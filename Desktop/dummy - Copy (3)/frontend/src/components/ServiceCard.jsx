import React from "react";

export default function ServiceCard({ title, desc, icon }) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition transform hover:-translate-y-1 text-center">
      <div className="bg-green-100 w-16 h-16 flex items-center justify-center rounded-full mx-auto mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-green-700 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm mb-4">{desc}</p>
      <a href="/upload" className="text-green-700 font-medium hover:text-green-900 flex items-center justify-center gap-2 mx-auto">
        Try Now →
      </a>
    </div>
  );
}
