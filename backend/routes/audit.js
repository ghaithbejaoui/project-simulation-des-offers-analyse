const express = require('express');
const db = require('../config/database');
const { requireAdmin } = require('../middleware/auth');
const router = express.Router();

/**
 * @swagger
 * /api/audit/logs:
 *   get:
 *     summary: Get audit logs (admin only)
 *     tags: [Audit]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: entity
 *         schema:
 *           type: string
 *         description: Filter by entity type (offer, customer_profile, option, simulation)
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: integer
 *         description: Filter by user ID
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *         description: Filter by action (CREATE, UPDATE, DELETE, LOGIN, etc.)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Maximum number of logs to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of logs to skip
 *     responses:
 *       200:
 *         description: List of audit logs
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.get('/logs', requireAdmin, async (req, res) => {
  // TODO: Add admin role check middleware
  const { entity, user_id, action, limit = 100, offset = 0 } = req.query;

  try {
    let query = 'SELECT * FROM audit_logs WHERE 1=1';
    const params = [];

    if (entity) {
      query += ' AND entity = ?';
      params.push(entity);
    }
    if (user_id) {
      query += ' AND user_id = ?';
      params.push(user_id);
    }
    if (action) {
      query += ' AND action = ?';
      params.push(action);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [logs] = await db.query(query, params);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM audit_logs WHERE 1=1';
    const countParams = [];
    if (entity) { countQuery += ' AND entity = ?'; countParams.push(entity); }
    if (user_id) { countQuery += ' AND user_id = ?'; countParams.push(user_id); }
    if (action) { countQuery += ' AND action = ?'; countParams.push(action); }

    const [countResult] = await db.query(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      logs,
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
 * /api/audit/logs/summary:
 *   get:
 *     summary: Get audit summary statistics (admin only)
 *     tags: [Audit]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Summary of audit activity
 */
