import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import API from "../services/api";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);

  // ✅ ใช้ env สำหรับ production
  const BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await API.get(`/foods/${id}`);
        setProduct(res.data);
      } catch (err) {
        console.log("FETCH PRODUCT ERROR:", err);
      }
    };

    fetchProduct();
  }, [id]);

  const addToCart = () => {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    const index = cart.findIndex((item) => item._id === product._id);

    if (index > -1) {
      cart[index].qty += 1;
    } else {
      cart.push({
        _id: product._id,
        name: product.name,
        price: Number(product.price) || 0,
        qty: 1,
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cartUpdated"));

    alert("Added to cart 🛒");
    navigate("/cart");
  };

  if (!product) {
    return (
      <>
        <Navbar />
        <div className="p-10 text-xl">Loading product...</div>
      </>
    );
  }

  // 🔥 กัน path ซ้อน
  const cleanImage = product.image
    ? product.image.replace(/^\/?uploads\//, "")
    : null;

  return (
    <>
      <Navbar />

      <div className="p-10 flex gap-10">
        <img
          src={`${BASE_URL}/uploads/${product.image}`}
          onError={(e) => {
            console.log("FAIL IMAGE:", product.image);
            e.target.src = "https://placehold.co/300";
          }}
        />

        <div>
          <h1 className="text-3xl font-bold">{product.name}</h1>

          <p className="text-gray-600 mt-3">
            {product.description || "No description"}
          </p>

          <p className="text-2xl text-pink-500 font-bold mt-4">
            {product.price} บาท
          </p>

          <button
            onClick={addToCart}
            className="mt-6 bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </>
  );
}
