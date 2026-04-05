"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Comment = {
  id: string;
  content: string;
  issue_id: string;
  created_by: string;
  created_at: string;
};

export default function CommentsSection() {
  const params = useParams();
  const issueId = params?.id;

  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (!issueId) return;

    const fetchComments = async () => {
      try {
        const res = await fetch(`/api/issues/${issueId}/comments`, {
          credentials: "include",
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        setComments(data);
      } catch (err: any) {
        console.log(err.message);
      }
    };

    fetchComments();
  }, [issueId]);

  const handleCreateComment = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/issues/${issueId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ content }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setComments((prev) => [data, ...prev]);
      setContent("");
    } catch (err: any) {
      console.log(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async () => {
    if (!selectedComment) return;
    setLoading(true);

    try {
      const res = await fetch(
        `/api/comments/${selectedComment.id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setComments((prev) =>
        prev.filter((c) => c.id !== selectedComment.id)
      );

      setShowDeleteModal(false);
      setSelectedComment(null);
    } catch (err: any) {
      console.log(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateComment = async (e: any) => {
    e.preventDefault();
    if (!selectedComment) return;

    setLoading(true);

    try {
      const res = await fetch(
        `/api/comments/${selectedComment.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ content }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setComments((prev) =>
        prev.map((c) => (c.id === selectedComment.id ? data : c))
      );

      setShowEditModal(false);
      setSelectedComment(null);
      setContent("");
    } catch (err: any) {
      console.log(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="m-10">
      <h2 className="text-xl font-bold mb-4">Comments</h2>

      {/* Add Comment */}
      <form onSubmit={handleCreateComment} className="mb-6 flex gap-2">
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 border rounded p-2"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {loading ? "Posting..." : "Post"}
        </button>
      </form>

      {/* Comment List */}
      {comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="border p-3 rounded-lg shadow-sm"
            >
              <p className="text-gray-800">{comment.content}</p>

              <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
                <span>{comment.created_by}</span>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setSelectedComment(comment);
                      setContent(comment.content);
                      setShowEditModal(true);
                    }}
                    className="text-yellow-600"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => {
                      setSelectedComment(comment);
                      setShowDeleteModal(true);
                    }}
                    className="text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No comments yet</p>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <h2 className="font-bold text-lg mb-4">Edit Comment</h2>

            <form onSubmit={handleUpdateComment} className="space-y-4">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full border p-2 rounded"
                required
              />

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
                  className="bg-yellow-600 text-white px-4 py-2 rounded"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-xl w-full max-w-sm">
            <h2 className="text-red-600 font-bold mb-4">
              Delete Comment
            </h2>

            <p className="mb-4">Are you sure?</p>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="border px-4 py-2 rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleDeleteComment}
                className="bg-red-600 text-white px-4 py-2 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}