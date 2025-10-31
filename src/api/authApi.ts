import axios from "axios";
import { API_BASE_URL } from "../config/env";

type LoginValues = {
  email: string;
  password: string;
};

export async function login(values: LoginValues) {
  const response = await axios.post(`${API_BASE_URL}/auth/login`, values);
  return response.data;
}

type registerValues = {
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
  name: string;
  profileImage?: File | null;
};

export async function register(values: registerValues) {
  const response = await axios.post(`${API_BASE_URL}/auth/register`, {
    name: values.name,
    username: values.username,
    email: values.email,
    password: values.password,
    confirmPassword: values.confirmPassword,
  });
  return response.data;
}

export async function forgotPassword(email: string) {
  const response = await axios.post(`${API_BASE_URL}/auth/forgot-password`, {
    email,
  });
  return response.data;
}

export async function resetPassword(token: string, password: string) {
  const endpoint = `${API_BASE_URL}/auth/reset-password/${token}`;
  const response = await axios.post(endpoint, { password });
  return response.data;
}
