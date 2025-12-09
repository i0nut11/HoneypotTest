import { useState } from "react";
import axios from "axios";
import { Lock, User, Shield, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function HoneypotLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(`${API}/honeypot/login`, {
        username,
        password,
      });
      
      // Always show error (it's a honeypot)
      setError(response.data.message || "Authentication failed");
      setAttempts(prev => prev + 1);
    } catch (err) {
      setError("System error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="honeypot-login" data-testid="honeypot-login-page">
      <div className="login-card w-full max-w-md px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 border border-[#333333] bg-[#0A0A0A] mb-4">
            <Shield className="w-8 h-8 text-[#00FF41]" />
          </div>
          <h1 className="font-mono text-2xl font-bold tracking-tight text-[#E5E5E5] uppercase">
            Secure Access Portal
          </h1>
          <p className="text-[#888888] text-sm mt-2 font-mono">
            AUTHORIZED PERSONNEL ONLY
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-[#0A0A0A] border border-[#333333] p-8 relative corner-accent">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00FF41] to-transparent opacity-50" />
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="font-mono text-xs uppercase tracking-widest text-[#888888]">
                Username / ID
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888888]" />
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 bg-[#111111] border-[#333333] text-[#E5E5E5] rounded-none focus:ring-1 focus:ring-[#00FF41] focus:border-[#00FF41] placeholder:text-[#444444] font-mono"
                  placeholder="Enter your username"
                  required
                  data-testid="username-input"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-mono text-xs uppercase tracking-widest text-[#888888]">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888888]" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-[#111111] border-[#333333] text-[#E5E5E5] rounded-none focus:ring-1 focus:ring-[#00FF41] focus:border-[#00FF41] placeholder:text-[#444444] font-mono"
                  placeholder="Enter your password"
                  required
                  data-testid="password-input"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-[#FF0033]/10 border border-[#FF0033]/30 text-[#FF0033] font-mono text-sm animate-fadeIn" data-testid="error-message">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#00FF41] text-black hover:bg-[#00FF41]/90 rounded-none font-mono uppercase tracking-wider text-xs font-bold px-6 py-3 shadow-[0_0_10px_rgba(0,255,65,0.3)] hover:shadow-[0_0_20px_rgba(0,255,65,0.5)] disabled:opacity-50"
              data-testid="login-button"
            >
              {loading ? "AUTHENTICATING..." : "ACCESS SYSTEM"}
            </Button>
          </form>

          {attempts > 0 && (
            <div className="mt-4 text-center font-mono text-xs text-[#888888]">
              Failed attempts: <span className="text-[#FF0033]">{attempts}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="font-mono text-xs text-[#555555]">
            WARNING: Unauthorized access is prohibited.
            <br />
            All activities are monitored and logged.
          </p>
        </div>

        {/* Hidden admin link */}
        <div className="mt-8 text-center">
          <a 
            href="/admin" 
            className="font-mono text-[10px] text-[#333333] hover:text-[#00FF41] transition-colors"
            data-testid="admin-link"
          >
            [ADMIN ACCESS]
          </a>
        </div>
      </div>
    </div>
  );
}
