const express = require("express")
const Room = require("../models/Room")
const router = express.Router()

// Generate random room ID
function generateRoomId() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = ""
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Create or join room
router.post("/join", async (req, res) => {
  try {
    let { roomId } = req.body

    // Generate new room ID if not provided
    if (!roomId) {
      do {
        roomId = generateRoomId()
      } while (await Room.findOne({ roomId }))
    }

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

    res.json({
      success: true,
      room: {
        id: room.roomId,
        createdAt: room.createdAt,
        drawingData: room.drawingData,
      },
    })
  } catch (error) {
    console.error("Error joining room:", error)
    res.status(500).json({
      success: false,
      message: "Failed to join room",
    })
  }
})

// Get room info
router.get("/:roomId", async (req, res) => {
  try {
    const { roomId } = req.params
    const room = await Room.findOne({ roomId })

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      })
    }

    res.json({
      success: true,
      room: {
        id: room.roomId,
        createdAt: room.createdAt,
        lastActivity: room.lastActivity,
        drawingData: room.drawingData,
      },
    })
  } catch (error) {
    console.error("Error getting room:", error)
    res.status(500).json({
      success: false,
      message: "Failed to get room",
    })
  }
})

module.exports = router
