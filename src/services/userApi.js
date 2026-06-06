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