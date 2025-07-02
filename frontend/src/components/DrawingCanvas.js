"use client"

import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from "react"
import "./DrawingCanvas.css"

const DrawingCanvas = forwardRef(({ drawingTool, onDrawStart, onDrawMove, onDrawEnd, onCursorMove }, ref) => {
  const canvasRef = useRef(null)
  const contextRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentPath, setCurrentPath] = useState([])
  const lastPointRef = useRef(null)

  useImperativeHandle(ref, () => ({
    loadDrawing: (drawingData) => {
      clearCanvas()
      drawingData.forEach((command) => {
        if (command.type === "stroke") {
          drawPath(command.data.path, command.data.color, command.data.width)
        }
      })
    },
    handleRemoteDrawStart: (data) => {
      // Remote users start drawing - we don't need to do anything special
    },
    handleRemoteDrawMove: (data) => {
      if (data.path && data.path.length > 0) {
        drawPath(data.path, data.color, data.width)
      }
    },
    handleRemoteDrawEnd: (data) => {
      if (data.path && data.path.length > 0) {
        drawPath(data.path, data.color, data.width)
      }
    },
    clearCanvas: () => {
      clearCanvas()
    },
  }))

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")

    // Set canvas size
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * window.devicePixelRatio
      canvas.height = rect.height * window.devicePixelRatio
      context.scale(window.devicePixelRatio, window.devicePixelRatio)
      canvas.style.width = rect.width + "px"
      canvas.style.height = rect.height + "px"
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Configure context
    context.lineCap = "round"
    context.lineJoin = "round"
    context.imageSmoothingEnabled = true
    contextRef.current = context

    return () => {
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [])

  const getCoordinates = (event) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()

    let clientX, clientY

    if (event.touches) {
      clientX = event.touches[0].clientX
      clientY = event.touches[0].clientY
    } else {
      clientX = event.clientX
      clientY = event.clientY
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    }
  }

  const startDrawing = (event) => {
    event.preventDefault()
    const coordinates = getCoordinates(event)

    setIsDrawing(true)
    setCurrentPath([coordinates])
    lastPointRef.current = coordinates

    onDrawStart({
      x: coordinates.x,
      y: coordinates.y,
      color: drawingTool.color,
      width: drawingTool.width,
    })
  }

  const draw = (event) => {
    event.preventDefault()

    if (!isDrawing) {
      // Handle cursor movement for non-drawing users
      const coordinates = getCoordinates(event)
      onCursorMove(coordinates.x, coordinates.y)
      return
    }

    const coordinates = getCoordinates(event)
    const newPath = [...currentPath, coordinates]
    setCurrentPath(newPath)

    // Draw locally
    drawLine(lastPointRef.current, coordinates, drawingTool.color, drawingTool.width)
    lastPointRef.current = coordinates

    // Emit to other users
    onDrawMove({
      x: coordinates.x,
      y: coordinates.y,
      path: newPath,
      color: drawingTool.color,
      width: drawingTool.width,
      isComplete: false,
    })
  }

  const stopDrawing = (event) => {
    if (!isDrawing) return

    event.preventDefault()
    setIsDrawing(false)

    onDrawEnd({
      path: currentPath,
      color: drawingTool.color,
      width: drawingTool.width,
    })

    setCurrentPath([])
    lastPointRef.current = null
  }

  const drawLine = (start, end, color, width) => {
    const context = contextRef.current
    if (!context) return

    context.strokeStyle = color
    context.lineWidth = width
    context.beginPath()
    context.moveTo(start.x, start.y)
    context.lineTo(end.x, end.y)
    context.stroke()
  }

  const drawPath = (path, color, width) => {
    const context = contextRef.current
    if (!context || !path || path.length < 2) return

    context.strokeStyle = color
    context.lineWidth = width
    context.beginPath()
    context.moveTo(path[0].x, path[0].y)

    for (let i = 1; i < path.length; i++) {
      context.lineTo(path[i].x, path[i].y)
    }

    context.stroke()
  }

  const clearCanvas = () => {
    const context = contextRef.current
    const canvas = canvasRef.current
    if (context && canvas) {
      context.clearRect(0, 0, canvas.width, canvas.height)
    }
  }

  const handleMouseMove = (event) => {
    if (!isDrawing) {
      const coordinates = getCoordinates(event)
      onCursorMove(coordinates.x, coordinates.y)
    } else {
      draw(event)
    }
  }

  return (
    <canvas
      ref={canvasRef}
      className="drawing-canvas"
      onMouseDown={startDrawing}
      onMouseMove={handleMouseMove}
      onMouseUp={stopDrawing}
      onMouseLeave={stopDrawing}
      onTouchStart={startDrawing}
      onTouchMove={draw}
      onTouchEnd={stopDrawing}
    />
  )
})

export default DrawingCanvas
