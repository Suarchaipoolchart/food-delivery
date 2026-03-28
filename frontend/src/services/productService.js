import API from "./api";

// 🔥 ดึงอาหารทั้งหมด
export const getFoods = async () => {
  try {
    const res = await API.get("/foods");
    return res.data;
  } catch (err) {
    console.error("FETCH FOODS ERROR:", err);
    throw err;
  }
};