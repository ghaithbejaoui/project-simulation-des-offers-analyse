const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');
const router = express.Router();

const optionController = require('../controllers/optionController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Option:
 *       type: object
 *       properties:
 *         option_id:
 *           type: integer
 *           description: The auto-generated ID of the option
 *         name:
 *           type: string
 *           description: Name of the option
 *         type:
 *           type: string
 *           description: Type of option
 *         price:
 *           type: number
 *           description: Price of the option
 *         data_gb:
 *           type: integer
 *           description: Data included in GB
 *         minutes:
 *           type: integer
 *           description: Minutes included
 *         sms:
 *           type: integer
 *           description: SMS included
 *         validity_days:
 *           type: integer
 *           description: Validity in days
 */

/**
 * @swagger
 * /api/options:
 *   get:
 *     summary: Returns all options
 *     tags: [Options]
 *     description: "EN: Get all telecom options - FR: Obtenir toutes les options telecom"
 *     responses:
 *       200:
 *         description: A list of all options
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Option'
 */

router.get('/', requireAuth, optionController.getAll);

/**
 * @swagger
 * /api/options/{id}:
 *   get:
 *     summary: Get an option by ID
 *     tags: [Options]
 *     description: "EN: Get a specific option by its ID - FR: Obtenir une option spécifique par son ID"
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The option ID
 *     responses:
 *       200:
 *         description: An option object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Option'
 *       404:
 *         description: Option not found
 */

router.get('/:id', requireAuth, optionController.getById);

/**
 * @swagger
 * /api/options:
 *   post:
 *     summary: Create a new option
 *     tags: [Options]
 *     description: "EN: Create a new telecom option - FR: Créer une nouvelle option telecom"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *               price:
 *                 type: number
 *               data_gb:
 *                 type: integer
 *                 default: 0
 *               minutes:
 *                 type: integer
 *                 default: 0
 *               sms:
 *                 type: integer
 *                 default: 0
 *               validity_days:
 *                 type: integer
 *                 default: 30
 *     responses:
 *       201:
 *         description: Option created
 */

router.post('/', requireRole('ADMIN', 'ANALYST'), optionController.create);

/**
 * @swagger
 * /api/options/{id}:
 *   put:
 *     summary: Update an option
 *     tags: [Options]
 *     description: "EN: Update an existing option - FR: Mettre à jour une option existante"
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The option ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Option updated successfully
 *       404:
 *         description: Option not found
 */

router.put('/:id', requireRole('ADMIN', 'ANALYST'), optionController.update);

/**
 * @swagger
 * /api/options/{id}:
 *   delete:
 *     summary: Delete an option
 *     tags: [Options]
 *     description: "EN: Delete an existing option - FR: Supprimer une option existante"
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The option ID
 *     responses:
 *       200:
 *         description: Option deleted successfully
 *       404:
 *         description: Option not found
 */

router.delete('/:id', requireRole('ADMIN'), optionController.delete);

module.exports = router;