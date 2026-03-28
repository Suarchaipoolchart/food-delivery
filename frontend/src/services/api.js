import axios from "axios";

const API = axios.create({
  baseURL: "https://food-delivery-xgdk.onrender.com/api",
});

// 🔥 ใส่ token อัตโนมัติ
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

export default API;