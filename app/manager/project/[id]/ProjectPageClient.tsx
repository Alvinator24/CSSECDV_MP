"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

type Issue = {
  id: number;
  title: string;
  description: string;
  status: string;
};

export default function ProjectPageClient({ projectId }: { projectId: string }) {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const res = await fetch(`/api/projects/${projectId}/issues`, { cache: "no-store" });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error);

        setIssues(data);
      } catch (err: any) {
        console.log(err.message);
      }
    };

    fetchIssues();
  }, [projectId]);

  const handleCreateIssue = async (e: any) => {
    e.preventDefault();
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
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setIssues((prev) => [data, ...prev]);

      setTitle("");
      setDescription("");
      setShowModal(false);
    } catch (err: any) {
      console.log(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-6">
      {/* Header */}
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

      {/* Issues */}
      {issues.length > 0 ? (
        <div className="grid gap-4">
          {issues.map((issue) => (
            <div
              key={issue.id}
              className="border p-4 rounded-xl shadow-sm"
            >
              <h2 className="font-semibold text-lg">{issue.title}</h2>
              <p className="text-gray-500">{issue.description}</p>

              <span className="text-sm mt-2 inline-block">
                Status: {issue.status}
              </span>
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
    </div>
  );
}