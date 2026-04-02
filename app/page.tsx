"use client";

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data: { message?: string; error?: string } = await res.json();

      if (res.ok) {
        setMessage("Login successful!");
      } else {
        setMessage(data.error || "Login failed");
      }
    } catch (err) {
      setMessage("Something went wrong");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 p-6 border rounded-xl w-80"
      >
        <h1 className="text-xl font-bold text-center">BugTrackr</h1>

        <input
          type="email"
          placeholder="Email"
          className="border p-2 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="border p-2 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className="bg-green-800 text-white p-2 rounded cursor-pointer">
          Login
        </button>

        {message && (
          <p className="text-sm text-center">{message}</p>
        )}
      </form>
    </div>
  );
}