import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export function getPosts(token?: string) {
  const fetchPosts = async () => {
    const headers: any = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await axios.get(`${API_BASE_URL}/posts`, { headers });
    return response.data;
  };
  return fetchPosts;
}

export async function toggleLikePost(postId: string, token: string) {
  const response = await axios.post(
    `${API_BASE_URL}/posts/${postId}/like`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
}

export async function addComment(
  postId: string,
  content: string,
  token: string
) {
  const response = await axios.post(
    `${API_BASE_URL}/posts/${postId}/comments`,
    { text: content },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
}

export async function deletePost(postId: string, token: string) {
  const response = await axios.delete(`${API_BASE_URL}/posts/${postId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}

export async function updatePost(
  postId: string,
  content: string,
  token: string
) {
  const response = await axios.put(
    `${API_BASE_URL}/posts/${postId}`,
    { content },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
}

export async function deleteComment(commentId: string, token: string) {
  const response = await axios.delete(`${API_BASE_URL}/comments/${commentId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}

export async function updateComment(
  commentId: string,
  content: string,
  token: string
) {
  const response = await axios.put(
    `${API_BASE_URL}/comments/${commentId}`,
    { text: content },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
}

export async function toggleLikeComment(commentId: string, token: string) {
  const response = await axios.post(
    `${API_BASE_URL}/comments/${commentId}/like`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
}

export async function createPost(
  content: string,
  image?: File,
  token?: string
) {
  const formData = new FormData();
  formData.append("content", content);
  if (image) {
    formData.append("image", image);
  }

  const response = await axios.post(`${API_BASE_URL}/posts`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}
