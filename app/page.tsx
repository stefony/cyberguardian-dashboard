"use client";

import { useEffect, useRef, useState } from "react";
import { Shield, Activity, AlertTriangle, Eye, Wifi, WifiOff } from "lucide-react";
import { dashboardApi } from "@/lib/api";
import type { HealthData } from "@/lib/types";
import { useWebSocketContext } from "@/lib/contexts/WebSocketContext";
import { LiveThreatNotification } from "@/components/LiveThreatNotification";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";




/* ===== CountUp: анимира „изкачване" на числата ===== */
function CountUp({
  end,
  duration = 1200,
  prefix = "",
  suffix = "",
}: {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}) {
  const [val, setVal] = useState(0);
  const raf = useRef<number | null>(null);
  const start = useRef<number | null>(null);

  useEffect(() => {
    const target = end;
    const run = (t: number) => {
      if (start.current === null) start.current = t;
      const p = Math.min((t - start.current) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 2); // easeOutQuad
      setVal(Math.round(target * eased));
      if (p < 1) raf.current = requestAnimationFrame(run);
    };
    raf.current = requestAnimationFrame(run);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [end, duration]);

  return <span>{prefix}{val}{suffix}</span>;
}

/* ===== CardTilt: лек parallax/tilt при мишка ===== */
function CardTilt({ children, className = "" }: { children: React.ReactNode; className?: string; }) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
    const rotX = (py - 0.5) * -6, rotY = (px - 0.5) * 6;
    el.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-6px) scale(1.02)`;
  };
  const onLeave = () => { const el = ref.current; if (el) el.style.transform = ""; };

  return (
    <div ref={ref} className={`tilt ${className}`} onMouseMove={onMove} onMouseLeave={onLeave}>
      {children}
    </div>
  );
}

/* ===== Threat Activity Chart (Recharts) ===== */
type RangeKey = "24h" | "7d" | "30d";
type ThreatPoint = { t: string; threats: number };

function ThreatActivityChart() {
  const [range, setRange] = useState<RangeKey>("24h");
  const [data, setData] = useState<ThreatPoint[]>([]);

  useEffect(() => {
    const basePoints: Record<RangeKey, number> = { "24h": 15, "7d": 7, "30d": 30 };
    const newData: ThreatPoint[] = Array.from({ length: basePoints[range] }, (_, i) => ({
      t: range === "24h" ? `${i + 1}h` : `Day ${i + 1}`,
      threats: Math.floor(Math.random() * 20 + 10) + i * 2,
    }));
    setData(newData);
  }, [range]);

  return (
    <div className="chart-card p-6 transition-all duration-700 ease-out opacity-0 translate-y-6 animate-[fadeInUp_1s_ease-out_forwards]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Threat Activity</h3>
        <div className="flex gap-2">
          {(["24h", "7d", "30d"] as RangeKey[]).map((label) => (
            <button
              key={label}
              onClick={() => setRange(label)}
              className={`btn btn-ghost motion-safe:transition-transform motion-safe:duration-300 will-change-transform hover:-translate-y-1 hover:scale-[1.03] ${
                range === label ? "bg-primary/20 border-primary/50 text-primary shadow-lg" : ""
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 10, right: 12, bottom: 0, left: -10 }}>
            <defs>
              <linearGradient id="gradThreat" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7C3AED" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#7C3AED" stopOpacity={0.05} />
              </linearGradient>
            </defs>

            <CartesianGrid vertical={false} stroke="rgba(255,255,255,.06)" strokeDasharray="3 3" />
            <XAxis dataKey="t" tick={{ fill: "rgba(226,232,240,.7)", fontSize: 12 }} tickMargin={8} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "rgba(226,232,240,.6)", fontSize: 12 }} axisLine={false} tickLine={false} width={30} />
            <Tooltip
              contentStyle={{ background: "rgba(17,27,46,.95)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 12, color: "rgb(226 232 240)", boxShadow: "0 8px 24px rgba(0,0,0,.45)", padding: "10px 12px" }}
              labelStyle={{ color: "rgba(148,163,184,1)" }}
              cursor={{ stroke: "rgba(124,58,237,.4)", strokeWidth: 1 }}
            />
            <Area type="monotone" dataKey="threats" stroke="#7C3AED" strokeWidth={2} fill="url(#gradThreat)" animationDuration={900} dot={false} activeDot={{ r: 5 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ===== MAIN DASHBOARD PAGE WITH WEBSOCKET ===== */
export default function DashboardPage() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Threat notification state
  const [currentThreat, setCurrentThreat] = useState<{
    id: string;
    title: string;
    severity: string;
    timestamp: string;
  } | null>(null);
  
  // WebSocket integration
  const { isConnected, lastMessage } = useWebSocketContext();

  // Fetch initial data
  const fetchHealth = async () => {
    try {
      const response = await dashboardApi.getHealth();
      if (response.success && response.data) {
        setHealth(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch health:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchHealth();
  }, []);

  // Listen for WebSocket updates
  useEffect(() => {
    if (!lastMessage) return;

    console.log("📡 Dashboard received WebSocket message:", lastMessage);

    // Handle different message types
    switch (lastMessage.type) {
      case "stats_update":
        // Update stats from WebSocket
        if (lastMessage.data && health) {
          setHealth(prev => ({
            ...prev!,
            ...lastMessage.data
          }));
        }
        break;

      case "threat_update":
        // Show notification for new threat
        if (lastMessage.data) {
          setCurrentThreat({
            id: lastMessage.data.id || Date.now().toString(),
            title: lastMessage.data.title || lastMessage.data.threat_type || "Unknown Threat",
            severity: lastMessage.data.severity || lastMessage.data.level || "medium",
            timestamp: lastMessage.data.timestamp || new Date().toISOString()
          });
          
          // Play sound alert (optional)
          if (typeof Audio !== 'undefined') {
            try {
              const audio = new Audio('/alert.mp3');
              audio.volume = 0.3;
              audio.play().catch(() => {}); // Ignore if sound fails
            } catch (e) {}
          }
        }
        
        // Refresh health data when new threat detected
        fetchHealth();
        break;

      case "honeypot_event":
        // Refresh health data when honeypot triggered
        fetchHealth();
        break;
    }
  }, [lastMessage, health]);

  // Auto-refresh every 30 seconds (fallback)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchHealth();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent p-8 border border-primary/20">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
              Welcome to CyberGuardian AI
            </h1>
            
            {/* WebSocket Status Indicator */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
              isConnected 
                ? 'bg-green-500/20 border border-green-500/50' 
                : 'bg-red-500/20 border border-red-500/50'
            }`}>
              {isConnected ? (
                <>
                  <Wifi className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-green-400 font-medium">Live</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-red-400" />
                  <span className="text-sm text-red-400 font-medium">Offline</span>
                </>
              )}
            </div>
          </div>
          
          <p className="text-slate-300 max-w-2xl">
            Your advanced, AI-powered security operations center — combining real-time threat detection, 
            behavioral analytics, deception layers, and predictive defense.
          </p>

          <div className="flex gap-4 mt-6">
            <button className="btn btn--primary">
              <Activity className="w-4 h-4" />
              Get Started
            </button>
            <button className="btn btn--ghost">Learn More</button>
            <button className="btn btn--success">
              <Shield className="w-4 h-4" />
              Live Beta
            </button>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <CardTilt>
          <div className="stat-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/20 rounded-xl">
                <Shield className="w-6 h-6 text-green-400" />
              </div>
              <span className="text-xs text-slate-400 uppercase tracking-wider">System</span>
            </div>
            <h3 className="text-2xl font-bold mb-1">
              {health?.status === "healthy" ? "Protected" : "Warning"}
            </h3>
            <p className="text-sm text-slate-400">{health?.system?.platform || health?.platform || "Windows"}</p>
          </div>
        </CardTilt>

        <CardTilt>
          <div className="stat-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <Activity className="w-6 h-6 text-blue-400" />
              </div>
              <span className="text-xs text-slate-400 uppercase tracking-wider">Monitors</span>
            </div>
            <h3 className="text-2xl font-bold mb-1">
              <CountUp end={5} />
            </h3>
            <p className="text-sm text-slate-400">Real-time scanning</p>
          </div>
        </CardTilt>

        <CardTilt>
          <div className="stat-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-500/20 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <span className="text-xs text-slate-400 uppercase tracking-wider">Threats</span>
            </div>
            <h3 className="text-2xl font-bold mb-1">
              <CountUp end={12} />
            </h3>
            <p className="text-sm text-slate-400">Last 24 hours</p>
          </div>
        </CardTilt>

        <CardTilt>
          <div className="stat-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <Eye className="w-6 h-6 text-purple-400" />
              </div>
              <span className="text-xs text-slate-400 uppercase tracking-wider">Honeypots</span>
            </div>
            <h3 className="text-2xl font-bold mb-1">
              <CountUp end={8} />
            </h3>
            <p className="text-sm text-slate-400">Deception layer ready</p>
          </div>
        </CardTilt>
      </div>

      {/* Dashboard Connected Indicator */}
      <div className="flex items-center justify-center p-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-xl border border-green-500/20">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
          <span className="text-sm font-medium">
            {isConnected 
              ? "Dashboard Connected to API! Live API Data: Frontend successfully connected to backend!" 
              : "Connecting to API..."}
          </span>
        </div>
        
        {health && (
          <div className="ml-auto flex gap-6 text-sm text-slate-400">
            <div>CPU Usage: <span className="text-primary font-semibold">{((health.system?.cpu_percent ?? health.cpu_usage) || 0).toFixed(1)}%</span></div>
            <div>Memory Usage: <span className="text-primary font-semibold">{((health.system?.memory_percent ?? health.memory_usage) || 0).toFixed(1)}%</span></div>
            <div>Uptime: <span className="text-primary font-semibold">{health.uptime || "0m"}</span></div>
          </div>
        )}
      </div>

      {/* Threat Activity Chart */}
      <ThreatActivityChart />

      {/* System Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="stat-card p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            Detection Rate
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Success Rate</span>
              <span className="font-semibold text-green-400">99.8%</span>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-2">
              <div className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full" style={{ width: "99.8%" }}></div>
            </div>
          </div>
        </div>

        <div className="stat-card p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            Response Time
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Average</span>
              <span className="font-semibold text-blue-400">&lt; 100ms</span>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-2">
              <div className="bg-gradient-to-r from-blue-400 to-cyan-500 h-2 rounded-full" style={{ width: "85%" }}></div>
            </div>
          </div>
        </div>

        <div className="stat-card p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
            Protection
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">24/7 Active</span>
              <span className="font-semibold text-purple-400">Online</span>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-2">
              <div className="bg-gradient-to-r from-purple-400 to-pink-500 h-2 rounded-full" style={{ width: "100%" }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Threat Notification */}
      <LiveThreatNotification 
        threat={currentThreat}
        onClose={() => setCurrentThreat(null)}
      />
    </div>
  );
}