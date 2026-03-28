import Navbar from "../components/Navbar";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Cart() {
  const navigate = useNavigate();

  const [cart, setCart] = useState(
    JSON.parse(localStorage.getItem("cart")) || [],
  );

  const removeItem = (index) => {
    const newCart = cart.filter((item, i) => i !== index);

    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart");
    window.dispatchEvent(new Event("cartUpdated"));
  };

  // ✅ FIX total (คิด qty ด้วย)
  const total = cart.reduce(
    (sum, item) => sum + item.price * (item.qty || 1),
    0,
  );

  return (
    <>
      <Navbar />

      <div className="p-10 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Cart ({cart.length})</h1>

        {cart.length === 0 && <p className="text-gray-500">No items in cart</p>}

        {cart.map((item, index) => (
          <div
            key={index}
            className="flex justify-between items-center border-b py-4"
          >
            <div>
              <p className="font-semibold">{item.name}</p>

              {/* ✅ แสดง qty */}
              <p className="text-gray-500 text-sm">
                {item.price} x {item.qty || 1} บาท
              </p>
            </div>

            <button
              onClick={() => removeItem(index)}
              className="text-red-500 hover:text-red-700"
            >
              Remove
            </button>
          </div>
        ))}

        {cart.length > 0 && (
          <>
            <h2 className="text-xl font-bold mt-6">Total: {total} บาท</h2>

            <div className="flex gap-4 mt-4">
              <button
                onClick={() => navigate("/checkout")}
                className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
              >
                Checkout
              </button>

              <button
                onClick={clearCart}
                className="bg-gray-300 px-6 py-2 rounded hover:bg-gray-400"
              >
                Clear Cart
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
