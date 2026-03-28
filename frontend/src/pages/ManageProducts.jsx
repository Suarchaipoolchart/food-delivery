import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import API from "../services/api";

export default function ManageProducts() {
  const BASE_URL = import.meta.env.VITE_API_URL;
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  // =========================
  // 🔥 FETCH PRODUCTS
  // =========================
  const fetchProducts = async () => {
    try {
      const res = await API.get("/foods");
      setProducts(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  // =========================
  // 🔥 DELETE PRODUCT (FIX 403)
  // =========================
  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;

    try {
      const token = localStorage.getItem("token");

      console.log("TOKEN:", token); // 🔥 debug

      await API.delete(`/foods/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Deleted ✅");

      // 🔥 รีโหลดใหม่
      fetchProducts();
    } catch (err) {
      console.log(err.response?.data || err);
      alert("Delete failed ❌");
    }
  };

  return (
    <div className="flex">
      <AdminSidebar />

      <div className="flex-1 p-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Manage Products</h1>

          <Link to="/add-product">
            <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
              Add Product
            </button>
          </Link>
        </div>

        <table className="w-full border shadow">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-3">Image</th>
              <th className="p-3">Name</th>
              <th className="p-3">Price</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {products.map((product) => (
              <tr key={product._id} className="border-t">
                <td className="p-3">
                  <img
                    src={
                      product.image
                        ? `${BASE_URL}/uploads/${product.image}`
                        : "https://placehold.co/80"
                    }
                    className="w-16 h-16 object-cover rounded"
                  />
                </td>

                <td className="p-3">{product.name}</td>

                <td className="p-3">{product.price} บาท</td>

                <td className="p-3 flex gap-2">
                  <button
                    onClick={() => navigate(`/edit-product/${product._id}`)}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => deleteProduct(product._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
