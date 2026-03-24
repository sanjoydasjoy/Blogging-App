# Blogging App

A full-stack blogging application built with React.js and Node.js that allows users to create, read, update, and delete blog posts.

## Project Structure

```
blogging-app/
<<<<<<< HEAD
├── frontend/                     # React frontend application
│   ├── public/                   # Public assets
│   ├── src/                      # Source files
│   │   ├── pages/                # Page components
│   │   │   ├── CreatePost.js     # Create new post page
│   │   │   ├── IndexPage.js      # Home page with posts list
│   │   │   ├── LoginPage.js      # User login page
│   │   │   └── RegisterPage.js   # User registration page
│   │   ├── App.js                # Main application component
│   │   ├── App.css               # Main application styles
│   │   ├── header.js             # Header component
│   │   ├── layout.js             # Layout component
│   │   ├── post.js               # Post component
│   │   ├── index.js              # Application entry point
│   │   ├── index.css             # Global styles
│   │   └── UserContext.js        # User authentication context
│   ├── package.json              # Frontend dependencies
│   └── README.md                 # Frontend documentation
│
├── backend/                      # Node.js backend application
│   ├── models/                   # MongoDB models
│   │   ├── Post.js               # Post model schema
│   │   └── User.js               # User model schema
│   ├── uploads/                  # File upload directory for blog images
│   ├── index.js                  # Main server file with API routes
│   └── package.json              # Backend dependencies
│
└── README.md                     # Main documentation
=======
├── frontend/                # React frontend application
│   ├── public/             # Public assets
│   ├── src/                # Source files
│   │   ├── pages/         # Page components
│   │   │   ├── CreatePost.js    # Create new post page
│   │   │   ├── IndexPage.js     # Home page with posts list
│   │   │   ├── LoginPage.js     # User login page
│   │   │   └── RegisterPage.js  # User registration page
│   │   ├── App.js         # Main application component
│   │   ├── App.css        # Main application styles
│   │   ├── header.js      # Header component
│   │   ├── layout.js      # Layout component
│   │   ├── post.js        # Post component
│   │   ├── index.js       # Application entry point
│   │   ├── index.css      # Global styles
│   │   └── UserContext.js # User authentication context
│   ├── package.json       # Frontend dependencies
│   └── README.md          # Frontend documentation
│
├── backend/               # Node.js backend application
│   ├── models/           # MongoDB models
│   │   ├── Post.js      # Post model schema
│   │   └── User.js      # User model schema
│   ├── uploads/         # File upload directory for blog images
│   ├── index.js        # Main server file with API routes
│   └── package.json    # Backend dependencies
│
└── README.md           # Main documentation
>>>>>>> a106c8e (hardcoded credentials removed)
```

## Prerequisites

Before running this application, make sure you have the following installed:

- Node.js (v14.0.0 or higher)
- npm (Node Package Manager)
- MongoDB Atlas account or local MongoDB installation
- Git

## Setup & Installation

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Environment Setup:
<<<<<<< HEAD
   - Make sure MongoDB connection string is properly configured in `index.js`
   - The backend will run on port 4000
=======
   - Create `backend/.env` from `backend/.env.example`
   - Set `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, and `PORT`
>>>>>>> a106c8e (hardcoded credentials removed)

4. Start the backend server:
   ```bash
   # For development with auto-reload:
   npm run dev

   # For production:
   npm start
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the frontend development server:
   ```bash
   npm start
   ```

<<<<<<< HEAD
=======
4. Frontend Environment Setup:
   - Create `frontend/.env` from `frontend/.env.example`
   - Set `REACT_APP_API_URL` to your backend URL

>>>>>>> a106c8e (hardcoded credentials removed)
The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000

## Features

- User authentication (Register/Login)
- Create and publish blog posts
- Upload images for blog posts
- View all blog posts
- Responsive design

## Tech Stack

### Frontend
- React.js
- React Router DOM
- CSS for styling

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Multer for file uploads
- bcrypt for password hashing

## API Endpoints

- `POST /register` - Register new user
- `POST /login` - User login
- `POST /logout` - User logout
- `GET /profile` - Get user profile
- `POST /post` - Create new blog post
- `GET /post` - Get all blog posts


