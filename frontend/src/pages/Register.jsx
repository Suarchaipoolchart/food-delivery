import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { toast } from "react-toastify";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !password) {
      toast.error("กรอกข้อมูลให้ครบ");
      return;
    }

    try {
      setLoading(true);
      await API.post("/auth/register", {
        name,
        email,
        password,
      });

      toast.success("สมัครสมาชิกสำเร็จ 🎉");
      navigate("/login");
    } catch (err) {
      console.log(err?.response?.data);
      toast.error("สมัครไม่สำเร็จ");
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
        <h2 className="text-3xl font-bold text-center text-white">
          ✨ Sign Up
        </h2>

        {/* Name */}
        <div className="space-y-2">
          <label className="text-sm text-gray-300">Name</label>
          <div className="flex px-4 py-3 rounded-xl bg-white/10 border border-white/20">
            <input
              type="text"
              placeholder="Your name"
              className="bg-transparent w-full text-white outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label className="text-sm text-gray-300">Email</label>
          <div className="flex px-4 py-3 rounded-xl bg-white/10 border border-white/20">
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
          <div className="flex px-4 py-3 rounded-xl bg-white/10 border border-white/20">
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
          {loading ? "Creating..." : "Sign Up"}
        </button>

        {/* Back */}
        <p
          onClick={() => navigate("/login")}
          className="text-sm text-center text-gray-300 cursor-pointer hover:text-white"
        >
          มีบัญชีแล้ว? ไป Login
        </p>
      </form>
    </div>
  );
}
