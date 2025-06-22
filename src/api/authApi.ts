import axios from "axios";


type LoginValues = {
  email: string;
  password: string;
};
  
export async function  login(values: LoginValues){
  const response = await axios.post("http://localhost:5000/api/auth/login", values);
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

export async function register(values:registerValues) {
  
  const formData = new FormData();
  
  formData.append('username', values.username);
  formData.append('email', values.email);
  formData.append('password', values.password);
  formData.append('confirmPassword', values.confirmPassword);
  formData.append('name', values.name);
  if (values.profileImage) {
    formData.append('profileImage', values.profileImage);
  }




  const response = await axios.post("http://localhost:5000/api/auth/register", formData);
  return response.data
}