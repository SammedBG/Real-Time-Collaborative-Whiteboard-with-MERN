# 🚀 Setup Instructions

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd collaborative-whiteboard
```

### 2. Install Server Dependencies

```bash
cd server
npm install
```

### 3. Install Client Dependencies

```bash
cd ../client
npm install
```

### 4. Environment Configuration

#### Server Environment (.env in server folder)

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/whiteboard
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

#### Client Environment (.env in client folder)

```env
REACT_APP_SERVER_URL=http://localhost:5000
```

### 5. MongoDB Setup

#### Option A: Local MongoDB

1. Install MongoDB locally
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017/whiteboard`

#### Option B: MongoDB Atlas (Cloud)

1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a cluster
3. Get connection string
4. Update MONGODB_URI in server/.env

### 6. Start the Application

#### Terminal 1 - Start Server

```bash
cd server
npm run dev
```

#### Terminal 2 - Start Client

```bash
cd client
npm start
```

### 7. Access the Application

- Client: http://localhost:3000
- Server: http://localhost:5000

## 🧪 Testing

### Server Tests

```bash
cd server
npm test
```

### Client Tests

```bash
cd client
npm test
```

## 📦 Production Build

### Client Build

```bash
cd client
npm run build
```

### Server Production

```bash
cd server
npm start
```

## 🔧 Troubleshooting

### Common Issues

1. **Port already in use**
   - Change PORT in server/.env
   - Update REACT_APP_SERVER_URL in client/.env

2. **MongoDB connection failed**
   - Check MongoDB service is running
   - Verify connection string
   - Check network access (for Atlas)

3. **CORS errors**
   - Verify CLIENT_URL in server/.env
   - Check server CORS configuration

4. **Socket connection issues**
   - Ensure server is running
   - Check firewall settings
   - Verify WebSocket support

### Performance Tips

1. **Drawing Performance**
   - Use hardware acceleration
   - Optimize canvas rendering
   - Throttle cursor updates

2. **Network Performance**
   - Compress drawing data
   - Use binary protocols for large data
   - Implement connection pooling

3. **Database Performance**
   - Add proper indexes
   - Implement data pagination
   - Use aggregation pipelines
