"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Task = {
  id: number;
  title: string;
  description: string;
  status: string;
};

const handleLogout = async () => {
  await fetch("/api/logout", {
    method: "POST",
  });

  window.location.href = "/";
};

export default function DeveloperPanel() {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const fetchTasks = async () => {
      const assignedTasks: Task[] = [
        // Example tasks
        { id: 1, title: "Fix login bug", description: "Error on login page", status: "in_progress" },
        { id: 2, title: "Update readme", description: "Add setup instructions", status: "open" },
      ];
      setTasks(assignedTasks);
    };

    fetchTasks();
  }, []);

  return (
    <div className="min-h-screen bg-white p-6">
      {/* Header with Profile Button */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Developer Dashboard</h1>
        <div className="flex items-center gap-3">
          <Link
            href="/developer/profile"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            My Profile
          </Link>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Task Cards */}
      {tasks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="border rounded-2xl p-6 shadow-sm hover:shadow-md transition"
            >
              <h2 className="text-xl font-semibold mb-2">Title: {task.title}</h2>
              <p className="text-gray-500 mb-4">Description: {task.description}</p>
              <span
                className={`px-3 py-1 rounded-full text-white text-sm ${
                  task.status === "in_progress"
                    ? "bg-yellow-500"
                    : task.status === "open"
                    ? "bg-blue-500"
                    : "bg-green-500"
                }`}
              >
                Status: {task.status}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center mt-10 text-lg">
          No tasks assigned
        </p>
      )}
    </div>
  );
}