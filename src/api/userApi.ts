import axios from "axios";

export async function getProfile(id: string) {
  const { data } = await axios.get(`http://localhost:5000/api/user/${id}`);
  return data;
}

export async function followUser(userId: string, token: string) {
  try {
    const response = await axios.post(
      `http://localhost:5000/api/user/${userId}/follow`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("Error following user:", error);
    if (error.response?.status === 401) {
      // Token is invalid, redirect to login
      localStorage.removeItem("token");
      window.location.href = "/login";
      throw new Error("Authentication failed. Please log in again.");
    }
    throw error;
  }
}

export async function unfollowUser(userId: string, token: string) {
  try {
    const response = await axios.delete(
      `http://localhost:5000/api/user/${userId}/unFollow`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("Error unfollowing user:", error);
    if (error.response?.status === 401) {
      // Token is invalid, redirect to login
      localStorage.removeItem("token");
      window.location.href = "/login";
      throw new Error("Authentication failed. Please log in again.");
    }
    throw error;
  }
}

export async function getFollowers(userId: string, token?: string) {
  try {
    const headers: any = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await axios.get(
      `http://localhost:5000/api/Follow/followers/${userId}`,
      { headers }
    );

    return response.data;
  } catch (error: any) {
    console.error("Error getting followers:", error);
    throw error;
  }
}

export async function getFollowing(userId: string, token?: string) {
  try {
    const headers: any = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await axios.get(
      `http://localhost:5000/api/Follow/following/${userId}`,
      { headers }
    );

    return response.data;
  } catch (error: any) {
    console.error("Error getting following:", error);
    throw error;
  }
}

export async function getUserProfile(userId: string, token?: string) {
  try {
    const headers: any = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await axios.get(
      `http://localhost:5000/api/user/${userId}`,
      { headers }
    );

    return response.data;
  } catch (error: any) {
    console.error("Error getting user profile:", error);
    if (error.response?.status === 401) {
      // Token is invalid, redirect to login
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
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await axios.get(
      `http://localhost:5000/api/posts/user/${userId}`,
      { headers }
    );

    return response.data;
  } catch (error: any) {
    console.error("Error getting user posts:", error);
    // Return empty array instead of throwing to prevent crashes
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
  try {
    const formData = new FormData();
    if (profileData.name) formData.append("name", profileData.name);
    if (profileData.username) formData.append("username", profileData.username);
    if (profileData.bio) formData.append("bio", profileData.bio);
    if (profileData.avatar) formData.append("avatar", profileData.avatar);

    const response = await axios.put(
      `http://localhost:5000/api/users/profile`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("Error updating profile:", error);
    throw error;
  }
}

export async function deleteProfileImage(token: string) {
  try {
    const response = await axios.delete(
      `http://localhost:5000/api/users/profile/avatar`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("Error deleting profile image:", error);
    throw error;
  }
}

// Update full profile
export async function updateFullProfile(
  userId: string,
  formData: FormData,
  token?: string
) {
  const headers: any = { "Content-Type": "multipart/form-data" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  try {
    const response = await axios.put(
      `http://localhost:5000/api/user/${userId}`,
      formData,
      { headers }
    );
    return response.data;
  } catch (error) {}
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
    `http://localhost:5000/api/user/${userId}`,
    formData,
    { headers }
  );
  return response.data;
}
