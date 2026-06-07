const fs = require("fs");
const path = require("path");
const { canViewProgress } = require("../services/visibilityService");
const groupsFilePath = path.join(__dirname, "../data/groups.json");
const invitationsFilePath = path.join(
  __dirname,
  "../data/groupInvitations.json"
);
const profileFilePath = path.join(__dirname, "../data/profile.json");

function readJsonFile(filePath, fallbackData) {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(fallbackData, null, 2), "utf-8");
      return fallbackData;
    }

    const content = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    console.error(`讀取檔案失敗：${filePath}`, error);
    return fallbackData;
  }
}

function writeJsonFile(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

function readGroups() {
  const data = readJsonFile(groupsFilePath, { groups: [] });
  return Array.isArray(data.groups) ? data : { groups: [] };
}

function writeGroups(data) {
  writeJsonFile(groupsFilePath, data);
}

function readInvitations() {
  const data = readJsonFile(invitationsFilePath, { invitations: [] });
  return Array.isArray(data.invitations) ? data : { invitations: [] };
}

function writeInvitations(data) {
  writeJsonFile(invitationsFilePath, data);
}

function readProfiles() {
  const data = readJsonFile(profileFilePath, []);

  if (Array.isArray(data)) {
    return data;
  }

  if (data && Array.isArray(data.users)) {
    return data.users;
  }

  if (data && data.users && typeof data.users === "object") {
    return Object.values(data.users);
  }

  if (data && typeof data === "object" && data.id) {
    return [data];
  }

  return [];
}

function findUserById(userId) {
  const profiles = readProfiles();
  return profiles.find((profile) => String(profile.id) === String(userId));
}

function createGroup(req, res) {
  try {
    const { ownerId, name } = req.body;

    if (!ownerId || !name) {
      return res.status(400).json({
        status: "error",
        message: "缺少 ownerId 或 name",
      });
    }

    const owner = findUserById(ownerId);

    if (!owner) {
      return res.status(404).json({
        status: "error",
        message: "找不到建立群組的使用者",
      });
    }

    const store = readGroups();

    const newGroup = {
      id: `group-${Date.now()}`,
      name: name.trim(),
      ownerId: String(ownerId),
      ownerName: owner.name,
      members: [
        {
          id: String(ownerId),
          name: owner.name,
          role: "owner",
        },
      ],
      createdAt: new Date().toISOString(),
    };

    store.groups.push(newGroup);
    writeGroups(store);

    return res.status(201).json({
      status: "success",
      message: "群組建立成功",
      data: newGroup,
    });
  } catch (error) {
    console.error("建立群組失敗：", error);

    return res.status(500).json({
      status: "error",
      message: "建立群組失敗",
    });
  }
}

function getMyGroups(req, res) {
  try {
    const userId = String(req.query.userId || "");

    if (!userId) {
      return res.status(400).json({
        status: "error",
        message: "缺少 userId",
      });
    }

    const store = readGroups();

    const myGroups = store.groups.filter((group) =>
      group.members.some((member) => String(member.id) === userId)
    );

    return res.status(200).json({
      status: "success",
      data: myGroups,
    });
  } catch (error) {
    console.error("取得我的群組失敗：", error);

    return res.status(500).json({
      status: "error",
      message: "取得我的群組失敗",
    });
  }
}

function sendInvitation(req, res) {
  try {
    const { groupId, fromUserId, toUserId } = req.body;

    if (!groupId || !fromUserId || !toUserId) {
      return res.status(400).json({
        status: "error",
        message: "缺少 groupId、fromUserId 或 toUserId",
      });
    }

    const groupsStore = readGroups();
    const invitationsStore = readInvitations();

    const group = groupsStore.groups.find(
      (item) => String(item.id) === String(groupId)
    );

    if (!group) {
      return res.status(404).json({
        status: "error",
        message: "找不到群組",
      });
    }

    if (String(group.ownerId) !== String(fromUserId)) {
      return res.status(403).json({
        status: "error",
        message: "只有群組建立者可以邀請成員",
      });
    }

    const toUser = findUserById(toUserId);

    if (!toUser) {
      return res.status(404).json({
        status: "error",
        message: "找不到要邀請的使用者",
      });
    }

    const alreadyMember = group.members.some(
      (member) => String(member.id) === String(toUserId)
    );

    if (alreadyMember) {
      return res.status(409).json({
        status: "error",
        message: "此使用者已經是群組成員",
      });
    }

    const duplicatePendingInvitation = invitationsStore.invitations.find(
      (invite) =>
        String(invite.groupId) === String(groupId) &&
        String(invite.toUserId) === String(toUserId) &&
        invite.status === "pending"
    );

    if (duplicatePendingInvitation) {
      return res.status(409).json({
        status: "error",
        message: "已經送出過邀請，等待對方接受中",
      });
    }

    const invitation = {
      id: `invite-${Date.now()}`,
      groupId: String(groupId),
      groupName: group.name,
      fromUserId: String(fromUserId),
      fromUserName: group.ownerName,
      toUserId: String(toUserId),
      toUserName: toUser.name,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    invitationsStore.invitations.push(invitation);
    writeInvitations(invitationsStore);

    return res.status(201).json({
      status: "success",
      message: "群組邀請已送出",
      data: invitation,
    });
  } catch (error) {
    console.error("送出群組邀請失敗：", error);

    return res.status(500).json({
      status: "error",
      message: "送出群組邀請失敗",
    });
  }
}

function getSentInvitations(req, res) {
  try {
    const userId = String(req.query.userId || "");

    if (!userId) {
      return res.status(400).json({
        status: "error",
        message: "缺少 userId",
      });
    }

    const store = readInvitations();

    const sentInvitations = store.invitations.filter(
      (invite) => String(invite.fromUserId) === userId
    );

    return res.status(200).json({
      status: "success",
      data: sentInvitations,
    });
  } catch (error) {
    console.error("取得送出邀請失敗：", error);

    return res.status(500).json({
      status: "error",
      message: "取得送出邀請失敗",
    });
  }
}

function getReceivedInvitations(req, res) {
  try {
    const userId = String(req.query.userId || "");

    if (!userId) {
      return res.status(400).json({
        status: "error",
        message: "缺少 userId",
      });
    }

    const store = readInvitations();

    const receivedInvitations = store.invitations.filter(
      (invite) => String(invite.toUserId) === userId
    );

    return res.status(200).json({
      status: "success",
      data: receivedInvitations,
    });
  } catch (error) {
    console.error("取得收到邀請失敗：", error);

    return res.status(500).json({
      status: "error",
      message: "取得收到邀請失敗",
    });
  }
}

function acceptInvitation(req, res) {
  try {
    const { invitationId } = req.params;

    const groupsStore = readGroups();
    const invitationsStore = readInvitations();

    const invitation = invitationsStore.invitations.find(
      (item) => String(item.id) === String(invitationId)
    );

    if (!invitation) {
      return res.status(404).json({
        status: "error",
        message: "找不到邀請",
      });
    }

    if (invitation.status !== "pending") {
      return res.status(409).json({
        status: "error",
        message: "此邀請已處理過",
      });
    }

    const group = groupsStore.groups.find(
      (item) => String(item.id) === String(invitation.groupId)
    );

    if (!group) {
      return res.status(404).json({
        status: "error",
        message: "找不到群組",
      });
    }

    const alreadyMember = group.members.some(
      (member) => String(member.id) === String(invitation.toUserId)
    );

    if (!alreadyMember) {
      group.members.push({
        id: String(invitation.toUserId),
        name: invitation.toUserName,
        role: "member",
      });
    }

    invitation.status = "accepted";
    invitation.updatedAt = new Date().toISOString();

    writeGroups(groupsStore);
    writeInvitations(invitationsStore);

    return res.status(200).json({
      status: "success",
      message: "已接受群組邀請",
      data: {
        invitation,
        group,
      },
    });
  } catch (error) {
    console.error("接受群組邀請失敗：", error);

    return res.status(500).json({
      status: "error",
      message: "接受群組邀請失敗",
    });
  }
}

function rejectInvitation(req, res) {
  try {
    const { invitationId } = req.params;

    const invitationsStore = readInvitations();

    const invitation = invitationsStore.invitations.find(
      (item) => String(item.id) === String(invitationId)
    );

    if (!invitation) {
      return res.status(404).json({
        status: "error",
        message: "找不到邀請",
      });
    }

    if (invitation.status !== "pending") {
      return res.status(409).json({
        status: "error",
        message: "此邀請已處理過",
      });
    }

    invitation.status = "rejected";
    invitation.updatedAt = new Date().toISOString();

    writeInvitations(invitationsStore);

    return res.status(200).json({
      status: "success",
      message: "已拒絕群組邀請",
      data: invitation,
    });
  } catch (error) {
    console.error("拒絕群組邀請失敗：", error);

    return res.status(500).json({
      status: "error",
      message: "拒絕群組邀請失敗",
    });
  }
}

function leaveGroup(req, res) {
  try {
    const { groupId } = req.params;
    const { userId } = req.body;

    if (!groupId || !userId) {
      return res.status(400).json({
        status: "error",
        message: "缺少 groupId 或 userId",
      });
    }

    const groupsStore = readGroups();

    const group = groupsStore.groups.find(
      (item) => String(item.id) === String(groupId)
    );

    if (!group) {
      return res.status(404).json({
        status: "error",
        message: "找不到群組",
      });
    }

    if (String(group.ownerId) === String(userId)) {
      return res.status(403).json({
        status: "error",
        message: "群組建立者不能退出群組，請改用解散群組",
      });
    }

    const isMember = group.members.some(
      (member) => String(member.id) === String(userId)
    );

    if (!isMember) {
      return res.status(404).json({
        status: "error",
        message: "你不是此群組成員",
      });
    }

    group.members = group.members.filter(
      (member) => String(member.id) !== String(userId)
    );

    writeGroups(groupsStore);

    return res.status(200).json({
      status: "success",
      message: "已退出群組",
      data: group,
    });
  } catch (error) {
    console.error("退出群組失敗：", error);

    return res.status(500).json({
      status: "error",
      message: "退出群組失敗",
    });
  }
}

function removeGroupMember(req, res) {
  try {
    const { groupId, memberId } = req.params;
    const { ownerId } = req.body;

    if (!groupId || !memberId || !ownerId) {
      return res.status(400).json({
        status: "error",
        message: "缺少 groupId、memberId 或 ownerId",
      });
    }

    const groupsStore = readGroups();

    const group = groupsStore.groups.find(
      (item) => String(item.id) === String(groupId)
    );

    if (!group) {
      return res.status(404).json({
        status: "error",
        message: "找不到群組",
      });
    }

    if (String(group.ownerId) !== String(ownerId)) {
      return res.status(403).json({
        status: "error",
        message: "只有群組建立者可以移除成員",
      });
    }

    if (String(group.ownerId) === String(memberId)) {
      return res.status(403).json({
        status: "error",
        message: "不能移除群組建立者自己",
      });
    }

    const isMember = group.members.some(
      (member) => String(member.id) === String(memberId)
    );

    if (!isMember) {
      return res.status(404).json({
        status: "error",
        message: "此使用者不是群組成員",
      });
    }

    group.members = group.members.filter(
      (member) => String(member.id) !== String(memberId)
    );

    writeGroups(groupsStore);

    return res.status(200).json({
      status: "success",
      message: "已移除群組成員",
      data: group,
    });
  } catch (error) {
    console.error("移除群組成員失敗：", error);

    return res.status(500).json({
      status: "error",
      message: "移除群組成員失敗",
    });
  }
}

function deleteGroup(req, res) {
  try {
    const { groupId } = req.params;
    const { ownerId } = req.body;

    if (!groupId || !ownerId) {
      return res.status(400).json({
        status: "error",
        message: "缺少 groupId 或 ownerId",
      });
    }

    const groupsStore = readGroups();
    const invitationsStore = readInvitations();

    const group = groupsStore.groups.find(
      (item) => String(item.id) === String(groupId)
    );

    if (!group) {
      return res.status(404).json({
        status: "error",
        message: "找不到群組",
      });
    }

    if (String(group.ownerId) !== String(ownerId)) {
      return res.status(403).json({
        status: "error",
        message: "只有群組建立者可以解散群組",
      });
    }

    groupsStore.groups = groupsStore.groups.filter(
      (item) => String(item.id) !== String(groupId)
    );

    invitationsStore.invitations = invitationsStore.invitations.filter(
      (invite) => String(invite.groupId) !== String(groupId)
    );

    writeGroups(groupsStore);
    writeInvitations(invitationsStore);

    return res.status(200).json({
      status: "success",
      message: "群組已解散",
      data: {
        groupId,
      },
    });
  } catch (error) {
    console.error("解散群組失敗：", error);

    return res.status(500).json({
      status: "error",
      message: "解散群組失敗",
    });
  }
}

function searchUsers(req, res) {
  try {
    const keyword = String(req.query.keyword || "").trim().toLowerCase();

    if (!keyword) {
      return res.status(200).json({
        status: "success",
        data: [],
      });
    }

    const profiles = readProfiles();

    const results = profiles
      .filter((profile) => {
        const name = String(profile.name || "").toLowerCase();
        const id = String(profile.id || "").toLowerCase();

        return name.includes(keyword) || id.includes(keyword);
      })
      .map((profile) => ({
        id: profile.id,
        name: profile.name,
        examGoal: profile.examGoal || "",
        weakSubjects: profile.weakSubjects || "",
        availableTime: profile.availableTime || "",
        progressVisibility: profile.progressVisibility || "group",
      }))
      .slice(0, 10);

    return res.status(200).json({
      status: "success",
      data: results,
    });
  } catch (error) {
    console.error("搜尋使用者失敗：", error);

    return res.status(500).json({
      status: "error",
      message: "搜尋使用者失敗",
    });
  }
}

function readProgressStore() {
  const progressFilePath = path.join(__dirname, "../data/progress.json");

  const data = readJsonFile(progressFilePath, { users: {} });

  if (data && typeof data.users === "object") {
    return data;
  }

  return { users: {} };
}

function getProgressPayload(progress) {
  if (!progress) {
    return {
      completedTasks: 0,
      totalTasks: 0,
      completionRate: 0,
      streak: 0,
      lastCheckInDate: null,
      checkInDates: [],
    };
  }

  const tasks = Array.isArray(progress.tasks) ? progress.tasks : [];
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.isCompleted).length;

  return {
    completedTasks,
    totalTasks,
    completionRate:
      totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100),
    streak: progress.streak || 0,
    lastCheckInDate: progress.lastCheckInDate || null,
    checkInDates: progress.checkInDates || [],
  };
}

