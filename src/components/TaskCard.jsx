import React from 'react';

function TaskCard({ title, duration, isCompleted }) {
  return (
    <div style={{
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '12px',
      backgroundColor: isCompleted ? '#e6f4ea' : '#f5f5f5', // 淺色背景
      color: '#111111', // 強制文字用黑色，這樣深色主題才看得到字！
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <div>
        {/* 完美保留你原本的刪除線與標題樣式 */}
        <h4 style={{ margin: '0', fontSize: '16px', textDecoration: isCompleted ? 'line-through' : 'none' }}>
          {title}
        </h4>
        {/* 🎯 依照你的指示：預計時間整排直接從這裡刪除！ */}
      </div>
      
      {/* 右側：完美保留你原本的狀態呈現與字體粗細 */}
      <div style={{ fontWeight: 'bold', fontSize: '14px', whiteSpace: 'nowrap' }}>
        {isCompleted ? '✅ 已完成' : '⏳ 待處理'}
      </div>
    </div>
  );
}

export default TaskCard;
