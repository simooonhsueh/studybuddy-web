import FeatureButton from "../components/FeatureButton";
import UserCard from "../components/UserCard";
import CourseCard from "../components/CourseCard";
import { matchedUsers, courseSuggestions } from "../data/mockData";

function MainHubPage({ profile, goToPage }) {
  return (
    <section className="screen">
      <p className="section-label">Learning Hub</p>
      <h2>歡迎，{profile.name}</h2>

      <div className="summary-card">
        <span>近期測驗目標</span>
        <h3>{profile.examGoal}</h3>
        <p>可讀書時段：{profile.availableTime || "尚未填寫"}</p>
        <p>想加強科目：{profile.weakSubjects || "尚未填寫"}</p>
      </div>

      <div className="feature-list">
        <FeatureButton
          title="AI 學習排程"
          description="根據課表與近期測驗目標，產生今日學習任務。"
          meta="Plan"
          onClick={() => goToPage("schedule")}
        />

        <FeatureButton
          title="Study Buddy 配對"
          description="尋找相同科目、相近目標與重疊時段的學習夥伴。"
          meta="Match"
          onClick={() => goToPage("match")}
        />

        <FeatureButton
          title="Streak 進度追蹤"
          description="追蹤任務完成率、連續打卡與本週學習狀態。"
          meta="Track"
          onClick={() => goToPage("progress")}
        />
      </div>

      <div className="section-block">
        <h3>課表與學習建議</h3>
        <div className="card-list">
          {courseSuggestions.map((course) => (
            <CourseCard
              key={course.title}
              title={course.title}
              subtitle={course.subtitle}
              time={course.time}
              note={course.note}
            />
          ))}
        </div>
      </div>

      <div className="section-block">
        <h3>可配對學習者預覽</h3>
        <div className="card-list">
          {matchedUsers.slice(0, 2).map((user) => (
            <UserCard
              key={user.name}
              name={user.name}
              subject={user.subject}
              goal={user.goal}
              time={user.time}
              matchRate={user.matchRate}
              status={user.status}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default MainHubPage;