# Modern Learning Management System (LMS)

A production-ready full-stack Learning Management System built with **Next.js 14**, **Tailwind CSS**, **Node.js**, **Express**, and **MySQL**.

## Features

- **Authentication System**: Secure JWT-based auth with refresh token rotation. Role-based access (Admin, Student).
- **Course Catalog & Enrollment**: Students can browse available courses and enroll instantly.
- **Video Learning Interface**: YouTube embedded videos, lesson progress tracking, sequential unlocking, auto-resume from last timestamp.
- **Admin Dashboard**: Comprehensive course management.
- **Content Management**: Drag-and-drop video reordering to perfectly arrange sections and curriculums.

## Prerequisites
- Node.js (v18+)
- MySQL Base

## Getting Started

### 1. Database Setup
1. Open MySQL and execute the `backend/schema.sql` file to create the tables.
2. Execute the `backend/seed.sql` file to populate demo data (including Admin and Student accounts).

### 2. Backend Setup
1. Navigate to the backend directory: `cd backend`
2. Update the `.env` file with your MySQL credentials:
   ```env
   DB_HOST=localhost
   DB_USER=your_mysql_user
   DB_PASSWORD=your_mysql_password
   DB_NAME=lms_db
   ```
3. Run the development server: `npm run dev` (Runs on `http://localhost:5000`)

### 3. Frontend Setup
1. Navigate to the frontend directory: `cd frontend`
2. Change the API URL if needed by creating a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```
3. Start the application: `npm run dev` (Runs on `http://localhost:3000`)

## Test Accounts
You can log in with the seeded accounts:

**Admin:**
- Email: `admin@example.com`
- Password: `password123`

**Student:**
- Email: `student@example.com`
- Password: `password123`

## Tech Stack
- **Frontend**: Next.js App Router, React, Tailwind CSS, Axios, @hello-pangea/dnd (Drag and drop)
- **Backend**: Node.js, Express, MySQL2, JSONWebToken, Bcrypt
