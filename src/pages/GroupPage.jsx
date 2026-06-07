import { useEffect, useState } from "react";
import {
  acceptGroupInvitation,
  createStudyGroup,
  deleteStudyGroup,
  getMyStudyGroups,
  getReceivedGroupInvitations,
  getSentGroupInvitations,
  leaveStudyGroup,
  rejectGroupInvitation,
  removeStudyGroupMember,
  searchUsersByName,
  sendGroupInvitation,
  getGroupProgress,
} from "../services/userApi";

function GroupPage({ profile, goToPage }) {
  const [groupName, setGroupName] = useState("");
  const [groups, setGroups] = useState([]);
  const [sentInvitations, setSentInvitations] = useState([]);
  const [receivedInvitations, setReceivedInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedGroupByUser, setSelectedGroupByUser] = useState({});
  const [groupProgressMap, setGroupProgressMap] = useState({});

  async function loadGroupData() {
    if (!profile?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const [groupsResult, sentResult, receivedResult] = await Promise.all([
        getMyStudyGroups(profile.id),
        getSentGroupInvitations(profile.id),
        getReceivedGroupInvitations(profile.id),
      ]);

      const nextGroups = groupsResult.data || [];

        setGroups(nextGroups);
        setSentInvitations(sentResult.data || []);
        setReceivedInvitations(receivedResult.data || []);

        const progressResults = await Promise.all(
        nextGroups.map((group) => getGroupProgress(group.id, profile.id))
      );

      const nextProgressMap = {};

        progressResults.forEach((result) => {
        nextProgressMap[result.data.groupId] = result.data.membersProgress;
      });

      setGroupProgressMap(nextProgressMap);
    } catch (error) {
      console.error("載入群組資料失敗：", error);
      alert(error.message || "載入群組資料失敗");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGroupData();
  }, [profile?.id]);

  async function handleCreateGroup() {
    if (!profile?.id) {
      alert("請先登入或建立學習檔案。");
      return;
    }

    if (!groupName.trim()) {
      alert("請輸入群組名稱。");
      return;
    }

    try {
      await createStudyGroup(profile.id, groupName.trim());
      setGroupName("");
      await loadGroupData();
      alert("群組建立成功。");
    } catch (error) {
      console.error("建立群組失敗：", error);
      alert(error.message || "建立群組失敗");
    }
  }

  async function handleSearchUsers() {
    if (!searchKeyword.trim()) {
        alert("請輸入要搜尋的使用者名稱。");
        return;
    }

    try {
        const result = await searchUsersByName(searchKeyword.trim());

        const filteredResults = (result.data || []).filter(
        (user) => String(user.id) !== String(profile.id)
        );

        setSearchResults(filteredResults);
    } catch (error) {
        console.error("搜尋使用者失敗：", error);
        alert(error.message || "搜尋使用者失敗");
    }
  }

  function handleSelectGroupForUser(userId, groupId) {
    setSelectedGroupByUser({
        ...selectedGroupByUser,
        [userId]: groupId,
    });
  }

  async function handleInviteSearchedUser(user) {
    const selectedGroupId = selectedGroupByUser[user.id];

    if (!selectedGroupId) {
        alert("請先選擇要邀請對方加入哪一個群組。");
        return;
    }

    try {
        await sendGroupInvitation(selectedGroupId, profile.id, user.id);
        await loadGroupData();
        alert(`已送出邀請給 ${user.name}。`);
    } catch (error) {
        console.error("送出邀請失敗：", error);
        alert(error.message || "送出邀請失敗");
    }
  }

  async function handleAcceptInvitation(invitationId) {
    try {
      await acceptGroupInvitation(invitationId);
      await loadGroupData();
      alert("已接受群組邀請。");
    } catch (error) {
      console.error("接受邀請失敗：", error);
      alert(error.message || "接受邀請失敗");
    }
  }

  async function handleRejectInvitation(invitationId) {
    try {
      await rejectGroupInvitation(invitationId);
      await loadGroupData();
      alert("已拒絕群組邀請。");
    } catch (error) {
      console.error("拒絕邀請失敗：", error);
      alert(error.message || "拒絕邀請失敗");
    }
  }

  async function handleLeaveGroup(groupId) {
    if (!window.confirm("確定要退出這個群組嗎？")) {
        return;
    }

    try {
        await leaveStudyGroup(groupId, profile.id);
        await loadGroupData();
        alert("已退出群組。");
    } catch (error) {
        console.error("退出群組失敗：", error);
        alert(error.message || "退出群組失敗");
    }
    }

    async function handleRemoveMember(groupId, memberId, memberName) {
    if (!window.confirm(`確定要將 ${memberName} 移出群組嗎？`)) {
        return;
    }

    try {
        await removeStudyGroupMember(groupId, profile.id, memberId);
        await loadGroupData();
        alert(`已將 ${memberName} 移出群組。`);
    } catch (error) {
        console.error("移除成員失敗：", error);
        alert(error.message || "移除成員失敗");
    }
    }

    async function handleDeleteGroup(groupId, groupName) {
    if (!window.confirm(`確定要解散「${groupName}」嗎？此操作無法復原。`)) {
        return;
    }

    try {
        await deleteStudyGroup(groupId, profile.id);
        await loadGroupData();
        alert(`已解散群組：${groupName}`);
    } catch (error) {
        console.error("解散群組失敗：", error);
        alert(error.message || "解散群組失敗");
    }
    }

  return (
    <section className="screen">
      <button className="back-button" onClick={() => goToPage("hub")}>
        返回主介面
      </button>

      <p className="section-label">Study Groups</p>
      <h2 className="screen-title">我的讀書群組</h2>

      {!profile?.id && (
        <p className="section-description">
          請先登入或建立學習檔案，才能管理讀書群組。
        </p>
      )}

      <div className="summary-card">
        <span>建立新群組</span>
        <h3>先建立群組，再邀請 Study Buddy 加入</h3>

        <input
          value={groupName}
          onChange={(event) => setGroupName(event.target.value)}
          placeholder="例如：TOEFL 衝刺小組、期末考讀書小隊"
          disabled={!profile?.id}
        />

        <button
          className="primary-button"
          onClick={handleCreateGroup}
          disabled={!profile?.id}
        >
          建立群組
        </button>
      </div>

      {loading && <p className="section-description">正在載入群組資料⋯</p>}

      <div className="section-block">
        <h3>我的群組</h3>

        {!loading && groups.length === 0 ? (
          <p className="section-description">
            目前還沒有群組。請先建立一個群組，再到 Study Buddy 配對頁邀請學伴。
          </p>
        ) : (
          <div className="card-list">
            {groups.map((group) => {
                const isOwner = String(group.ownerId) === String(profile.id);

                return (
                    <div className="summary-card" key={group.id}>
                    <span>{group.ownerName} 建立</span>
                    <h3>{group.name}</h3>
                    <p>成員數：{group.members.length}</p>

                    <div className="group-member-list">
                        {group.members.map((member) => {
                        const isCurrentUser = String(member.id) === String(profile.id);
                        const isGroupOwner = String(member.id) === String(group.ownerId);

                        return (
                            <div className="group-member-item" key={member.id}>
                            <strong>{member.name}</strong>
                            <p>{member.role === "owner" ? "群組建立者" : "成員"}</p>

                            {isOwner && !isCurrentUser && !isGroupOwner && (
                                <button
                                className="secondary-button"
                                onClick={() =>
                                    handleRemoveMember(group.id, member.id, member.name)
                                }
                                >
                                移除成員
                                </button>
                            )}
                            </div>
                        );
                        })}
                    </div>

                    <div className="group-progress-list">
                        <h4>群組成員進度</h4>

                        {(groupProgressMap[group.id] || []).map((item) => (
                            <div className="group-progress-item" key={item.userId}>
                            <strong>{item.name}</strong>

                            {!item.canView ? (
                                <p>{item.message}</p>
                            ) : (
                                <>
                                <p>
                                    可見範圍：
                                    {item.progressVisibility === "public" && "公開給所有人"}
                                    {item.progressVisibility === "group" && "只公開給群組成員"}
                                    {item.progressVisibility === "private" && "只有自己可見"}
                                </p>
                                <p>
                                    完成任務：
                                    {item.progress.completedTasks || 0} / {item.progress.totalTasks || 0}
                                </p>
                                <p>
                                    完成率：
                                    {item.progress.completionRate || 0}%
                                </p>
                                <p>
                                    連續打卡：
                                    {item.progress.streak || 0} 天
                                </p>
                                </>
                            )}
                            </div>
                        ))}
                        </div>
                    <div className="invite-actions">
                        {isOwner ? (
                        <button
                            className="secondary-button"
                            onClick={() => handleDeleteGroup(group.id, group.name)}
                        >
                            解散群組
                        </button>
                        ) : (
                        <button
                            className="secondary-button"
                            onClick={() => handleLeaveGroup(group.id)}
                        >
                            退出群組
                        </button>
                        )}
                    </div>
                    </div>
                );
                })}
          </div>
        )}
      </div>

      <div className="section-block">
        <h3>搜尋朋友並邀請進群組</h3>

        <div className="invite-panel">
            <input
            value={searchKeyword}
            onChange={(event) => setSearchKeyword(event.target.value)}
            placeholder="輸入朋友名稱或帳號"
            />

            <button className="primary-button" onClick={handleSearchUsers}>
            搜尋
            </button>
        </div>

        {searchResults.length === 0 ? (
            <p className="section-description">
            尚未搜尋到使用者，請輸入名稱後搜尋。
            </p>
        ) : (
            <div className="card-list">
            {searchResults.map((user) => (
                <div className="summary-card" key={user.id}>
                <span>搜尋結果</span>
                <h3>{user.name}</h3>
                <p>目標：{user.examGoal || "尚未填寫"}</p>
                <p>加強科目：{user.weakSubjects || "尚未設定"}</p>
                <p>可讀書時段：{user.availableTime || "尚未填寫"}</p>
                <p>
                    進度公開範圍：
                    {user.progressVisibility === "public" && "公開給所有人"}
                    {user.progressVisibility === "group" && "只公開給群組成員"}
                    {user.progressVisibility === "private" && "只有自己可見"}
                </p>

                <div className="invite-panel">
                    <select
                    value={selectedGroupByUser[user.id] || ""}
                    onChange={(event) =>
                        handleSelectGroupForUser(user.id, event.target.value)
                    }
                    disabled={groups.length === 0}
                    >
                    <option value="">選擇要邀請加入的群組</option>
                    {groups.map((group) => (
                        <option key={group.id} value={group.id}>
                        {group.name}
                        </option>
                    ))}
                    </select>

                    <button
                    className="primary-button"
                    onClick={() => handleInviteSearchedUser(user)}
                    disabled={groups.length === 0}
                    >
                    傳送群組邀請
                    </button>
                </div>
                </div>
            ))}
            </div>
        )}
        </div>

      <div className="section-block">
        <h3>收到的邀請</h3>

        {!loading && receivedInvitations.length === 0 ? (
          <p className="section-description">目前沒有收到任何群組邀請。</p>
        ) : (
          <div className="card-list">
            {receivedInvitations.map((invite) => (
              <div className="summary-card" key={invite.id}>
                <span>
                  {invite.status === "pending" ? "等待回覆" : "已處理"}
                </span>
                <h3>{invite.groupName}</h3>
                <p>邀請人：{invite.fromUserName}</p>
                <p>狀態：{invite.status}</p>

                {invite.status === "pending" && (
                  <div className="invite-actions">
                    <button
                      className="primary-button"
                      onClick={() => handleAcceptInvitation(invite.id)}
                    >
                      接受
                    </button>
                    <button
                      className="secondary-button"
                      onClick={() => handleRejectInvitation(invite.id)}
                    >
                      拒絕
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="section-block">
        <h3>已送出的邀請</h3>

        {!loading && sentInvitations.length === 0 ? (
          <p className="section-description">目前尚未送出任何群組邀請。</p>
        ) : (
          <div className="card-list">
            {sentInvitations.map((invite) => (
              <div className="summary-card" key={invite.id}>
                <span>邀請狀態：{invite.status}</span>
                <h3>{invite.toUserName}</h3>
                <p>邀請加入：{invite.groupName}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default GroupPage;