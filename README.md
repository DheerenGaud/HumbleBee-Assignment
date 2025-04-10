# BeeTrail Field Logger - Backend Service

This repository contains the backend API service for the BeeTrail Field Logger application. It allows beekeepers to log hive placements, manage crop calendars, and discover nearby crop pollination opportunities based on location and flowering times.

## 🎯 Objective

To provide a robust and scalable backend that:
*   Stores and retrieves hive placement logs.
*   Manages crop information, including flowering periods and locations.
*   Supports geo-filtered searches for nearby flowering crops.
*   Includes user authentication and role-based access control.
*   Offers additional features like data export and API documentation.

## ✨ Features

### Core Requirements Implemented:
*   **Hive Management:**
    *   `POST /api/hives`: Add a new hive log entry (requires authentication).
    *   `GET /api/hives`: Retrieve a paginated list of hive logs, filterable by date range (requires authentication). Supports sync token (`lastSyncTimestamp`) for efficient updates.
*   **Crop Management:**
    *   `POST /api/crops`: Add a new crop calendar entry (requires 'admin' role).
    *   `GET /api/crops/nearby`: Find flowering crops within a specified radius of a given latitude/longitude, optionally filtered by a specific date (requires authentication).

### Bonus Features Implemented:
*   **User Authentication:** JWT-based authentication (Access & Refresh Tokens) with secure cookies.
    *   `POST /api/auth/register`: Register new users.
    *   `POST /api/auth/login`: Log in users and issue tokens.
    *   `POST /api/auth/logout`: Log out users and invalidate tokens/cookies.
    *   `POST /api/auth/refresh-token`: Refresh expired access tokens using refresh tokens.
*   **Role-Based Access Control:** Differentiates between 'beekeeper' and 'admin' roles (e.g., only admins can add crops).
*   **CSV Export:** `GET /api/hives/export`: Export hive log data as a CSV file, filterable by date (requires authentication).
*   **API Documentation:** Interactive Swagger/OpenAPI documentation available at `/api-docs`.
*   **Admin Dashboard:** A basic web dashboard at `/admin/dashboard` providing overview stats (requires admin login via session).
*   **Sync Token:** The `GET /api/hives` endpoint supports a `lastSyncTimestamp` query parameter to allow clients (like offline apps) to fetch only records updated since their last sync.

## 🛠️ Tech Stack

*   **Backend:** Node.js, Express.js
*   **Database:** MongoDB with Mongoose ODM
*   **Authentication:** JSON Web Tokens (JWT), Passport.js (passport-jwt), bcrypt (password hashing)
*   **Session Management:** express-session, connect-mongo (for Admin Dashboard)
*   **API Documentation:** swagger-jsdoc, swagger-ui-express
*   **CSV Handling:** json2csv
*   **Templating:** EJS (for Admin Dashboard)
*   **Environment Variables:** dotenv
*   **Development:** Nodemon

## ⚙️ Prerequisites

*   Node.js (v18 or later recommended)
*   npm (usually comes with Node.js)
*   MongoDB Instance:
    *   A running local MongoDB server OR
    *   A MongoDB Atlas account (free tier available)

## 🚀 Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd Backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables:**
    *   Create a `.env` file in the `Backend` root directory.
    *   Copy the contents of `.env.example` (see below) into your `.env` file.
    *   **Crucially, replace the placeholder values** with your actual configuration, especially `MONGODB_URI`, `DB_NAME`, and generate strong, unique secrets for `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET`, and `SESSION_SECRET`.

    **`.env.example`:**
    ```dotenv
    # Server Configuration
    PORT=8000

    # MongoDB Connection (Replace with your actual connection string)
    # Example for Atlas: mongodb+srv://<username>:<password>@<your-cluster-url>/<database_name>?retryWrites=true&w=majority
    # Example for Local: mongodb://localhost:27017/<database_name>
    MONGODB_URI=mongodb+srv://hitesh:your-password@cluster0.lxl3fsq.mongodb.net/BeeTrailDB
    DB_NAME=BeeTrailDB # Or your preferred database name

    # CORS Origin (Adjust if your frontend runs on a different port/domain)
    CORS_ORIGIN=http://localhost:3000

    # JWT Authentication Secrets (Generate strong random strings)
    ACCESS_TOKEN_SECRET=replace_with_very_strong_random_access_secret
    ACCESS_TOKEN_EXPIRY=1d
    REFRESH_TOKEN_SECRET=replace_with_even_stronger_random_refresh_secret
    REFRESH_TOKEN_EXPIRY=10d

    # Session Secret (Generate another strong random string for admin dashboard sessions)
    SESSION_SECRET=replace_with_strong_random_session_secret

    ```
    **Important:** Ensure the `<username>`, `<password>`, `<your-cluster-url>`, and `<database_name>` in `MONGODB_URI` are correct for your MongoDB setup. If using Atlas, also ensure your server's IP address is whitelisted in the Network Access settings.

