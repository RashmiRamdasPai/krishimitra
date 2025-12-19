import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [msg, setMsg] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setMsg("");

    if (password !== confirmPass) {
      setMsg("Passwords do not match");
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:8000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: name,
          password: password,
          preferred_language: "kannada",
        }),
      });

      if (res.ok) {
        setMsg("Registration successful! Redirecting...");
        setTimeout(() => navigate("/"), 1000);
      } else {
        const data = await res.json();
        setMsg(data.detail || "Registration failed");
      }
    } catch (err) {
      setMsg("Server error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-green-200 to-yellow-100">

      <div className="w-full max-w-5xl bg-white shadow-xl rounded-xl grid grid-cols-1 md:grid-cols-2 overflow-hidden">

        {/* LEFT PANEL */}
        <div className="bg-gradient-to-b from-green-700 to-green-600 text-white p-10 flex flex-col justify-center">
          <h1 className="text-3xl font-bold mb-4">🌾 KrishiMitra</h1>
          <h2 className="text-xl font-semibold mb-6">Grow Smarter with Us!</h2>

          <p className="text-green-100 mb-6 leading-relaxed">
            Create your account to access personalized farming insights,  
            AI document summaries, task reminders, and crop recommendations.
          </p>

          <ul className="space-y-4 text-green-100">
            <li>📄 <strong>AI-driven document scanner</strong></li>
            <li>🌱 <strong>Smart crop advisor</strong></li>
            <li>🔔 <strong>Automatic deadlines & alerts</strong></li>
            <li>🔐 <strong>Secure & encrypted login</strong></li>
          </ul>
        </div>

        {/* RIGHT PANEL - REGISTER FORM */}
        <div className="p-10">
          <h2 className="text-2xl font-bold text-green-700 mb-2">Create Your Account</h2>
          <p className="text-gray-600 mb-6">Join KrishiMitra for a smarter farming experience</p>

          <form onSubmit={handleRegister} className="space-y-4">

            {/* FULL NAME */}
            <div>
              <label className="block mb-1 font-semibold text-gray-700">Full Name</label>
              <input
                type="text"
                className="w-full border p-3 rounded-lg"
                placeholder="Enter your full name"
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* MOBILE */}
            <div>
              <label className="block mb-1 font-semibold text-gray-700">Mobile Number</label>
              <div className="flex items-center border rounded-lg overflow-hidden">
                <span className="px-3 bg-gray-100 text-gray-700">+91</span>
                <input
                  type="number"
                  className="w-full p-3 outline-none"
                  placeholder="Enter mobile number"
                  onChange={(e) => setMobile(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block mb-1 font-semibold text-gray-700">Password</label>
              <input
                type="password"
                className="w-full border p-3 rounded-lg"
                placeholder="Create a password"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* CONFIRM PASSWORD */}
            <div>
              <label className="block mb-1 font-semibold text-gray-700">Confirm Password</label>
              <input
                type="password"
                className="w-full border p-3 rounded-lg"
                placeholder="Re-enter your password"
                onChange={(e) => setConfirmPass(e.target.value)}
                required
              />
            </div>

            {/* CAPTCHA */}
            <div>
              <label className="block mb-1 font-semibold text-gray-700">Security Verification</label>
              <div className="flex items-center gap-3">
                <div className="px-4 py-2 bg-gray-200 rounded-lg font-mono tracking-wider">
                  M7Kp3X
                </div>
                <button className="text-green-600 text-sm font-semibold">↻ Refresh</button>
              </div>

              <input
                placeholder="Enter the code above"
                className="w-full border p-3 rounded-lg mt-2"
              />
            </div>

            {/* REGISTER BUTTON */}
            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg text-lg font-semibold flex items-center justify-center gap-2"
            >
              🌱 Create Account →
            </button>

            {/* STATUS MESSAGE */}
            {msg && <p className="text-center text-red-600 mt-2">{msg}</p>}

            {/* LOGIN LINK */}
            <p className="text-center text-gray-600 mt-4">
              Already have an account?{" "}
              <span
                className="text-green-700 font-semibold cursor-pointer hover:underline"
                onClick={() => navigate("/")}
              >
                Login here
              </span>
            </p>

          </form>

        </div>
      </div>
    </div>
  );
}
