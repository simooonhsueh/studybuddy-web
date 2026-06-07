import { useEffect, useState } from "react";
import UserCard from "../components/UserCard";
import {
  fetchMatches,
  getMyStudyGroups,
  getSentGroupInvitations,
  sendGroupInvitation,
} from "../services/userApi";

function MatchPage({ profile, goToPage }) {
  const [matches, setMatches] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [sentInvitations, setSentInvitations] = useState([]);
  const [selectedGroupByUser, setSelectedGroupByUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [inviteLoadingUserId, setInviteLoadingUserId] = useState(null);
  const [error, setError] = useState(null);

  async function loadMatchPageData() {
    if (!profile?.id) {
      setError("找不到使用者資料，請重新登入。");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const [matchesResult, groupsResult, sentResult] = await Promise.all([
        fetchMatches(profile.id),
        getMyStudyGroups(profile.id),
        getSentGroupInvitations(profile.id),
      ]);

      setMatches(matchesResult.data || []);
      setMyGroups(groupsResult.data || []);
      setSentInvitations(sentResult.data || []);
    } catch (err) {
      setError(err.message || "配對載入失敗，請稍後再試。");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMatchPageData();
  }, [profile?.id]);

  function handleSelectGroup(userId, groupId) {
    setSelectedGroupByUser({
      ...selectedGroupByUser,
      [userId]: groupId,
    });
  }

  function hasPendingInvite(userId, groupId) {
    return sentInvitations.some(
      (invite) =>
        String(invite.toUserId) === String(userId) &&
        String(invite.groupId) === String(groupId) &&
        invite.status === "pending"
    );
  }

  async function handleSendInvite(user) {
    const selectedGroupId = selectedGroupByUser[user.id];

    if (!selectedGroupId) {
      alert("請先選擇要邀請對方加入哪一個群組。");
      return;
    }

    try {
      setInviteLoadingUserId(user.id);

      await sendGroupInvitation(selectedGroupId, profile.id, user.id);

      await loadMatchPageData();

      const selectedGroup = myGroups.find(
        (group) => String(group.id) === String(selectedGroupId)
      );

      alert(
        `已送出邀請給 ${user.name}，邀請加入「${
          selectedGroup?.name || "指定群組"
        }」。`
      );
    } catch (error) {
      console.error("送出邀請失敗：", error);
      alert(error.message || "送出邀請失敗");
    } finally {
      setInviteLoadingUserId(null);
    }
  }

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

      <div className="summary-card">
        <span>我的讀書群組</span>
        <h3>{myGroups.length} 個群組</h3>

        {myGroups.length === 0 ? (
          <p>你還沒有建立讀書群組。請先建立群組，再邀請 Study Buddy 加入。</p>
        ) : (
          <p>你可以在下方推薦學伴中，選擇要邀請他加入哪一個群組。</p>
        )}

        <button className="secondary-button" onClick={() => goToPage("groups")}>
          管理我的讀書群組
        </button>
      </div>

      <div className="summary-card">
        <span>已送出的邀請</span>
        <h3>{sentInvitations.length} 筆邀請</h3>

        {sentInvitations.length === 0 ? (
          <p>目前尚未送出任何邀請。</p>
        ) : (
          <div className="group-member-list">
            {sentInvitations.map((invite) => (
              <div className="group-member-item" key={invite.id}>
                <strong>{invite.toUserName}</strong>
                <p>邀請加入：{invite.groupName}</p>
                <p>狀態：{invite.status}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="section-block">
        <h3>推薦學習夥伴</h3>

        {loading && <p className="section-description">正在計算配對中⋯</p>}

        {error && (
          <p
            className="section-description"
            style={{ color: "var(--color-warning, #e57373)" }}
          >
            {error}
          </p>
        )}

        {!loading && !error && matches.length === 0 && (
          <p className="section-description">
            目前還沒有找到適合的學習夥伴，邀請更多朋友加入後配對結果會更豐富！
          </p>
        )}

        <div className="card-list">
          {matches.map((user) => {
            const selectedGroupId = selectedGroupByUser[user.id] || "";
            const inviteAlreadySent =
              selectedGroupId && hasPendingInvite(user.id, selectedGroupId);

            return (
              <div className="match-card" key={user.id}>
                <UserCard
                  name={user.name}
                  subject={user.weakSubjects}
                  goal={user.examGoal}
                  time={user.availableTime}
                  matchRate={user.matchScore}
                  reasons={user.reasons || []}
                  status={user.reasons?.[0] || "可配對"}
                  onSelect={() =>
                    alert(
                      `〖${user.name}〗的配對共同點：\n\n` +
                        (user.reasons || [])
                          .map((r, i) => `${i + 1}. ${r}`)
                          .join("\n")
                    )
                  }
                />

                <div className="invite-panel">
                  <select
                    value={selectedGroupId}
                    onChange={(event) =>
                      handleSelectGroup(user.id, event.target.value)
                    }
                    disabled={myGroups.length === 0}
                  >
                    <option value="">選擇要邀請加入的群組</option>
                    {myGroups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </select>

                  <button
                    className="primary-button"
                    onClick={() => handleSendInvite(user)}
                    disabled={
                      myGroups.length === 0 ||
                      inviteAlreadySent ||
                      inviteLoadingUserId === user.id
                    }
                  >
                    {inviteAlreadySent
                      ? "邀請已送出"
                      : inviteLoadingUserId === user.id
                      ? "送出中..."
                      : "傳送群組邀請"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default MatchPage;