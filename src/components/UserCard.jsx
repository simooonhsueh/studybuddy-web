function UserCard({
  name,
  subject,
  goal,
  time,
  matchRate,
  status = "可配對",
  onSelect,
}) {
  return (
    <div className="user-card">
      <div className="user-card-header">
        <div className="user-avatar">
          {name ? name.slice(0, 1).toUpperCase() : "U"}
        </div>

        <div>
          <h3>{name}</h3>
          <p>{status}</p>
        </div>
      </div>

      <div className="user-card-info">
        <div>
          <span>相同科目</span>
          <strong>{subject}</strong>
        </div>

        <div>
          <span>近期目標</span>
          <strong>{goal}</strong>
        </div>

        <div>
          <span>重疊時段</span>
          <strong>{time}</strong>
        </div>
      </div>

      <div className="match-rate-row">
        <span>匹配度</span>
        <strong>{matchRate}%</strong>
      </div>

      <div className="mini-progress">
        <div style={{ width: `${matchRate}%` }} />
      </div>

      {onSelect && (
        <button className="secondary-button" onClick={onSelect}>
          查看配對詳情
        </button>
      )}
    </div>
  );
}

export default UserCard;