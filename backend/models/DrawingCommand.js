const mongoose = require("mongoose")

const DrawingCommandSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    index: true,
  },
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

module.exports = mongoose.model("DrawingCommand", DrawingCommandSchema)
