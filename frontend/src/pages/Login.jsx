import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { toast } from "react-toastify";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("กรอกข้อมูลให้ครบ");
      return;
    }

    try {
      setLoading(true);
      const res = await API.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      toast.success("เข้าสู่ระบบสำเร็จ 🎉");
      window.location.href = "/";

      // ❌ ไม่ใช้ navigate แล้ว (เพราะ React ไม่ re-render)
      // navigate("/");

      toast.success("เข้าสู่ระบบสำเร็จ 🎉");
      navigate("/");
    } catch (err) {
      console.log(err?.response?.data);
      toast.error("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
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
        <h2 className="text-3xl font-bold text-center text-white">🔑 Login</h2>

        {/* Email */}
        <div className="space-y-2">
          <label className="text-sm text-gray-300">Email</label>
          <div className="flex px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus-within:ring-2 focus-within:ring-indigo-400">
            <input
              type="email"
              placeholder="you@example.com"
              className="bg-transparent w-full text-white outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-2">
          <label className="text-sm text-gray-300">Password</label>
          <div className="flex px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus-within:ring-2 focus-within:ring-indigo-400">
            <input
              type="password"
              placeholder="••••••••"
              className="bg-transparent w-full text-white outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        {/* Button */}
        <button
          disabled={loading}
          className="w-full py-3 rounded-xl text-white font-semibold 
          bg-gradient-to-r from-indigo-500 to-purple-600
          hover:scale-105 hover:shadow-[0_0_25px_rgba(99,102,241,0.6)]
          transition duration-300 disabled:opacity-50"
        >
          {loading ? "Loading..." : "Login"}
        </button>

        {/* Links */}
        <div className="text-center text-sm text-gray-300 space-y-2">
          <p
            onClick={() => navigate("/register")}
            className="cursor-pointer hover:text-white"
          >
            ยังไม่มีบัญชี? สมัครสมาชิก
          </p>

          <p
            onClick={() => navigate("/forgot-password")}
            className="cursor-pointer text-pink-400 hover:text-pink-300"
          >
            ลืมรหัสผ่าน
          </p>
        </div>
      </form>
    </div>
  );
}
