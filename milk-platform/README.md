<!-- Auth.css 
    customer.css  
    
-->

# 🥛 Milk Platform - MERN Stack Application

A complete real-world milk selling business platform built with the MERN stack (MongoDB, Express, React, Node.js) and Socket.io for real-time updates.

## 📋 Features

### Customer Features
- ✅ Self-registration and authentication
- ✅ Browse dynamic milk types (Cow, Buffalo, Goat, etc.)
- ✅ View sellers offering selected milk type
- ✅ Place daily orders with time-based validation (5 AM - 10 AM for same-day)
- ✅ Create subscriptions with custom duration
- ✅ Pause subscriptions (1 day advance notice required)
- ✅ Automatic subscription extension when paused
- ✅ Track payments and remaining balance
- ✅ Rate and review milk products and sellers
- ✅ Real-time order updates

### Seller Features
- ✅ Admin-created seller accounts
- ✅ Add and manage milk products dynamically
- ✅ Set pricing, fat percentage, nutrients, quality
- ✅ View real-time orders and subscriptions
- ✅ Track customer payments and earnings
- ✅ View ratings and reviews
- ✅ Manage paused subscriptions
- ✅ Real-time notifications for all events

### Technical Features
- ✅ JWT-based authentication
- ✅ Role-based access control
- ✅ Real-time updates via Socket.io
- ✅ Time-based order validation
- ✅ Dynamic subscription pause/extension logic
- ✅ Payment tracking system
- ✅ Rating and review system with automatic average calculation
- ✅ Fully responsive UI
- ✅ No hardcoded data

## 🛠️ Tech Stack

**Backend:**
- Node.js
- Express.js
- MongoDB with Mongoose
- Socket.io
- JWT for authentication
- bcryptjs for password hashing

**Frontend:**
- React.js
- React Router DOM
- Socket.io Client
- Axios
- React Toastify
- Moment.js
- Recharts (for analytics)

## 📁 Project Structure

```
milk-platform/
├── server/                      # Backend
│   ├── config/
│   │   ├── db.js               # MongoDB connection
│   │   └── socket.js           # Socket.io setup
│   ├── controllers/
│   │   ├── authController.js   # Auth logic
│   │   ├── milkController.js   # Milk CRUD
│   │   ├── orderController.js  # Order management
│   │   ├── subscriptionController.js
│   │   ├── paymentController.js
│   │   └── ratingController.js
│   ├── middleware/
│   │   ├── auth.js             # JWT verification
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Milk.js
│   │   ├── Order.js
│   │   ├── Subscription.js
│   │   ├── Payment.js
│   │   └── Rating.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── milkRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── subscriptionRoutes.js
│   │   ├── paymentRoutes.js
│   │   └── ratingRoutes.js
│   ├── .env
│   ├── server.js               # Main server file
│   └── package.json
│
└── client/                      # Frontend
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.js
    │   │   ├── Navbar.css
    │   │   └── PrivateRoute.js
    │   ├── context/
    │   │   ├── AuthContext.js
    │   │   └── SocketContext.js
    │   ├── pages/
    │   │   ├── Home.js
    │   │   ├── auth/
    │   │   │   ├── CustomerLogin.js
    │   │   │   ├── CustomerSignup.js
    │   │   │   └── SellerLogin.js
    │   │   ├── customer/
    │   │   │   ├── CustomerDashboard.js
    │   │   │   ├── BrowseMilk.js
    │   │   │   ├── SellersByMilk.js
    │   │   │   ├── PlaceOrder.js
    │   │   │   ├── MyOrders.js
    │   │   │   ├── MySubscriptions.js
    │   │   │   └── MyPayments.js
    │   │   └── seller/
    │   │       ├── SellerDashboard.js
    │   │       ├── ManageMilk.js
    │   │       ├── SellerOrders.js
    │   │       ├── SellerSubscriptions.js
    │   │       ├── SellerPayments.js
    │   │       └── SellerRatings.js
    │   ├── utils/
    │   │   └── api.js
    │   ├── App.js
    │   ├── index.js
    │   └── index.css
    └── package.json
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone the Repository
```bash
git clone <repository-url>
cd milk-platform
```

### 2. Install Dependencies

**Root level:**
```bash
npm run install-all
```

Or manually:
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Environment Configuration

**Server (.env):**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/milk-platform
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

**Client (.env):**
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

### 4. Start MongoDB
```bash
# If using local MongoDB
mongod
```

### 5. Run the Application

**Development mode (concurrent):**
```bash
npm run dev
```

**Or run separately:**
```bash
# Terminal 1 - Server
cd server
npm run dev

# Terminal 2 - Client
cd client
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## 🎯 Usage

### First-Time Setup

1. **Create Admin User** (via MongoDB directly or backend script)
2. **Admin Creates Seller Accounts**
3. **Sellers Add Milk Products**
4. **Customers Self-Register**
5. **Customers Browse & Order**

### Time-Based Order Rules

**Same-Day Orders:**
- Allowed only between 5:00 AM - 10:00 AM
- Only if milk is available on that day

