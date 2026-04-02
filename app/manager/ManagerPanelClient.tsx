"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

type Project = {
  id: number;
  title: string;
  description: string;
  status: string;
};

export default function ManagerPanel() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/";
  };

  useEffect(() => {
    const fetchProjects = async () => {
      // Example projects, replace with API fetch if needed
      const assignedProjects: Project[] = [
        { id: 1, title: "Website Redesign", description: "Update homepage UI", status: "in_progress" },
        { id: 2, title: "Marketing Campaign", description: "Launch social ads", status: "open" },
      ];
      setProjects(assignedProjects);
    };

    fetchProjects();
  }, []);

  const handleCreateProject = (e: any) => {
    e.preventDefault();
    setLoading(true);

    const newProject: Project = {
      id: Date.now(),
      title,
      description,
      status: "open",
    };

    setProjects((prev) => [...prev, newProject]);
    setTitle("");
    setDescription("");
    setShowModal(false);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manager Dashboard</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
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

      {/* Project Cards */}
      {projects.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="border rounded-2xl p-6 shadow-sm hover:shadow-md transition"
            >
              <h2 className="text-xl font-semibold mb-2">{project.title}</h2>
              <p className="text-gray-500 mb-4">{project.description}</p>
              <span
                className={`px-3 py-1 rounded-full text-white text-sm ${
                  project.status === "in_progress"
                    ? "bg-yellow-500"
                    : project.status === "open"
                    ? "bg-blue-500"
                    : "bg-green-500"
                }`}
              >
                {project.status}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center mt-10 text-lg">
          No projects found
        </p>
      )}

      {/* Modal for creating a project */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Create New Project</h2>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className="w-full border rounded-lg px-3 py-2"
                />
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