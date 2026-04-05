"use client";

import { useState } from "react";
import { z } from "zod";

const resetPasswordSchema = z
  .object({
    newPassword: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
    "Password must include uppercase, lowercase, number, and special character"),
    confirmPassword: z.string(),
  })

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [favoriteSong, setFavoriteSong] = useState("");
  const [email, setEmail] = useState("");

  const handleReset = async (e: any) => {
    e.preventDefault();
    setMessage("");

    const parsed = resetPasswordSchema.safeParse({ newPassword, confirmPassword });
    if (!parsed.success) {
      setMessage(parsed.error.message);
      return;
    }

    if (newPassword !== confirmPassword) {
        setMessage("Passwords do not match");
        return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/users/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessage("Password reset successfully!");
      setNewPassword("");
      setConfirmPassword("");
      setEmail("");
      setFavoriteSong("");
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-50 p-6">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">
          Account Recovery
        </h1>
        <form onSubmit={handleReset} className="space-y-4">
          <input
            type="text"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
          <input
            type="text"
            placeholder="Title of favorite song"
            value={favoriteSong}
            onChange={(e) => setFavoriteSong(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
          {message && <p className="text-red-500 text-sm">{message}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-800 text-white px-4 py-2 rounded cursor-pointer"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}