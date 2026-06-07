const API_BASE_URL = "http://localhost:5000/api";

export async function saveUserProfile(profile) {
  const response = await fetch(`${API_BASE_URL}/user/profile`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(profile),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to save profile");
  }

  return result;
}

export async function getUserProfile() {
  const response = await fetch(`${API_BASE_URL}/user/profile`);

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to get profile");
  }

  return result;
}

export async function loginUserProfile(name) {
  const response = await fetch(`${API_BASE_URL}/user/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to login");
  }

  return result;
}

// 根據目前使用者 id，從後端取得真實配對結果
export async function fetchMatches(userId) {
  const response = await fetch(`${API_BASE_URL}/match`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to fetch matches");
  }

  return result; // { status: 'success', data: [...] }
}

export async function createStudyGroup(ownerId, name) {
  const response = await fetch(`${API_BASE_URL}/groups`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ownerId, name }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to create study group");
  }

  return result;
}

export async function getMyStudyGroups(userId) {
  const response = await fetch(`${API_BASE_URL}/groups/my?userId=${userId}`);

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to get study groups");
  }

  return result;
}

export async function sendGroupInvitation(groupId, fromUserId, toUserId) {
  const response = await fetch(`${API_BASE_URL}/groups/invitations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ groupId, fromUserId, toUserId }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to send group invitation");
  }

  return result;
}

export async function getSentGroupInvitations(userId) {
  const response = await fetch(
    `${API_BASE_URL}/groups/invitations/sent?userId=${userId}`
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to get sent invitations");
  }

  return result;
}

export async function getReceivedGroupInvitations(userId) {
  const response = await fetch(
    `${API_BASE_URL}/groups/invitations/received?userId=${userId}`
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to get received invitations");
  }

  return result;
}

export async function acceptGroupInvitation(invitationId) {
  const response = await fetch(
    `${API_BASE_URL}/groups/invitations/${invitationId}/accept`,
    {
      method: "PATCH",
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to accept invitation");
  }

  return result;
}

export async function rejectGroupInvitation(invitationId) {
  const response = await fetch(
    `${API_BASE_URL}/groups/invitations/${invitationId}/reject`,
    {
      method: "PATCH",
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to reject invitation");
  }

  return result;
}

export async function leaveStudyGroup(groupId, userId) {
  const response = await fetch(`${API_BASE_URL}/groups/${groupId}/leave`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to leave study group");
  }

  return result;
}

export async function removeStudyGroupMember(groupId, ownerId, memberId) {
  const response = await fetch(
    `${API_BASE_URL}/groups/${groupId}/members/${memberId}/remove`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ownerId }),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to remove group member");
  }

  return result;
}

export async function deleteStudyGroup(groupId, ownerId) {
  const response = await fetch(`${API_BASE_URL}/groups/${groupId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ownerId }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to delete study group");
  }

  return result;
}

export async function searchUsersByName(keyword) {
  const response = await fetch(
    `${API_BASE_URL}/groups/search-users?keyword=${encodeURIComponent(keyword)}`
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to search users");
  }

  return result;
}

export async function getGroupProgress(groupId, viewerId) {
  const response = await fetch(
    `${API_BASE_URL}/groups/${groupId}/progress?viewerId=${viewerId}`
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to get group progress");
  }

  return result;
}

export async function updateUserProfile(id, profile) {
  const response = await fetch(`${API_BASE_URL}/user/profile/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(profile),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to update profile");
  }

  return result;
}