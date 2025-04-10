import { Router } from "express";
import { addCrop, getNearbyCrops } from "../controllers/crop.controller.js";
import { verifyJWT, verifyRole } from "../middlewares/auth.middleware.js"; // Import middleware

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Crops
 *   description: Crop calendar and opportunity management
 */

// --- Apply authentication globally to crop routes ---
router.use(verifyJWT);

/**
 * @swagger
 * /api/crops:
 *   post:
 *     summary: Add a new crop (Admin only)
 *     tags: [Crops]
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
 *               - floweringStart
 *               - floweringEnd
 *               - latitude
 *               - longitude
 *               - recommendedHiveDensity
 *             properties:
 *               name:
 *                 type: string
 *                 example: E
 *               floweringStart:
 *                 type: string
 *                 format: date
 *                 example: 2025-04-01
 *               floweringEnd:
 *                 type: string
 *                 format: date
 *                 example: 2025-06-30
 *               latitude:
 *                 type: number
 *                 format: float
 *                 example: 19.00843
 *               longitude:
 *                 type: number
 *                 format: float
 *                 example: 72.88425
 *               recommendedHiveDensity:
 *                 type: number
 *                 format: float
 *                 example: 5
 *     responses:
 *       201:
 *         description: Crop added successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Only Admin)
 */

router.route("").post(verifyRole('admin'), addCrop); // only add by admin

/**
 * @swagger
 * /api/crops/nearby:
 *   get:
 *     summary: Get nearby crop opportunities based on location and date
 *     tags: [Crops]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: latitude
 *         required: true
 *         schema:
 *           type: number
 *           format: float
 *           minimum: -90
 *           maximum: 90
 *         description: Latitude of the center point for the search
 *       - in: query
 *         name: longitude
 *         required: true
 *         schema:
 *           type: number
 *           format: float
 *           minimum: -180
 *           maximum: 180
 *         description: Longitude of the center point for the search
 *       - in: query
 *         name: radius
 *         schema:
 *           type: integer
 *           default: 100
 *           minimum: 1
 *         description: Search radius in kilometers (km)
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Date to check flowering window (defaults to today)
 *     responses:
 *       200:
 *         description: Successfully retrieved nearby crops or empty array if none found
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Crop' # Reference Crop schema
 *       400:
 *         description: Missing or invalid query parameters (lat/lng, radius, date)
 *       401:
 *         description: Unauthorized
 */
router.route("/nearby").get(getNearbyCrops); 

export default router;