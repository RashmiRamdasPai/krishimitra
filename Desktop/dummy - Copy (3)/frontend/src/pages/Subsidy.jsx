// src/pages/Subsidy.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function Subsidy() {
  const { username } = useParams();

  const [file, setFile] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const [details, setDetails] = useState(null);

  const [deadline, setDeadline] = useState("");
  const [deadlines, setDeadlines] = useState([]);

  const [loading, setLoading] = useState(false);

  // Fetch ALL deadlines for this user
  const fetchDeadlines = async () => {
    const res = await fetch(
      `http://127.0.0.1:8000/subsidy/all-deadlines/${username}`
    );
    const data = await res.json();
    setDeadlines(data.deadlines || []);
  };

  useEffect(() => {
    fetchDeadlines();
  }, []);

  // Upload subsidy form → OCR extract → Show text
  const handleUpload = async () => {
    if (!file) {
      alert("Please upload a subsidy form image.");
      return;
    }

    setLoading(true);

    const form = new FormData();
    form.append("file", file);

    try {
      const ocrRes = await fetch("http://127.0.0.1:8000/upload", {
        method: "POST",
        body: form,
      });

      const ocrData = await ocrRes.json();
      setExtractedText(ocrData.extracted_text);
      setDetails(null); // Clear previous analysis when uploading new file
    } catch (error) {
      console.error("OCR failed:", error);
      setExtractedText("Error extracting text. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Send extracted text → AI extracts subsidy info
  const analyzeSubsidy = async () => {
    if (!extractedText.trim() || extractedText.includes("Error")) {
      alert("No valid text extracted from form!");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/subsidy/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: extractedText,
          language: "english",
        }),
      });

      const data = await res.json();
      setDetails(data);

      if (data.deadline) setDeadline(data.deadline);
    } catch (error) {
      console.error("Analysis failed:", error);
      setDetails({ error: "Analysis failed. Server error." });
    } finally {
      setLoading(false);
    }
  };

  // Save final deadline to DB
  const saveDeadline = async () => {
    if (!deadline) {
      alert("Please enter or select a deadline");
      return;
    }

    const res = await fetch("http://127.0.0.1:8000/subsidy/save-deadline", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        subsidy_name: details?.subsidy_name || "Govt Subsidy",
        deadline,
      }),
    });

    if (res.ok) {
      alert("Deadline saved successfully!");
      fetchDeadlines();
    }
  };

  // Delete deadline
  const handleDelete = async (subsidy_name, deadline) => {
    const confirmDelete = window.confirm(
      `Delete deadline for "${subsidy_name}"?`
    );
    if (!confirmDelete) return;

    const res = await fetch("http://127.00.1:8000/subsidy/delete-deadline", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        subsidy_name,
        deadline,
      }),
    });

    if (res.ok) {
      alert("Deadline removed!");
      fetchDeadlines();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 p-6 sm:p-10">
      <h1 className="text-4xl font-extrabold text-green-800 mb-4 border-b-4 border-yellow-500 pb-2 inline-block">
        ⏰ Subsidy Deadline Tracker
      </h1>
      <p className="text-gray-600 mb-8 font-medium">Analyze forms and manage important dates, {username}.</p>

      {/* MAIN CONTENT AREA - GLASSMORPHIC */}
      <div className="bg-white/40 backdrop-blur-xl p-8 rounded-3xl shadow-2xl max-w-4xl mx-auto border border-white/50">

        {/* 1. FORM UPLOAD SECTION (Yellow Accent) */}
        <div className="mb-10 p-6 bg-yellow-50/70 rounded-xl shadow-lg border-l-8 border-yellow-500">
          <h2 className="text-2xl font-bold text-yellow-800 mb-4 flex items-center">
            <span className="text-3xl mr-2">1️⃣</span> Upload & Extract
          </h2>
          
          <label className="block font-semibold text-lg text-gray-700 mb-2">Upload Subsidy Form Image (PDFs not supported here):</label>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
            className="mb-4 w-full text-lg text-gray-700 
                       file:mr-4 file:py-3 file:px-6 
                       file:rounded-full file:border-0
                       file:text-lg file:font-bold
                       file:bg-yellow-500 file:text-white
                       hover:file:bg-yellow-600 transition duration-200 cursor-pointer"
          />

          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className={`px-6 py-3 rounded-xl w-full font-bold text-lg transition duration-300 shadow-md 
                        ${!file || loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 text-white hover:bg-green-700"}`}
          >
            {loading ? "Extracting Text..." : "Extract Text from Form"}
          </button>
        </div>
        
        {/* 2. EXTRACTED TEXT & ANALYZE (Blue Accent) */}
        {extractedText && (
          <div className="mb-10 p-6 bg-blue-50/70 rounded-xl shadow-lg border-l-8 border-blue-500">
            <h2 className="text-2xl font-bold text-blue-800 mb-4 flex items-center">
              <span className="text-3xl mr-2">2️⃣</span> Review & Analyze
            </h2>

            <h3 className="text-xl font-bold mt-2 mb-2 text-gray-700">Extracted Text:</h3>
            <div className="bg-white p-4 rounded-lg shadow-inner max-h-64 overflow-y-auto whitespace-pre-wrap border border-blue-200 text-sm font-mono text-gray-700">
              {extractedText}
            </div>

            <button
              onClick={analyzeSubsidy}
              disabled={loading}
              className={`mt-4 px-6 py-3 rounded-xl w-full font-bold text-lg transition duration-300 shadow-md 
                          ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"}`}
            >
              {loading ? "Analyzing Details..." : "Analyze Form Details"}
            </button>
          </div>
        )}

        {/* 3. AI ANALYZED DETAILS & SAVE (Indigo Accent) */}
        {details && (
          <div className="mt-10 p-6 bg-indigo-50/70 rounded-xl shadow-lg border-l-8 border-indigo-500">
            <h2 className="text-2xl font-bold text-indigo-800 mb-4 flex items-center">
              <span className="text-3xl mr-2">3️⃣</span> Extracted Details & Save
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-lg border border-indigo-200 shadow-inner mb-6 text-gray-700">
                <p className="font-semibold">Subsidy Name:</p><p className="font-bold text-indigo-700">{details.subsidy_name || 'N/A'}</p>
                <p className="font-semibold">Eligibility Summary:</p><p>{details.eligibility || 'N/A'}</p>
                <p className="font-semibold">Required Documents:</p><p>{details.required_documents || 'N/A'}</p>
            </div>

            <div className="mt-6 p-4 bg-white rounded-lg shadow-md border border-indigo-200">
              <label className="font-bold text-lg text-indigo-700">Final Deadline to Save:</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full p-3 border-2 border-indigo-300 rounded-lg mt-2 focus:border-indigo-500"
              />
            </div>

            <button
              onClick={saveDeadline}
              disabled={!deadline}
              className={`mt-5 px-6 py-3 rounded-xl w-full font-bold text-lg transition duration-300 shadow-xl 
                          ${!deadline ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 text-white hover:bg-red-700"}`}
            >
              Save Deadline to My Calendar
            </button>
          </div>
        )}
      </div>

      {/* SAVED DEADLINES LIST (Red/Orange Accent) */}
        
    </div>
  );
}