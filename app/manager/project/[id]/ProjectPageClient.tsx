"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import { useParams } from "next/navigation";

type Issue = {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  assigned_to: string;
};

export default function ProjectPageClient() {
  const params = useParams();
  const projectId = params?.id;

  const [issues, setIssues] = useState<Issue[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [developers, setDevelopers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  useEffect(() => {
    if (!projectId) return;

    const fetchIssues = async () => {
        try {
        const res = await fetch(`/api/projects/${projectId}/issues`, {
            cache: "no-store",
            credentials: "include",
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || "Failed to fetch issues");
        }

        setIssues(data);
        } catch (err: any) {
        console.log("Fetch issues error:", err.message);
        }
    };

    fetchIssues();
    }, [projectId]);

    useEffect(() => {
        const fetchDevelopers = async () => {
        try {
            const res = await fetch("/api/users");
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setDevelopers(data);
        } catch (err: any) {
            console.log(err.message);
        }
        };

        fetchDevelopers();
    }, []);

    const handleCreateIssue = async (e: any) => {
        e.preventDefault();
        if (!projectId) return;

        setLoading(true);

        try {
        const res = await fetch(`/api/projects/${projectId}/issues`, {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
            title,
            description,
            priority,
            assigned_to: assignedTo,
            }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        setIssues((prev) => [data, ...prev]);

        setTitle("");
        setDescription("");
        setPriority("");
        setAssignedTo("");
        setShowModal(false);
        } catch (err: any) {
        console.log(err.message);
        } finally {
        setLoading(false);
        }
    };

    const handleDeleteIssue = async () => {
        if (!selectedIssue || !projectId) return;

        setLoading(true);

        try {
            const res = await fetch(
            `/api/projects/${projectId}/issues/${selectedIssue.id}`,
            {
                method: "DELETE",
                credentials: "include",
            }
            );

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setIssues((prev) =>
            prev.filter((i) => i.id !== selectedIssue.id)
            );

            setShowDeleteModal(false);
            setSelectedIssue(null);
        } catch (err: any) {
            console.log(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateIssue = async (e: any) => {
        e.preventDefault();
        if (!selectedIssue || !projectId) return;

        setLoading(true);

        try {
            const res = await fetch(
            `/api/projects/${projectId}/issues/${selectedIssue.id}`,
            {
                method: "PUT",
                headers: {
                "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                title,
                description,
                priority,
                assigned_to: assignedTo,
                }),
            }
            );

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setIssues((prev) =>
            prev.map((i) => (i.id === selectedIssue.id ? data : i))
            );

            setShowEditModal(false);
            setSelectedIssue(null);
        } catch (err: any) {
            console.log(err.message);
        } finally {
            setLoading(false);
        }
    };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Project Issues</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          <Plus className="w-4 h-4" />
          New Issue
        </button>
      </div>

      {issues.length > 0 ? (
        <div className="grid gap-4">
            {issues.map((issue) => (
            <div key={issue.id} className="border p-4 rounded-xl shadow-sm">
                <h2 className="font-semibold text-lg">{issue.title}</h2>
                <p className="text-gray-500">{issue.description}</p>

                <span className="text-sm mt-2 inline-block">
                Status: {issue.status}
                </span>
                <span className="text-sm mt-1 inline-block ml-2">
                Priority: {issue.priority}
                </span>

                <div className="flex justify-end gap-3 mt-4">
                <button
                    onClick={() => {
                    setSelectedIssue(issue);
                    setTitle(issue.title);
                    setDescription(issue.description);
                    setPriority(issue.priority);
                    setAssignedTo("");
                    setShowEditModal(true);
                    }}
                    className="text-yellow-600 hover:text-yellow-800 text-sm font-medium"
                >
                    <Pencil />
                </button>

                <button
                    onClick={() => {
                    setSelectedIssue(issue);
                    setShowDeleteModal(true);
                    }}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                    <Trash2 />
                </button>
                </div>
            </div>
            ))}
        </div>
        ) : (
        <p className="text-gray-500 text-center mt-10">
            No issues yet
        </p>
        )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create Issue</h2>
            <form onSubmit={handleCreateIssue} className="space-y-4">
              <input
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border p-2 rounded"
                required
              />
              <textarea
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border p-2 rounded"
                required
              />

              <div className="flex flex-col gap-2">
                <label className="font-semibold">Select Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="border rounded p-2 bg-white"
                  required
                >
                  <option value="">Choose priority level</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 font-semibold">Assign to</label>
                <select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="w-full border rounded p-2 bg-white"
                  required
                >
                  <option value="">Select developer</option>
                  {developers.map((dev) => (
                    <option key={dev.email} value={dev.email}>
                      {dev.firstname} {dev.lastname}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="border px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-green-600 text-white px-4 py-2 rounded"
                >
                  {loading ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-2xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit Issue</h2>

            <form onSubmit={handleUpdateIssue} className="space-y-4">
                <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border p-2 rounded"
                required
                />

                <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border p-2 rounded"
                required
                />

                <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full border p-2 rounded"
                required
                >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                </select>

                <div>
                <label className="block mb-1 font-semibold">Assign to</label>
                <select
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    className="w-full border rounded p-2 bg-white"
                    required
                >
                    <option value="">Select developer</option>
                    {developers.map((dev) => (
                    <option key={dev.email} value={dev.email}>
                        {dev.firstname} {dev.lastname}
                    </option>
                    ))}
                </select>
                </div>

                <div className="flex justify-end gap-2">
                <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="border px-4 py-2 rounded"
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    disabled={loading}
                    className="bg-yellow-600 text-white px-4 py-2 rounded"
                >
                    {loading ? "Updating..." : "Update"}
                </button>
                </div>
            </form>
            </div>
        </div>
        )}

        {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-2xl w-full max-w-sm">
            <h2 className="text-xl font-bold text-red-600 mb-4">
                Confirm Delete
            </h2>

            <p className="mb-6">
                Are you sure you want to delete this issue?
            </p>

            <div className="flex justify-end gap-2">
                <button
                onClick={() => setShowDeleteModal(false)}
                className="border px-4 py-2 rounded"
                >
                Cancel
                </button>

                <button
                onClick={handleDeleteIssue}
                disabled={loading}
                className="bg-red-600 text-white px-4 py-2 rounded"
                >
                {loading ? "Deleting..." : "Delete"}
                </button>
            </div>
            </div>
        </div>
        )}
    </div>
  );
}