import { useEffect, useState } from "react";
import AdminSidebar from "../components/AdminSidebar";
import API from "../services/api";
import socket from "../services/socket";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [selectedSlip, setSelectedSlip] = useState(null);

  const BASE_URL = "https://food-delivery-gamma-orcin.vercel.app";

  // =========================
  // 🔥 SAFE ID
  // =========================
  const getId = (o) => o?._id || o?.id || "";

  const shortId = (o) => {
    const id = getId(o);
    return id ? id.toString().slice(-6) : "------";
  };

  // =========================
  // ✅ FETCH
  // =========================
  const fetchOrders = async () => {
    try {
      const res = await API.get("/orders");
      setOrders(res.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  // =========================
  // ✅ REALTIME
  // =========================
  useEffect(() => {
    fetchOrders();

    socket.on("order:new", (order) => {
      setOrders((prev) => [order, ...prev]);
    });

    socket.on("order:update", (updated) => {
      setOrders((prev) =>
        prev.map((o) => (getId(o) === getId(updated) ? updated : o)),
      );
    });

    socket.on("order:delete", (id) => {
      setOrders((prev) => prev.filter((o) => getId(o) !== id));
    });

    return () => {
      socket.off("order:new");
      socket.off("order:update");
      socket.off("order:delete");
    };
  }, []);

  // =========================
  // ✅ UPDATE STATUS (FIX BUG)
  // =========================
  const updateStatus = async (id, newStatus) => {
    try {
      await API.put(`/orders/${id}`, { status: newStatus });

      // optional realtime fallback
      setOrders((prev) =>
        prev.map((o) => (getId(o) === id ? { ...o, status: newStatus } : o)),
      );
    } catch (err) {
      console.log(err);
    }
  };

  // =========================
  // ✅ SAFE ITEMS
  // =========================
  const getItems = (order) => {
    return Array.isArray(order?.foods) ? order.foods : [];
  };

  // =========================
  // ✅ STATUS COLOR
  // =========================
  const getStatusColor = (status) => {
    if (status === "Order Received") return "bg-gray-300";
    if (status === "Preparing") return "bg-yellow-400";
    if (status === "On the way") return "bg-blue-400";
    if (status === "Delivered") return "bg-green-500";
    return "bg-gray-300";
  };

  // =========================
  // ✅ ETA SAFE
  // =========================
  const getETA = (order) => {
    if (!order?.eta) return "-";
    const min = Math.floor((order.eta - Date.now()) / 60000);
    return min > 0 ? `${min} นาที` : "ใกล้ถึง";
  };

  return (
    <div className="flex">
      <AdminSidebar />

      <div className="flex-1 p-10">
        <h1 className="text-2xl font-bold mb-6">Orders 🧑‍🍳</h1>

        <table className="w-full border text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2">OrderID</th>
              <th className="p-2">User</th>
              <th className="p-2">Items</th>
              <th className="p-2">Total</th>
              <th className="p-2">ETA</th>
              <th className="p-2">Status</th>
              <th className="p-2">Slip</th>
            </tr>
          </thead>

          <tbody>
            {(orders || []).map((order) => {
              const items = getItems(order);
              const id = getId(order);

              return (
                <tr key={id} className="border-t align-top">
                  {/* ID */}
                  <td className="p-2 font-semibold">#{shortId(order)}</td>

                  {/* USER */}
                  <td className="p-2">{order?.user?.name || "Unknown"}</td>

                  {/* ITEMS */}
                  <td className="p-2">
                    {items.length === 0 && (
                      <span className="text-gray-400">No items</span>
                    )}

                    {items.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 mb-1">
                        <img
                          src={
                            item?.food?.image
                              ? `${BASE_URL}/uploads/${item.food.image}`
                              : "https://placehold.co/40"
                          }
                          className="w-8 h-8 object-cover rounded"
                        />

                        <span>
                          {item?.food?.name || "-"} x {item?.qty || 0}
                        </span>
                      </div>
                    ))}
                  </td>

                  {/* TOTAL */}
                  <td className="p-2 font-semibold text-pink-500">
                    {order?.totalPrice || 0} บาท
                  </td>

                  {/* ETA */}
                  <td className="p-2 text-gray-500">{getETA(order)}</td>

                  {/* STATUS */}
                  <td className="p-2">
                    <div className="flex flex-col gap-2">
                      <span
                        className={`text-white px-2 py-1 rounded text-xs text-center ${getStatusColor(
                          order?.status,
                        )}`}
                      >
                        {order?.status || "-"}
                      </span>

                      <div className="flex gap-1 flex-wrap">
                        <button
                          onClick={() => updateStatus(id, "Preparing")}
                          className="bg-yellow-400 px-2 py-1 text-xs rounded"
                        >
                          Preparing
                        </button>

                        <button
                          onClick={() => updateStatus(id, "On the way")}
                          className="bg-blue-400 px-2 py-1 text-xs rounded"
                        >
                          Deliver
                        </button>

                        <button
                          onClick={() => updateStatus(id, "Delivered")}
                          className="bg-green-500 text-white px-2 py-1 text-xs rounded"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  </td>

                  {/* SLIP */}
                  <td className="p-2">
                    {order?.slip ? (
                      <button
                        onClick={() =>
                          setSelectedSlip(`${BASE_URL}/uploads/${order.slip}`)
                        }
                        className="bg-blue-500 text-white px-3 py-1 rounded"
                      >
                        View
                      </button>
                    ) : (
                      <span className="text-gray-400">No Slip</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* POPUP */}
        {selectedSlip && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg">
              <img src={selectedSlip} className="max-w-md" />

              <button
                onClick={() => setSelectedSlip(null)}
                className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
