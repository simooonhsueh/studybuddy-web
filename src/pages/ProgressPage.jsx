import ProgressBar from "../components/ProgressBar";
import { taskTemplates } from "../data/mockData";

function getCurrentWeek(checkInDates) {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    const day = date.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    date.setDate(date.getDate() + mondayOffset + index);

    const dateKey = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");

    return {
      label: ["一", "二", "三", "四", "五", "六", "日"][index],
      dateKey,
      completed: checkInDates.includes(dateKey),
    };
  });
}

function ProgressPage({
  profile,
  goToPage,
  checkedTasks,
  streak,
  hasCheckedIn,
  checkInDates,
  completeCheckIn,
}) {
  const totalTasks = taskTemplates.length;
  const progress =
    totalTasks === 0 ? 0 : Math.round((checkedTasks.length / totalTasks) * 100);
  const allTasksCompleted = totalTasks > 0 && checkedTasks.length === totalTasks;
  const weekDays = getCurrentWeek(checkInDates);
  const weeklyCompletedDays = weekDays.filter((day) => day.completed).length;

  return (
    <section className="screen">
      <button className="back-button" onClick={() => goToPage("hub")}>
        返回主介面
      </button>

      <p className="section-label">Progress Tracking</p>
      <h2 className="screen-title">Streak 進度追蹤</h2>

      <div className="summary-card">
        <span>學習狀態</span>
        <h3>{profile.name || "StudyBuddy 使用者"}</h3>
        <p>近期目標：{profile.examGoal || "尚未設定"}</p>
        <p>今日打卡狀態：{hasCheckedIn ? "已完成" : "尚未完成"}</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span>連續打卡</span>
          <strong>{streak} 天</strong>
        </div>

        <div className="stat-card">
          <span>今日完成</span>
          <strong>
            {checkedTasks.length} / {totalTasks}
          </strong>
        </div>
      </div>

      <ProgressBar
        label="今日任務完成率"
        value={progress}
        helperText={
          hasCheckedIn
            ? "今日已完成打卡。"
            : "完成所有任務後即可進行今日打卡。"
        }
      />

      <div className="weekly-card">
        <h3>本週進度</h3>
        <div className="week-row">
          {weekDays.map((day) => (
            <div
              key={day.dateKey}
              className={day.completed ? "week-day active" : "week-day"}
              title={day.dateKey}
            >
              {day.label}
            </div>
          ))}
        </div>
        <p>目前本週已完成 {weeklyCompletedDays} 天學習紀錄。</p>
      </div>

      <button
        className="primary-button"
        onClick={() => completeCheckIn(totalTasks)}
        disabled={!allTasksCompleted || hasCheckedIn}
      >
        {hasCheckedIn ? "今日已完成打卡" : "完成今日任務並打卡"}
      </button>
    </section>
  );
}

export default ProgressPage;
