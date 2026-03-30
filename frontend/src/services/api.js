import axios from "axios";

const API = axios.create({
  baseURL: "https://food-delivery-xgdk.onrender.com/api",
  timeout: 10000, // 🔥 10 วิ
});

// 🔥 ใส่ token อัตโนมัติ
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");

  if (token) {
    req.headers = req.headers || {};
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

// ==========================
// 🔥 RESPONSE INTERCEPTOR
// ==========================
API.interceptors.response.use(
  (res) => res,
  (err) => {
    // 🔥 token หมด / ไม่ถูกต้อง
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      alert("Session หมดอายุ กรุณา login ใหม่");

      window.location.href = "/login";
    }

    // 🔥 server error
    if (err.response?.status === 500) {
      console.error("SERVER ERROR 💥", err.response.data);
    }

    return Promise.reject(err);
  }
);

API.interceptors.request.use((req) => {
  console.log("API CALL:", req.url);
  return req;
});

export default API;