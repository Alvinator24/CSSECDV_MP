"use client";

import Link from "next/link";
import { Users, FileText, Laptop } from "lucide-react";

export default function ManagerHome() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-6">
      <h1 className="text-3xl font-bold">Manager Panel</h1>
      <div className="flex gap-6">
        <Link
          href="/manager/accounts"
          className="flex flex-col items-center p-6 bg-white shadow rounded hover:shadow-lg transition"
        >
          <Users size={40} />
          <span className="mt-2 font-semibold">Accounts</span>
        </Link>
        <Link
          href="/manager/projects"
          className="flex flex-col items-center p-6 bg-white shadow rounded hover:shadow-lg transition"
        >
          <Laptop size={40} />
          <span className="mt-2 font-semibold">Projects</span>
        </Link>
        <Link
          href="/manager/issues"
          className="flex flex-col items-center p-6 bg-white shadow rounded hover:shadow-lg transition"
        >
          <FileText size={40} />
          <span className="mt-2 font-semibold">Issues</span>
        </Link>
      </div>
    </div>
  );
}