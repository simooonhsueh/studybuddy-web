const API_BASE_URL = "http://localhost:5000/api";

export async function saveUserProfile(profile) {
  const response = await fetch(`${API_BASE_URL}/user/profile`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(profile),
  });

  if (!response.ok) {
    throw new Error("Failed to save profile");
  }

  return response.json();
}

export async function getUserProfile() {
  const response = await fetch(`${API_BASE_URL}/user/profile`);

  if (!response.ok) {
    throw new Error("Failed to get profile");
  }

  return response.json();
}