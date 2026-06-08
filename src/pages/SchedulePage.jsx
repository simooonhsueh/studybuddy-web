import React, { useEffect, useRef, useState } from "react";
import TaskCard from "../components/TaskCard";
import { generatePlan, getTasks, replaceProgressTasks } from "../services/userApi";

function SchedulePage({
  profile,
  goToPage,
  checkedTasks,
  toggleTask,
  weeklyPlan,
  onPlanLoaded,
}) {
  const [localPlan, setLocalPlan] = useState(weeklyPlan || []);
  const [selectedDay, setSelectedDay] = useState("Day 1");
  const [loading, setLoading] = useState(!weeklyPlan);
  const [error, setError] = useState("");
  const hasFetched = useRef(false);

  const userId = profile?.id || profile?.name || "guest";
  const storageKey = `studybuddy-weekly-plan-${userId}`;

  function getCalculatedDate(dayString) {
    const dayNum = parseInt(String(dayString).replace("Day ", ""), 10);
    if (Number.isNaN(dayNum)) return "";

    const today = new Date();
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + (dayNum - 1));

    return `${targetDate.getMonth() + 1}/${targetDate.getDate()}`;
  }

  async function loadPlan({ forceRefresh = false } = {}) {
    if (!profile?.id && !profile?.name) {
      setError("找不到使用者資料，請先建立學習檔案。");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      if (!forceRefresh && weeklyPlan && weeklyPlan.length > 0) {
        setLocalPlan(weeklyPlan);
        localStorage.setItem(storageKey, JSON.stringify(weeklyPlan));
        setLoading(false);
        return;
      }

      if (!forceRefresh) {
        const savedPlan = localStorage.getItem(storageKey);

        if (savedPlan) {
          const parsedPlan = JSON.parse(savedPlan);

          if (Array.isArray(parsedPlan) && parsedPlan.length > 0) {
            setLocalPlan(parsedPlan);
            onPlanLoaded?.(parsedPlan);
            setLoading(false);
            return;
          }
        }
      }

      await generatePlan(profile);

      const tasksResult = await getTasks();

      const finalPlan =
        tasksResult.weeklyPlan ||
        tasksResult.data ||
        tasksResult.tasks ||
        [];

      const standardizedPlan = Array.isArray(finalPlan)
        ? finalPlan.slice(0, 7).map((plan, index) => ({
            ...plan,
            day: plan.day || `Day ${index + 1}`,
            tasks: Array.isArray(plan.tasks) ? plan.tasks : [],
          }))
        : [];

      setLocalPlan(standardizedPlan);
      onPlanLoaded?.(standardizedPlan);
      localStorage.setItem(storageKey, JSON.stringify(standardizedPlan));

      const dayOneTasks = standardizedPlan[0]?.tasks || [];
      if (profile?.id && dayOneTasks.length > 0) {
        await replaceProgressTasks(profile.id, dayOneTasks);
      }
    } catch (err) {
      console.error("排程頁面串接發生錯誤:", err);
      setError(err.message || "AI 動態排程刷新失敗，請檢查後端連線。");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    loadPlan();
  }, [profile?.id, profile?.name]);

  const currentDayData = localPlan.find((plan) => plan.day === selectedDay);
  const currentTasks = currentDayData?.tasks || [];
  const isToday = selectedDay === "Day 1";

  if (loading) {
    return (
      <section className="screen">
        <button className="back-button" onClick={() => goToPage("hub")}>
          返回主介面
        </button>
        <p className="section-label">AI Learning Plan</p>
        <h2 className="screen-title">AI 為您排程中...</h2>
      </section>
    );
  }

  if (error) {
    return (
      <section className="screen">
        <button className="back-button" onClick={() => goToPage("hub")}>
          返回主介面
        </button>
        <p className="section-label">AI Learning Plan</p>
        <h2 className="screen-title">AI 學習排程</h2>
        <p className="section-description" style={{ color: "var(--color-warning, #e57373)" }}>
          ❌ 錯誤：{error}
        </p>
        <button className="primary-button" onClick={() => loadPlan({ forceRefresh: true })}>
          重新產生計畫
        </button>
      </section>
    );
  }

  return (
    <section className="screen">
      <button className="back-button" onClick={() => goToPage("hub")}>
        返回主介面
      </button>

      <p className="section-label">AI Learning Plan</p>
      <h2 className="screen-title">你的 AI 智慧排程計畫</h2>

      <p className="section-description">
        根據你的目標，AI 已為你量身打造以下 7 天計畫。
      </p>

      <div className="summary-card">
        <span>排程依據</span>
        <h3>{profile?.examGoal || "尚未設定目標"}</h3>
        <p>考試日期：{profile?.examDate || "未提供考試日期"}</p>
        <p>
          每天可讀時間：
          {profile?.dailyStudyHours
            ? `${profile.dailyStudyHours} 小時`
            : "未提供可讀時間"}
        </p>
        <p>加強科目：{profile?.weakSubjects || "未提供加強科目"}</p>
      </div>

      <button
        className="secondary-button"
        onClick={() => loadPlan({ forceRefresh: true })}
      >
        重新產生計畫
      </button>

      <div className="day-tabs">
        {localPlan.map((plan) => (
          <button
            key={plan.day}
            className={`day-tab ${selectedDay === plan.day ? "active" : ""}`}
            onClick={() => setSelectedDay(plan.day)}
          >
            <span>{plan.day}</span>
            <small>{getCalculatedDate(plan.day)}</small>
          </button>
        ))}
      </div>

      <div className="section-block">
        <h3>
          ✨ {selectedDay} 任務清單
          {isToday && <span className="section-description">（今日任務可點擊勾選）</span>}
        </h3>

        {currentTasks.length > 0 ? (
          <div className="task-list">
            {currentTasks.map((task, index) => (
              <TaskCard
                key={task.id || `${selectedDay}-${index}`}
                title={task.title || task.name || "未命名任務"}
                description={task.description || task.detail || ""}
                time={task.time || ""}
                duration={task.duration || ""}
                isCompleted={
                  checkedTasks.includes(task.id) ||
                  checkedTasks.includes(index) ||
                  task.isCompleted ||
                  task.completed ||
                  false
                }
                onToggle={isToday ? () => toggleTask(task.id || index) : undefined}
              />
            ))}
          </div>
        ) : (
          <p className="section-description">這一天沒有安排任務，放鬆一下吧！</p>
        )}
      </div>
    </section>
  );
}

export default SchedulePage;