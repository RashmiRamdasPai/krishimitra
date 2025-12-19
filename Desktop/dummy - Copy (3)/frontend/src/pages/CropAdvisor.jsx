// src/pages/CropAdvisor.jsx
import React, { useState } from "react";
import { useParams } from "react-router-dom";

export default function CropAdvisor() {
  const { username } = useParams();

  const [file, setFile] = useState(null);
  const [soilText, setSoilText] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [loading, setLoading] = useState(false);

  // NEW WEATHER STATES
  const [weather, setWeather] = useState(null);
  const [manualLocation, setManualLocation] = useState("");

  // LANGUAGE
  const [language, setLanguage] = useState("english");

  const API = "http://127.0.0.1:8000";

  // -----------------------------------------------------------
  // 🌤 1. Auto Detect Weather Using Browser
  // -----------------------------------------------------------
  const detectWeather = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported!");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        const res = await fetch(`${API}/weather?lat=${lat}&lon=${lon}`);
        const data = await res.json();

        setWeather({
          temp: data.main.temp,
          humidity: data.main.humidity,
          wind: data.wind.speed,
          desc: data.weather[0].description,
          rain: data.rain ? data.rain["1h"] : 0,
        });

        setManualLocation(`${lat}, ${lon}`);
      },
      () => alert("Failed to retrieve location")
    );
  };

  // -----------------------------------------------------------
  // 🌍 2. Manual location search
  // -----------------------------------------------------------
  const searchWeather = async () => {
    if (!manualLocation.trim()) return;

    const q = manualLocation.trim();

    const res = await fetch(`${API}/weather?q=${q}`);
    const data = await res.json();

    setWeather({
      temp: data.main.temp,
      humidity: data.main.humidity,
      wind: data.wind.speed,
      desc: data.weather[0].description,
      rain: data.rain ? data.rain["1h"] : 0,
    });
  };

  // -----------------------------------------------------------
  // 📤 3. Soil Upload
  // -----------------------------------------------------------
  const handleSoilUpload = async () => {
    if (!file) return alert("Upload soil report image!");

    setLoading(true);

    const form = new FormData();
    form.append("file", file);

    const ocrRes = await fetch(`${API}/upload?username=${username}`, {
      method: "POST",
      body: form,
    });

    const ocrData = await ocrRes.json();
    setSoilText(ocrData.extracted_text);
    setLoading(false);
  };

  // -----------------------------------------------------------
  // 🤖 4. Get AI Recommendation
  // -----------------------------------------------------------
  const getRecommendation = async () => {
    if (!soilText.trim()) return alert("No soil report extracted!");
    if (!weather) return alert("Fetch weather first!");

    setLoading(true); // Set loading for recommendation

    const res = await fetch(`${API}/crop-advisor`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        soil_report: soilText,
        language,
        username,
        location: manualLocation || "India",
        weather: weather,
      }),
    });

    const data = await res.json();
    setRecommendation(data.recommendation);
    setLoading(false); // Clear loading
  };

  // -----------------------------------------------------------
  // UI STARTS HERE
  // -----------------------------------------------------------
  return (
    <div className="min-h-screen bg-yellow-50 flex flex-col items-center py-10 px-4">
      <h1 className="text-4xl font-extrabold text-green-800 mb-8 border-b-4 border-yellow-600 pb-2">
        🌱 Crop Advisor AI 🚜
      </h1>

      <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-2xl w-full max-w-4xl border-t-8 border-green-500">

        {/* LANGUAGE */}
        <div className="mb-8 p-4 bg-green-50 rounded-lg border border-green-200">
          <label className="font-bold text-lg text-green-700 mr-4">Select Output Language:</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="px-4 py-2 border-2 border-green-400 rounded-lg text-lg font-semibold shadow-inner focus:ring-green-500 focus:border-green-500 transition duration-150"
          >
            <option value="english">English (Recommended)</option>
            <option value="hindi">हिन्दी</option>
            <option value="kannada">ಕನ್ನಡ</option>
          </select>
        </div>

        {/* WEATHER SECTION */}
        <div className="mb-8 p-6 bg-blue-50 rounded-xl shadow-lg border-l-8 border-blue-400">
          <h2 className="font-bold text-xl text-blue-700 mb-4 flex items-center">
            <span className="text-2xl mr-2">🌤</span> Step 1: Weather Information
          </h2>

          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <input
              type="text"
              placeholder="Enter city / village name (e.g., Sirsi)"
              value={manualLocation}
              onChange={(e) => setManualLocation(e.target.value)}
              className="border-2 border-blue-300 px-4 py-3 rounded-xl w-full text-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-150"
            />
            <button
              onClick={searchWeather}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition duration-150 shadow-md flex-shrink-0"
            >
              Search Location
            </button>
          </div>

          <button
            onClick={detectWeather}
            className="bg-green-600 text-white px-6 py-3 rounded-xl w-full font-bold hover:bg-green-700 transition duration-150 shadow-md mt-2"
          >
            Detect My Current Weather
          </button>

          {weather && (
            <div className="mt-5 p-4 bg-blue-100/70 rounded-lg border border-blue-200 shadow-inner grid grid-cols-2 gap-2 text-lg font-medium text-gray-800">
              <p>📍 Location: <span className="font-bold text-blue-800">{manualLocation}</span></p>
              <p>🌡 Temp: <span className="font-bold">{weather.temp}°C</span></p>
              <p>💧 Humidity: <span className="font-bold">{weather.humidity}%</span></p>
              <p>💨 Wind: <span className="font-bold">{weather.wind} m/s</span></p>
              <p className="col-span-2">🌥 Condition: <span className="font-bold">{weather.desc}</span></p>
            </div>
          )}
        </div>

        {/* SOIL UPLOAD */}
        <div className="mb-8 p-6 bg-yellow-100 rounded-xl shadow-lg border-l-8 border-yellow-500">
            <h2 className="font-bold text-xl text-yellow-800 mb-4 flex items-center">
                <span className="text-2xl mr-2">📄</span> Step 2: Upload Soil Report
            </h2>
            <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files[0])}
                className="mb-4 block w-full text-sm text-gray-500 
                          file:mr-4 file:py-2 file:px-4 
                          file:rounded-full file:border-0
                          file:text-sm file:font-semibold
                          file:bg-yellow-500 file:text-white
                          hover:file:bg-yellow-600 transition duration-150"
            />

            <button
                onClick={handleSoilUpload}
                disabled={!file || loading}
                className={`text-white px-6 py-3 rounded-xl w-full font-bold text-lg transition duration-300 shadow-md 
                            ${!file || loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}
            >
                {loading ? "🌾 Reading Soil Report..." : "Upload & Extract Text"}
            </button>
        </div>


        {/* EXTRACTED SOIL TEXT & RECOMMENDATION BUTTON */}
        {soilText && (
          <div className="mt-6 p-6 bg-gray-50 rounded-xl shadow-lg border-l-8 border-gray-400">
            <h2 className="font-bold text-xl text-gray-800 mb-3 flex items-center">
              <span className="text-2xl mr-2">🔍</span> Extracted Soil Report (Review)
            </h2>
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-inner max-h-56 overflow-y-auto whitespace-pre-wrap text-sm text-gray-700 font-mono">
              {soilText}
            </div>

            <button
              onClick={getRecommendation}
              disabled={!weather || loading}
              className={`mt-6 text-white px-6 py-3 rounded-xl w-full font-bold text-lg transition duration-300 shadow-xl 
                          ${!weather || loading ? "bg-red-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"}`}
            >
              {loading ? "🧠 Generating Crop Advice..." : "Step 3: Get AI Crop Recommendation"}
            </button>
            {!weather && (
                <p className="mt-2 text-sm text-red-500 text-center">
                    *Please fetch weather information (Step 1) before getting a recommendation.
                </p>
            )}
          </div>
        )}

        {/* AI OUTPUT */}
        {recommendation && (
          <div className="mt-8 p-6 bg-green-100 rounded-2xl shadow-2xl border-l-8 border-green-600">
            <h2 className="font-extrabold text-2xl text-green-800 mb-4 flex items-center">
              <span className="text-3xl mr-2">✅</span> Your Best Crop Advice!
            </h2>
            <div className="bg-white p-6 rounded-lg border-2 border-green-400 shadow-inner max-h-96 overflow-y-auto whitespace-pre-wrap text-base leading-relaxed text-gray-700">
              {recommendation}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}