# Vending Machine API

A full-stack application that simulates a vending machine API with user authentication, product management, and purchase functionality.

## 🚀 Features

- **User Management**:
  - User registration and authentication using JWT
  - Role-based authorization (Seller and Buyer roles)
  - Session management with multi-session detection
  - Password security with bcrypt hashing

- **Product Management**:
  - Full CRUD operations for products
  - Role-based access control (Sellers can only manage their own products)
  - Product availability tracking

- **Vending Machine Operations**:
  - Coin deposit system (accepts 5, 10, 20, 50, and 100 cent coins)
  - Purchase functionality with product validation
  - Change calculation and return
  - Deposit reset capability

- **Security Features**:
  - JWT authentication
  - Password hashing
  - Role-based permissions
  - Input validation
  - Multi-session detection and management

## 🔧 Tech Stack

### Backend
- **Framework**: NestJS
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT
- **Testing**: Jest

### Frontend
- **Framework**: React
- **State Management**: Redux
- **UI Library**: Material-UI
- **HTTP Client**: Axios
- **CSS**: Custom CSS stylesheets
- **Testing**: React Testing Library

## 📋 API Endpoints

### User Endpoints
- `POST /user` - Register a new user (public)
- `GET /user` - Get all users (authenticated)
- `GET /user/:id` - Get a specific user (authenticated)
- `PUT /user/:id` - Update a user (authenticated, own account only)
- `DELETE /user/:id` - Delete a user (authenticated, own account only)
- `POST /user/login` - User login
- `POST /user/logout/all` - Logout from all active sessions

### Product Endpoints
- `POST /product` - Create a product (seller only)
- `GET /product` - Get all products (public)
- `GET /product/:id` - Get a specific product (public)
- `PUT /product/:id` - Update a product (authenticated, product owner only)
- `DELETE /product/:id` - Delete a product (authenticated, product owner only)

### Vending Machine Endpoints
- `POST /deposit` - Deposit coins (buyer only)
- `POST /buy` - Purchase products (buyer only)
- `POST /reset` - Reset deposit to 0 (buyer only)

## 🛠️ Setup and Installation

### Prerequisites
- Node.js (v14.x or higher)
- MongoDB (local or Atlas URI)
- npm or yarn

### Backend Setup
1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/vending-machine-api.git
   cd vending-machine-api/backend
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRATION=3600
   PORT=3001
   ```

4. Start the development server
   ```bash
   npm run start:dev
   ```

### Frontend Setup
1. Navigate to the frontend directory
   ```bash
   cd ../frontend
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create a `.env` file with the following variable:
   ```
   REACT_APP_API_URL=http://localhost:3001
   ```

4. Start the development server
   ```bash
   npm start
   ```

## 🧪 Running Tests

### Backend Tests
```bash
cd backend
npm run test
```

### Frontend Tests
```bash
cd frontend
npm run test
```

## 📱 Usage

### User Registration
Register as either a buyer or seller:
```
POST /user
{
  "username": "user123",
  "password": "securePassword",
  "role": "buyer" // or "seller"
}
```

### Deposit Coins (Buyer)
```
POST /deposit
{
  "coin": 20 // Accepts only 5, 10, 20, 50, or 100
}
```

### Buy Products (Buyer)
```
POST /buy
{
  "productId": "product_id_here",
  "amount": 2
}
```

### Add Product (Seller)
```
POST /product
{
  "productName": "Candy Bar",
  "cost": 65,
  "amountAvailable": 10
}
```

## 🧰 Project Structure

```
vending-machine-api/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── dtos/
│   │   ├── guards/
│   │   ├── interfaces/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── services/
│   │   ├── utils/
│   │   └── main.ts
│   ├── test/
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── store/
│   │   ├── styles/
│   │   ├── utils/
│   │   └── App.js
│   └── package.json
└── README.md
```

## 🧩 Edge Cases Handled

- Attempting to buy more products than available
- Insufficient funds for purchase
- Invalid coin denominations
- Handling of change calculation
- Product not found or no longer available
- Session conflict detection
- Role-based permission validation
- Input validation for all endpoints

## 🔐 Security Considerations

- Passwords are hashed using bcrypt
- JWT tokens are used for secure authentication
- Authorization checks on all protected endpoints
- Input validation to prevent injection attacks
- CORS configuration
- Rate limiting for sensitive endpoints
- Detection of multiple active sessions

## 👥 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Contact

 Name -collinsngene@gmail.com

Project Link: [https://github.com/collinsdev-prog/vending-machine-api](https://github.com/collinsdev-prog/vending-machine-api)
