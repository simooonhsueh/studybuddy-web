const API_BASE_URL = "http://localhost:5000/api/progress";

async function progressRequest(path, userId, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-user-id": String(userId),
      ...options.headers,
    },
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Progress API request failed");
  }

  return result.data;
}

export function getProgress(userId) {
  return progressRequest("", userId);
}

export function syncProgressTasks(userId, tasks) {
  return progressRequest("/tasks", userId, {
    method: "PUT",
    body: JSON.stringify({ tasks }),
  });
}

export function updateProgressTask(userId, taskId, isCompleted) {
  return progressRequest(`/tasks/${taskId}/complete`, userId, {
    method: "PATCH",
    body: JSON.stringify({ isCompleted }),
  });
}

export function checkInProgress(userId) {
  return progressRequest("/checkin", userId, {
    method: "POST",
  });
}
