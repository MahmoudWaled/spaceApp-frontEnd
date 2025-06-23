import axios from "axios";

export function getPosts() {
  const fetchPosts = async () => {
    const { data } = await axios.get("http://localhost:5000/api/posts");
    console.log("Fetched posts:", data);
    return data;
  };
  return fetchPosts;
}

export async function toggleLikePost(postId: string, token) {
  const response = await axios.post(
    `http://localhost:5000/api/posts/${postId}/like`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  console.log(response.data)
  return response.data;
}
