import axios from "axios";

export function getPosts() {
  const fetchPosts = async () => {
    const { data } = await axios.get("http://localhost:5000/api/posts");
    console.log("Fetched posts:", data);
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
  console.log(response.data);
  return response.data;
}

export async function addComment(
  postId: string,
  content: string,
  token: string
) {
  try {
    // Try multiple possible endpoints
    const endpoints = [
      `http://localhost:5000/api/posts/${postId}/comments`,
      `http://localhost:5000/api/posts/${postId}/comment`,
      `http://localhost:5000/api/comments`,
      `http://localhost:5000/api/comment`,
      `http://localhost:5000/api/posts/${postId}/reply`,
      `http://localhost:5000/api/comments/${postId}`,
    ];

    const payloads = [
      { text: content },
      { text: content, postId: postId },
      { content: content, postId: postId },
      { message: content, postId: postId },
    ];

    console.log("Testing multiple endpoints for comment...");

    for (const endpoint of endpoints) {
      for (const payload of payloads) {
        try {
          console.log(`Trying: ${endpoint} with payload:`, payload);

          const response = await axios.post(endpoint, payload, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          console.log("✅ SUCCESS! Comment API response:", response.data);
          console.log("Working endpoint:", endpoint);
          console.log("Working payload:", payload);
          return response.data;
        } catch (error: any) {
          if (error.response?.status !== 404) {
            console.log(
              `❌ ${endpoint} failed with status ${error.response?.status}:`,
              error.response?.data
            );
          }
          // Continue to next combination
        }
      }
    }

    // If we get here, none of the combinations worked
    throw new Error("No working comment endpoint found");
  } catch (error: any) {
    console.error("All comment endpoints failed:", error);
    throw error;
  }
}

export async function deletePost(postId: string, token: string) {
  try {
    console.log("Deleting post:", postId);

    const response = await axios.delete(
      `http://localhost:5000/api/posts/${postId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("Post deleted successfully:", response.data);
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
    console.log("Updating post:", postId, "Content:", content);

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

    console.log("Post updated successfully:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error updating post:", error);
    throw error;
  }
}

export async function deleteComment(commentId: string, token: string) {
  try {
    console.log("Deleting comment:", commentId);

    const response = await axios.delete(
      `http://localhost:5000/api/comments/${commentId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("Comment deleted successfully:", response.data);
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
    console.log("Updating comment:", commentId, "Content:", content);

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

    console.log("Comment updated successfully:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error updating comment:", error);
    throw error;
  }
}
