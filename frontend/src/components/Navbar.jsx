import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Navbar() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const loadData = () => {
      // 🔥 FIX ตรงนี้
      const data = JSON.parse(localStorage.getItem("user"));
      setUser(data);

      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      setCartCount(cart.length);
    };

    loadData();

    window.addEventListener("userUpdated", loadData);
    window.addEventListener("cartUpdated", loadData);

    return () => {
      window.removeEventListener("userUpdated", loadData);
      window.removeEventListener("cartUpdated", loadData);
    };
  }, []);

  const logout = () => {
    // 🔥 FIX ตรงนี้
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    window.dispatchEvent(new Event("userUpdated"));

    navigate("/login");
  };

  return (
    <nav className="h-20 bg-gradient-to-r from-black to-blue-400 text-white px-8 py-4 flex justify-between items-center">
      <h1 className="font-bold text-lg">🍔 Foodmonkey ProMax</h1>

      <div className="flex items-center gap-6">
        <Link to="/">Home</Link>

        <Link to="/cart" className="relative">
          🛒 Cart
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-4 bg-red-500 text-black text-xs px-2 rounded-full">
              {cartCount}
            </span>
          )}
        </Link>

        <Link to="/orders">📦 Orders</Link>

        {user ? (
          <div className="relative">
            <div
              onClick={() => setOpen(!open)}
              className="flex items-center gap-2 cursor-pointer"
            >
              <img
                src={
                  user?.avatar ||
                  "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                }
                className="w-8 h-8 rounded-full object-cover"
              />

              <span>{user.name}</span>
              <span>▼</span>
            </div>

            {open && (
              <div className="absolute right-0 mt-2 bg-white text-black rounded shadow w-40">
                <Link
                  to="/profile"
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  Profile
                </Link>

                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            to="/login"
            className="bg-white text-black px-4 py-1 rounded hover:bg-gray-200"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
