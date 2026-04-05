"use client";

import Link from "next/link";
import { Users, FileText, Contact } from "lucide-react";

export default function ManagerHome() {
  const handleLogout = async () => {
    await fetch("/api/logout", {
      method: "POST",
    });

    window.location.href = "/";
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-6">
      <h1 className="text-3xl font-bold">Admin Panel</h1>
      <div className="flex gap-6">
        <Link
          href="/admin/users"
          className="flex flex-col items-center p-6 bg-white shadow rounded hover:shadow-lg transition"
        >
          <Users size={40} />
          <span className="mt-2 font-semibold">Users</span>
        </Link>
        <Link
          href="/admin/logs"
          className="flex flex-col items-center p-6 bg-white shadow rounded hover:shadow-lg transition"
        >
          <FileText size={40} />
          <span className="mt-2 font-semibold">Logs</span>
        </Link>
        <Link
          href="/profile"
          className="flex flex-col items-center p-6 bg-white shadow rounded hover:shadow-lg transition"
        >
          <Contact size={40} />
          <span className="mt-2 font-semibold">Profile</span>
        </Link>
      </div>
      <div>
         <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            Logout
          </button>
      </div>
    </div>
  );
}