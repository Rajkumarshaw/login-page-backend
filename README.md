# AgeFlow — Private Age Calculator & Admin Management System

A secure, production-grade full-stack SaaS application for calculating age, designed from the ground up with a **strict privacy and security-first model**. 

Ordinary visitors can compute and submit their details without ever being exposed to other users' information or database statistics. Only authenticated administrators can access user records, search, sort, and manage details via a secure, cookie-gated admin portal.

---

## 1. Privacy & Security Model

Personal information (names and dates of birth) is highly sensitive. AgeFlow mitigates data leakage risks using the following paradigms:
- **No Public Directories**: There are no public views or endpoints returning the collection of submitted user records.
- **Strict Backend Authorization**: All admin endpoints are protected by `authMiddleware` and `adminMiddleware` verifying JWT signatures. Attempting to bypass the UI to call `GET /api/admin/records` directly returns a `401 Unauthorized` or `403 Forbidden` response.
- **Minimized Data Transfer**: Public submissions (`POST /api/records`) return *only* the newly calculated age segment. No database IDs, creation dates, or user tables are included in the response payload.
- **Cryptographic Safeguards**: Administrator credentials are never stored in plain text. Passwords are salted and hashed using `bcrypt` (10 rounds).
- **HTTP-Only Cookies**: JWTs are stored in HTTP-Only cookies with the `SameSite=Strict` flag. This guards the session credentials against Cross-Site Scripting (XSS) and minimizes session hijacking vectors.

---

## 2. Technology Stack

- **Frontend**: React 18, Vite (fast HMR), Tailwind CSS (professional premium design), Axios (API calls), Lucide React (vector iconography), React Router DOM (clean SPA navigation).
- **Backend**: Node.js, Express.js (REST API server), MongoDB & Mongoose (object data modeling), Helmet (secure HTTP response headers), Cookie Parser (secure payload extraction).
- **Session Auth**: JSON Web Tokens (JWT), `bcryptjs` (password hashing).
- **Local Dev Fallback**: `mongodb-memory-server` spins up an in-memory database automatically if no local MongoDB instance is running on port 27017, making the codebase plug-and-play.

---

## 3. Database Schemas

### Record Schema (`models/Record.js`)
Stores user inputs. To prevent data from becoming obsolete, **age is not stored**. It is calculated dynamically upon request.
```javascript
{
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
  dateOfBirth: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

### Admin Schema (`models/Admin.js`)
Defines the authorized system administrator accounts.
```javascript
{
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false }, // Omitted from query results by default
  role: { type: String, default: 'admin', enum: ['admin'] },
  createdAt: { type: Date, default: Date.now }
}
```

---

## 4. API Endpoints

### Public
| Method | Route | Description | Input Payload | Output Payload |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/api/records` | Submits user name and DOB; computes and returns age. | `{ "name": "Rahul", "dateOfBirth": "2002-05-15" }` | `{ "message": "...", "age": { "years": 24, "months": 3, "days": 11 } }` |

