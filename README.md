# 🚀 Setup Instructions

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (v16.0.0 or higher) - [Download here](https://nodejs.org/)
- **npm** (v7.0.0 or higher) - Comes with Node.js
- **MongoDB** - Either local installation or MongoDB Atlas account
- **Git** - For cloning the repository

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/SammedBG/Real-Time-Collaborative-Whiteboard-with-MERN.git
cd collaborative-whiteboard
```

### 2. Install Dependencies

#### Install Server Dependencies
```bash
cd server
npm install
```

#### Install Client Dependencies
```bash
cd ../client
npm install
```

### 3. Environment Configuration

#### Server Environment Variables

Create a `.env` file in the `server` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/whiteboard

# Client Configuration
CLIENT_URL=http://localhost:3000

# Optional: JWT Secret (for future authentication)
JWT_SECRET=your-super-secret-jwt-key
```

#### Client Environment Variables

Create a `.env` file in the `client` directory:

```env
# Server URL
REACT_APP_SERVER_URL=http://localhost:5000

# Optional: Environment
REACT_APP_ENV=development
```

### 4. Database Setup

#### Option A: Local MongoDB

1. **Install MongoDB Community Edition**
   - [Windows](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/)
   - [macOS](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-os-x/)
   - [Linux](https://docs.mongodb.com/manual/administration/install-on-linux/)

2. **Start MongoDB Service**
   ```bash
   # macOS (with Homebrew)
   brew services start mongodb-community
   
   # Linux (systemd)
   sudo systemctl start mongod
   
   # Windows
   net start MongoDB
   ```

3. **Verify Connection**
   ```bash
   mongo --eval "db.adminCommand('ismaster')"
   ```

#### Option B: MongoDB Atlas (Cloud)

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Sign up for a free account

2. **Create a Cluster**
   - Choose "Build a Database"
   - Select "Shared" (free tier)
   - Choose your preferred cloud provider and region
   - Create cluster

3. **Configure Database Access**
   - Go to "Database Access"
   - Add a new database user
   - Choose "Password" authentication
   - Set username and password
   - Grant "Read and write to any database" privileges

4. **Configure Network Access**
   - Go to "Network Access"
   - Add IP Address
   - For development: Add `0.0.0.0/0` (allows access from anywhere)
   - For production: Add specific IP addresses

5. **Get Connection String**
   - Go to "Databases"
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Update `MONGODB_URI` in your `.env` file

### 5. Start the Application

#### Method 1: Using npm scripts (Recommended)

**Terminal 1 - Start Server:**
```bash
cd server
npm run dev
```

**Terminal 2 - Start Client:**
```bash
cd client
npm start
```

#### Method 2: Using concurrently (Optional)

Install concurrently in the root directory:
```bash
npm install -g concurrently
```

Create a `package.json` in the root directory:
```json
{
  "name": "collaborative-whiteboard",
  "scripts": {
    "dev": "concurrently \"cd server && npm run dev\" \"cd client && npm start\"",
    "start": "concurrently \"cd server && npm start\" \"cd client && npm run build && serve -s build\""
  }
}
```

Then run:
```bash
npm run dev
```

### 6. Access the Application

- **Client Application**: http://localhost:3000
- **Server API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

## Development Workflow

### File Structure Overview

```
collaborative-whiteboard/
├── client/                     # React frontend
│   ├── public/
│   │   ├── index.html
│   │   └── favicon.ico
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── RoomJoin.js
│   │   │   ├── Whiteboard.js
│   │   │   ├── DrawingCanvas.js
│   │   │   ├── Toolbar.js
│   │   │   └── UserCursors.js
│   │   ├── styles/            # CSS files
│   │   ├── utils/             # Utility functions
│   │   ├── App.js             # Main app component
│   │   └── index.js           # Entry point
│   ├── package.json
│   └── .env
├── server/                     # Node.js backend
│   ├── models/                # MongoDB schemas
│   │   ├── Room.js
│   │   └── DrawingCommand.js
│   ├── routes/                # Express routes
│   │   └── roomRoutes.js
│   ├── middleware/            # Custom middleware
│   ├── utils/                 # Utility functions
│   ├── server.js              # Main server file
│   ├── package.json
│   └── .env
├── docs/                      # Documentation
└── README.md
```

### Development Commands

#### Server Commands
```bash
cd server

# Start development server with auto-reload
npm run dev

# Start production server
npm start

# Run tests
npm test

# Run linting
npm run lint

# Check for security vulnerabilities
npm audit
```

#### Client Commands
```bash
cd client

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Analyze bundle size
npm run analyze
```

## Testing

### Running Tests

#### Server Tests
```bash
cd server
npm test
```

#### Client Tests
```bash
cd client
npm test
```

#### Integration Tests
```bash
# Run both server and client tests
npm run test:all
```

### Test Coverage

Generate test coverage reports:
```bash
# Server coverage
cd server
npm run test:coverage

# Client coverage
cd client
npm run test:coverage
```

## Troubleshooting

### Common Issues

#### 1. Port Already in Use
**Error**: `EADDRINUSE: address already in use :::5000`

**Solution**:
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>

# Or change port in server/.env
PORT=5001
```

#### 2. MongoDB Connection Failed
**Error**: `MongoNetworkError: failed to connect to server`

**Solutions**:
- Ensure MongoDB service is running
- Check connection string format
- Verify network access (for Atlas)
- Check firewall settings

```bash
# Test MongoDB connection
mongo "mongodb://localhost:27017/whiteboard" --eval "db.runCommand({connectionStatus : 1})"
```

#### 3. CORS Errors
**Error**: `Access to XMLHttpRequest has been blocked by CORS policy`

**Solution**:
- Verify `CLIENT_URL` in server/.env matches client URL
- Check CORS configuration in server.js

#### 4. Socket Connection Issues
**Error**: `WebSocket connection failed`

**Solutions**:
- Ensure server is running before client
- Check firewall settings
- Verify WebSocket support in browser
- Check proxy configuration

#### 5. Canvas Not Drawing
**Issues**: Drawing not working on touch devices

**Solutions**:
- Ensure `touch-action: none` is set in CSS
- Check canvas context initialization
- Verify event listeners are properly attached

### Performance Optimization

#### Client-Side Optimization
```javascript
// Throttle cursor updates
const throttledCursorMove = throttle((x, y) => {
  socket.emit('cursor-move', { x, y });
}, 16); // 60fps

// Optimize canvas rendering
const canvas = canvasRef.current;
const context = canvas.getContext('2d', { alpha: false });
context.imageSmoothingEnabled = false;
```

#### Server-Side Optimization
```javascript
// Rate limiting for drawing events
const rateLimit = require('express-rate-limit');

const drawingLimiter = rateLimit({
  windowMs: 1000, // 1 second
  max: 60, // 60 requests per second
  message: 'Too many drawing commands'
});
```

### Environment-Specific Configuration

#### Development
```env
NODE_ENV=development
DEBUG=true
LOG_LEVEL=debug
```

#### Production
```env
NODE_ENV=production
DEBUG=false
LOG_LEVEL=error
```

#### Testing
```env
NODE_ENV=test
MONGODB_URI=mongodb://localhost:27017/whiteboard_test
```

## Next Steps

After successful setup:

1. **Explore the Application**
   - Create a room and test drawing
   - Open multiple browser tabs to test collaboration
   - Test on different devices

2. **Customize the Application**
   - Modify colors and themes
   - Add new drawing tools
   - Implement additional features

3. **Deploy to Production**
   - Follow the deployment guide
   - Set up monitoring and logging
   - Configure SSL certificates

4. **Contribute**
   - Read the contributing guidelines
   - Submit bug reports or feature requests
   - Create pull requests

## Support

If you encounter any issues:

1. Check this documentation
2. Search existing GitHub issues
3. Create a new issue with detailed information
4. Join our Discord community for real-time help

## Additional Resources

- [React Documentation](https://reactjs.org/docs)
- [Node.js Documentation](https://nodejs.org/docs)
- [Socket.io Documentation](https://socket.io/docs)
- [MongoDB Documentation](https://docs.mongodb.com)
- [Express.js Documentation](https://expressjs.com)