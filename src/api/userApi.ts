import axios from "axios";
import { API_BASE_URL } from "../config/env";

export async function getProfile(id: string) {
  const response = await axios.get(`${API_BASE_URL}/user/${id}`);
  return response.data;
}

export async function followUser(userId: string, token: string) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/user/${userId}/follow`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
      throw new Error("Authentication failed. Please log in again.");
    }
    throw error;
  }
}

export async function unfollowUser(userId: string, token: string) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/user/${userId}/unfollow`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
      throw new Error("Authentication failed. Please log in again.");
    }
    throw error;
  }
}

export async function getFollowers(userId: string, token?: string) {
  const headers: any = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await axios.get(`${API_BASE_URL}/user/${userId}/followers`, {
    headers,
  });
  return response.data;
}

export async function getFollowing(userId: string, token?: string) {
  const headers: any = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await axios.get(`${API_BASE_URL}/user/${userId}/following`, {
    headers,
  });
  return response.data;
}

export async function getUserProfile(userId: string, token?: string) {
  try {
    const headers: any = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await axios.get(`${API_BASE_URL}/user/${userId}`, {
      headers,
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
      throw new Error("Authentication failed. Please log in again.");
    }
    throw error;
  }
}

export async function getUserPosts(userId: string, token?: string) {
  try {
    const headers: any = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await axios.get(`${API_BASE_URL}/posts/user/${userId}`, {
      headers,
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status !== 404) {
    }
    return [];
  }
}

export async function updateProfile(
  profileData: {
    name?: string;
    username?: string;
    bio?: string;
    avatar?: File;
  },
  token: string
) {
  const formData = new FormData();
  if (profileData.name) formData.append("name", profileData.name);
  if (profileData.username) formData.append("username", profileData.username);
  if (profileData.bio) formData.append("bio", profileData.bio);
  if (profileData.avatar) formData.append("avatar", profileData.avatar);

  const response = await axios.put(`${API_BASE_URL}/user/profile`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}

export async function deleteProfileImage(token: string) {
  const response = await axios.delete(`${API_BASE_URL}/user/profile/avatar`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

// Update full profile
export async function updateFullProfile(
  userId: string,
  formData: FormData,
  token?: string
) {
  const headers: any = { "Content-Type": "multipart/form-data" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const response = await axios.put(`${API_BASE_URL}/user/${userId}`, formData, {
    headers,
  });
  return response.data;
}

// Update only profile image
export async function updateProfileImage(
  userId: string,
  profileImage: File,
  token?: string
) {
  const formData = new FormData();
  formData.append("profileImage", profileImage);
  const headers: any = { "Content-Type": "multipart/form-data" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const response = await axios.patch(
    `${API_BASE_URL}/user/${userId}`,
    formData,
    { headers }
  );
  return response.data;
}
