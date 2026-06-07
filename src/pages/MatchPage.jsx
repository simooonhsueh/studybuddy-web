import { useEffect, useState } from "react";
import UserCard from "../components/UserCard";
import { fetchMatches } from "../services/userApi";

function MatchPage({ profile, goToPage }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!profile?.id) {
      setError("找不到使用者資料，請重新登入。");
      setLoading(false);
      return;
    }

    fetchMatches(profile.id)
      .then((result) => {
        setMatches(result.data || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "配對載入失敗，請稍後再試。");
        setLoading(false);
      });
  }, [profile?.id]);

  return (
    <section className="screen">
      <button className="back-button" onClick={() => goToPage("hub")}>
        返回主介面
      </button>

      <p className="section-label">Buddy Matching</p>
      <h2 className="screen-title">Study Buddy 配對</h2>

      <div className="summary-card">
        <span>你的配對條件</span>
        <h3>{profile?.weakSubjects || "尚未設定加強科目"}</h3>
        <p>近期目標：{profile?.examGoal || "尚未填寫"}</p>
        <p>可讀書時段：{profile?.availableTime || "尚未填寫"}</p>
      </div>

      <div className="section-block">
        <h3>推薦學習夥伴</h3>

        {loading && (
          <p className="section-description">正在計算配對中⋯</p>
        )}

        {error && (
          <p className="section-description" style={{ color: "var(--color-warning, #e57373)" }}>
            {error}
          </p>
        )}

        {!loading && !error && matches.length === 0 && (
          <p className="section-description">
            目前還沒有找到適合的學習夥伴，邀請更多朋友加入後配對結果會更豐富！
          </p>
        )}

        <div className="card-list">
          {matches.map((user) => (
            <UserCard
              key={user.id}
              name={user.name}
              subject={user.weakSubjects}
              goal={user.examGoal}
              time={user.availableTime}
              matchRate={user.matchScore}
              reasons={user.reasons}
              status={user.reasons?.[0] || "可配對"}
              onSelect={() =>
                alert(
                  `【${user.name}】的配對共同點：\n\n` +
                  user.reasons.map((r, i) => `${i + 1}. ${r}`).join("\n")
                )
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default MatchPage;