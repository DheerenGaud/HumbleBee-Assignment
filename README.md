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
    cd Backend
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

## 📄 License

[Specify your license here, e.g., MIT]
