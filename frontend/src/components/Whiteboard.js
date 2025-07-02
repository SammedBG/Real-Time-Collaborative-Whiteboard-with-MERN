"use client"

import { useState, useEffect, useRef } from "react"
import io from "socket.io-client"
import DrawingCanvas from "./DrawingCanvas"
import Toolbar from "./Toolbar"
import UserCursors from "./UserCursors"
import "../styles/Whiteboard.css"

const Whiteboard = ({ roomId, userName, onLeaveRoom }) => {
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [userCount, setUserCount] = useState(0)
  const [users, setUsers] = useState([])
  const [cursors, setCursors] = useState(new Map())
  const [drawingTool, setDrawingTool] = useState({
    color: "#000000",
    width: 2,
  })

  const canvasRef = useRef(null)

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(process.env.REACT_APP_SERVER_URL || "http://localhost:5000")
    setSocket(newSocket)

    // Connection events
    newSocket.on("connect", () => {
      setIsConnected(true)
      console.log("Connected to server")

      // Join room
      newSocket.emit("join-room", { roomId, userName })
    })

    newSocket.on("disconnect", () => {
      setIsConnected(false)
      console.log("Disconnected from server")
    })

    // Room events
    newSocket.on("room-joined", (data) => {
      console.log("Joined room:", data)
      setUserCount(data.userCount)
    })

    newSocket.on("users-update", (data) => {
      setUserCount(data.count)
      setUsers(data.users)
    })

    newSocket.on("user-joined", (data) => {
      console.log("User joined:", data.userName)
    })

    newSocket.on("user-left", (data) => {
      console.log("User left:", data.userName)
      // Remove cursor
      setCursors((prev) => {
        const newCursors = new Map(prev)
        newCursors.delete(data.userId)
        return newCursors
      })
    })

    // Drawing events
    newSocket.on("load-drawing", (drawingData) => {
      if (canvasRef.current) {
        canvasRef.current.loadDrawing(drawingData)
      }
    })

    newSocket.on("draw-start", (data) => {
      if (canvasRef.current) {
        canvasRef.current.handleRemoteDrawStart(data)
      }
    })

    newSocket.on("draw-move", (data) => {
      if (canvasRef.current) {
        canvasRef.current.handleRemoteDrawMove(data)
      }
    })

    newSocket.on("draw-end", (data) => {
      if (canvasRef.current) {
        canvasRef.current.handleRemoteDrawEnd(data)
      }
    })

    newSocket.on("clear-canvas", () => {
      if (canvasRef.current) {
        canvasRef.current.clearCanvas()
      }
    })

    // Cursor events
    newSocket.on("cursor-move", (data) => {
      setCursors((prev) => {
        const newCursors = new Map(prev)
        newCursors.set(data.userId, {
          x: data.x,
          y: data.y,
          userName: data.userName,
          lastUpdate: Date.now(),
        })
        return newCursors
      })
    })

    // Cleanup
    return () => {
      newSocket.disconnect()
    }
  }, [roomId, userName])

  // Clean up inactive cursors
  useEffect(() => {
    const interval = setInterval(() => {
      setCursors((prev) => {
        const newCursors = new Map()
        const now = Date.now()

        prev.forEach((cursor, userId) => {
          if (now - cursor.lastUpdate < 5000) {
            // Keep cursors active for 5 seconds
            newCursors.set(userId, cursor)
          }
        })

        return newCursors
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const handleDrawStart = (data) => {
    if (socket) {
      socket.emit("draw-start", data)
    }
  }

  const handleDrawMove = (data) => {
    if (socket) {
      socket.emit("draw-move", data)
    }
  }

  const handleDrawEnd = (data) => {
    if (socket) {
      socket.emit("draw-end", data)
    }
  }

  const handleClearCanvas = () => {
    if (socket) {
      socket.emit("clear-canvas")
    }
    if (canvasRef.current) {
      canvasRef.current.clearCanvas()
    }
  }

  const handleCursorMove = (x, y) => {
    if (socket) {
      socket.emit("cursor-move", { x, y })
    }
  }

  return (
    <div className="whiteboard">
      <div className="whiteboard-header">
        <div className="room-info">
          <h2>Room: {roomId}</h2>
          <div className="connection-status">
            <span className={`status-indicator ${isConnected ? "connected" : "disconnected"}`}></span>
            {isConnected ? "Connected" : "Disconnected"}
          </div>
          <div className="user-count">
            👥 {userCount} user{userCount !== 1 ? "s" : ""} online
          </div>
        </div>

        <button onClick={onLeaveRoom} className="leave-btn">
          Leave Room
        </button>
      </div>

      <Toolbar drawingTool={drawingTool} onToolChange={setDrawingTool} onClearCanvas={handleClearCanvas} />

      <div className="canvas-container">
        <DrawingCanvas
          ref={canvasRef}
          drawingTool={drawingTool}
          onDrawStart={handleDrawStart}
          onDrawMove={handleDrawMove}
          onDrawEnd={handleDrawEnd}
          onCursorMove={handleCursorMove}
        />
        <UserCursors cursors={cursors} />
      </div>
    </div>
  )
}

export default Whiteboard
