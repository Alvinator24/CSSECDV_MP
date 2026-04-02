"use client";

import { Users, FileText, Settings } from "lucide-react";

export default function AdminPanel() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-3xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Admin Panel</h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <a
            href="/admin/users"
            className="dark:hover:bg-gray-500 group border rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3 shadow-sm hover:shadow-md transition active:scale-95"
          >
            <Users className="w-8 h-8 opacity-80 group-hover:scale-110 transition" />
            <h2 className="font-semibold text-lg">Users</h2>
            <p className="text-xs opacity-60">Create, update roles, delete accounts</p>
          </a>

          <a
            href="/admin/logs"
            className="group border rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3 shadow-sm hover:shadow-md transition active:scale-95"
          >
            <FileText className="w-8 h-8 opacity-80 group-hover:scale-110 transition" />
            <h2 className="font-semibold text-lg">Logs</h2>
            <p className="text-xs opacity-60">Track system activity and audit history</p>
          </a>

          <a
            href="/admin/settings"
            className="group border rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3 shadow-sm hover:shadow-md transition active:scale-95"
          >
            <Settings className="w-8 h-8 opacity-80 group-hover:scale-110 transition" />
            <h2 className="font-semibold text-lg">Settings</h2>
            <p className="text-xs opacity-60">Manage projects and global config</p>
          </a>
        </div>
      </div>
    </div>
  );
}