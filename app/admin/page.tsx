"use client";

import Link from "next/link";
import { Users, FileText, Settings } from "lucide-react";

export default function ManagerHome() {
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
          href="/admin/settings"
          className="flex flex-col items-center p-6 bg-white shadow rounded hover:shadow-lg transition"
        >
          <Settings size={40} />
          <span className="mt-2 font-semibold">Settings</span>
        </Link>
      </div>
    </div>
  );
}