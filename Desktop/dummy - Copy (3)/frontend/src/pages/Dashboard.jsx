// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { username } = useParams();
  const navigate = useNavigate();

  const [deadlines, setDeadlines] = useState([]);

  // Fetch deadlines from backend
  const loadDeadlines = async () => {
    const res = await fetch(`http://127.0.0.1:8000/subsidy/deadlines/${username}`);
    const data = await res.json();
    setDeadlines(data.deadlines || []);
  };

  useEffect(() => {
    loadDeadlines();
  }, []);

  // Delete handler
  const deleteDeadline = async (id) => {
    const ok = confirm("Delete this deadline?");
    if (!ok) return;

    await fetch(`http://127.0.0.1:8000/subsidy/delete/${id}`, {
      method: "DELETE",
    });

    loadDeadlines(); // refresh
  };

  return (
    <div className="min-h-screen bg-green-50 p-6 sm:p-10">
      <h1 className="text-4xl font-extrabold mb-8 text-green-800 border-b-4 border-yellow-500 pb-2 inline-block">
        🌾 Farmer's Dashboard 🌻
      </h1>
      
      <p className="text-2xl font-semibold mb-10 text-gray-700">
        Welcome back, <span className="text-green-600">{username}</span>!
      </p>

      {/* DEADLINE ALERTS */}
      {deadlines.length > 0 && (
        <div className="mb-12 p-6 bg-red-50 border-l-4 border-red-500 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-red-700 flex items-center">
            <span className="text-3xl mr-2">🚨</span> Upcoming Deadlines
          </h2>

          <div className="space-y-4">
            {deadlines.map((dl) => (
              <div
                key={dl._id}
                className="flex items-center justify-between bg-white border border-red-200 p-4 rounded-lg shadow-md transition duration-300 hover:shadow-lg hover:border-red-400"
              >
                <div>
                  <p className="font-extrabold text-lg text-red-800">
                    {dl.subsidy_name}
                  </p>
                  <p className="text-red-600 font-medium">Deadline: {dl.deadline}</p>
                </div>

                <button
                  onClick={() => deleteDeadline(dl._id)}
                  className="text-red-500 font-bold text-2xl hover:text-red-700 transition duration-150 p-2 rounded-full hover:bg-red-100"
                  aria-label="Delete deadline"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MAIN CARDS */}
      
       <div>
        {/* DOCUMENT INTERPRETER */}
        <Card 
          icon="📜"
          title="Document Interpreter"
          description="Upload and analyze soil reports & complex forms easily."
          onClick={() => navigate(`/documents/${username}`)}
          colorClasses="from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700"
        />

        
      </div>
    </div>
  );
}

// A reusable Card component for cleaner JSX and styling control
const Card = ({ icon, title, description, onClick, colorClasses }) => (
  <div
    onClick={onClick}
    className={`p-8 bg-white/70 border border-gray-100 
                rounded-3xl shadow-xl cursor-pointer
                transform transition-all duration-300 ease-in-out
                hover:scale-[1.03] hover:shadow-2xl text-center
                group`}
  >
    <div className={`p-4 mx-auto w-16 h-16 rounded-full text-4xl mb-4 
                    bg-gradient-to-br ${colorClasses} shadow-md flex items-center justify-center`}>
      {icon}
    </div>
    <h2 className="text-xl font-extrabold text-gray-800 group-hover:text-green-700 transition duration-300">
      {title}
    </h2>
    <p className="text-gray-600 mt-2 font-medium">
      {description}
    </p>
  </div>
);