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

## 🚀 Setup & Run (Without Docker)

1.  **Clone:**
    ```bash
    git clone https://github.com/DheerenGaud/HumbleBee-Assignment.git
    cd HumbleBee-Assignment # Navigate into the project directory
    ```
2.  **Install:**
    ```bash
    npm install
    ```
3.  **Configure `.env`:**
    *   Create a `.env` file in the **root** of the project directory (`HumbleBee-Assignment`).
    *   Copy the example below and **fill in your details**, especially `MONGODB_URI` and generate unique secrets.

    **`.env` Example:**
    ```dotenv
    PORT=8000
    MONGODB_URI=mongodb+srv://<username>:<password>@<your-cluster-url> # Example Atlas
    # MONGODB_URI=mongodb://localhost:27017 # Example Local DB
    DB_NAME=your_db_name
    ACCESS_TOKEN_SECRET=your_strong_random_access_secret_here
    ACCESS_TOKEN_EXPIRY=1d
    REFRESH_TOKEN_SECRET=your_strong_random_refresh_secret_here
    REFRESH_TOKEN_EXPIRY=10d
    SESSION_SECRET=your_strong_random_session_secret_here
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

## 🐳 Running with Docker (Using Pre-built Image)

This method uses the pre-built Docker image from Docker Hub.

1.  **Prerequisites:**
    *   Docker installed and running.
    *   A configured `.env` file in the **root** of the project directory (`HumbleBee-Assignment`) (see step 3 in "Setup & Run (Without Docker)").

2.  **Run the Container:**
    (Docker will automatically pull the image if it's not found locally)
    ```bash
    # Make sure you are in the 'HumbleBee-Assignment' directory containing your .env file
    docker run -d --name humblebee-app -p 8000:8000 --env-file .env ganeshgaud1111102/humblebee:01

    ```
    *   `-d`: Run in detached mode (background).
    *   `--name`: Assign a name to the container.
    *   `-p`: Map host port 8000 to container port 8000.
    *   `--env-file`: Load configuration from your local `.env` file in the current directory.
    *   `ganeshgaud1111102/humblebee:01`: The image to run from Docker Hub.

3.  **Access:** The application will be available at `http://localhost:8000`. Check container logs with `docker logs humblebee-app` if needed.

## 📚 API Documentation

*   Visit: `http://localhost:8000/api-docs` (use your actual port)

## 👑 Admin Dashboard

1.  Register a user with `"role": "admin"` via API (`POST /api/auth/register`).
2.  Go to `http://localhost:8000/admin/` (use your actual port).
3.  Log in with admin credentials.

## 📮 Postman Collection

Use the included Postman collection to easily test the API.

*   **File:** `postman/HumbleBee_API.postman_collection.json` (Located in the `postman` folder within the project root)
*   **Setup:** Import the collection, set `baseURL` environment variable to `http://localhost:8000`.

## ⚙️ Core Logic Explanation

1.  **📍 Nearby Crop Discovery (`GET /api/crops/nearby`):**
    *   Leverages MongoDB's geospatial features (`2dsphere` index, `$nearSphere`) to find crops within a radius and date range.
2.  **🔐 Authentication & Authorization (`/api/auth/*`):**
    *   Uses JWT (access/refresh tokens) and Role-Based Access Control (`admin`/`beekeeper`) via middleware.
3.  **📊 Hive Data Export (`GET /api/hives/export`):**
    *   Fetches hive data, converts JSON to CSV using `json2csv`, and sets headers for browser download.
4.  **📚 API Documentation (`/api-docs`):**
    *   Uses `swagger-jsdoc` to parse code comments and `swagger-ui-express` to serve interactive documentation.
5.  **👑 Admin Dashboard (`/admin/dashboard`):**
    *   Basic web UI for admins, protected by session-based authentication (using `express-session` and `connect-mongo`).
