import ProgressBar from "../components/ProgressBar";

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
  totalTasks,   // ✅ 從 App 傳入，對應 AI 排程今日任務數
}) {
  const safeTotalTasks = totalTasks ?? 0;
  const progress =
    safeTotalTasks === 0 ? 0 : Math.round((checkedTasks.length / safeTotalTasks) * 100);
  const allTasksCompleted = safeTotalTasks > 0 && checkedTasks.length >= safeTotalTasks;
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
            {checkedTasks.length} / {safeTotalTasks === 0 ? "—" : safeTotalTasks}
          </strong>
        </div>
      </div>

      <ProgressBar
        label="今日任務完成率"
        value={progress}
        helperText={
          safeTotalTasks === 0
            ? "請先前往 AI 學習排程產生今日任務。"
            : hasCheckedIn
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

      <div className="summary-card">
        <span>進度公開範圍</span>
        <h3>
          {profile.progressVisibility === "public" && "公開給所有人"}
          {profile.progressVisibility === "group" && "只公開給群組成員"}
          {profile.progressVisibility === "private" && "只有自己可見"}
        </h3>
        <p>
          {profile.progressVisibility === "public" &&
            "其他使用者可以看到你的學習進度。"}
          {profile.progressVisibility === "group" &&
            "只有同一個讀書群組的成員可以看到你的學習進度。"}
          {profile.progressVisibility === "private" &&
            "只有你自己可以看到學習進度。"}
        </p>
      </div>

      <button
        className="primary-button"
        onClick={() => completeCheckIn(safeTotalTasks)}
        disabled={!allTasksCompleted || hasCheckedIn}
      >
        {hasCheckedIn ? "今日已完成打卡" : "完成今日任務並打卡"}
      </button>
    </section>
  );
}

export default ProgressPage;