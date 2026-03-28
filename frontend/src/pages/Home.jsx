import { useEffect, useState } from "react";
import API from "../services/api";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

export default function Home() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");

  const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // 🔥 แสดงผลภาษาไทย
  const categoryLabel = {
    food: "อาหาร",
    drink: "เครื่องดื่ม",
    dessert: "ของหวาน",
  };

  // =========================
  // 🔥 FETCH FOODS
  // =========================
  const fetchFoods = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await API.get("/foods", {
        params: {
          category: category || "",
          search,
        },
      });

      setFoods(res.data || []);
    } catch (err) {
      console.log("FETCH FOODS ERROR:", err);
      setError("โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  // debounce
  useEffect(() => {
    const delay = setTimeout(fetchFoods, 300);
    return () => clearTimeout(delay);
  }, [category, search]);

  // =========================
  // 🛒 ADD TO CART
  // =========================
  const addToCart = (food) => {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    const index = cart.findIndex((item) => item._id === food._id);

    if (index > -1) {
      cart[index].qty += 1;
    } else {
      cart.push({
        _id: food._id,
        name: food.name,
        price: Number(food.price) || 0,
        qty: 1,
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cartUpdated"));

    setToast("เพิ่มสินค้าแล้ว 🛒");
    setTimeout(() => setToast(""), 2000);
  };

  // =========================
  // 🔥 GROUP CATEGORY
  // =========================
  const grouped = foods.reduce((acc, food) => {
    const cat = food.category || "other";

    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(food);

    return acc;
  }, {});

  return (
    <>
      <Navbar />

      {toast && (
        <div className="fixed top-5 right-5 bg-black text-white px-4 py-2 rounded shadow">
          {toast}
        </div>
      )}

      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">🍔 Food Menu</h1>

        {/* 🔥 FILTER */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input
            placeholder="🔍 ค้นหาอาหาร..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border p-2 rounded w-full"
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="">ทุกหมวด</option>
            <option value="food">อาหาร</option>
            <option value="drink">เครื่องดื่ม</option>
            <option value="dessert">ของหวาน</option>
          </select>
        </div>

        {/* STATES */}
        {loading && <p>Loading...</p>}
        {!loading && error && <p className="text-red-500">{error}</p>}
        {!loading && !error && foods.length === 0 && (
          <p className="text-gray-500">ไม่มีสินค้า</p>
        )}

        {/* CATEGORY */}
        {!loading &&
          !error &&
          Object.keys(grouped).map((cat) => (
            <div key={cat} className="mb-10">
              <h2 className="text-2xl font-bold mb-4">
                {categoryLabel[cat] || cat}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {grouped[cat].map((food) => {
                  const cleanImage = food.image
                    ? food.image.replace(/^\/?uploads\//, "")
                    : null;

                  return (
                    <div
                      key={food._id}
                      className="bg-white rounded-xl shadow-md hover:shadow-xl transition"
                    >
                      <img
                        src={
                          cleanImage
                            ? `${BASE_URL}/uploads/${cleanImage}`
                            : "https://placehold.co/300x300"
                        }
                        onError={(e) =>
                          (e.currentTarget.src = "https://placehold.co/300x300")
                        }
                        className="w-full h-48 object-cover"
                      />

                      <div className="p-4">
                        <h3 className="text-lg font-semibold">{food.name}</h3>

                        <p className="font-bold">{food.price} บาท</p>

                        <div className="flex gap-3 mt-3">
                          <Link to={`/products/${food._id}`}>
                            <button className="bg-blue-500 text-white px-4 py-2 rounded">
                              รายละเอียด
                            </button>
                          </Link>

                          <button
                            onClick={() => addToCart(food)}
                            className="bg-pink-500 text-white px-4 py-2 rounded"
                          >
                            Add to cart
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
      </div>
    </>
  );
}