**Future Orders:**
- Can be placed anytime
- Must be for tomorrow or later

### Subscription Management

**Creating a Subscription:**
- Select start date
- Choose number of days
- Set quantity per day
- System calculates total amount

**Pausing a Subscription:**
- Must be done at least 1 day in advance
- Paused days automatically extend subscription
- Related order is cancelled

## 📡 Socket Events

### Customer Events
- `NEW_ORDER` - New order notification
- `ORDER_STATUS_UPDATED` - Order status changed
- `SUBSCRIPTION_PAUSED` - Subscription paused
- `PAYMENT_RECEIVED` - Payment confirmation

### Seller Events
- `NEW_ORDER` - Incoming order
- `ORDER_CANCELLED` - Order cancellation
- `NEW_SUBSCRIPTION` - New subscription
- `SUBSCRIPTION_PAUSED` - Customer paused
- `PAYMENT_RECEIVED` - Payment received
- `NEW_RATING` - New rating/review

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/customer/signup` - Customer registration
- `POST /api/auth/customer/login` - Customer login
- `POST /api/auth/seller/login` - Seller login
- `POST /api/auth/admin/create-seller` - Create seller (Admin)
- `GET /api/auth/me` - Get current user

### Milk
- `GET /api/milk/types` - Get all milk types
- `GET /api/milk/sellers/:milkType` - Get sellers by milk type
- `GET /api/milk/:id` - Get milk details
- `POST /api/milk` - Add milk (Seller)
- `PUT /api/milk/:id` - Update milk (Seller)
- `DELETE /api/milk/:id` - Delete milk (Seller)

### Orders
- `POST /api/orders/daily` - Create daily order
- `GET /api/orders/customer` - Get customer orders
- `GET /api/orders/seller` - Get seller orders
- `PUT /api/orders/:id/status` - Update order status (Seller)
- `PUT /api/orders/:id/cancel` - Cancel order (Customer)

### Subscriptions
- `POST /api/subscriptions` - Create subscription
- `GET /api/subscriptions/customer` - Get customer subscriptions
- `GET /api/subscriptions/seller` - Get seller subscriptions
- `POST /api/subscriptions/:id/pause` - Pause subscription
- `PUT /api/subscriptions/:id/cancel` - Cancel subscription

### Payments
- `POST /api/payments` - Record payment
- `GET /api/payments/customer` - Get customer payments
- `GET /api/payments/seller` - Get seller payments
- `GET /api/payments/seller/summary` - Seller earnings summary

### Ratings
- `POST /api/ratings` - Create rating
- `GET /api/ratings/seller/:sellerId` - Get seller ratings
- `GET /api/ratings/milk/:milkId` - Get milk ratings
- `PUT /api/ratings/:id` - Update rating
- `DELETE /api/ratings/:id` - Delete rating

## 🧪 Testing

The system enforces business rules:
1. Same-day orders only between 5 AM - 10 AM
2. Subscriptions can be paused 1 day in advance
3. Paused days extend subscription automatically
4. Ratings update averages in real-time
5. All events trigger Socket.io notifications

## 🌟 Key Features Explained

### Dynamic Milk Types
- Sellers can add any milk type
- Automatically appears for all customers
- No hardcoded milk types

### Time-Based Validation
- Backend enforces order time rules
- Prevents invalid same-day orders
- Future orders allowed anytime

### Subscription Pause Logic
- 1-day advance requirement
- Automatic extension calculation
- Order cancellation on paused dates
- Real-time seller notification

### Payment Tracking
- Total amount calculation
- Paid amount tracking
- Remaining balance display
- Seller earnings dashboard

## 🤝 Contributing

This is a complete production-ready application. Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

## 📝 License

MIT License

## 👥 Team

4-member development team

## 📞 Support

For issues or questions, please create an issue in the repository.

---

**Built with ❤️ using MERN Stack**










<!--File Structure  -->
<!-- # Complete File Structure

## Project Root
```
milk-platform/
│
├── package.json                 # Root package.json for running concurrent dev servers
├── README.md                    # Complete project documentation
│
├── server/                      # Backend Application
│   ├── config/
│   │   ├── db.js               # MongoDB connection configuration
│   │   └── socket.js           # Socket.io setup and event handlers
│   │
│   ├── controllers/
│   │   ├── authController.js   # Authentication logic (signup, login, JWT)
│   │   ├── milkController.js   # Milk CRUD operations
│   │   ├── orderController.js  # Order management with time validation
│   │   ├── subscriptionController.js  # Subscription with pause/extend logic
│   │   ├── paymentController.js       # Payment tracking and earnings
│   │   └── ratingController.js        # Rating and review system
│   │
│   ├── middleware/
│   │   ├── auth.js             # JWT authentication and authorization
│   │   └── errorHandler.js     # Centralized error handling
│   │
│   ├── models/
│   │   ├── User.js             # User model (Customer, Seller, Admin roles)
│   │   ├── Milk.js             # Milk product model with dynamic types
│   │   ├── Order.js            # Order model with time validation
│   │   ├── Subscription.js     # Subscription with pause/extension logic
│   │   ├── Payment.js          # Payment transaction model
│   │   └── Rating.js           # Rating and review model
│   │
│   ├── routes/
│   │   ├── authRoutes.js       # Authentication routes
│   │   ├── milkRoutes.js       # Milk management routes
│   │   ├── orderRoutes.js      # Order routes (customer & seller)
│   │   ├── subscriptionRoutes.js  # Subscription routes
│   │   ├── paymentRoutes.js    # Payment routes
│   │   └── ratingRoutes.js     # Rating routes
│   │
│   ├── .env                     # Environment variables
│   ├── server.js                # Main server entry point
│   └── package.json             # Server dependencies
│
└── client/                      # Frontend Application
    ├── public/
    │   └── index.html           # HTML template
    │
    ├── src/
    │   ├── components/          # Reusable React components
    │   │   ├── Navbar.js        # Navigation bar component
    │   │   ├── Navbar.css       # Navbar styles
    │   │   ├── PrivateRoute.js  # Route protection component
    │   │   ├── Loading.js       # Loading spinner component
    │   │   ├── MilkCard.js      # Milk product card
    │   │   ├── OrderCard.js     # Order display card
    │   │   ├── SubscriptionCard.js  # Subscription card
    │   │   ├── PaymentCard.js   # Payment card
    │   │   ├── RatingCard.js    # Rating display card
    │   │   └── Modal.js         # Reusable modal component
    │   │
    │   ├── context/
    │   │   ├── AuthContext.js   # Authentication state management
    │   │   └── SocketContext.js # Socket.io connection and events
    │   │
    │   ├── pages/
    │   │   ├── Home.js          # Landing page
    │   │   │
    │   │   ├── auth/            # Authentication pages
    │   │   │   ├── CustomerLogin.js
    │   │   │   ├── CustomerSignup.js
    │   │   │   └── SellerLogin.js
    │   │   │
    │   │   ├── customer/        # Customer pages
    │   │   │   ├── CustomerDashboard.js     # Customer home
    │   │   │   ├── BrowseMilk.js            # Browse milk types
    │   │   │   ├── SellersByMilk.js         # View sellers for milk type
    │   │   │   ├── PlaceOrder.js            # Order placement form
    │   │   │   ├── MyOrders.js              # View all orders
    │   │   │   ├── MySubscriptions.js       # Manage subscriptions
    │   │   │   └── MyPayments.js            # Payment history
    │   │   │
    │   │   └── seller/          # Seller pages
    │   │       ├── SellerDashboard.js       # Seller home
    │   │       ├── ManageMilk.js            # Add/edit milk products
    │   │       ├── SellerOrders.js          # View and manage orders
    │   │       ├── SellerSubscriptions.js   # View subscriptions
    │   │       ├── SellerPayments.js        # Payment tracking
    │   │       └── SellerRatings.js         # View ratings
    │   │
    │   ├── utils/
    │   │   ├── api.js           # Axios configuration
    │   │   ├── validators.js    # Form validation helpers
    │   │   └── helpers.js       # Utility functions
    │   │
    │   ├── App.js               # Main App component with routing
    │   ├── index.js             # React entry point
    │   └── index.css            # Global styles
    │
    └── package.json             # Client dependencies
