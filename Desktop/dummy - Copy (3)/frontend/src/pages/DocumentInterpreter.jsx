// src/pages/DocumentInterpreter.jsx
import React, { useState } from "react";
import { useParams } from "react-router-dom";

export default function DocumentInterpreter() {
  const { username } = useParams();

  const [file, setFile] = useState(null);
  const [extracted, setExtracted] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  const [language, setLanguage] = useState("english"); // NEW

  const handleFileUpload = async () => {
    // Custom modal message instead of alert()
    if (!file) {
      console.error("Please choose a document image");
      // In a real app, this would trigger a custom modal
      return;
    }

    setLoading(true);

    const form = new FormData();
    form.append("file", file);

    try {
      // Step 1 — OCR
      const ocrRes = await fetch(
        `http://127.0.0.1:8000/upload?username=${username}`,
        {
          method: "POST",
          body: form,
        }
      );

      const ocrData = await ocrRes.json();
      setExtracted(ocrData.extracted_text);

      // Step 2 — AI Summarization (with language)
      const sumRes = await fetch("http://127.0.0.1:8000/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: ocrData.extracted_text,
          language: language, // SENDING LANGUAGE
        }),
      });

      const sumData = await sumRes.json();
      setSummary(sumData.summary);
    } catch (error) {
      console.error("Interpretation failed:", error);
      setSummary("An error occurred during interpretation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const buttonText = loading 
    ? "Processing Document..." 
    : summary ? "Re-Interpret Document" : "Upload & Interpret";

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex flex-col items-center py-10 px-6">
      <h1 className="text-4xl font-extrabold text-green-800 mb-4 border-b-4 border-yellow-500 pb-2 inline-block">
        📄 Document Interpreter AI
      </h1>
      <p className="text-gray-600 mb-8 font-medium">Upload reports, forms, or documents for instant understanding.</p>

      {/* GLASSMORPHIC CONTAINER */}
      <div className="bg-white/30 backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-full max-w-3xl border border-white/50">

        {/* Language Dropdown */}
        <div className="mb-8 p-4 bg-yellow-50/70 rounded-xl border border-yellow-300 shadow-inner">
          <label className="font-bold text-lg text-yellow-800 mr-4">Summary Language:</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="px-4 py-2 border-2 border-yellow-500 rounded-lg text-lg font-semibold shadow-md transition duration-150 bg-white focus:ring-yellow-600 focus:border-yellow-600"
          >
            <option value="english">English (Recommended)</option>
            <option value="hindi">हिन्दी</option>
            <option value="kannada">ಕನ್ನಡ</option>
          </select>
        </div>

        {/* File Input */}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
          className="mb-6 block w-full text-lg text-gray-700 
                    file:mr-4 file:py-3 file:px-6 
                    file:rounded-full file:border-0
                    file:text-lg file:font-bold
                    file:bg-green-500 file:text-white
                    hover:file:bg-green-600 transition duration-200 cursor-pointer"
        />

        {/* ACTION BUTTON */}
        <button
          onClick={handleFileUpload}
          disabled={!file || loading}
          className={`px-6 py-4 rounded-xl font-bold text-xl w-full transition duration-300 shadow-lg 
                      transform hover:scale-[1.01]
                      ${!file || loading 
                        ? "bg-gray-400 cursor-not-allowed" 
                        : "bg-gradient-to-r from-green-500 to-green-700 text-white hover:from-green-600 hover:to-green-800"}`}
        >
          {buttonText}
        </button>
        {loading && (
             <div className="mt-4 text-center text-green-700 font-semibold">
                Extracting text and generating summary...
             </div>
        )}

        {/* AI SUMMARY OUTPUT */}
        {summary && (
          <div className="mt-8 p-6 bg-green-50/70 rounded-2xl shadow-xl border-l-8 border-green-500">
            <h2 className="font-extrabold text-xl text-green-800 mb-3 flex items-center">
              <span className="text-2xl mr-2">💡</span> Key Summary in {language}
            </h2>
            <div className="bg-white/80 p-5 rounded-lg border border-gray-200 shadow-inner max-h-72 overflow-y-auto text-base leading-relaxed text-gray-700">
              {summary}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}