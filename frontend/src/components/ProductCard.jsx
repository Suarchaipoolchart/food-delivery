import React from "react";

export default function ProductCard({ food }) {
  if (!food) return null;

  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    const exist = cart.find((item) => item._id === food._id);

    if (exist) {
      exist.qty += 1;
    } else {
      cart.push({
        _id: food._id,
        name: food.name,
        price: food.price,
        image: food.image,
        qty: 1,
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cartUpdated"));
    alert("เพิ่มสินค้าแล้ว");
  };

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition p-4">
      <img
        src={
          food.image
            ? `http://localhost:5000/uploads/${food.image}`
            : "https://placehold.co/150"
        }
        className="w-full h-40 object-cover rounded"
      />

      <h2 className="text-lg font-semibold mt-3">{food.name || "No name"}</h2>

      <p className="text-black-500">{food.price || 0} บาท</p>

      <button
        onClick={addToCart}
        className="mt-3 w-full bg-pink-500 text-white py-2 rounded hover:bg-pink-600"
      >
        Add to Cart
      </button>
    </div>
  );
}
