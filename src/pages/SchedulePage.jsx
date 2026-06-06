import React, { useState, useEffect, useRef } from 'react';
import TaskCard from '../components/TaskCard';

function SchedulePage() {
  const [weeklyPlan, setWeeklyPlan] = useState([]);
  const [selectedDay, setSelectedDay] = useState("Day 1");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    console.log("🚀 [前端排程頁面] 觸發強行同步！正在嘗試讀取登入帳號並重新產生計畫...");

    // 🎯 核心修正：從你在登入或 profile 建立時儲存的狀態中，撈出當前使用者的名稱
    // 這裡相容從 studybuddy-profile 或是單獨儲存的 username / name
    const rawProfile = localStorage.getItem("studybuddy-profile");
    const savedName = localStorage.getItem("username") || localStorage.getItem("name");
    
    let currentName = "yy"; // 給予一個穩固的基礎預設值
    
    if (rawProfile) {
      try {
        const parsed = JSON.parse(rawProfile);
        if (parsed.name) currentName = parsed.name;
      } catch (e) {
        console.error("解析本地 profile 失敗", e);
      }
    } else if (savedName) {
      currentName = savedName;
    }

    console.log(`🔑 [前端發送] 準備將帳號名稱【${currentName}】送往後端進行精準匹配...`);

    // 二話不說直接先發 POST，並在 body 裡面帶上 name 讓後端知道是誰
    fetch('http://localhost:5000/api/generate-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: currentName }) 
    })
      .then((res) => {
        if (!res.ok) throw new Error('AI 動態排程刷新失敗，請檢查後端連線。');
        return res.json();
      })
      .then(() => {
        // 後端依據該帳號重新寫入記憶體後，立刻抓回最新任務清單
        return fetch('http://localhost:5000/api/tasks'); 
      })
      .then((resTasks) => {
        if (!resTasks.ok) throw new Error('無法從 /api/tasks 取得排程清單'); 
        return resTasks.json();
      })
      .then((tasksData) => {
        let finalPlan = tasksData.weeklyPlan || tasksData.data || tasksData || [];

        // 嚴格截斷前 7 天並排序
        const standardizedPlan = finalPlan.slice(0, 7).map((plan, index) => {
          return { ...plan, day: `Day ${index + 1}` };
        });

        setWeeklyPlan(standardizedPlan);
        setLoading(false);
      })
      .catch((err) => {
        console.error("💥 排程頁面串接發生錯誤:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // 根據「今天」往後推算日期 (M/D)
  const getCalculatedDate = (dayString) => {
    const dayNum = parseInt(dayString.replace("Day ", ""), 10);
    if (isNaN(dayNum)) return "";
    const today = new Date();
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + (dayNum - 1));
    return `${targetDate.getMonth() + 1}/${targetDate.getDate()}`;
  };

  const currentDayData = weeklyPlan.find(plan => plan.day === selectedDay);

  if (loading) return <div style={{ padding: '20px', color: '#fff', fontSize: '18px', fontWeight: 'bold' }}>🔄 AI為您排程中....</div>;
  if (error) return <div style={{ padding: '20px', color: '#ff4d4f' }}>❌ 錯誤: {error}</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', color: '#ffffff' }}>
      <h2>📅 你的 AI 智慧排程計畫  </h2>
      <p style={{ color: '#aaa' }}>根據你的目標，AI 已為你量身打造以下計畫：</p>

      {/* 切換天數的按鈕區 */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '10px' }}>
        {weeklyPlan.map((plan) => (
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
            <span style={{ fontSize: '12px', opacity: 0.8, marginTop: '2px' }}>{getCalculatedDate(plan.day)}</span>
          </button>
        ))}
      </div>

      {/* 顯示選中天數的任務卡片 */}
      <div style={{ borderTop: '2px solid #007bff', paddingTop: '15px' }}>
        <h3 style={{ color: '#ffffff', marginBottom: '20px' }}>
          ✨ {selectedDay} 任務清單 
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
          {currentDayData && currentDayData.tasks && currentDayData.tasks.length > 0 ? (
            currentDayData.tasks.map((task, index) => (
              <TaskCard
                key={task.id || `task-${index}`}
                title={task.title || '未命名任務'}
                duration={Number(task.estimatedMinutes || 60)} 
                isCompleted={task.isCompleted || false}
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
