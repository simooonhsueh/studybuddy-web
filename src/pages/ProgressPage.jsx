import ProgressBar from "../components/ProgressBar";
import { taskTemplates } from "../data/mockData";

function ProgressPage({
  profile,
  goToPage,
  checkedTasks,
  streak,
  hasCheckedIn,
  completeCheckIn,
}) {
  const totalTasks = taskTemplates.length;
  const progress = Math.round((checkedTasks.length / totalTasks) * 100);

  return (
    <section className="screen">
      <button className="back-button" onClick={() => goToPage("hub")}>
        返回主介面
      </button>

      <p className="section-label">Progress Tracking</p>
      <h2 className="screen-title">Streak 進度追蹤</h2>

      <div className="summary-card">
        <span>學習狀態</span>
        <h3>{profile.name}</h3>
        <p>近期目標：{profile.examGoal}</p>
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
        helperText="完成所有任務後即可進行今日打卡。"
      />

      <div className="weekly-card">
        <h3>本週進度</h3>
        <div className="week-row">
          {["一", "二", "三", "四", "五", "六", "日"].map((day, index) => (
            <div
              key={day}
              className={index < 4 ? "week-day active" : "week-day"}
            >
              {day}
            </div>
          ))}
        </div>
        <p>目前本週已完成 4 天學習紀錄。</p>
      </div>

      <button
        className="primary-button"
        onClick={() => completeCheckIn(totalTasks)}
      >
        完成今日任務並打卡
      </button>
    </section>
  );
}

export default ProgressPage;