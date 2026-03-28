import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import API from "../services/api";

export default function Checkout() {
  const navigate = useNavigate();

  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  const [payment, setPayment] = useState("Cash");
  const [selectedBank, setSelectedBank] = useState("SCB");
  const [slip, setSlip] = useState(null);
  const [preview, setPreview] = useState(null);

  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [finalTotal, setFinalTotal] = useState(0);

  const [address, setAddress] = useState("");

  const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // 🏦 BANK
  const BANKS = [
    {
      name: "SCB",
      label: "ไทยพาณิชย์",
      img: "https://img.kapook.com/u/2021/settawoot/sep%202021/a3_17.jpg",
    },
    {
      name: "KBANK",
      label: "กสิกรไทย",
      img: "https://play-lh.googleusercontent.com/AyX675vwNz8X2sYUTSrjUTRVzzXMZUW_nMQ8Vk__Nabj6zQ7s7We-bpZbFmoYf7e2YM",
    },
    {
      name: "BBL",
      label: "กรุงเทพ",
      img: "https://www.mitihoon.com/wp-content/uploads/2019/09/BBL.jpg",
    },
    {
      name: "KTB",
      label: "กรุงไทย",
      img: "https://moneyandbanking.co.th/wp-content/uploads/2024/03/11-2.webp",
    },
    {
      name: "TTB",
      label: "TTB",
      img: "https://play-lh.googleusercontent.com/5cnnA8lEdsdpLLT1hxUVFkDE6JX-JOW7SQWL-mmvSlH1eYjG-SNYgSrZzrMpYC3mQCM",
    },
  ];

  const ACCOUNT = {
    name: "Foodmonkey ProMax",
    number: "123-4-56789-0",
  };

  // =========================
  // 💰 CALCULATE
  // =========================
  const subtotal = cart.reduce(
    (sum, item) => sum + Number(item.price) * (item.qty || 1),
    0,
  );

  const total = finalTotal || subtotal;

  // =========================
  // 📸 SLIP
  // =========================
  const handleSlip = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSlip(file);
    setPreview(URL.createObjectURL(file));
  };

  // =========================
  // 🎟️ APPLY COUPON (FIX สำคัญ)
  // =========================
  const applyCoupon = async () => {
    if (!couponCode) return;

    try {
      const res = await API.post("/api/coupons/apply", {
        code: couponCode,
        total: subtotal, // 🔥 ต้องส่ง total ไป backend
      });

      setDiscount(res.data.discount);
      setFinalTotal(res.data.finalTotal);

      alert(`ลด ${res.data.discount} บาท 🎉`);
    } catch (err) {
      alert(err.response?.data?.message || "Coupon ไม่ถูกต้อง");
    }
  };

  // =========================
  // 🛒 PLACE ORDER
  // =========================
  const placeOrder = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const userId = user?._id || user?.id;

      if (!userId) return alert("Login ใหม่ก่อน");
      if (cart.length === 0) return alert("ไม่มีสินค้า");
      if (!address) return alert("กรุณากรอกที่อยู่");

      if (payment !== "Cash" && !slip) {
        return alert("แนบสลิปก่อน");
      }

      const formattedFoods = cart.map((item) => ({
        food: String(item._id),
        qty: Number(item.qty) || 1,
      }));

      const formData = new FormData();
      formData.append("user", userId);
      formData.append("foods", JSON.stringify(formattedFoods));
      formData.append("totalPrice", total);
      formData.append("paymentMethod", payment);
      formData.append("address", address);

      // 🔥 เพิ่ม coupon ส่งไป backend
      if (couponCode) {
        formData.append("coupon", couponCode);
        formData.append("discount", discount);
      }

      if (payment === "Bank Transfer") {
        formData.append("bank", selectedBank);
      }

      if (slip) {
        formData.append("slip", slip);
      }

      await API.post("/api/orders", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("สั่งสำเร็จ 🎉");
      localStorage.removeItem("cart");
      navigate("/orders");
    } catch (err) {
      console.log(err.response?.data || err.message);
      alert(err.response?.data?.message || "Error");
    }
  };

  return (
    <>
      <Navbar />

      <div className="p-10 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        {/* ORDER */}
        <div className="bg-white p-6 rounded-xl shadow mb-6">
          {cart.map((item, i) => (
            <div key={i} className="flex justify-between py-2">
              <span>{item.name}</span>
              <span>
                {item.price} x {item.qty}
              </span>
            </div>
          ))}

          {discount > 0 && (
            <p className="text-green-500">ส่วนลด: -{discount} บาท</p>
          )}

          <p className="text-pink-500 font-bold text-xl">Total: {total} บาท</p>
        </div>

        {/* ADDRESS */}
        <div className="bg-white p-6 rounded-xl shadow mb-6">
          <h2 className="font-bold mb-2">ที่อยู่จัดส่ง</h2>
          <textarea
            rows="3"
            placeholder="กรอกที่อยู่..."
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="border p-3 w-full rounded"
          />
        </div>

        {/* COUPON */}
        <div className="bg-white p-6 rounded-xl shadow mb-6">
          <div className="flex gap-2">
            <input
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className="border p-2 w-full"
              placeholder="Coupon"
            />
            <button
              onClick={applyCoupon}
              className="bg-green-500 px-4 text-white"
            >
              Apply
            </button>
          </div>
        </div>

        {/* PAYMENT */}
        <div className="bg-white p-6 rounded-xl shadow mb-6">
          <select
            value={payment}
            onChange={(e) => setPayment(e.target.value)}
            className="border p-2 w-full"
          >
            <option value="Cash">Cash</option>
            <option value="PromptPay">PromptPay</option>
            <option value="Bank Transfer">Bank Transfer</option>
          </select>

          {payment === "PromptPay" && (
            <img
              src={`https://promptpay.io/0812345678/${total}.png`}
              className="mx-auto w-52 mt-4"
            />
          )}

          {payment === "Bank Transfer" && (
            <>
              <img
                src="/qr-payment.jpg"
                className="w-48 mx-auto mt-4 rounded"
              />

              <div className="grid grid-cols-3 gap-3 mt-4">
                {BANKS.map((b) => (
                  <div
                    key={b.name}
                    onClick={() => setSelectedBank(b.name)}
                    className={`border p-3 text-center cursor-pointer rounded ${
                      selectedBank === b.name && "border-pink-500"
                    }`}
                  >
                    <img src={b.img} className="h-10 mx-auto" />
                    <p className="text-xs">{b.label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 bg-gray-100 p-3 rounded">
                <p>{ACCOUNT.name}</p>
                <p>{ACCOUNT.number}</p>
                <p>{BANKS.find((b) => b.name === selectedBank)?.label}</p>
              </div>
            </>
          )}

          {payment !== "Cash" && (
            <div className="mt-4">
              <input type="file" onChange={handleSlip} />
              {preview && <img src={preview} className="w-40 mt-3 rounded" />}
            </div>
          )}
        </div>

        <button
          onClick={placeOrder}
          className="w-full bg-pink-500 text-white py-3 rounded"
        >
          Place Order
        </button>
      </div>
    </>
  );
}
