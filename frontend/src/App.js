import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HoneypotLogin from "@/pages/HoneypotLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminLogin from "@/pages/AdminLogin";

function App() {
  return (
    <div className="min-h-screen bg-[#050505]">
      <div className="scanlines" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HoneypotLogin />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