### Admin (Auth Required)
| Method | Route | Description | Output Payload / Actions |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/admin/login` | Validates admin email/password, issues HTTP-only JWT cookie. | `{ "message": "Login successful.", "admin": { ... } }` |
| **POST** | `/api/admin/logout` | Clears JWT session cookie. | `{ "message": "Logged out successfully." }` |
| **GET** | `/api/admin/me` | Validates session token, returns logged-in admin. | `{ "admin": { "email": "...", "role": "admin" } }` |
| **GET** | `/api/admin/records` | Returns list of all records with age computed on the fly. Supports `?search=` and `?sort=`. | `[ { "_id": "...", "name": "...", "age": { ... } } ]` |
| **GET** | `/api/admin/stats` | Computes aggregate counts, mean age, youngest, and oldest. | `{ "total": 12, "averageAge": 28.5, "youngest": { ... }, "oldest": { ... } }` |
| **GET** | `/api/admin/records/:id`| Returns a single record. | `{ "_id": "...", "name": "...", "age": { ... } }` |
| **PUT** | `/api/admin/records/:id`| Modifies a record (updates name or DOB). Recalculates age. | `{ "message": "Record updated successfully.", "record": { ... } }` |
| **DELETE**| `/api/admin/records/:id`| Deletes a record from the database. | `{ "message": "Record deleted successfully." }` |

---

## 5. Directory Structure

```
ageflow/
├── backend/
│   ├── config/db.js
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── authController.js
│   │   └── recordController.js
│   ├── middleware/
│   │   ├── adminMiddleware.js
│   │   ├── authMiddleware.js
│   │   └── errorMiddleware.js
│   ├── models/
│   │   ├── Admin.js
│   │   └── Record.js
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── authRoutes.js
│   │   └── recordRoutes.js
│   ├── utils/
│   │   └── calculateAge.js
│   ├── scripts/
│   │   └── seedAdmin.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminLogin.jsx
│   │   │   ├── AgeCalculator.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── RecordsTable.jsx
│   │   │   ├── StatsCards.jsx
│   │   │   └── Toast.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   └── recordService.js
│   │   ├── utils/
│   │   │   ├── calculateAge.js
│   │   │   └── validators.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
├── .env.example
├── .gitignore
└── README.md
```

---

## 6. Installation & Running Instructions

### Step 1: Environment Settings
Create a `.env` file in the project root (you can copy `.env.example`).
```bash
# Clone the env file
cp .env.example .env
```
Ensure you set:
- `JWT_SECRET`: A secure random cryptographic string.
- `ADMIN_EMAIL` and `ADMIN_PASSWORD`: Credentials for the administrator account.

### Step 2: Running the Backend
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Initialize the admin database record:
   ```bash
   npm run seed:admin
   ```
4. Start the backend server:
   ```bash
   # Production mode
   npm start
   # Development hot-reload mode
   npm run dev
   ```
*Note: If no local MongoDB is running on port 27017, the backend will automatically spin up `mongodb-memory-server` in the background.*

### Step 3: Running the Frontend
1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to the URL shown (default: `http://localhost:5173`).

---

## 7. How I would explain this project in an interview

**1. Why React on the frontend?**
React enables a highly responsive single-page application (SPA) user experience. Its component-driven architecture allows us to separate concerns easily (such as isolating public calculation widgets from the admin dashboard and tables) and provides fast state transitions.

**2. Why Express.js on the backend?**
Express.js is light, unopinionated, and fast. It allows us to easily set up custom middleware stacks, which is crucial for handling authentication checks (`authMiddleware`) and authorization validations (`adminMiddleware`) before request handlers are reached.

**3. Why MongoDB and Mongoose?**
MongoDB is document-oriented, meaning we can store records as JSON documents. This structure maps naturally to JavaScript and Node.js. Mongoose acts as a clean Object Data Modeling (ODM) layer, allowing us to specify strict validation constraints (e.g., minimum character length on names) directly at the schema level.

**4. Why use JWTs for authentication?**
JSON Web Tokens (JWT) are self-contained and stateless, meaning the server doesn't need to maintain a database session table for checking user authentication on every request. This reduces load on the database and allows the API layer to scale easily.

**5. Why use HTTP-Only Cookies instead of localStorage?**
Storing JWTs in `localStorage` makes them accessible to JavaScript. If a third-party script gets injected into the app (XSS attack), the token can be easily stolen. Placing the JWT inside an HTTP-only cookie prevents browser-side JavaScript from reading it. Using `SameSite=Strict` and `Secure` attributes also mitigates Cross-Site Request Forgery (CSRF) and interception vectors.

**6. Why use a separate Admin model?**
Keeping `Admin` accounts in a dedicated model separates normal submitted visitor logs from privileged system accounts. This enforces a clear segregation of duties, prevents database collisions, and ensures we can configure specialized policies (like setting `select: false` on the administrator's password field) without bloat.

**7. Why not store age directly in the database?**
Storing a computed age is an anti-pattern because age shifts every single day. If we stored "24 years", that value would become inaccurate next year. Storing the static Date of Birth (DOB) ensures the data remains forever accurate, and we compute the current age dynamically on the fly whenever the record is fetched.

**8. How does authorization work?**
Authorization works on two levels:
1. *Frontend routing*: React Router protects routes by checking for a valid session, redirecting unauthenticated users to `/admin/login`.
2. *Backend routes (The real security)*: The backend guards all admin APIs. Every request must pass through a middleware that reads the cookie, verifies the JWT signature, and checks the database model. If the verification fails, the backend immediately stops execution and returns a `401` or `403` JSON error.

**9. How does data flow from the calculator to the database?**
The visitor enters a name and DOB, triggering frontend input validation. On success, an Axios request sends a `POST` request with the fields to `/api/records`. The Express route handles the request, validates the input format, sanitizes the name, writes the new record to MongoDB via Mongoose, calculates the current age in memory, and returns only the calculated age to the user.
