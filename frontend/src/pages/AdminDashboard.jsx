import { useEffect, useState } from "react";
import AdminSidebar from "../components/AdminSidebar";
import API from "../services/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    orders: 0,
    sales: 0,
    pending: 0,
    delivered: 0,
  });

  const [loading, setLoading] = useState(true);

  // 🔥 แปลง status กันพัง
  const normalizeStatus = (status) => {
    if (!status) return "pending";

    const s = status.toLowerCase();

    if (s.includes("received") || s.includes("pending")) return "pending";
    if (s.includes("complete") || s.includes("delivered")) return "delivered";

    return s;
  };

  const fetchData = async () => {
    try {
      const [usersRes, ordersRes] = await Promise.all([
        API.get("/users"),
        API.get("/orders"),
      ]);

      let totalSales = 0;
      let pending = 0;
      let delivered = 0;

      ordersRes.data.forEach((order) => {
        totalSales += Number(order.total || 0);

        const status = normalizeStatus(order.status);

        if (status === "pending") pending++;
        if (status === "delivered") delivered++;
      });

      setStats({
        users: usersRes.data.length,
        orders: ordersRes.data.length,
        sales: totalSales,
        pending,
        delivered,
      });

      setLoading(false);
    } catch (err) {
      console.log("Dashboard error:", err?.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex bg-white min-h-screen">
      <AdminSidebar />

      <div className="flex-1 p-10">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Dashboard</h1>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            <Card title="Users" value={stats.users} />
            <Card title="Orders" value={stats.orders} />
            <Card
              title="Revenue"
              value={formatMoney(stats.sales)}
              color="text-green-600"
            />
            <Card
              title="Pending"
              value={stats.pending}
              color="text-orange-500"
            />
            <Card
              title="Delivered"
              value={stats.delivered}
              color="text-blue-500"
            />
          </div>
        )}
      </div>
    </div>
  );
}

// 🔥 format เงินให้สวย
function formatMoney(num) {
  return new Intl.NumberFormat("th-TH").format(num) + " บาท";
}

// 🔥 Card สวย + กันล้น + กล่องขาว
function Card({ title, value, color }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center shadow-sm hover:shadow-md transition w-full h-[120px]">
      <p className="text-gray-500 text-sm mb-2 text-center">{title}</p>

      <p
        className={`text-xl sm:text-2xl font-bold text-center truncate w-full ${color || "text-gray-800"}`}
      >
        {value}
      </p>
    </div>
  );
}
