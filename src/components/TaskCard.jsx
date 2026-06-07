import React from 'react';

function TaskCard({ title, description, time, duration, isCompleted, completed, onToggle }) {
  const isDone = isCompleted || completed || false;

  const cardStyle = {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '12px',
    backgroundColor: isDone ? '#e6f4ea' : '#f5f5f5',
    color: '#111111',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    cursor: onToggle ? 'pointer' : 'default',
    width: '100%',
    textAlign: 'left',
  };

  const content = (
    <>
      <div>
        <h4 style={{ margin: '0', fontSize: '16px', textDecoration: isDone ? 'line-through' : 'none' }}>
          {title}
        </h4>
        {description && (
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#555' }}>{description}</p>
        )}
        {time && (
          <span style={{ fontSize: '12px', color: '#888' }}>{time}</span>
        )}
      </div>

      <div style={{ fontWeight: 'bold', fontSize: '14px', whiteSpace: 'nowrap', marginLeft: '12px' }}>
        {isDone ? '✅ 已完成' : '⏳ 待處理'}
      </div>
    </>
  );

  if (onToggle) {
    return (
      <button style={cardStyle} onClick={onToggle} aria-pressed={isDone}>
        {content}
      </button>
    );
  }

  return <div style={cardStyle}>{content}</div>;
}

export default TaskCard;