```

## File Count Summary

### Server (Backend)
- Config files: 2
- Controllers: 6
- Middleware: 2
- Models: 6
- Routes: 6
- Main files: 3 (server.js, package.json, .env)
**Total Backend Files: 25**

### Client (Frontend)
- Components: 10+
- Context: 2
- Pages: 15+
- Utils: 3
- Main files: 4 (App.js, index.js, index.css, index.html)
**Total Frontend Files: 35+**

### Root
- package.json
- README.md
**Total Root Files: 2**

## **GRAND TOTAL: 60+ FILES**

## Key Directories Purpose

### `/server/config/`
Database connection and Socket.io configuration

### `/server/controllers/`
Business logic for all features

### `/server/middleware/`
Authentication and error handling

### `/server/models/`
MongoDB schemas using Mongoose

### `/server/routes/`
API endpoint definitions

### `/client/src/components/`
Reusable React components

### `/client/src/context/`
Global state management (Auth, Socket)

### `/client/src/pages/`
Page-level components for different routes

### `/client/src/utils/`
Helper functions and API configuration

## Environment Files

### Server `.env`
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/milk-platform
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

### Client `.env`
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

## Package Dependencies

### Server Dependencies
- express
- mongoose
- bcryptjs
- jsonwebtoken
- dotenv
- cors
- socket.io
- express-validator
- moment

### Client Dependencies
- react
- react-dom
- react-router-dom
- axios
- socket.io-client
- react-toastify
- moment
- recharts

## Notes

1. All files follow clean code principles
2. No hardcoded data anywhere
3. Fully dynamic and scalable architecture
4. Production-ready code structure
5. Clear separation of concerns
6. Modular and maintainable codebase -->