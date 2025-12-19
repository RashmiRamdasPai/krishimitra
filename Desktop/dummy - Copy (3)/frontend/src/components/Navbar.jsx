import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";

export default function Navbar() {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <nav className="flex justify-between items-center px-10 py-4 bg-gradient-to-r from-green-700 to-green-800 text-white shadow-md sticky top-0 z-40">
      <Link to="/" className="text-2xl font-bold">🌾 Agri-Comply</Link>

      <ul className="flex items-center gap-8 text-sm font-medium relative z-20">
        <li><Link to="/" className="hover:text-green-200">Home</Link></li>

        <li
          className="relative"
          onMouseEnter={() => setShowDropdown(true)}
          onMouseLeave={() => setShowDropdown(false)}
        >
          <div className="flex items-center gap-1 cursor-pointer hover:text-green-200">
            AI Services <ChevronDown size={16} />
          </div>

          {showDropdown && (
            <div className="absolute top-8 left-0 bg-white text-gray-800 shadow-lg rounded-md w-52 p-2 z-50">
              <Link to="/upload" className="block px-3 py-2 hover:bg-green-100 rounded">
                Crop Recommendation
              </Link>
              <Link to="/dashboard" className="block px-3 py-2 hover:bg-green-100 rounded">
                Dashboard
              </Link>
              <div className="px-3 py-2 hover:bg-green-100 rounded cursor-pointer">
                Weather Forecast
              </div>
            </div>
          )}
        </li>

        <li><Link to="/dashboard" className="hover:text-green-200">Dashboard</Link></li>
        <li><Link to="/login" className="hover:text-green-200">Login</Link></li>
      </ul>
    </nav>
  );
}

