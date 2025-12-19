import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function LandingPage() {
  const [language, setLanguage] = useState("en");

  const translations = {
    en: {
      appName: "KrishiMitra",
      heroTitle: "KrishiMitra",
      heroSubtitle: "The Farmers' Friend",
      heroDescription:
        "Revolutionize farming with AI-powered document analysis, crop recommendations, and subsidy deadline tracking.",
      startPredicting: "START PREDICTING",
      learnMore: "LEARN MORE",
      login: "Login",
      selectLanguage: "English",
      trustBadge: "Trusted by 10,000+ farmers across India",
      features: "Key Features",
      featureSubtitle: "Everything you need for smart farming",
      cropAdvisor: "Crop Advisor",
      cropAdvisorDesc:
        "Get AI-powered recommendations for the best crops based on your soil and climate.",
      documentInterpreter: "Document Interpreter",
      documentInterpreterDesc:
        "Upload soil reports or pesticide labels — get clear, actionable insights.",
      deadlines: "Subsidy Deadlines",
      deadlinesDesc:
        "Stay updated with important dates for subsidies, loans, and government schemes.",
      tryNow: "Try Now →",
      securePrivate: "Secure & Private",
      securityDesc:
        "Your data is protected with end-to-end encryption and never shared without your consent.",
    },
  };

  const t = translations[language];

  return (
    <div className="min-h-screen bg-gray-100 font-sans">

      {/* NAVBAR */}
      <nav className="bg-green-600 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">

          <h1 className="text-2xl font-bold">{t.appName}</h1>

          <div className="flex items-center gap-4">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="px-3 py-2 rounded-md text-green-700 font-semibold bg-white cursor-pointer"
            >
              <option value="en">🇮🇳 English</option>
            </select>

            <Link
              to="/login"
              className="px-5 py-2 bg-white text-green-600 font-semibold rounded-md hover:shadow-lg"
            >
              {t.login}
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="bg-gradient-to-br from-green-500 to-green-700 text-white py-20 relative overflow-hidden">

        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 px-6">

          {/* TEXT SIDE */}
          <div className="space-y-6">
            <h1 className="text-5xl font-extrabold">{t.heroTitle}</h1>
            <p className="text-2xl opacity-90">{t.heroSubtitle}</p>
            <p className="text-lg opacity-90">{t.heroDescription}</p>

            <div className="flex gap-4 pt-4">
              <Link
                to="/login"
                className="px-8 py-3 bg-white text-green-700 font-bold rounded-lg hover:shadow-xl transition transform hover:-translate-y-1 flex items-center gap-2"
              >
                🚀 {t.startPredicting}
              </Link>

              <a
                href="#features"
                className="px-8 py-3 border-2 border-white text-white font-bold rounded-lg hover:bg-white hover:bg-opacity-20 transition flex items-center gap-2"
              >
                ℹ {t.learnMore}
              </a>
            </div>

            <p className="text-sm opacity-80 pt-4">✅ {t.trustBadge}</p>
          </div>

          {/* FLOATING CARDS */}
          <div className="hidden md:flex relative h-96">

            {/* Floating Card 1 */}
            <div
              onClick={() => (window.location.href = "/login")}
              className="absolute left-5 top-8 bg-white/40 backdrop-blur-lg p-4 rounded-xl shadow-lg cursor-pointer hover:scale-110 transition"
            >
              🌾 {t.cropAdvisor}
            </div>

            {/* Floating Card 2 */}
            <div
              onClick={() => (window.location.href = "/login")}
              className="absolute right-4 top-36 bg-white/40 backdrop-blur-lg p-4 rounded-xl shadow-lg cursor-pointer hover:scale-110 transition"
            >
              📄 {t.documentInterpreter}
            </div>

            {/* Floating Card 3 */}
            <div
              onClick={() => (window.location.href = "/login")}
              className="absolute left-16 bottom-8 bg-white/40 backdrop-blur-lg p-4 rounded-xl shadow-lg cursor-pointer hover:scale-110 transition"
            >
              📅 {t.deadlines}
            </div>

          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">

          <h2 className="text-4xl font-bold">{t.features}</h2>
          <p className="text-gray-600 mt-3">{t.featureSubtitle}</p>

          <div className="grid md:grid-cols-3 gap-10 mt-12">

            {/* Feature Card 1 */}
            <div className="glass-card bg-white/30 backdrop-blur-xl p-8 rounded-2xl shadow-lg hover:-translate-y-2 hover:shadow-2xl transition">
              <div className="text-5xl mb-4">🌾</div>
              <h3 className="text-2xl font-bold">{t.cropAdvisor}</h3>
              <p className="text-gray-700 mt-2">{t.cropAdvisorDesc}</p>
              <Link to="/login" className="text-green-600 font-semibold mt-4 inline-block">
                {t.tryNow}
              </Link>
            </div>

            {/* Feature Card 2 */}
            <div className="glass-card bg-white/30 backdrop-blur-xl p-8 rounded-2xl shadow-lg hover:-translate-y-2 hover:shadow-2xl transition">
              <div className="text-5xl mb-4">📄</div>
              <h3 className="text-2xl font-bold">{t.documentInterpreter}</h3>
              <p className="text-gray-700 mt-2">{t.documentInterpreterDesc}</p>
              <Link to="/login" className="text-green-600 font-semibold mt-4 inline-block">
                {t.tryNow}
              </Link>
            </div>

            {/* Feature Card 3 */}
            <div className="glass-card bg-white/30 backdrop-blur-xl p-8 rounded-2xl shadow-lg hover:-translate-y-2 hover:shadow-2xl transition">
              <div className="text-5xl mb-4">📅</div>
              <h3 className="text-2xl font-bold">{t.deadlines}</h3>
              <p className="text-gray-700 mt-2">{t.deadlinesDesc}</p>
              <Link to="/login" className="text-green-600 font-semibold mt-4 inline-block">
                {t.tryNow}
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* SECURITY SECTION */}
      <section className="py-20 bg-gray-200">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-white shadow-xl rounded-xl p-8 border-l-4 border-green-600">
            <h3 className="text-2xl font-bold">{t.securePrivate}</h3>
            <p className="text-gray-600 mt-3">{t.securityDesc}</p>
          </div>
        </div>
      </section>

    </div>
  );
}
