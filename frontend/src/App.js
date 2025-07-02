"use client"

import { useState } from "react"
import RoomJoin from "./components/RoomJoin"
import Whiteboard from "./components/Whiteboard"
import "./App.css"

function App() {
  const [currentRoom, setCurrentRoom] = useState(null)
  const [userName, setUserName] = useState("")

  const handleJoinRoom = (roomId, name) => {
    setCurrentRoom(roomId)
    setUserName(name)
  }

  const handleLeaveRoom = () => {
    setCurrentRoom(null)
    setUserName("")
  }

  return (
    <div className="App">
      {!currentRoom ? (
        <RoomJoin onJoinRoom={handleJoinRoom} />
      ) : (
        <Whiteboard roomId={currentRoom} userName={userName} onLeaveRoom={handleLeaveRoom} />
      )}
    </div>
  )
}

export default App
