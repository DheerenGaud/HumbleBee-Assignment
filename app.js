import express from "express";
import bodyParser from "body-parser"; // Corrected import name
import cookieParser from "cookie-parser"; // Needed for reading JWT cookies
import dotenv from "dotenv";
import session from 'express-session'; // For admin dashboard sessions
import MongoStore from 'connect-mongo'; // To store sessions in MongoDB
import path from 'path'; // To correctly locate views directory
import { fileURLToPath } from 'url'; // To get __dirname equivalent in ES modules
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";


// --- ES Module __dirname equivalent ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config(); // Load .env variables early



const app = express();




// --- Middleware Setup ---
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(cookieParser()); 


app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false, // Don't save session if unmodified
    saveUninitialized: false, // Don't create session until something stored
    store: MongoStore.create({ // Store session in MongoDB
        mongoUrl:process.env.MONGODB_URI,
        dbName: process.env.DB_NAME || 'Savaaree', // Use DB_NAME from .env
        collectionName: 'sessions',
        ttl: 14 * 24 * 60 * 60 // = 14 days. Default is 14 days
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production (HTTPS)
        httpOnly: true, // Prevent client-side JS access
        maxAge: 1000 * 60 * 60 * 24 // Session cookie expiration (e.g., 1 day)
    }
}));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); 




// --- Swagger Setup ---
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'BeeTrail API',
            version: '1.0.0',
            description: 'API documentation for the BeeTrail Field Logger backend.',
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT || 8000}`, // Adjust if needed
                description: 'Development server'
            },
            // Add production server URL if applicable
        ],
        components: { // Define security scheme for JWT
             securitySchemes: {
                 bearerAuth: { // Can be named anything, e.g., jwtAuth
                     type: 'http',
                     scheme: 'bearer',
                     bearerFormat: 'JWT',
                     description: 'Enter JWT Bearer token **_only_**'
                 },
                 cookieAuth: { // Define cookie auth for Swagger UI (optional but helpful)
                     type: 'apiKey',
                     in: 'cookie',
                     name: 'accessToken' // Name of your access token cookie
                 }
             }
         },
         security: [ // Apply security globally or per-path/operation
             {
                 bearerAuth: [] // Reference the scheme defined above
             },
             {
                  cookieAuth: []
             }
         ],
    },
    // Path to the API docs files (can include controllers, routes, models)
    apis: ['./routes/*.js', './controllers/*.js', './models/*.js'],
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));




// --- Import Routers ---
import hiveRouter from './routes/hive.router.js';
import cropRouter from './routes/crop.router.js';
import authRouter from './routes/auth.router.js'; 
import adminRouter from './routes/admin.router.js';



// --- API Routes ---
app.use("/api/hives", hiveRouter);   // Protect hive routes below
app.use("/api/crops", cropRouter);   // Protect crop routes below
app.use("/api/auth", authRouter);    // Auth routes (login/register) usually public

// --- Admin Dashboard Route ---
app.use("/admin", adminRouter); // Use the dedicated admin router



app.get("/", (req, res) => {
    // api Document 
    res.redirect('/api-docs');
});


import errorHandler from "./middlewares/errorHandler.middlewares.js";
app.use(errorHandler);

export { app };