import "./UserCursors.css"

const UserCursors = ({ cursors }) => {
  return (
    <div className="user-cursors">
      {Array.from(cursors.entries()).map(([userId, cursor]) => (
        <div
          key={userId}
          className="user-cursor"
          style={{
            left: cursor.x,
            top: cursor.y,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div className="cursor-pointer"></div>
          <div className="cursor-label">{cursor.userName}</div>
        </div>
      ))}
    </div>
  )
}

export default UserCursors
