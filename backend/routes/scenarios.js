const express = require('express');
const db = require('../config/database');
const { logAction } = require('./audit');
const { requireAdmin } = require('../middleware/auth');
const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Scenario:
 *       type: object
 *       properties:
 *         scenario_id:
 *           type: integer
 *         user_id:
 *           type: integer
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         profile_id:
 *           type: integer
 *         offer_ids:
 *           type: array
 *           items:
 *             type: integer
 *         status:
 *           type: string
 *           enum: [DRAFT, ACTIVE, ARCHIVED]
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *     ScenarioResult:
 *       type: object
 *       properties:
 *         result_id:
 *           type: integer
 *         scenario_id:
 *           type: integer
 *         profile_id:
 *           type: integer
 *         offer_id:
 *           type: integer
 *         total_cost:
 *           type: number
 *         satisfaction_score:
 *           type: integer
 *         recommendation:
 *           type: string
 */

/**
 * @swagger
 * /api/scenarios:
 *   get:
 *     summary: List all scenarios
 *     tags: [Scenarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, ACTIVE, ARCHIVED]
 *         description: Filter by status
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: List of scenarios
 *       401:
 *         description: Unauthorized
 */
router.get('/', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const { status, limit = 50, offset = 0 } = req.query;
  const user_id = req.user.user_id;
  const isAdmin = req.user.role === 'ADMIN';

  try {
    let query = 'SELECT * FROM scenarios';
    const params = [];
    const conditions = [];

    if (!isAdmin) {
      conditions.push('user_id = ?');
      params.push(user_id);
    }
    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY updated_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [scenarios] = await db.query(query, params);

    // Parse offer_ids from JSON string
    const parsed = scenarios.map(s => ({
      ...s,
      offer_ids: s.offer_ids ? JSON.parse(s.offer_ids) : [],
      comparison_data: s.comparison_data ? JSON.parse(s.comparison_data) : null
    }));

    // Get count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM scenarios';
    const countParams = [];
    if (!isAdmin) {
      countQuery += ' WHERE user_id = ?';
      countParams.push(user_id);
    }
    if (status) {
      countQuery += isAdmin ? ' WHERE status = ?' : ' AND status = ?';
      countParams.push(status);
    }

    const [countResult] = await db.query(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      scenarios: parsed,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/scenarios/{id}:
 *   get:
 *     summary: Get scenario by ID
 *     tags: [Scenarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Scenario details
 *       404:
 *         description: Scenario not found
 */
router.get('/:id', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const { id } = req.params;
  const user_id = req.user.user_id;
  const isAdmin = req.user.role === 'ADMIN';

  try {
    let query = 'SELECT * FROM scenarios WHERE scenario_id = ?';
    const params = [id];

    if (!isAdmin) {
      query += ' AND user_id = ?';
      params.push(user_id);
    }

    const [rows] = await db.query(query, params);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Scenario not found' });
    }

    const scenario = rows[0];

    // Get results for this scenario
    const [results] = await db.query(
      'SELECT * FROM scenario_results WHERE scenario_id = ? ORDER BY rank_by_score ASC',
      [id]
    );

    res.json({
      ...scenario,
      offer_ids: scenario.offer_ids ? JSON.parse(scenario.offer_ids) : [],
      comparison_data: scenario.comparison_data ? JSON.parse(scenario.comparison_data) : null,
      results
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/scenarios:
 *   post:
 *     summary: Create a new scenario
 *     tags: [Scenarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               profile_id:
 *                 type: integer
 *               offer_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *               comparison_data:
 *                 type: object
 *     responses:
 *       201:
 *         description: Scenario created
 */
router.post('/', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const { name, description, profile_id, offer_ids, comparison_data, status = 'DRAFT' } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Name is required' });
  }

  const user_id = req.user.user_id;

  try {
    const offerIdsJson = offer_ids ? JSON.stringify(offer_ids) : null;
    const comparisonDataJson = comparison_data ? JSON.stringify(comparison_data) : null;

    const [result] = await db.query(
      `INSERT INTO scenarios (user_id, name, description, profile_id, offer_ids, comparison_data, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [user_id, name, description || null, profile_id || null, offerIdsJson, comparisonDataJson, status]
    );

    const scenario_id = result.insertId;

    // Log audit
    await logAction({
      user_id,
      action: 'CREATE',
      entity: 'scenario',
      entity_id: scenario_id,
      ip_address: req.ip || req.connection?.remoteAddress,
      details: { name, profile_id, offer_ids_count: offer_ids?.length || 0 }
    });

    res.status(201).json({
      scenario_id,
      message: 'Scenario created successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/scenarios/{id}:
 *   put:
 *     summary: Update a scenario
 *     tags: [Scenarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [DRAFT, ACTIVE, ARCHIVED]
 *     responses:
 *       200:
 *         description: Scenario updated
 *       404:
 *         description: Scenario not found
 */
router.put('/:id', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const { id } = req.params;
  const { name, description, status, offer_ids, comparison_data, profile_id } = req.body;
  const user_id = req.user.user_id;
  const isAdmin = req.user.role === 'ADMIN';

  try {
    // Check ownership or admin
    let query = 'SELECT * FROM scenarios WHERE scenario_id = ?';
    const params = [id];

    if (!isAdmin) {
      query += ' AND user_id = ?';
      params.push(user_id);
    }

    const [rows] = await db.query(query, params);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Scenario not found' });
    }

    // Build update query
    const updates = [];
    const updateParams = [];

    if (name !== undefined) {
      updates.push('name = ?');
      updateParams.push(name);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      updateParams.push(description);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      updateParams.push(status);
    }
    if (offer_ids !== undefined) {
      updates.push('offer_ids = ?');
      updateParams.push(JSON.stringify(offer_ids));
    }
    if (comparison_data !== undefined) {
      updates.push('comparison_data = ?');
      updateParams.push(JSON.stringify(comparison_data));
    }
    if (profile_id !== undefined) {
      updates.push('profile_id = ?');
      updateParams.push(profile_id);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    updateParams.push(id);
    await db.query(
      `UPDATE scenarios SET ${updates.join(', ')}, updated_at = NOW() WHERE scenario_id = ?`,
      updateParams
    );

    // Log audit
    await logAction({
      user_id,
      action: 'UPDATE',
      entity: 'scenario',
      entity_id: parseInt(id),
      ip_address: req.ip || req.connection?.remoteAddress,
      details: { name, status }
    });

    res.json({ message: 'Scenario updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/scenarios/{id}:
 *   delete:
 *     summary: Delete a scenario
 *     tags: [Scenarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Scenario deleted
 *       404:
 *         description: Scenario not found
 */
router.delete('/:id', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const { id } = req.params;
  const user_id = req.user.user_id;
  const isAdmin = req.user.role === 'ADMIN';

  try {
    let query = 'DELETE FROM scenarios WHERE scenario_id = ?';
    const params = [id];

    if (!isAdmin) {
      query += ' AND user_id = ?';
      params.push(user_id);
    }

    const [result] = await db.query(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Scenario not found' });
    }

    // Log audit
    await logAction({
      user_id,
      action: 'DELETE',
      entity: 'scenario',
      entity_id: parseInt(id),
      ip_address: req.ip || req.connection?.remoteAddress,
      details: {}
    });

    res.json({ message: 'Scenario deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/scenarios/{id}/duplicate:
 *   post:
 *     summary: Duplicate a scenario
 *     tags: [Scenarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       201:
 *         description: Scenario duplicated
 */
router.post('/:id/duplicate', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const { id } = req.params;
  const user_id = req.user.user_id;
  const { name } = req.body;

  try {
    // Get original
    const [rows] = await db.query('SELECT * FROM scenarios WHERE scenario_id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Scenario not found' });
    }

    const original = rows[0];
    const newName = name || `${original.name} (Copy)`;

    // Create duplicate
    const [result] = await db.query(
      `INSERT INTO scenarios (user_id, name, description, profile_id, offer_ids, comparison_data, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [user_id, newName, original.description, original.profile_id, original.offer_ids, original.comparison_data, 'DRAFT']
    );

    const newScenarioId = result.insertId;

    // Also copy results
    const [results] = await db.query('SELECT * FROM scenario_results WHERE scenario_id = ?', [id]);
    for (const r of results) {
      await db.query(
        `INSERT INTO scenario_results (scenario_id, profile_id, offer_id, base_cost, overage_cost, roaming_cost, total_cost, satisfaction_score, recommendation, rank_by_cost, rank_by_score, notes, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [newScenarioId, r.profile_id, r.offer_id, r.base_cost, r.overage_cost, r.roaming_cost, r.total_cost, r.satisfaction_score, r.recommendation, r.rank_by_cost, r.rank_by_score, r.notes]
      );
    }

    // Log audit
    await logAction({
      user_id,
      action: 'DUPLICATE',
      entity: 'scenario',
      entity_id: newScenarioId,
      ip_address: req.ip || req.connection?.remoteAddress,
      details: { original_id: id, name: newName }
    });

    res.status(201).json({
      scenario_id: newScenarioId,
      message: 'Scenario duplicated successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/scenarios/{id}/results:
 *   post:
 *     summary: Save simulation results to a scenario
 *     tags: [Scenarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               results:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       201:
 *         description: Results saved
 */
router.post('/:id/results', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const { id } = req.params;
  const { results } = req.body;
  const user_id = req.user.user_id;

  if (!results || !Array.isArray(results)) {
    return res.status(400).json({ message: 'Results array is required' });
  }

  try {
    // Clear existing results
    await db.query('DELETE FROM scenario_results WHERE scenario_id = ?', [id]);

    // Insert new results using SET syntax
    for (const r of results) {
      await db.query('INSERT INTO scenario_results SET ?', {
        scenario_id: parseInt(id),
        profile_id: r.profile_id || null,
        offer_id: r.offer_id || null,
        base_cost: Number(r.base_cost) || 0,
        overage_cost: Number(r.overage_cost) || 0,
        roaming_cost: Number(r.roaming_cost) || 0,
        total_cost: Number(r.total_cost) || 0,
        satisfaction_score: Number(r.satisfaction_score) || 0,
        recommendation: r.recommendation || null,
        rank_by_cost: r.rank_by_cost || null,
        rank_by_score: r.rank_by_score || null,
        notes: r.notes || null
      });
    }

    // Update scenario status
    await db.query(
      "UPDATE scenarios SET status = 'ACTIVE', updated_at = NOW() WHERE scenario_id = ?",
      [id]
    );

    // Log audit
    await logAction({
      user_id,
      action: 'SAVE_RESULTS',
      entity: 'scenario',
      entity_id: parseInt(id),
      ip_address: req.ip || req.connection?.remoteAddress,
      details: { results_count: results.length }
    });

    res.status(201).json({
      message: 'Results saved successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;