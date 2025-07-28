import axios from "axios";

export function getPosts() {
  const fetchPosts = async () => {
    const { data } = await axios.get("http://localhost:5000/api/posts");
    return data;
  };
  return fetchPosts;
}

export async function toggleLikePost(postId: string, token: string) {
  const response = await axios.post(
    `http://localhost:5000/api/posts/${postId}/like`,
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
  try {
    const endpoint = `http://localhost:5000/api/comments/${postId}`;
    const payload = { text: content };

    const response = await axios.post(endpoint, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Comment endpoint failed:", error);
    throw error;
  }
}

export async function deletePost(postId: string, token: string) {
  try {
    const response = await axios.delete(
      `http://localhost:5000/api/posts/${postId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("Error deleting post:", error);
    throw error;
  }
}

export async function updatePost(
  postId: string,
  content: string,
  token: string
) {
  try {
    const response = await axios.put(
      `http://localhost:5000/api/posts/${postId}`,
      { content },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("Error updating post:", error);
    throw error;
  }
}

export async function deleteComment(commentId: string, token: string) {
  try {
    const response = await axios.delete(
      `http://localhost:5000/api/comments/${commentId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("Error deleting comment:", error);
    throw error;
  }
}

export async function updateComment(
  commentId: string,
  content: string,
  token: string
) {
  try {
    const response = await axios.put(
      `http://localhost:5000/api/comments/${commentId}`,
      { text: content },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("Error updating comment:", error);
    throw error;
  }
}

export async function createPost(
  content: string,
  image?: File,
  token?: string
) {
  try {
    const formData = new FormData();
    formData.append("content", content);
    if (image) {
      formData.append("image", image);
    }

    const response = await axios.post(
      `http://localhost:5000/api/posts`,
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
    console.error("Error creating post:", error);
    throw error;
  }
}
