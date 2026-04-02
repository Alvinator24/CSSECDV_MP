"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";

type User = {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  password: string,
  role: string
};

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [firstname, setFirstName] = useState("");
  const [lastname, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      const dummyUsers: User[] = [
        { id: 1, firstname: "Alice", lastname: "Smith", email: "alice@example.com", password: "hello", role: "developer" },
        { id: 2, firstname: "Bob", lastname: "Johnson", email: "bob@example.com", password: "hello", role: "manager" },
      ];
      setUsers(dummyUsers);
    };
    fetchUsers();
  }, []);

  const handleCreateUser = (e: any) => {
    e.preventDefault();
    const newUser: User = {
      id: users.length + 1,
      firstname,
      lastname,
      email,
      password,
      role
    };
    setUsers([...users, newUser]);
    setFirstName("");
    setLastName("");
    setEmail("");
    setPassword("");
    setRole("");
    setShowModal(false);
  };

  return (
    <div className="min-h-screen p-6 bg-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Users</h1>
        <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
            <Plus className="w-4 h-4" />
            New User
        </button>
      </div>

      {/* Users Grid */}
      {users.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <div
              key={user.id}
              className="border rounded-2xl p-6 shadow-sm hover:shadow-md transition"
            >
              <h2 className="text-xl font-semibold mb-2">{user.firstname} {user.lastname}</h2>
              <p className="text-gray-500">{user.email}</p>
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
              <div className="flex flex-col gap-2">
                <label className="font-semibold">Select Role</label>
                <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="border rounded p-2 bg-white"
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
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}