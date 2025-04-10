import { Router } from "express";
import { addHive, getHive, exportHivesCSV } from "../controllers/hive.controller.js"; // Add exportHivesCSV
import { verifyJWT, verifyRole } from "../middlewares/auth.middleware.js"; // Import middleware

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Hives
 *   description: Hive management endpoints
 */

// --- Apply verifyJWT to all hive routes ---
router.use(verifyJWT);
/**
 * @swagger
 * components:
 *   schemas:
 *     Hive:
 *       type: object
 *       properties:
 *         hiveId:
 *           type: string
 *           example: HIVE001
 *         datePlaced:
 *           type: string
 *           format: date
 *           example: 2025-04-01
 *         latitude:
 *           type: number
 *           format: float
 *           example: 19.00843
 *         longitude:
 *           type: number
 *           format: float
 *           example: 72.88425
 *         numColonies:
 *           type: integer
 *           example: 5
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: 2025-04-01T10:00:00.000Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: 2025-04-05T15:30:00.000Z
 */

/**
 * @swagger
 * /api/hives:
 *   get:
 *     summary: Get a paginated list of hive logs
 *     tags: [Hives]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter hives placed on or after this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter hives placed on or before this date
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Successfully retrieved hives
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 hives:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Hive'
 */


router.route("").get(getHive);

/**
 * @swagger
 * components:
 *   schemas:
 *     HiveInput:
 *       type: object
 *       required:
 *         - hiveId
 *         - datePlaced
 *         - latitude
 *         - longitude
 *         - numColonies
 *       properties:
 *         hiveId:
 *           type: string
 *           example: HIVE001
 *         datePlaced:
 *           type: string
 *           format: date
 *           example: 2025-04-01
 *         latitude:
 *           type: number
 *           format: float
 *           example: 19.00843
 *         longitude:
 *           type: number
 *           format: float
 *           example: 72.88425
 *         numColonies:
 *           type: integer
 *           example: 5
 */

/**
 * @swagger
 * /api/hives:
 *   post:
 *     summary: Add a new hive log
 *     tags: [Hives]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/HiveInput'
 *     responses:
 *       201:
 *         description: Hive added successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Hive ID already exists
 */
router.route("").post(addHive);


router.route("").post(addHive); // verifyJWT applied by router.use()

/**
 * @swagger
 * /api/hives/export:
 *   get:
 *     summary: Export hive logs as a CSV file
 *     tags: [Hives]
 *     security:
 *       - bearerAuth: [] # or cookieAuth: []
 *     parameters: # Add parameters if filtering is supported for export
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Optional start date filter for export
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Optional end date filter for export
 *     responses:
 *       200:
 *         description: CSV file of hive logs
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Error generating CSV
 */
// Add the export route - requires auth, potentially admin-only if desired
router.route("/export").get( /* verifyRole('admin'), */ exportHivesCSV); // Uncomment verifyRole('admin') to restrict

export default router;