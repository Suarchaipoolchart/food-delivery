import { useEffect, useState, useRef } from "react";
import Navbar from "../components/Navbar";
import API from "../services/api";
import { io } from "socket.io-client";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState("ongoing");
  const socketRef = useRef(null);

  const DELIVERY_TIME = 30 * 1000;

  // =========================
  // 🔥 SAFE ID (กัน _id / id)
  // =========================
  const getId = (o) => o?._id || o?.id || "";

  // =========================
  // 🔥 SAFE TIME
  // =========================
  const parseTime = (time) => {
    if (!time) return Date.now();
    if (typeof time === "number") return time;
    const parsed = new Date(time).getTime();
    return isNaN(parsed) ? Date.now() : parsed;
  };

  // =========================
  // 🔥 MERGE (กัน undefined)
  // =========================
  const mergeOrders = (oldOrders, newOrders) => {
    return (newOrders || []).map((newOrder) => {
      const id = getId(newOrder);
      const old = oldOrders.find((o) => getId(o) === id);

      const createdAt = parseTime(newOrder.createdAt || old?.createdAt);
      const eta = createdAt + DELIVERY_TIME;

      return {
        ...newOrder,
        _id: id,
        createdAt,
        eta,
        riderLocation: old?.riderLocation || newOrder.riderLocation,
      };
    });
  };

  // =========================
  // ✅ FETCH
  // =========================
  const fetchOrders = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const userId = user?._id;
      if (!userId) return;

      const res = await API.get(`/orders/user/${userId}`);
      setOrders((prev) => mergeOrders(prev, res.data || []));
    } catch (err) {
      console.log("FETCH ERROR", err);
    }
  };

  // =========================
  // ✅ SOCKET
  // =========================
  useEffect(() => {
    fetchOrders();

    if (!socketRef.current) {
      socketRef.current = io(import.meta.env.VITE_API_URL);
    }

    const socket = socketRef.current;

    socket.on("order:new", (newOrder) => {
      setOrders((prev) => {
        const id = getId(newOrder);
        if (prev.find((o) => getId(o) === id)) return prev;

        const createdAt = parseTime(newOrder.createdAt);

        return [
          {
            ...newOrder,
            _id: id,
            createdAt,
            eta: createdAt + DELIVERY_TIME,
          },
          ...prev,
        ];
      });
    });

    socket.on("order:update", (updated) => {
      setOrders((prev) =>
        prev.map((o) => {
          const id = getId(o);
          if (id !== getId(updated)) return o;

          return {
            ...o,
            ...updated,
            _id: id,
            createdAt: o.createdAt,
            eta: o.createdAt + DELIVERY_TIME,
          };
        }),
      );
    });

    return () => {
      socket.off("order:new");
      socket.off("order:update");
    };
  }, []);

  // =========================
  // 🔥 SIMULATION
  // =========================
  useEffect(() => {
    const interval = setInterval(() => {
      setOrders((prev) =>
        prev.map((order) => {
          if (!order.eta || isNaN(order.eta)) return order;

          const now = Date.now();
          const remain = order.eta - now;

          let status = order.status;

          if (remain <= 0) status = "Delivered";
          else if (remain <= 5 * 60 * 1000) status = "On the way";
          else if (remain <= 10 * 60 * 1000) status = "Preparing";
          else status = "Order Received";

          let riderLocation = order.riderLocation;

          if (status === "On the way") {
            riderLocation = {
              lat: (order.riderLocation?.lat || 13.75) + 0.0003,
              lng: (order.riderLocation?.lng || 100.5) + 0.0003,
            };
          }

          return {
            ...order,
            status,
            riderLocation,
          };
        }),
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // =========================
  // 🔥 FILTER SAFE
  // =========================
  const ongoing = (orders || []).filter((o) => o?.status !== "Delivered");
  const completed = (orders || []).filter((o) => o?.status === "Delivered");

  // =========================
  // 🔥 PROGRESS
  // =========================
  const getProgress = (order) => {
    if (!order?.createdAt) return 0;
    const elapsed = Date.now() - order.createdAt;
    return Math.min(100, Math.max(0, (elapsed / DELIVERY_TIME) * 100));
  };

  // =========================
  // 🔥 TEXT SAFE
  // =========================
  const getStatusText = (status) => {
    switch (status) {
      case "Order Received":
        return "🧾 ร้านรับออเดอร์แล้ว";
      case "Preparing":
        return "🍳 กำลังทำอาหาร";
      case "On the way":
        return "🚚 ไรเดอร์กำลังไปส่ง";
      case "Delivered":
        return "✅ ส่งสำเร็จแล้ว";
      default:
        return status || "-";
    }
  };

  const getETA = (order) => {
    if (!order?.eta) return "...";
    const diff = order.eta - Date.now();
    if (diff <= 0) return "ถึงแล้ว 🎉";

    const min = Math.floor(diff / 60000);
    const sec = Math.floor((diff % 60000) / 1000);
    return `${min}m ${sec}s`;
  };

  // =========================
  // 🔥 ITEMS SAFE (กัน foods undefined)
  // =========================
  const getItems = (order) => {
    if (Array.isArray(order?.items)) return order.items;

    if (Array.isArray(order?.foods)) {
      return order.foods.map((f) => ({
        name: f?.food?.name || "Unknown",
        price: f?.food?.price || 0,
        image: f?.food?.image
          ? `${import.meta.env.VITE_API_URL}/uploads/${f.food.image}`
          : "",
        qty: f?.qty || 1,
      }));
    }

    return [];
  };

  // =========================
  // 🔥 RENDER SAFE (แก้ slice พัง)
  // =========================
  const renderOrder = (order) => {
    const items = getItems(order);
    const id = getId(order);

    return (
      <div key={id} className="bg-white rounded-xl shadow-md p-5 mb-6">
        <div className="flex justify-between">
          <p className="font-bold">
            Order #{id ? id.toString().slice(-6) : "------"}
          </p>
          <p className="text-pink-500 text-sm">{order?.status}</p>
        </div>

        <p className="text-sm text-gray-600 mt-1">
          {getStatusText(order?.status)}
        </p>

        {order?.status !== "Delivered" && (
          <p className="text-sm text-pink-500">⏱ {getETA(order)}</p>
        )}

        <div className="mt-4 space-y-3">
          {(items || []).map((item, i) => (
            <div key={i} className="flex gap-3 items-center">
              <img
                src={item?.image || "/no-image.png"}
                onError={(e) => (e.currentTarget.src = "/no-image.png")}
                className="w-14 h-14 rounded-lg"
              />
              <div className="flex-1">
                <p>{item?.name}</p>
                <p className="text-sm text-gray-500">
                  {item?.price} x {item?.qty}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex justify-between">
          <p>Total</p>
          <p className="text-pink-500 font-bold">
            {order?.total || order?.totalPrice || 0} บาท
          </p>
        </div>

        {order?.riderLocation && order?.status !== "Delivered" && (
          <div className="mt-3 bg-gray-100 p-2 rounded text-xs">
            🚗 Rider: {order.riderLocation?.lat?.toFixed?.(3) || "-"},{" "}
            {order.riderLocation?.lng?.toFixed?.(3) || "-"}
          </div>
        )}

        <div className="mt-4">
          <div className="w-full bg-gray-200 h-2 rounded-full">
            <div
              className="bg-pink-500 h-2 transition-all duration-500"
              style={{ width: `${getProgress(order)}%` }}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Navbar />

      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">My Orders</h1>

        <div className="flex gap-6 mb-6 border-b pb-2">
          <button onClick={() => setTab("ongoing")}>Ongoing</button>
          <button onClick={() => setTab("completed")}>Completed</button>
        </div>

        {tab === "ongoing" && (ongoing || []).map(renderOrder)}
        {tab === "completed" && (completed || []).map(renderOrder)}

        {(orders || []).length === 0 && (
          <p className="text-gray-400">ยังไม่มีออเดอร์</p>
        )}
      </div>
    </>
  );
}