router.get('/logs/summary', requireAdmin, async (req, res) => {
  try {
    // Recent activity count (last 24 hours)
    const [recent] = await db.query(
      "SELECT COUNT(*) as count FROM audit_logs WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)"
    );

    // Top users by activity
    const [topUsers] = await db.query(
      `SELECT user_id, COUNT(*) as count 
       FROM audit_logs 
       WHERE user_id IS NOT NULL 
       GROUP BY user_id 
       ORDER BY count DESC 
       LIMIT 5`
    );

    // Actions breakdown
    const [actionsBreakdown] = await db.query(
      `SELECT action, COUNT(*) as count 
       FROM audit_logs 
       GROUP BY action 
       ORDER BY count DESC`
    );

    // Entity types breakdown
    const [entityBreakdown] = await db.query(
      `SELECT entity, COUNT(*) as count 
       FROM audit_logs 
       WHERE entity IS NOT NULL 
       GROUP BY entity 
       ORDER BY count DESC`
    );

    res.json({
      recent_24h: recent[0].count,
      top_users: topUsers,
      actions_breakdown: actionsBreakdown,
      entity_breakdown: entityBreakdown
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get recent activity for dashboard display
 * Shows last N actions with user names and relative timestamps
 * Requires authentication (any role)
 */
router.get('/recent', async (req, res) => {
  // Require authentication
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const limit = parseInt(req.query.limit) || 10;

  try {
    const [rows] = await db.query(
      `SELECT al.*, u.username 
       FROM audit_logs al
       LEFT JOIN users u ON al.user_id = u.user_id
       ORDER BY al.created_at DESC
       LIMIT ?`,
      [limit]
    );

    // Format for dashboard display
    const activity = rows.map(log => {
      let icon = '📋';
      let color = '#1a8fff'; // colors.blue

      // Determine icon and color based on action/entity
      if (log.action === 'LOGIN' || log.action === 'LOGIN_FAILED') {
        icon = log.action === 'LOGIN' ? '🔓' : '🔒';
        color = log.action === 'LOGIN' ? '#43c78b' : '#e35b5b'; // green or red
      } else if (log.action === 'SIMULATE_SINGLE' || log.action === 'SIMULATE_RECOMMEND') {
        icon = '⚡';
        color = '#1a8fff';
      } else if (log.action === 'SIMULATE_COMPARE') {
        icon = '⚖️';
        color = '#f0b429';
      } else if (log.action === 'SIMULATE_BATCH') {
        icon = '📊';
        color = '#e35b35';
      } else if (log.action === 'CREATE') {
        icon = log.entity === 'offer' ? '📋' : log.entity === 'customer_profile' ? '👤' : '⚙️';
        color = '#43c78b';
      } else if (log.action === 'UPDATE') {
        icon = '✏️';
        color = '#f0b429';
      } else if (log.action === 'DELETE') {
        icon = '🗑️';
        color = '#e35b5b';
      } else if (log.action === 'LINK' || log.action === 'UNLINK') {
        icon = '🔗';
        color = 'rgba(200,212,232,0.55)';
      }

      // Build descriptive text from details
      let text = '';
      try {
        const detailsObj = log.details ? JSON.parse(log.details) : {};
        if (log.action === 'SIMULATE_SINGLE') {
          text = `Simulation: Offer #${detailsObj.offer_id} — Cost: ${detailsObj.total_cost} TND, Score: ${detailsObj.satisfaction_score}/100`;
        } else if (log.action === 'SIMULATE_RECOMMEND') {
          text = `Recommendations generated — ${detailsObj.limit || 5} offers`;
        } else if (log.action === 'SIMULATE_COMPARE') {
          text = `Compared ${detailsObj.offer_ids?.length || 0} offers`;
        } else if (log.action === 'SIMULATE_BATCH') {
          text = `Batch: ${detailsObj.total_profiles} profiles, ${detailsObj.good_matches} good matches`;
        } else if (log.action === 'CREATE') {
          if (log.entity === 'offer') text = `New offer: "${detailsObj.name}" (${detailsObj.segment})`;
          else if (log.entity === 'customer_profile') text = `Profile created: "${detailsObj.label}"`;
          else if (log.entity === 'option') text = `New option: "${detailsObj.name}"`;
          else text = `${log.entity} created (ID: ${log.entity_id})`;
        } else if (log.action === 'UPDATE') {
          text = `${log.entity?.replace('_', ' ')} updated`;
        } else if (log.action === 'DELETE') {
          text = `${log.entity?.replace('_', ' ')} deleted`;
        } else if (log.action === 'LINK') {
          text = `Option linked to offer`;
        } else if (log.action === 'UNLINK') {
          text = `Option unlinked from offer`;
        } else if (log.action === 'LOGIN') {
          text = `User logged in: ${log.username}`;
        } else if (log.action === 'LOGIN_FAILED') {
          text = `Failed login${log.details?.includes('user_not_found') ? '' : ` for ${log.details?.username || 'unknown'}`}`;
        } else {
          text = `${log.action} on ${log.entity || 'system'}`;
        }
      } catch (e) {
        text = `${log.action} - ${log.entity}`;
      }

      // Calculate relative time
      const now = new Date();
      const logTime = new Date(log.created_at);
      const diffMs = now - logTime;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      let timeAgo;
      if (diffMins < 1) timeAgo = 'Just now';
      else if (diffMins < 60) timeAgo = `${diffMins}m ago`;
      else if (diffHours < 24) timeAgo = `${diffHours}h ago`;
      else timeAgo = `${diffDays}d ago`;

      return {
        id: log.log_id,
        icon,
        text,
        time: timeAgo,
        color,
        raw_time: log.created_at,
        user: log.username || 'System',
        action: log.action
      };
    });

    res.json({ activity, count: activity.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
   }
 });

/**
 * Helper function to log audit entries
 * Should be called from other route handlers
 */
const logAction = async ({
  user_id = null,
  action,
  entity = null,
  entity_id = null,
  ip_address = null,
  details = null
}) => {
  try {
    await db.query(
      `INSERT INTO audit_logs 
       (user_id, action, entity, entity_id, ip_address, details, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [user_id, action, entity, entity_id, ip_address, details ? JSON.stringify(details) : null]
    );
  } catch (error) {
    console.error('Audit log failed:', error.message);
    // Don't throw - audit failures shouldn't break the main flow
  }
};

module.exports = { router, logAction };
