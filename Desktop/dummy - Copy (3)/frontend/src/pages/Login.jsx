import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API = "http://127.0.0.1:8000";

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(`${API}/login`, {
        username,
        password,
      });

      if (res.data.message === "Login successful") {
        navigate(`/dashboard/${res.data.username}`);
      } else {
        setError("Invalid login details");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Cannot connect to backend");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* LEFT GREEN PANEL */}
      <div className="w-1/2 bg-green-700 text-white p-12 flex flex-col justify-center">
        <h1 className="text-4xl font-bold mb-4">🌾 KrishiMitra</h1>
        <p className="text-lg mb-6">Welcome, Farmer Friend!</p>

        <ul className="space-y-4 text-white/90 text-base">
          <li>📄 <strong>AI Document Interpreter</strong> – Better crop decisions</li>
          <li>🌱 <strong>Profit-Driven Crop Advisor</strong> – Smart recommendations</li>
          <li>⏰ <strong>Automatic Alerts</strong> — Never miss deadlines</li>
          <li>🔒 <strong>Secure & Private</strong> — Your data is encrypted</li>
        </ul>
      </div>

      {/* RIGHT FORM PANEL */}
      <div className="w-1/2 p-16 flex flex-col justify-center">
        <h2 className="text-3xl font-bold text-green-700 mb-6">
          Welcome to KrishiMitra
        </h2>

        <form onSubmit={handleLogin} className="space-y-4 max-w-md">
          {/* Username */}
          <input
            type="text"
            placeholder="Full Name or Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 border rounded-lg"
          />

          {/* Password */}
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border rounded-lg"
          />

          {/* Button */}
          <button
            type="submit"
            className="w-full bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 transition"
          >
            {loading ? "Checking..." : "🔒 Secure Login →"}
          </button>

          {/* Error */}
          {error && <p className="text-red-600">{error}</p>}
        </form>

        {/* Register link */}
        <p className="mt-6">
          New to KrishiMitra?
          <a href="/register" className="text-green-700 font-semibold ml-2">
            Create an Account
          </a>
        </p>
      </div>
    </div>
  );
}