function findProgressByUserId(userId) {
  const progressStore = readProgressStore();
  return progressStore.users[String(userId)] || null;
}

function getSharedGroupIds(viewerId, targetUserId) {
  const groupsStore = readGroups();

  return groupsStore.groups
    .filter((group) => {
      const members = Array.isArray(group.members) ? group.members : [];

      const hasViewer = members.some(
        (member) => String(member.id) === String(viewerId)
      );

      const hasTarget = members.some(
        (member) => String(member.id) === String(targetUserId)
      );

      return hasViewer && hasTarget;
    })
    .map((group) => group.id);
}

function getGroupProgress(req, res) {
  try {
    const { groupId } = req.params;
    const viewerId = String(req.query.viewerId || "");

    if (!groupId || !viewerId) {
      return res.status(400).json({
        status: "error",
        message: "缺少 groupId 或 viewerId",
      });
    }

    const groupsStore = readGroups();

    const group = groupsStore.groups.find(
      (item) => String(item.id) === String(groupId)
    );

    if (!group) {
      return res.status(404).json({
        status: "error",
        message: "找不到群組",
      });
    }

    const members = Array.isArray(group.members) ? group.members : [];

    const viewerIsMember = members.some(
      (member) => String(member.id) === String(viewerId)
    );

    if (!viewerIsMember) {
      return res.status(403).json({
        status: "error",
        message: "你不是此群組成員，不能查看群組進度",
      });
    }

    const profiles = readProfiles();

    const membersProgress = members.map((member) => {
      const matchedProfile = profiles.find(
        (profile) => String(profile.id) === String(member.id)
      );

      const targetUser = matchedProfile || {
        id: member.id,
        name: member.name,
        progressVisibility: "group",
      };

      const sharedGroupIds = getSharedGroupIds(viewerId, member.id);
      const canView = canViewProgress(viewerId, targetUser, sharedGroupIds);

      if (!canView) {
        return {
          userId: member.id,
          name: member.name,
          progressVisibility: targetUser.progressVisibility || "group",
          canView: false,
          message: "此使用者已將進度設為私人或限制可見",
        };
      }

      const progress = findProgressByUserId(member.id);

      return {
        userId: member.id,
        name: member.name,
        progressVisibility: targetUser.progressVisibility || "group",
        canView: true,
        progress: getProgressPayload(progress),
      };
    });

    return res.status(200).json({
      status: "success",
      data: {
        groupId: group.id,
        groupName: group.name,
        membersProgress,
      },
    });
  } catch (error) {
    console.error("取得群組進度失敗：", error);

    return res.status(500).json({
      status: "error",
      message: "取得群組進度失敗",
      detail: error.message,
    });
  }
}

module.exports = {
  createGroup,
  getMyGroups,
  sendInvitation,
  getSentInvitations,
  getReceivedInvitations,
  acceptInvitation,
  rejectInvitation,
  leaveGroup,
  removeGroupMember,
  deleteGroup,
  searchUsers,
  getGroupProgress,
};