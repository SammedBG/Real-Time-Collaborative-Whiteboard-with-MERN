const mongoose = require("mongoose")

const DrawingCommandSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["stroke", "clear"],
    required: true,
  },
  data: {
    path: [
      {
        x: Number,
        y: Number,
      },
    ],
    color: String,
    width: Number,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  userId: String,
})

const RoomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastActivity: {
    type: Date,
    default: Date.now,
    index: true,
  },
  drawingData: [DrawingCommandSchema],
})

// Index for cleanup queries
RoomSchema.index({ lastActivity: 1 })

module.exports = mongoose.model("Room", RoomSchema)
