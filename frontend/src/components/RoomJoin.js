"use client"

import { useState } from "react"
import "../styles/RoomJoin.css"

const RoomJoin = ({ onJoinRoom }) => {
  const [roomId, setRoomId] = useState("")
  const [userName, setUserName] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!userName.trim()) {
      alert("Please enter your name")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL || "http://localhost:5000"}/api/rooms/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ roomId: roomId.trim() || undefined }),
      })

      const data = await response.json()

      if (data.success) {
        onJoinRoom(data.room.id, userName.trim())
      } else {
        alert("Failed to join room: " + data.message)
      }
    } catch (error) {
      console.error("Error joining room:", error)
      alert("Failed to connect to server")
    } finally {
      setIsLoading(false)
    }
  }

  const generateRandomRoom = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let result = ""
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setRoomId(result)
  }

  return (
    <div className="room-join">
      <div className="room-join-container">
        <h1>🎨 Collaborative Whiteboard</h1>
        <p>Join a room to start drawing together!</p>

        <form onSubmit={handleSubmit} className="join-form">
          <div className="form-group">
            <label htmlFor="userName">Your Name</label>
            <input
              type="text"
              id="userName"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your name"
              maxLength={20}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="roomId">Room Code (optional)</label>
            <div className="room-input-group">
              <input
                type="text"
                id="roomId"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                placeholder="Enter room code or leave empty"
                maxLength={8}
              />
              <button type="button" onClick={generateRandomRoom} className="generate-btn">
                Generate
              </button>
            </div>
            <small>Leave empty to create a new room</small>
          </div>

          <button type="submit" className="join-btn" disabled={isLoading}>
            {isLoading ? "Joining..." : "Join Room"}
          </button>
        </form>

        <div className="features">
          <h3>Features:</h3>
          <ul>
            <li>✏️ Real-time collaborative drawing</li>
            <li>🎨 Multiple colors and brush sizes</li>
            <li>👥 See other users' cursors</li>
            <li>💾 Automatic saving</li>
            <li>📱 Works on desktop and tablets</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default RoomJoin
