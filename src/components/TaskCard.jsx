function TaskCard({ title, description, time, completed, onToggle }) {
  return (
    <button
      className={completed ? "task-card completed" : "task-card"}
      onClick={onToggle}
      aria-pressed={completed}
    >
      <div className="task-status">{completed ? "完成" : "待辦"}</div>

      <div className="task-content">
        <div className="task-title-row">
          <h3>{title}</h3>
          {time && <span>{time}</span>}
        </div>

        {description && <p>{description}</p>}
      </div>
    </button>
  );
}

export default TaskCard;
