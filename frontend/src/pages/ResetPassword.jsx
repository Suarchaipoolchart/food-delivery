import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import { toast } from "react-toastify";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const { token } = useParams();
  const navigate = useNavigate();

  // ✅ check token ตอนเข้า page
  useEffect(() => {
    console.log("🔑 TOKEN:", token);

    if (!token) {
      toast.error("ลิงก์รีเซ็ตไม่ถูกต้อง");
      navigate("/login");
    }
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    // ❌ ไม่มี token
    if (!token) {
      toast.error("Token หาย");
      return;
    }

    // ❌ password สั้น
    if (password.length < 6) {
      toast.error("รหัสผ่านต้อง ≥ 6 ตัว");
      return;
    }

    try {
      setLoading(true);

      const res = await API.post("/auth/reset-password", {
        token,
        password,
      });

      console.log("✅ RESET SUCCESS:", res.data);

      toast.success("รีเซ็ตรหัสสำเร็จ 🎉");

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // ✅ redirect แบบนิ่ง
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      console.log("❌ RESET ERROR:", err?.response?.data || err.message);

      toast.error(err?.response?.data?.message || "Token หมดอายุ / ไม่ถูกต้อง");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#312e81] px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md p-8 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl space-y-6"
      >
        {/* Title */}
        <h2 className="text-3xl font-bold text-center text-white">
          🔐 Reset Password
        </h2>

        {/* Input */}
        <div className="space-y-2">
          <label className="text-sm text-gray-300">New Password</label>

          <div className="flex items-center px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus-within:ring-2 focus-within:ring-indigo-400 transition">
            <input
              type={show ? "text" : "password"}
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-transparent w-full text-white placeholder-gray-400 outline-none"
            />

            <button
              type="button"
              onClick={() => setShow(!show)}
              className="text-gray-300 hover:text-white text-sm"
            >
              {show ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        {/* Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl text-white font-semibold 
          bg-gradient-to-r from-indigo-500 to-purple-600
          hover:scale-105 hover:shadow-[0_0_25px_rgba(99,102,241,0.6)]
          transition duration-300 disabled:opacity-50"
        >
          {loading ? "Processing..." : "Reset Password"}
        </button>

        {/* Back */}
        <p
          onClick={() => navigate("/login")}
          className="text-sm text-center text-gray-300 cursor-pointer hover:text-white"
        >
          ← Back to Login
        </p>
      </form>
    </div>
  );
}
