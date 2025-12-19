// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from "./pages/Landing"; 
import Login from "./pages/Login";
import Register from "./pages/Register";

import Dashboard from "./pages/Dashboard";
import CropAdvisor from "./pages/CropAdvisor";
import DocumentInterpreter from "./pages/DocumentInterpreter";
import Subsidy from "./pages/Subsidy";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* LANDING PAGE */}
        <Route path="/" element={<LandingPage />} />

        {/* AUTH */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* MAIN DASHBOARD */}
        <Route path="/dashboard/:username" element={<Dashboard />} />

        {/* TOOLS */}
        <Route path="/crop/:username" element={<CropAdvisor />} />
        <Route path="/documents/:username" element={<DocumentInterpreter />} />
        <Route path="/subsidy/:username" element={<Subsidy />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
