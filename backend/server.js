const express = require("express")
const http = require("http")
const socketIo = require("socket.io")
const cors = require("cors")
const mongoose = require("mongoose")
const path = require("path")
require("dotenv").config()

const Room = require("./models/Room")
const DrawingCommand = require("./models/DrawingCommand")
const roomRoutes = require("./routes/roomRoutes")

const app = express()
const server = http.createServer(app)
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
})

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
  }),
)
app.use(express.json())

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/whiteboard", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err))

// Routes
app.use("/api/rooms", roomRoutes)

// Socket.io connection handling
const activeUsers = new Map() // socketId -> {roomId, userName, userId}
const roomUsers = new Map() // roomId -> Set of userIds

io.on("connection", (socket) => {
  console.log("User connected:", socket.id)

  // Join room
  socket.on("join-room", async (data) => {
    try {
      const { roomId, userName } = data
      const userId = socket.id

      // Leave previous room if any
      if (activeUsers.has(socket.id)) {
        const prevRoom = activeUsers.get(socket.id).roomId
        socket.leave(prevRoom)
        updateRoomUsers(prevRoom, userId, "leave")
      }

      // Join new room
      socket.join(roomId)
      activeUsers.set(socket.id, { roomId, userName, userId })
      updateRoomUsers(roomId, userId, "join")

      // Find or create room
      let room = await Room.findOne({ roomId })
      if (!room) {
        room = new Room({
          roomId,
          createdAt: new Date(),
          lastActivity: new Date(),
          drawingData: [],
        })
        await room.save()
      } else {
        room.lastActivity = new Date()
        await room.save()
      }

      // Send room data to user
      socket.emit("room-joined", {
        roomId,
        userName,
        userCount: roomUsers.get(roomId)?.size || 0,
      })

      // Load existing drawing data
      socket.emit("load-drawing", room.drawingData)

      // Notify others in room
      socket.to(roomId).emit("user-joined", { userId, userName })

      // Update user count for all in room
      io.to(roomId).emit("users-update", {
        count: roomUsers.get(roomId)?.size || 0,
        users: Array.from(roomUsers.get(roomId) || []),
      })
    } catch (error) {
      console.error("Error joining room:", error)
      socket.emit("error", { message: "Failed to join room" })
    }
  })

  // Handle drawing events
  socket.on("draw-start", async (data) => {
    const user = activeUsers.get(socket.id)
    if (!user) return

    const drawData = {
      userId: user.userId,
      userName: user.userName,
      ...data,
    }

    socket.to(user.roomId).emit("draw-start", drawData)
  })

  socket.on("draw-move", async (data) => {
    const user = activeUsers.get(socket.id)
    if (!user) return

    const drawData = {
      userId: user.userId,
      userName: user.userName,
      ...data,
    }

    socket.to(user.roomId).emit("draw-move", drawData)
  })

  socket.on("draw-end", async (data) => {
    const user = activeUsers.get(socket.id)
    if (!user) return

    try {
      // Save drawing command to database
      const drawingCommand = {
        type: "stroke",
        data: {
          path: data.path,
          color: data.color,
          width: data.width,
        },
        timestamp: new Date(),
        userId: user.userId,
      }

      await Room.findOneAndUpdate(
        { roomId: user.roomId },
        {
          $push: { drawingData: drawingCommand },
          $set: { lastActivity: new Date() },
        },
      )

      const drawData = {
        userId: user.userId,
        userName: user.userName,
        ...data,
      }

      socket.to(user.roomId).emit("draw-end", drawData)
    } catch (error) {
      console.error("Error saving drawing:", error)
    }
  })

  socket.on("clear-canvas", async () => {
    const user = activeUsers.get(socket.id)
    if (!user) return

    try {
      // Clear drawing data in database
      await Room.findOneAndUpdate(
        { roomId: user.roomId },
        {
          $set: {
            drawingData: [],
            lastActivity: new Date(),
          },
        },
      )

      // Notify all users in room
      io.to(user.roomId).emit("clear-canvas", {
        userId: user.userId,
        userName: user.userName,
      })
    } catch (error) {
      console.error("Error clearing canvas:", error)
    }
  })

  // Handle cursor movement
  socket.on("cursor-move", (data) => {
    const user = activeUsers.get(socket.id)
    if (!user) return

    socket.to(user.roomId).emit("cursor-move", {
      userId: user.userId,
      userName: user.userName,
      x: data.x,
      y: data.y,
    })
  })

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id)

    const user = activeUsers.get(socket.id)
    if (user) {
      updateRoomUsers(user.roomId, user.userId, "leave")

      // Notify others in room
      socket.to(user.roomId).emit("user-left", {
        userId: user.userId,
        userName: user.userName,
      })

      // Update user count
      io.to(user.roomId).emit("users-update", {
        count: roomUsers.get(user.roomId)?.size || 0,
        users: Array.from(roomUsers.get(user.roomId) || []),
      })

      activeUsers.delete(socket.id)
    }
  })
})

function updateRoomUsers(roomId, userId, action) {
  if (!roomUsers.has(roomId)) {
    roomUsers.set(roomId, new Set())
  }

  const users = roomUsers.get(roomId)
  if (action === "join") {
    users.add(userId)
  } else if (action === "leave") {
    users.delete(userId)
    if (users.size === 0) {
      roomUsers.delete(roomId)
    }
  }
}

// Clean up inactive rooms (run every hour)
setInterval(
  async () => {
    try {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
      await Room.deleteMany({
        lastActivity: { $lt: twentyFourHoursAgo },
      })
      console.log("Cleaned up inactive rooms")
    } catch (error) {
      console.error("Error cleaning up rooms:", error)
    }
  },
  60 * 60 * 1000,
) // Run every hour

const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
