import TaskCard from "../components/TaskCard";
import ProgressBar from "../components/ProgressBar";
import { taskTemplates } from "../data/mockData";

function SchedulePage({ profile, goToPage, checkedTasks, toggleTask }) {
  const progress = Math.round((checkedTasks.length / taskTemplates.length) * 100);

  return (
    <section className="screen">
      <button className="back-button" onClick={() => goToPage("hub")}>
        返回主介面
      </button>

      <p className="section-label">AI Learning Plan</p>
      <h2>AI 學習排程</h2>

      <div className="summary-card">
        <span>排程依據</span>
        <h3>{profile.examGoal}</h3>
        <p>目前課表：{profile.schedule || "未提供課表資訊"}</p>
        <p>加強科目：{profile.focusSubject || "未提供加強科目"}</p>
      </div>

      <ProgressBar
        label="今日任務完成率"
        value={progress}
        helperText={`已完成 ${checkedTasks.length} / ${taskTemplates.length} 項任務`}
      />

      <div className="section-block">
        <h3>今日建議任務</h3>
        <div className="card-list">
          {taskTemplates.map((task, index) => (
            <TaskCard
              key={task.title}
              title={task.title}
              description={task.description}
              time={task.time}
              completed={checkedTasks.includes(index)}
              onToggle={() => toggleTask(index)}
            />
          ))}
        </div>
      </div>

      <button
        className="secondary-button"
        onClick={() => alert("Demo：系統已模擬重新分配未完成任務。")}
      >
        模擬 AI 重新排程
      </button>
    </section>
  );
}

export default SchedulePage;