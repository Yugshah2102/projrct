# ReWear - Community Clothing Exchange Platform

![ReWear Logo](https://via.placeholder.com/150x50/0ea5e9/ffffff?text=ReWear)

ReWear is a web-based platform that enables users to exchange unused clothing through direct swaps or a point-based redemption system. The platform promotes sustainable fashion and reduces textile waste by encouraging users to reuse wearable garments instead of discarding them.

## 🌟 Features

### Core Features
- **User Authentication**: Email/password signup and login system
- **Landing Page**: Platform introduction with calls-to-action and featured items carousel
- **User Dashboard**: Profile details, points balance, uploaded items overview, and swap history
- **Item Management**: Upload, edit, and manage clothing items with image gallery
- **Search & Browse**: Advanced filtering and search functionality
- **Swap System**: Request item swaps or redeem items with points
- **Points System**: Earn points for listing items and spend them on desired items
- **Admin Panel**: Moderate and approve/reject item listings

### Technical Features
- **Modern UI/UX**: Beautiful and responsive design with Tailwind CSS
- **Real-time Updates**: Live notifications for swap requests and responses
- **Image Upload**: Support for multiple image uploads with optimization
- **Advanced Search**: Full-text search with filters and sorting options
- **Mobile Responsive**: Fully optimized for mobile devices
- **Security**: JWT authentication, input validation, and rate limiting

## 🚀 Tech Stack

### Frontend
- **Next.js** - React framework with SSR capabilities
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **React Hook Form** - Form handling and validation
- **Axios** - HTTP client for API calls
- **React Query** - Data fetching and caching
- **Lucide React** - Beautiful icons

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Token authentication
- **Multer** - File upload handling
- **Bcrypt** - Password hashing
- **Express Validator** - Input validation

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or higher)
- [MongoDB](https://www.mongodb.com/) (v4.4 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/rewear-platform.git
   cd rewear-platform
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**
   
   **Server Environment (.env in server directory)**
   ```bash
   cp server/.env.example server/.env
   ```
   
   Edit `server/.env` with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/rewear
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRE=7d
   CLIENT_URL=http://localhost:3000
   ```

   **Client Environment (.env.local in client directory)**
   ```bash
   # Create client/.env.local
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

4. **Start MongoDB**
   ```bash
   # If using MongoDB locally
   mongod
   
   # Or start MongoDB service
   sudo systemctl start mongod
   ```

5. **Run the application**
   ```bash
   # Development mode (runs both client and server)
   npm run dev
   
   # Or run separately
   npm run server  # Backend only
   npm run client  # Frontend only
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - API Health Check: http://localhost:5000/api/health

## 🔧 Configuration

### Database Setup
The application will automatically connect to MongoDB and create the necessary collections. For the first run, you might want to seed some sample data.

### Admin Account
Create an admin account by registering normally, then manually update the user in MongoDB:
```javascript
db.users.updateOne(
  { email: "admin@rewear.com" },
  { $set: { isAdmin: true } }
)
```

### File Uploads
Images are stored locally in the `server/uploads` directory. For production, consider using cloud storage like Cloudinary or AWS S3.

## 📁 Project Structure

```
rewear-platform/
├── client/                 # Next.js frontend
│   ├── pages/             # Next.js pages
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── contexts/      # React contexts
│   │   ├── hooks/         # Custom hooks
│   │   ├── lib/           # API client and utilities
│   │   ├── types/         # TypeScript types
│   │   └── utils/         # Utility functions
│   ├── styles/            # CSS styles
│   └── public/            # Static assets
├── server/                # Express.js backend
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── utils/             # Utility functions
│   └── uploads/           # File uploads
└── README.md
```

## 🎯 Usage

### For Users

1. **Register/Login**: Create an account or sign in
2. **Browse Items**: Explore available clothing items
3. **List Items**: Upload your unused clothing with details and photos
4. **Make Swap Requests**: Request items through direct swaps or points
5. **Manage Profile**: Update your profile and preferences
6. **Track Activity**: Monitor your swap history and points balance

### For Admins

1. **Item Moderation**: Approve or reject item listings
2. **User Management**: Manage user accounts and permissions
3. **Platform Analytics**: View platform statistics and metrics
4. **Content Management**: Remove inappropriate content

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Items
- `GET /api/items` - Get all items with filters
- `GET /api/items/:id` - Get single item
- `POST /api/items` - Create new item
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item

### Swaps
- `GET /api/swaps/requests` - Get swap requests
- `POST /api/swaps/request` - Create swap request
- `PUT /api/swaps/request/:id` - Respond to swap request

### Admin
- `GET /api/admin/stats` - Get platform statistics
- `GET /api/admin/items/pending` - Get pending items
- `PUT /api/admin/items/:id/approve` - Approve item

## 🚀 Deployment

### Frontend (Vercel/Netlify)
1. Build the client application
2. Deploy to your preferred platform
3. Set environment variables

### Backend (Railway/Heroku)
1. Deploy the server application
2. Set up MongoDB Atlas or managed database
3. Configure environment variables

### Full Stack (Docker)
```bash
# Build and run with Docker Compose
docker-compose up --build
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run e2e tests
npm run test:e2e
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Icons by [Lucide](https://lucide.dev/)
- UI inspired by modern sustainable fashion platforms
- Built with ❤️ for the sustainable fashion community

## 📞 Support

For support, email support@rewear.com or join our community Discord server.
 

**Happy Swapping! 🌱👕**
