import React, { useState } from "react";

export default function UploadDocument() {
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a file first");

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("http://127.0.0.1:8000/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    setText(data.extracted_text);

    // summarize
    const sumRes = await fetch("http://127.0.0.1:8000/summarize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: data.extracted_text }),
    });
    const sdata = await sumRes.json();
    setSummary(sdata.summary);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-green-700 mb-4">
        Upload Document for OCR & Summary
      </h1>

      <form onSubmit={handleUpload} className="mb-6">
        <input
          type="file"
          accept="image/*,application/pdf"
          onChange={(e) => setFile(e.target.files[0])}
          className="block mb-3"
        />
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Upload & Process
        </button>
      </form>

      {text && (
        <div className="mb-4 bg-white p-4 rounded shadow">
          <h3 className="font-semibold">Extracted Text:</h3>
          <pre className="text-sm mt-2">{text}</pre>
        </div>
      )}

      {summary && (
        <div className="bg-green-50 p-4 rounded shadow">
          <h3 className="font-semibold">AI Summary:</h3>
          <p className="mt-2 text-gray-700">{summary}</p>
        </div>
      )}
    </div>
  );
}
