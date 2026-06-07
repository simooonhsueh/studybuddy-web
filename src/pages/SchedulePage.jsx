import React, { useState, useEffect, useRef } from 'react';
import TaskCard from '../components/TaskCard';

function SchedulePage({ profile, goToPage, checkedTasks, toggleTask, weeklyPlan, onPlanLoaded }) {
  const [localPlan, setLocalPlan] = useState(weeklyPlan || []);
  const [selectedDay, setSelectedDay] = useState("Day 1");
  const [loading, setLoading] = useState(!weeklyPlan);  // ✅ 已有排程就不 loading
  const [error, setError] = useState(null);

  const hasFetched = useRef(false);

  useEffect(() => {
    // ✅ 已有排程就直接顯示，不再呼叫 OpenAI
    if (weeklyPlan) {
      setLocalPlan(weeklyPlan);
      setLoading(false);
      return;
    }

    if (hasFetched.current) return;
    hasFetched.current = true;

    const currentName = profile?.name || "guest";
    console.log(`🔑 [前端發送] 帳號【${currentName}】，首次產生排程...`);

    fetch('http://localhost:5000/api/generate-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: currentName })
    })
      .then((res) => {
        if (!res.ok) throw new Error('AI 動態排程刷新失敗，請檢查後端連線。');
        return res.json();
      })
      .then(() => fetch('http://localhost:5000/api/tasks'))
      .then((resTasks) => {
        if (!resTasks.ok) throw new Error('無法從 /api/tasks 取得排程清單');
        return resTasks.json();
      })
      .then((tasksData) => {
        let finalPlan = tasksData.weeklyPlan || tasksData.data || tasksData || [];

        const standardizedPlan = finalPlan.slice(0, 7).map((plan, index) => ({
          ...plan,
          day: `Day ${index + 1}`
        }));

        setLocalPlan(standardizedPlan);
        setLoading(false);

        // ✅ 通知 App 存起來，下次進來直接用
        if (onPlanLoaded) {
          onPlanLoaded(standardizedPlan);
        }
      })
      .catch((err) => {
        console.error("💥 排程頁面串接發生錯誤:", err);
        setError(err.message);
        setLoading(false);
      });
  }, [weeklyPlan]);

  const getCalculatedDate = (dayString) => {
    const dayNum = parseInt(dayString.replace("Day ", ""), 10);
    if (isNaN(dayNum)) return "";
    const today = new Date();
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + (dayNum - 1));
    return `${targetDate.getMonth() + 1}/${targetDate.getDate()}`;
  };

  const currentDayData = localPlan.find(plan => plan.day === selectedDay);
  const isToday = selectedDay === "Day 1";

  if (loading) return (
    <div style={{ padding: '20px' }}>
      <button className="back-button" onClick={() => goToPage("hub")}>返回主介面</button>
      <div style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold', marginTop: '20px' }}>
        🔄 AI為您排程中....
      </div>
    </div>
  );

  if (error) return (
    <div style={{ padding: '20px' }}>
      <button className="back-button" onClick={() => goToPage("hub")}>返回主介面</button>
      <div style={{ color: '#ff4d4f', marginTop: '20px' }}>❌ 錯誤: {error}</div>
    </div>
  );

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', color: '#ffffff' }}>
      <button className="back-button" onClick={() => goToPage("hub")}>返回主介面</button>

      <h2 style={{ marginTop: '16px' }}>📅 你的 AI 智慧排程計畫</h2>
      <p style={{ color: '#aaa' }}>根據你的目標，AI 已為你量身打造以下計畫：</p>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '10px' }}>
        {localPlan.map((plan) => (
          <button
            key={plan.day}
            onClick={() => setSelectedDay(plan.day)}
            style={{
              padding: '10px 18px',
              borderRadius: '20px',
              border: '1px solid #007bff',
              backgroundColor: selectedDay === plan.day ? '#007bff' : 'transparent',
              color: '#ffffff',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              minWidth: '75px'
            }}
          >
            <span style={{ fontWeight: 'bold' }}>{plan.day}</span>
            <span style={{ fontSize: '12px', opacity: 0.8, marginTop: '2px' }}>
              {getCalculatedDate(plan.day)}
            </span>
          </button>
        ))}
      </div>

      <div style={{ borderTop: '2px solid #007bff', paddingTop: '15px' }}>
        <h3 style={{ color: '#ffffff', marginBottom: '20px' }}>
          ✨ {selectedDay} 任務清單
          {isToday && (
            <span style={{ fontSize: '13px', color: '#aaa', marginLeft: '8px' }}>
              （今日任務可點擊勾選）
            </span>
          )}
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
          {currentDayData?.tasks?.length > 0 ? (
            currentDayData.tasks.map((task, index) => (
              <TaskCard
                key={task.id || `task-${index}`}
                title={task.title || '未命名任務'}
                isCompleted={checkedTasks?.includes(String(task.id)) || false}
                onToggle={isToday && toggleTask ? () => toggleTask(task.id) : undefined}
              />
            ))
          ) : (
            <p style={{ color: '#aaa' }}>今天沒有安排任務，放鬆一下吧！</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default SchedulePage;