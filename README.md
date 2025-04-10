# BeeTrail Field Logger - Backend

Backend API for the BeeTrail app. Logs hive placements, manages crop calendars, finds nearby pollination opportunities, and includes user authentication.

## ✨ Key Features

*   **Hive Logging:** Add (`POST /api/hives`) and retrieve (`GET /api/hives`) hive placement data. Supports sync tokens.
*   **Crop Management:** Add (`POST /api/crops` - Admin Only) and find nearby flowering crops (`GET /api/crops/nearby`).
*   **Authentication:** User registration/login (`/api/auth`) via JWT.
*   **Admin Role:** Separate permissions for administrators.
*   **Data Export:** Export hive data as CSV (`GET /api/hives/export`).
*   **API Docs:** Interactive documentation via Swagger at `/api-docs`.
*   **Admin Dashboard:** Basic web UI at `/admin/dashboard` (requires admin login).

## 🛠️ Tech Stack

Node.js, Express, MongoDB, Mongoose, JWT, Passport, EJS, Swagger, json2csv.

## ⚙️ Prerequisites

*   Node.js (v18+) & npm
*   MongoDB (Local instance or Atlas account)

## 🚀 Setup & Run

1.  **Clone:**
    ```bash
    git clone https://github.com/DheerenGaud/HumbleBee-Assignment.git
    cd HumbleBee-Assignment
    ```
2.  **Install:**
    ```bash
    npm install
    ```
3.  **Configure `.env`:**
    *   Create a `.env` file in the `Backend` root.
    *   Copy the example below and **fill in your details**, especially `MONGODB_URI` and generate unique secrets.

    **`.env` Example:**
    ```dotenv
    PORT=8000
    MONGODB_URI=mongodb+srv://<username>:<password>@<your-cluster-url> # Or mongodb://localhost:27017/<database_name>
    DB_NAME=YourDatabaseName
    ACCESS_TOKEN_SECRET=your_strong_random_access_secret
    ACCESS_TOKEN_EXPIRY=1d
    REFRESH_TOKEN_SECRET=your_strong_random_refresh_secret
    REFRESH_TOKEN_EXPIRY=10d
    SESSION_SECRET=your_strong_random_session_secret
    ```
    *   **Important:** If using Atlas, ensure your IP is whitelisted.

4.  **Run (Development):**
    ```bash
    npm run dev
    ```
5.  **Run (Production):**
    ```bash
    npm start
    ```
    Server runs on `http://localhost:8000` (or your `PORT`).

## 📚 API Documentation

*   Visit: `http://localhost:8000/api-docs` (use your actual port)

## 👑 Admin Dashboard

1.  Register a user with `"role": "admin"` via API (`POST /api/auth/register`).
2.  Go to `http://localhost:8000/admin/` (use your actual port).
3.  Log in with admin credentials.

## 📮 Postman Collection

Use the included Postman collection to easily test the API.

*   **File:** `postman/HumbleBee_API.postman_collection.json` *(Adjust if needed)*

### Quick Setup:

1.  **Import:** Open Postman, click "Import", and select the `.json` file.
2.  **Environment:** Create a Postman Environment, add `baseURL` = `http://localhost:8000` (or your server URL), and select it.
3.  **Run:** Use `POST /registerUser` and `POST /login` first (login saves the token). Other requests use the saved token.


## ⚙️ Core Logic Explanation

1.  **📍 Nearby Crop Discovery (`GET /api/crops/nearby`):**
    *   Leverages MongoDB's geospatial features. Crop locations are stored using GeoJSON `Point` format and indexed with `2dsphere` for efficient searching.
    *   Uses the `$nearSphere` operator to find crops within a specified radius (`maxDistance`) from a given latitude/longitude point.
    *   Filters the results further based on flowering times using date comparison operators (`$lte` - less than/equal to, `$gte` - greater than/equal to) to match crops flowering within a requested date range.

2.  **🔐 Authentication & Authorization (`/api/auth/*`):**
    *   Employs JSON Web Tokens (JWT) for securing API endpoints. Users receive short-lived `access tokens` for API calls and longer-lived `refresh tokens` to obtain new access tokens.
    *   Implements Role-Based Access Control (RBAC) with two primary roles: `admin` and `beekeeper`.
    *   Admins have elevated privileges (e.g., creating crop calendars), while beekeepers have standard access (e.g., viewing crops, managing their own hives). Middleware checks the user's role from the validated JWT to enforce these permissions.

3.  **📊 Hive Data Export (`GET /api/hives/export`):**
    *   Provides an API endpoint to download hive placement data as a CSV file.
    *   The backend fetches hive records from the database, potentially filtering them based on start and end date query parameters.
    *   Uses a library like `json2csv` to convert the retrieved JSON data into CSV format.
    *   Sets appropriate `Content-Type` and `Content-Disposition` HTTP headers in the response to trigger a file download in the user's browser.

4.  **📚 API Documentation (`/api-docs`):**
    *   Generates interactive API documentation using Swagger.
    *   The `swagger-jsdoc` library parses documentation comments (JSDoc) written alongside the API route code.
    *   `swagger-ui-express` serves the generated specification as a user-friendly web interface at `/api-docs`, allowing easy exploration and testing of endpoints.

5.  **👑 Admin Dashboard (`/admin/dashboard`):**
    *   Offers a basic web interface accessible only to users with the `admin` role.
    *   Likely uses server-side rendering (e.g., with EJS) to display administrative information or controls.
    *   Access is typically protected using session-based authentication, requiring admins to log in separately via specific web routes (e.g., `/admin/login`).
