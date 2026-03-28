import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { toast } from "react-toastify";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const navigate = useNavigate();

  // ✅ validate email
  const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

  // ✅ normalize email
  const normalizeEmail = (email) => email.trim().toLowerCase();

  // 🔥 CALL API
  const sendEmail = async () => {
    const cleanEmail = normalizeEmail(email);

    // 🚫 กัน error ฝั่งหน้า
    if (!cleanEmail) {
      toast.error("กรุณากรอกอีเมล");
      return;
    }

    if (!isValidEmail(cleanEmail)) {
      toast.error("รูปแบบอีเมลไม่ถูกต้อง");
      return;
    }

    try {
      setLoading(true);

      console.log("📨 Sending to:", cleanEmail);

      const res = await API.post("/auth/forgot-password", {
        email: cleanEmail,
      });

      console.log("✅ SUCCESS:", res.data);

      setSent(true);
      toast.success("ส่งลิงก์รีเซ็ตแล้ว 📩");

      // ⏱ redirect
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || "Server error";

      console.log("❌ ERROR:", msg);

      // 🔥 แยก error ให้ user เข้าใจง่าย
      if (msg.includes("User not found")) {
        toast.error("ไม่พบอีเมลนี้ในระบบ");
      } else if (msg.includes("email missing")) {
        toast.error("ข้อมูลผู้ใช้ไม่ถูกต้อง (backend)");
      } else if (msg.includes("Recipient email")) {
        toast.error("ระบบส่งเมลผิดพลาด (backend)");
      } else {
        toast.error("ไม่สามารถส่งอีเมลได้");
      }
    } finally {
      setLoading(false);
    }
  };

  // 🔥 SUBMIT
  const handleSubmit = (e) => {
    e.preventDefault();
    if (loading) return;
    sendEmail();
  };

  // 🔥 RESEND
  const handleResend = () => {
    if (loading) return;
    sendEmail();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#312e81] px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md p-8 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl space-y-6"
      >
        <h2 className="text-3xl font-bold text-center text-white">
          📧 Forgot Password
        </h2>

        {sent && (
          <div className="text-green-400 text-sm text-center">
            ✅ ส่งลิงก์แล้ว! กรุณาเช็คอีเมล
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm text-gray-300">Email</label>

          <div className="flex items-center px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus-within:ring-2 focus-within:ring-indigo-400 transition">
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-transparent w-full text-white placeholder-gray-400 outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl text-white font-semibold 
          bg-gradient-to-r from-indigo-500 to-purple-600
          hover:scale-105 hover:shadow-[0_0_25px_rgba(99,102,241,0.6)]
          transition duration-300 disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>

        {sent && (
          <button
            type="button"
            onClick={handleResend}
            disabled={loading}
            className="w-full text-sm text-indigo-300 hover:text-white"
          >
            {loading ? "Sending..." : "ส่งใหม่อีกครั้ง"}
          </button>
        )}

        <p
          onClick={() => navigate("/login")}
          className="text-sm text-center text-gray-300 cursor-pointer hover:text-white"
        >
          ← Back to Login
        </p>
      </form>
    </div>
  );
};

export default ForgotPassword;
