import React from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-green-600 text-white flex flex-col">
      {/* NAVBAR */}
      <div className="flex justify-between items-center px-10 py-6">
        <h1 className="text-3xl font-bold">🌱 Greengen</h1>

        <button
          onClick={() => navigate("/login")}
          className="bg-white text-green-600 px-5 py-2 rounded-lg font-semibold shadow"
        >
          Login
        </button>
      </div>

      {/* HERO */}
      <div className="flex flex-col items-center justify-center flex-grow text-center px-6">
        <h2 className="text-5xl font-extrabold mb-4">KrishiMitra</h2>
        <p className="text-xl max-w-2xl mb-8">
          Revolutionize your farming with cutting-edge AI technology.  
          Get document analysis, crop recommendations, and deadline tracking —  
          all in one platform.
        </p>

        <button
          onClick={() => navigate("/login")}
          className="bg-white text-green-700 px-8 py-3 rounded-lg text-lg font-semibold shadow-lg"
        >
          Start Predicting →
        </button>
      </div>
    </div>
  );
}
