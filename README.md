# Wholesale ZA - MERN Stack Ecommerce Website

A full-stack ecommerce application for Wholesale ZA, specializing in office supplies and stationery. Built with MongoDB, Express.js, React, and Node.js.

## Features

- User authentication (Register/Login)
- Product catalog with categories
- Shopping cart functionality
- Checkout and order processing
- Order history
- Admin panel for product management
- Responsive design

## Project Structure

```
ecommerce-app/
├── backend/          # Express.js backend
├── frontend/         # React frontend
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. Install backend dependencies:
```bash
cd backend
npm install
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

3. Create a `.env` file in the backend directory:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_jwt_secret_key_here
```

4. Start the backend server:
```bash
cd backend
npm run dev
```

5. Start the frontend development server:
```bash
cd frontend
npm start
```

The application will be available at `http://localhost:3000`

## Database Seeding

To seed the database with products from the CSV file and users, run:

```bash
cd backend
npm run seed
```

This will:
- Import products from `wholesale_za_products.csv` 
- Create admin user (email: admin@example.com, password: admin123)
- Create test user (email: user@example.com, password: user123)

**Note:** Make sure the `wholesale_za_products.csv` file is in the root directory of the project.

## Currency

All prices are displayed in South African Rand (ZAR). 
- Free shipping on orders over R500
- 15% VAT (Value Added Tax) applied to all orders

## Technologies Used

- **Backend**: Node.js, Express.js, MongoDB, Mongoose, JWT
- **Frontend**: React, React Router, Axios, Context API
- **Styling**: CSS3, Modern UI components

