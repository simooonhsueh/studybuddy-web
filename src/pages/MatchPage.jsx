import UserCard from "../components/UserCard";
import { matchedUsers } from "../data/mockData";

function MatchPage({ profile, goToPage }) {
  return (
    <section className="screen">
      <button className="back-button" onClick={() => goToPage("hub")}>
        返回主介面
      </button>

      <p className="section-label">Buddy Matching</p>
      <h2>Study Buddy 配對</h2>

      <div className="summary-card">
        <span>配對條件</span>
        <h3>{profile.focusSubject || "尚未設定加強科目"}</h3>
        <p>近期目標：{profile.examGoal}</p>
        <p>可讀書時段：{profile.studyTime || "尚未填寫"}</p>
      </div>

      <div className="section-block">
        <h3>推薦學習者</h3>
        <p className="section-description">
          Demo 版本以前端資料模擬配對結果，正式版本可改為後端相似度計算。
        </p>

        <div className="card-list">
          {matchedUsers.map((user) => (
            <UserCard
              key={user.name}
              name={user.name}
              subject={user.subject}
              goal={user.goal}
              time={user.time}
              matchRate={user.matchRate}
              status={user.status}
              onSelect={() => alert(`已選擇查看 ${user.name} 的配對資訊。`)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default MatchPage;