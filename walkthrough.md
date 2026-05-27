# PlacePrep AI — Full Stack Walkthrough

## Project Overview

A modern, dark-themed AI-powered placement preparation platform built with a **Next.js 16 (App Router)** frontend and a **Node.js + Express** backend. 

> [!WARNING]
> To run the backend server, **MongoDB** must be running locally on port `27017` or you must update the `MONGO_URI` in `backend/.env` with your MongoDB Atlas connection string.

---

## 🏗️ Backend Structure (Node.js + Express)

A fully robust MVC architecture built with Express 5, Mongoose, and JWT authentication.

```
backend/
├── config/
│   └── db.js                        # MongoDB connection logic
├── controllers/
│   └── authController.js            # Login, Signup, Get/Update profile, Logout logic
├── middleware/
│   ├── auth.js                      # JWT Verification & Role-based access
│   └── errorHandler.js              # Global centralized error handling
├── models/
│   └── User.js                      # Mongoose User Schema (hashed passwords, placement stats)
├── routes/
│   ├── authRoutes.js                # Public and Protected Auth endpoints
│   └── userRoutes.js                # Protected User/Admin endpoints
├── .env                             # Environment variables configuration
└── server.js                        # Express Entry Point (CORS, Parsing, Routes setup)
```

### 🔐 Backend Features
- **JWT Authentication**: Tokens are issued securely using both JSON payloads and `httpOnly` cookies.
- **MongoDB Connection**: Uses Mongoose for schema validation and database interactions.
- **Validation**: Uses `express-validator` to ensure secure and sanitized inputs for email, password lengths, etc.
- **Error Handling**: A centralized global error handler catches Mongoose validation errors, duplicate keys, and JWT expirations.
- **MVC Folder Structure**: Code is cleanly separated across controllers, routes, models, and middleware.

---

## 🎨 Frontend Structure (Next.js)

Built with **Next.js 16 (App Router)**, **Tailwind CSS**, and **TypeScript**.

> [!TIP]
> The frontend dev server can be started in the `frontend/` directory with `npm run dev` and accessed at **http://localhost:3000**

```
frontend/src/
├── app/
│   ├── layout.tsx                     # Root layout (fonts, metadata)
│   ├── globals.css                    # Design system & animations
│   ├── (dashboard)/
│   │   ├── layout.tsx                 # Sidebar + content wrapper
│   │   ├── page.tsx                   # Dashboard (home)
│   │   └── dsa-tracker/page.tsx       # DSA Tracker
│   └── (auth)/
│       ├── login/page.tsx             # Login page
│       └── signup/page.tsx            # Signup page
├── components/
│   ├── Sidebar.tsx                    # Collapsible nav sidebar
│   ├── StatCard.tsx                   # Reusable stat card
│   ├── DSATable.tsx                   # Filterable DSA problem table
│   └── AuthForm.tsx                   # Shared login/signup form
└── lib/
    └── dsaData.ts                     # 52 DSA problems dataset
```

### 💻 Frontend Features
- **Dark Glassmorphism Theme**: Custom CSS properties for colors, surfaces, and glowing accents.
- **Route Groups**: Separation of concerns between `(dashboard)` layouts with a sidebar and `(auth)` layouts.
- **Reusable Components**: Modular sidebar, stats cards, complex filtering tables, and shared authentication forms.
- **Responsive Animations**: Staggered fade-ins, pulsing glows, and smooth transitions.

---

## 🚀 Running the Project

**1. Backend**
Ensure MongoDB is running locally or set the `MONGO_URI` in `backend/.env`.
```bash
cd backend
npm install
npm run dev
```

**2. Frontend**
```bash
cd frontend
npm install
npm run dev
```