## ▶️ Running the Application

1.  **Start the server (development mode with Nodemon):**
    ```bash
    npm run dev
    # Or if you don't have a dev script:
    # nodemon index.js
    ```
    *(If you don't have Nodemon installed globally, you might need `npx nodemon index.js` or add `"dev": "nodemon index.js"` to your `package.json` scripts.)*

2.  **Start the server (production mode):**
    ```bash
    npm start
    # Or directly:
    # node index.js
    ```

The server will start, typically on `http://localhost:8000` (or the port specified in your `.env` file). You should see log messages indicating database connection and the server running port.

## 📚 API Documentation (Swagger)

Interactive API documentation is automatically generated and available when the server is running.

*   Navigate to: `http://localhost:<PORT>/api-docs` (e.g., `http://localhost:8000/api-docs`)

The documentation details all available endpoints, required parameters, request body schemas, response formats, and indicates which endpoints require authentication (use the "Authorize" button with a JWT Bearer token obtained from login).

## 👑 Admin Dashboard

A basic administrative dashboard is available for users with the 'admin' role.

1.  **Register an Admin User:** Use the `POST /api/auth/register` endpoint (via Swagger or Postman) to create a user, explicitly setting the `role` field to `"admin"` in the request body.
2.  **Access Login:** Navigate to `http://localhost:<PORT>/admin/login` in your browser.
3.  **Login:** Use the credentials of the admin user created in step 1.
4.  **Dashboard:** Upon successful login, you'll be redirected to `/admin/dashboard`, which shows basic statistics (total hives, crops, users) and links to management actions (like CSV export).

## 📮 Postman Collection

Use the included Postman collection to easily test the API.

*   **File:** `postman/HumbleBee_API.postman_collection.json` *(Adjust if needed)*

### Quick Setup:

1.  **Import:** Open Postman, click "Import", and select the `.json` file above.
2.  **Environment:**
    *   Create a new Postman Environment (click the eye icon > Add).
    *   Add a variable: `baseURL` = `http://localhost:8000` (or your server URL).
    *   **Select** this environment in the top-right dropdown.
3.  **Run:**
    *   Use `POST /registerUser` to create a user.
    *   Run `POST /login`. This will automatically save your `accessToken`.
    *   Other requests should now work using the saved token for authentication. Sample data is included in the request bodies.

## 💾 Database Schema Overview

*   **Users:** Stores user credentials (`username`, `email`, hashed `password`), `role` ('beekeeper' or 'admin'), and refresh tokens.
*   **Hives:** Stores individual hive placement logs (`hiveId`, `datePlaced`, `latitude`, `longitude`, `numColonies`) with timestamps.
*   **Crops:** Stores crop information (`name`, `floweringStart`, `floweringEnd`, `recommendedHiveDensity`) and uses a GeoJSON `Point` object for the `location` field, indexed with `2dsphere` for efficient geospatial queries.
*   **Sessions:** (Managed by `connect-mongo`) Stores session data for logged-in admin users.

## 🤔 Assumptions & Design Choices

*   **GeoJSON for Crops:** Crop locations are stored using MongoDB's native GeoJSON format (`Point`) for efficient `$nearSphere` queries.
*   **Authentication:** JWT is used for securing API endpoints intended for general use (e.g., by a mobile app). Sessions are used *specifically* for the web-based Admin Dashboard login persistence.
*   **Role Restriction:** Adding new crop data is restricted to 'admin' users. Other actions might be similarly restricted based on future requirements.
*   **Default Radius:** The `GET /api/crops/nearby` endpoint defaults to a 100km radius if not specified.
*   **Error Handling:** Uses custom `ApiError` and `ApiResponse` classes with a global error handling middleware.

## 💡 Future Improvements

*   Implement comprehensive unit and integration tests.
*   Add more detailed error logging.
*   Expand user roles and permissions.
*   Implement user management features in the Admin Dashboard.
*   Add endpoints for updating/deleting hives and crops.
*   Set up CI/CD pipeline.
*   Refine CORS configuration for specific frontend origins in production.

## 📄 License

[Specify your license here, e.g., MIT]

---