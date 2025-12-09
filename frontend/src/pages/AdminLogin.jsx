import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Lock, Terminal, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(`${API}/admin/login`, { password });
      if (response.data.success) {
        localStorage.setItem("adminToken", response.data.token);
        navigate("/admin/dashboard");
      }
    } catch (err) {
      setError("Invalid admin credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4" data-testid="admin-login-page">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 border border-[#00FF41]/30 bg-[#0A0A0A] mb-4 glow-green">
            <Terminal className="w-8 h-8 text-[#00FF41]" />
          </div>
          <h1 className="font-mono text-2xl font-bold tracking-tight text-[#00FF41] uppercase glow-text-green">
            Honeypot Control
          </h1>
          <p className="text-[#888888] text-sm mt-2 font-mono">
            ADMIN DASHBOARD ACCESS
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-[#0A0A0A] border border-[#333333] p-8 relative">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00FF41] to-transparent" />
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="font-mono text-xs uppercase tracking-widest text-[#888888]">
                Admin Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888888]" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-[#111111] border-[#333333] text-[#E5E5E5] rounded-none focus:ring-1 focus:ring-[#00FF41] focus:border-[#00FF41] placeholder:text-[#444444] font-mono"
                  placeholder="Enter admin password"
                  required
                  data-testid="admin-password-input"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-[#FF0033]/10 border border-[#FF0033]/30 text-[#FF0033] font-mono text-sm animate-fadeIn" data-testid="admin-error-message">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#00FF41] text-black hover:bg-[#00FF41]/90 rounded-none font-mono uppercase tracking-wider text-xs font-bold px-6 py-3 shadow-[0_0_10px_rgba(0,255,65,0.3)] hover:shadow-[0_0_20px_rgba(0,255,65,0.5)] disabled:opacity-50"
              data-testid="admin-login-button"
            >
              {loading ? "AUTHENTICATING..." : "ACCESS DASHBOARD"}
            </Button>
          </form>

          <div className="mt-6 p-3 bg-[#111111] border border-[#333333]">
            <p className="font-mono text-xs text-[#888888]">
              <span className="text-[#00FF41]">TIP:</span> Default password is <code className="text-[#FFB000]">honeyadmin123</code>
            </p>
          </div>
        </div>

        <div className="mt-4 text-center">
          <a 
            href="/" 
            className="font-mono text-xs text-[#888888] hover:text-[#00FF41] transition-colors"
          >
            ← Back to Honeypot
          </a>
        </div>
      </div>
    </div>
  );
}
