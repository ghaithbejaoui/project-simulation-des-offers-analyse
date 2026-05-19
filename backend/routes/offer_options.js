const express = require('express');
const router = express.Router();

const offerOptionController = require('../controllers/offerOptionController');

/**
 * @swagger
 * components:
 *   schemas:
 *     OfferOption:
 *       type: object
 *       properties:
 *         offer_id:
 *           type: integer
 *           description: The offer ID
 *         option_id:
 *           type: integer
 *           description: The option ID
 *         offer_name:
 *           type: string
 *           description: Name of the offer
 *         option_name:
 *           type: string
 *           description: Name of the option
 */

/**
 * @swagger
 * /api/offer-options:
 *   get:
 *     summary: Returns all offer-option relationships
 *     tags: [Offer Options]
 *     description: "EN: Get all offer-option relationships - FR: Obtenir toutes les relations offre-option"
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of all offer-option relationships
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/OfferOption'
 */

router.get('/', offerOptionController.getAll);

/**
 * @swagger
 * /api/offer-options/offer/{id}:
 *   get:
 *     summary: Get all options for a specific offer
 *     tags: [Offer Options]
 *     description: "EN: Get all options associated with a specific offer - FR: Obtenir toutes les options associées à une offre spécifique"
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The offer ID
 *     responses:
 *       200:
 *         description: List of options for the offer
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */

router.get('/offer/:id', offerOptionController.getByOfferId);

/**
 * @swagger
 * /api/offer-options/option/{id}:
 *   get:
 *     summary: Get all offers that have a specific option
 *     tags: [Offer Options]
 *     description: "EN: Get all offers that include a specific option - FR: Obtenir toutes les offres qui incluent une option spécifique"
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The option ID
 *     responses:
 *       200:
 *         description: List of offers with this option
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */

router.get('/option/:id', offerOptionController.getByOptionId);

/**
 * @swagger
 * /api/offer-options:
 *   post:
 *     summary: Add an option to an offer
 *     tags: [Offer Options]
 *     description: "EN: Link an option to an offer - FR: Lier une option à une offre"
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - offer_id
 *               - option_id
 *             properties:
 *               offer_id:
 *                 type: integer
 *               option_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Option added to offer successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 offer_id:
 *                   type: integer
 *                 option_id:
 *                   type: integer
 */

router.post('/', offerOptionController.create);

/**
 * @swagger
 * /api/offer-options:
 *   delete:
 *     summary: Remove an option from an offer
 *     tags: [Offer Options]
 *     description: "EN: Unlink an option from an offer - FR: Délier une option d'une offre"
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - offer_id
 *               - option_id
 *             properties:
 *               offer_id:
 *                 type: integer
 *               option_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Option removed from offer successfully
 *       404:
 *         description: Offer-Option relationship not found
 */

router.delete('/', offerOptionController.delete);

module.exports = router;