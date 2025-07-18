# Frontend & Backend Roadmap Application

A full-stack web application built with React and Node.js, featuring user authentication, dashboard analytics, and user management capabilities.

## 🚀 Project Structure

```
frontend-backend-roadmap/
├── frontend/                 # React.js frontend application
│   ├── public/              # Public assets
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── Auth/        # Authentication components
│   │   │   ├── Dashboard/   # Dashboard components
│   │   │   ├── Layout/      # Layout components (Navbar)
│   │   │   ├── Settings/    # Settings components
│   │   │   └── User/        # User management components
│   │   ├── context/         # React context (AuthContext)
│   │   └── ...
│   └── package.json
├── backend/                 # Node.js/Express backend API
│   ├── middleware/          # Express middleware
│   ├── models/              # MongoDB models
│   ├── routes/              # API routes
│   ├── .env                 # Environment variables
│   └── server.js           # Server entry point
└── package.json            # Root package.json
```

## 🛠 Technologies Used

### Frontend
- **React 18** - Frontend framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **CSS3** - Styling

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Development Tools
- **Concurrently** - Run multiple commands
- **Nodemon** - Development server
- **Morgan** - HTTP request logger
- **Helmet** - Security middleware

## 🔧 Features

- **Authentication System**
  - User registration and login
  - JWT-based authentication
  - Protected routes
  - Role-based access control (Admin, Moderator, User)

- **Dashboard**
  - Real-time statistics
  - Recent activity feed
  - Quick action buttons
  - Responsive design

- **User Management**
  - CRUD operations for users
  - Role management
  - User status (active/inactive)
  - Search and filtering

- **Payment Integration (Razorpay)**
  - Multiple subscription plans (Basic, Premium, Enterprise)
  - Secure payment processing
  - Payment history and tracking
  - Subscription management
  - Automatic payment verification

- **Security Features**
  - Password hashing with bcrypt
  - JWT token authentication
  - Rate limiting
  - Input validation
  - CORS protection
  - Secure payment processing

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (local installation or MongoDB Atlas)
- **Git**

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd frontend-backend-roadmap
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install all dependencies (frontend + backend)
npm run install-all
```

### 3. Environment Configuration

Create a `.env` file in the `backend` directory:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/roadmap_app
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=30d
BCRYPT_ROUNDS=12
CLIENT_URL=http://localhost:3000
```

### 4. Database Setup

Make sure MongoDB is running on your system:

```bash
# If using local MongoDB
mongod

# Or start MongoDB service
sudo systemctl start mongod  # Linux
brew services start mongodb  # macOS
```

### 5. Start the Application

```bash
# Start both frontend and backend concurrently
npm run dev

# Or start them separately:
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm start
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update user profile |
| POST | `/api/auth/logout` | Logout user |

### User Management Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/users` | Get all users | Admin/Moderator |
| GET | `/api/users/:id` | Get user by ID | Admin/Own Profile |
| POST | `/api/users` | Create new user | Admin |
| PUT | `/api/users/:id` | Update user | Admin/Own Profile |
| DELETE | `/api/users/:id` | Delete user | Admin |

### Dashboard Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Get dashboard statistics |
| GET | `/api/dashboard/activity` | Get recent activity |
| GET | `/api/dashboard/analytics` | Get user analytics |
| GET | `/api/dashboard/health` | Get system health |

### Payment Endpoints (Razorpay)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/payments/plans` | Get available subscription plans |
| POST | `/api/payments/create-order` | Create Razorpay payment order |
| POST | `/api/payments/verify` | Verify payment signature |
| GET | `/api/payments/history` | Get user payment history |
| GET | `/api/payments/:id` | Get specific payment details |
| POST | `/api/payments/webhook` | Razorpay webhook endpoint |

## 🎨 Default User Roles

- **Admin**: Full access to all features
- **Moderator**: Can view and manage users
- **User**: Basic access to dashboard and profile

## 🔐 Default Admin Account

After starting the application, you can create an admin account by registering through the frontend, then manually updating the user role in the database:

```javascript
// In MongoDB shell
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

## 🧪 Testing

```bash
# Run backend tests
cd backend && npm test

# Run frontend tests
cd frontend && npm test
```

## 📦 Building for Production

```bash
# Build frontend
cd frontend && npm run build

# Start backend in production mode
cd backend && NODE_ENV=production npm start
```

## 🔧 Environment Variables

### Backend (.env)
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `JWT_EXPIRE` - JWT expiration time
- `BCRYPT_ROUNDS` - Bcrypt hashing rounds
- `CLIENT_URL` - Frontend URL for CORS

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

## 🚀 Deployment

### Frontend (Netlify/Vercel)
1. Build the frontend: `cd frontend && npm run build`
2. Deploy the `build` folder

### Backend (Heroku/Railway/DigitalOcean)
1. Set environment variables
2. Deploy the `backend` folder
3. Ensure MongoDB is accessible

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🐛 Known Issues

- Dashboard statistics are currently using mock data
- Real-time updates not implemented yet
- File upload for user avatars not implemented

## 🔮 Future Enhancements

- [ ] Real-time notifications
- [ ] File upload for avatars
- [ ] Email verification
- [ ] Password reset functionality
- [ ] Two-factor authentication
- [ ] API rate limiting per user
- [ ] Advanced analytics and reporting
- [ ] Project management features
- [ ] Team collaboration tools

## 📞 Support

For support, please open an issue in the GitHub repository or contact the development team.

---

**Happy Coding! 🎉**