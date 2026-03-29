import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const navigate = useNavigate();

  const enterAdmin = () => {
    // 🔥 เซ็ตเป็น admin
    localStorage.setItem(
      "user",
      JSON.stringify({ name: "Admin", role: "admin" }),
    );

    navigate("/admin-orders");
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-10 rounded-xl shadow-lg text-center">
        <h1 className="text-2xl font-bold mb-6">Admin Access</h1>

        <button
          onClick={enterAdmin}
          className="bg-black text-white px-6 py-3 rounded-lg"
        >
          Enter Admin
        </button>
      </div>
    </div>
  );
}
