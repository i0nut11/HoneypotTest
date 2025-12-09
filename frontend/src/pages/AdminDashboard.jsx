import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Shield,
  Activity,
  Globe,
  Users,
  AlertTriangle,
  Skull,
  Terminal,
  RefreshCw,
  LogOut,
  Trash2,
  Clock,
  MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const COLORS = {
  primary: "#00FF41",
  destructive: "#FF0033",
  warning: "#FFB000",
  info: "#00EAFF",
  accent: "#FF00FF"
};

const SEVERITY_COLORS = {
  critical: "#FF0033",
  high: "#FFB000",
  medium: "#00EAFF",
  low: "#00FF41"
};

const ATTACK_TYPE_COLORS = {
  sql_injection: "#FF0033",
  xss: "#FFB000",
  command_injection: "#FF00FF",
  path_traversal: "#00EAFF",
  brute_force: "#00FF41"
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [liveAttacks, setLiveAttacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, timelineRes, liveRes] = await Promise.all([
        axios.get(`${API}/attacks/stats`),
        axios.get(`${API}/attacks/timeline`),
        axios.get(`${API}/attacks/live?limit=15`)
      ]);
      setStats(statsRes.data);
      setTimeline(timelineRes.data);
      setLiveAttacks(liveRes.data);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchData]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin");
  };

  const handleClearLogs = async () => {
    if (window.confirm("Are you sure you want to clear all attack logs?")) {
      try {
        await axios.delete(`${API}/attacks`);
        fetchData();
      } catch (err) {
        console.error("Failed to clear logs:", err);
      }
    }
  };

  const formatTimestamp = (ts) => {
    const date = new Date(ts);
    return date.toLocaleTimeString("en-US", { hour12: false });
  };

  const getSeverityBadge = (severity) => {
    const classes = {
      critical: "badge-critical",
      high: "badge-high",
      medium: "badge-medium",
      low: "badge-low"
    };
    return `px-2 py-0.5 font-mono text-[10px] uppercase ${classes[severity] || classes.low}`;
  };

  const getAttackTypeBadge = (type) => {
    const displayName = type.replace("_", " ");
    return (
      <span 
        className="px-2 py-0.5 font-mono text-[10px] uppercase" 
        style={{ 
          backgroundColor: `${ATTACK_TYPE_COLORS[type]}15`,
          color: ATTACK_TYPE_COLORS[type],
          border: `1px solid ${ATTACK_TYPE_COLORS[type]}30`
        }}
      >
        {displayName}
      </span>
    );
  };

  // Prepare pie chart data
  const attackTypesData = stats?.attack_types 
    ? Object.entries(stats.attack_types).map(([name, value]) => ({
        name: name.replace("_", " "),
        value,
        color: ATTACK_TYPE_COLORS[name] || COLORS.primary
      }))
    : [];

  const severityData = stats?.severity_breakdown
    ? Object.entries(stats.severity_breakdown).map(([name, value]) => ({
        name,
        value,
        color: SEVERITY_COLORS[name] || COLORS.primary
      }))
    : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-[#00FF41] animate-spin mx-auto mb-4" />
          <p className="font-mono text-[#888888]">Loading honeypot data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] p-4 md:p-6" data-testid="admin-dashboard">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#333333]">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 border border-[#00FF41]/30 bg-[#0A0A0A] flex items-center justify-center glow-green">
            <Shield className="w-5 h-5 text-[#00FF41]" />
          </div>
          <div>
            <h1 className="font-mono text-xl font-bold text-[#00FF41] uppercase tracking-wider glow-text-green">
              Honeypot Control Center
            </h1>
            <p className="font-mono text-xs text-[#888888]">Real-time attack monitoring</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 border ${autoRefresh ? 'border-[#00FF41]/30 bg-[#00FF41]/5' : 'border-[#333333] bg-[#0A0A0A]'}`}>
            <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-[#00FF41] animate-blink' : 'bg-[#888888]'}`} />
            <span className="font-mono text-xs text-[#888888]">{autoRefresh ? 'LIVE' : 'PAUSED'}</span>
          </div>
          <Button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="bg-transparent border border-[#333333] text-[#E5E5E5] hover:border-[#00FF41] hover:text-[#00FF41] rounded-none font-mono uppercase text-xs px-3 py-1.5 h-auto"
          >
            <RefreshCw className={`w-3 h-3 mr-1 ${autoRefresh ? 'animate-spin' : ''}`} />
            {autoRefresh ? 'Pause' : 'Resume'}
          </Button>
          <Button
            onClick={handleClearLogs}
            className="bg-transparent border border-[#FF0033]/30 text-[#FF0033] hover:bg-[#FF0033]/10 rounded-none font-mono uppercase text-xs px-3 py-1.5 h-auto"
            data-testid="clear-logs-button"
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Clear
          </Button>
          <Button
            onClick={handleLogout}
            className="bg-transparent border border-[#333333] text-[#888888] hover:border-[#888888] hover:text-[#E5E5E5] rounded-none font-mono uppercase text-xs px-3 py-1.5 h-auto"
            data-testid="logout-button"
          >
            <LogOut className="w-3 h-3 mr-1" />
            Exit
          </Button>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<Skull className="w-5 h-5" />}
          label="Total Attacks"
          value={stats?.total_attacks || 0}
          color="destructive"
          testId="total-attacks-stat"
        />
        <StatCard
          icon={<Users className="w-5 h-5" />}
          label="Unique IPs"
          value={stats?.unique_ips || 0}
          color="info"
          testId="unique-ips-stat"
        />
        <StatCard
          icon={<AlertTriangle className="w-5 h-5" />}
          label="Critical Threats"
          value={stats?.severity_breakdown?.critical || 0}
          color="warning"
          testId="critical-threats-stat"
        />
        <StatCard
          icon={<Globe className="w-5 h-5" />}
          label="Countries"
          value={stats?.attacks_by_country?.length || 0}
          color="primary"
          testId="countries-stat"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Attack Timeline Chart */}
        <div className="lg:col-span-2 bg-[#0A0A0A] border border-[#333333] p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-mono text-sm font-bold text-[#E5E5E5] uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#00FF41]" />
              Attack Timeline
            </h2>
            <span className="font-mono text-xs text-[#888888]">Last 7 days</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeline}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
                <XAxis dataKey="date" stroke="#888888" fontSize={10} fontFamily="JetBrains Mono" />
                <YAxis stroke="#888888" fontSize={10} fontFamily="JetBrains Mono" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0A0A0A', 
                    border: '1px solid #00FF41',
                    fontFamily: 'JetBrains Mono',
                    fontSize: 11
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="total" 
                  stroke={COLORS.primary} 
                  fillOpacity={1} 
                  fill="url(#colorTotal)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Attack Types Pie Chart */}
        <div className="bg-[#0A0A0A] border border-[#333333] p-4">
          <h2 className="font-mono text-sm font-bold text-[#E5E5E5] uppercase tracking-wider mb-4 flex items-center gap-2">
            <Skull className="w-4 h-4 text-[#FF0033]" />
            Attack Types
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={attackTypesData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {attackTypesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0A0A0A', 
                    border: '1px solid #333333',
                    fontFamily: 'JetBrains Mono',
                    fontSize: 11
                  }}
                />
                <Legend 
                  wrapperStyle={{ fontFamily: 'JetBrains Mono', fontSize: 10 }}
                  formatter={(value) => <span className="text-[#888888]">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Countries Bar Chart */}
        <div className="bg-[#0A0A0A] border border-[#333333] p-4">
          <h2 className="font-mono text-sm font-bold text-[#E5E5E5] uppercase tracking-wider mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#00EAFF]" />
            Top Attack Origins
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.attacks_by_country || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
                <XAxis type="number" stroke="#888888" fontSize={10} fontFamily="JetBrains Mono" />
                <YAxis type="category" dataKey="country" stroke="#888888" fontSize={9} fontFamily="JetBrains Mono" width={80} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0A0A0A', 
                    border: '1px solid #00EAFF',
                    fontFamily: 'JetBrains Mono',
                    fontSize: 11
                  }}
                />
                <Bar dataKey="count" fill={COLORS.info} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Distribution */}
        <div className="bg-[#0A0A0A] border border-[#333333] p-4">
          <h2 className="font-mono text-sm font-bold text-[#E5E5E5] uppercase tracking-wider mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#FFB000]" />
            Severity Distribution
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0A0A0A', 
                    border: '1px solid #333333',
                    fontFamily: 'JetBrains Mono',
                    fontSize: 11
                  }}
                />
                <Legend 
                  wrapperStyle={{ fontFamily: 'JetBrains Mono', fontSize: 10 }}
                  formatter={(value) => <span className="text-[#888888]">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hourly Activity */}
        <div className="bg-[#0A0A0A] border border-[#333333] p-4">
          <h2 className="font-mono text-sm font-bold text-[#E5E5E5] uppercase tracking-wider mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#00FF41]" />
            24h Activity
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.attacks_by_hour || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
                <XAxis dataKey="hour" stroke="#888888" fontSize={10} fontFamily="JetBrains Mono" />
                <YAxis stroke="#888888" fontSize={10} fontFamily="JetBrains Mono" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0A0A0A', 
                    border: '1px solid #00FF41',
                    fontFamily: 'JetBrains Mono',
                    fontSize: 11
                  }}
                />
                <Bar dataKey="count" fill={COLORS.primary} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Live Attack Feed */}
      <div className="bg-[#0A0A0A] border border-[#333333]">
        <div className="flex items-center justify-between p-4 border-b border-[#333333]">
          <h2 className="font-mono text-sm font-bold text-[#E5E5E5] uppercase tracking-wider flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#00FF41]" />
            Live Attack Feed
          </h2>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#00FF41] animate-pulse" />
            <span className="font-mono text-xs text-[#888888]">MONITORING</span>
          </div>
        </div>
        <div className="terminal-log" data-testid="live-attack-feed">
          {liveAttacks.length === 0 ? (
            <div className="text-center py-8 text-[#888888] font-mono text-sm">
              No attacks captured yet. Waiting for incoming connections...
            </div>
          ) : (
            liveAttacks.map((attack, idx) => (
              <div key={attack.id || idx} className="terminal-line animate-fadeIn flex flex-wrap items-center gap-2 py-2">
                <span className="text-[#888888]">[{formatTimestamp(attack.timestamp)}]</span>
                <span className={getSeverityBadge(attack.severity)}>{attack.severity}</span>
                {getAttackTypeBadge(attack.attack_type)}
                <span className="text-[#00EAFF]">{attack.ip_address}</span>
                <span className="text-[#888888]">from</span>
                <span className="text-[#FFB000]">{attack.country}</span>
                <span className="text-[#888888]">→</span>
                <span className="text-[#E5E5E5] truncate max-w-[200px]" title={attack.payload}>
                  {attack.payload.substring(0, 50)}{attack.payload.length > 50 ? '...' : ''}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color, testId }) {
  const colorClasses = {
    primary: "text-[#00FF41] border-[#00FF41]/20 hover:border-[#00FF41]/40",
    destructive: "text-[#FF0033] border-[#FF0033]/20 hover:border-[#FF0033]/40",
    warning: "text-[#FFB000] border-[#FFB000]/20 hover:border-[#FFB000]/40",
    info: "text-[#00EAFF] border-[#00EAFF]/20 hover:border-[#00EAFF]/40"
  };

  return (
    <div 
      className={`stat-card bg-[#0A0A0A] border p-6 ${colorClasses[color]} transition-colors`}
      data-testid={testId}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={colorClasses[color]}>{icon}</div>
        <span className="font-mono text-xs text-[#888888] uppercase tracking-wider">{label}</span>
      </div>
      <div className={`font-mono text-4xl font-bold ${colorClasses[color].split(' ')[0]}`}>
        {value.toLocaleString()}
      </div>
    </div>
  );
}
