import axios from "axios";

export async function getProfile(id: string) {
  const { data } = await axios.get(`http://localhost:5000/api/user/${id}`);
  return data;
}

