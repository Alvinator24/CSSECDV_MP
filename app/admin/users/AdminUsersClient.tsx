"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";

type User = {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  role: string;
};

type CreateUserInput = {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  role: string;
};

export default function AdminUsersClient() {
  const [users, setUsers] = useState<User[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [firstname, setFirstName] = useState("");
  const [lastname, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/users", { cache: "no-store" });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to fetch users");
        }

        // console.log(data)

        setUsers(data);
      } catch (err: any) {
        console.log(err.message);
      }
    };

    fetchUsers();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/logout", {
      method: "POST",
    });

    window.location.href = "/";
  };

  const handleCreateUser = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const newUser: CreateUserInput = {
      firstname,
      lastname,
      email,
      password,
      role,
    };

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create user");
      }

      setUsers((prev) => [...prev, data]);
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setRole("");
      setShowModal(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Users</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            <Plus className="w-4 h-4" />
            New User
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Users Grid */}
      {users.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <div
              key={user.id ?? `${user.email}-${Date.now()}`}
              className="border rounded-2xl p-6 shadow-sm hover:shadow-md transition"
            >
              <h2 className="text-xl font-semibold mb-2">
                {user.firstname} {user.lastname}
              </h2>
              <p className="text-gray-500">{user.email}</p>
              <p className="text-sm mt-2 capitalize">{user.role}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center mt-10 text-lg">
          No users found
        </p>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Create New User</h2>

            {error && (
              <p className="text-red-500 text-sm mb-2">{error}</p>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">First name</label>
                <input
                  type="text"
                  value={firstname}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">Last name</label>
                <input
                  type="text"
                  value={lastname}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-semibold">Select Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="border rounded p-2 bg-white"
                  required
                >
                  <option value="">Choose a role</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="developer">Developer</option>
                </select>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}