import { useEffect, useState } from "react";
import AdminSidebar from "../components/AdminSidebar";
import API from "../services/api";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    API.get("/users").then((res) => {
      setUsers(res.data);
    });
  }, []);

  const deleteUser = async (id) => {
    try {
      await API.delete(`/users/${id}`);
      setUsers(users.filter((u) => u._id !== id));
    } catch (err) {
      console.error(err);
      alert("ลบไม่สำเร็จ");
    }
  };

  return (
    <div className="flex">
      <AdminSidebar />

      <div className="flex-1 p-10">
        <h1 className="text-2xl font-bold mb-6">Users</h1>

        <table className="w-full border">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2">Name</th>
              <th className="p-2">Email</th>
              <th className="p-2">Role</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="border-t">
                <td className="p-2">{user.name}</td>

                <td className="p-2">{user.email}</td>

                <td className="p-2">{user.role || "User"}</td>

                <td className="p-2">
                  <button
                    className="bg-red-500 text-white px-3 py-1 rounded"
                    onClick={() => deleteUser(user._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
