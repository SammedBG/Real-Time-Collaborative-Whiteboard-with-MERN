"use client"
import "./Toolbar.css"

const Toolbar = ({ drawingTool, onToolChange, onClearCanvas }) => {
  const colors = ["#000000", "#FF0000", "#0000FF", "#00FF00", "#FFFF00", "#FF00FF", "#00FFFF", "#FFA500"]

  const handleColorChange = (color) => {
    onToolChange({ ...drawingTool, color })
  }

  const handleWidthChange = (event) => {
    onToolChange({ ...drawingTool, width: Number.parseInt(event.target.value) })
  }

  return (
    <div className="toolbar">
      <div className="toolbar-section">
        <label>Colors:</label>
        <div className="color-palette">
          {colors.map((color) => (
            <button
              key={color}
              className={`color-btn ${drawingTool.color === color ? "active" : ""}`}
              style={{ backgroundColor: color }}
              onClick={() => handleColorChange(color)}
              title={color}
            />
          ))}
        </div>
      </div>

      <div className="toolbar-section">
        <label htmlFor="brush-width">Brush Size: {drawingTool.width}px</label>
        <input
          id="brush-width"
          type="range"
          min="1"
          max="20"
          value={drawingTool.width}
          onChange={handleWidthChange}
          className="width-slider"
        />
      </div>

      <div className="toolbar-section">
        <button onClick={onClearCanvas} className="clear-btn" title="Clear Canvas">
          🗑️ Clear
        </button>
      </div>
    </div>
  )
}

export default Toolbar
