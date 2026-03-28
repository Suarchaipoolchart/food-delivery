import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import API from "../services/api";

export default function AddProduct() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("food");
  const [loading, setLoading] = useState(false);

  const addProduct = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      // ❌ กัน token หาย (สาเหตุ 403)
      if (!token) {
        alert("กรุณา login ก่อน ❌");
        return;
      }

      const formData = new FormData();

      formData.append("name", name.trim());
      formData.append("price", Number(price) || 0);
      formData.append("description", description.trim());
      formData.append("category", category.toLowerCase().trim());

      // ❌ กัน image null (บางทีทำให้ 500)
      if (image) {
        formData.append("image", image);
      }

      // 🔥 DEBUG
      console.log("SEND DATA:", {
        name,
        price,
        category,
        description,
        image,
      });

      await API.post("/foods", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("เพิ่มสินค้าเรียบร้อย ✅");
      navigate("/manage-products");
    } catch (err) {
      console.log("ERROR:", err.response?.data || err);

      alert(err.response?.data?.message || "เกิดข้อผิดพลาด (เช็ค console) ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex">
      <AdminSidebar />

      <div className="flex-1 p-10">
        <h1 className="text-2xl font-bold mb-6">Add Product</h1>

        <form onSubmit={addProduct} className="space-y-4 max-w-md">
          {/* NAME */}
          <input
            placeholder="Product Name"
            className="border p-2 w-full"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          {/* PRICE */}
          <input
            type="number"
            placeholder="Price"
            className="border p-2 w-full"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />

          {/* CATEGORY ✅ FIX ENUM */}
          <select
            className="border p-2 w-full"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="food">อาหาร</option>
            <option value="drink">เครื่องดื่ม</option>
            <option value="dessert">ของหวาน</option>
          </select>

          {/* IMAGE */}
          <input
            type="file"
            className="border p-2 w-full"
            onChange={(e) => setImage(e.target.files[0])}
          />

          {/* DESCRIPTION */}
          <textarea
            placeholder="Description"
            className="border p-2 w-full"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <button
            disabled={loading}
            className="bg-blue-500 text-white px-6 py-2 rounded w-full"
          >
            {loading ? "กำลังเพิ่ม..." : "Add Product"}
          </button>
        </form>
      </div>
    </div>
  );
}
