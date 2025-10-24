"use client";

import { useEffect, useRef, useState } from "react";
import { Shield, Activity, AlertTriangle, Eye } from "lucide-react";
import { dashboardApi } from "@/lib/api";
import type { HealthData } from "@/lib/types";
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

/* ===== PAGE ===== */
export default function DashboardPage() {
  // API State
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // Fetch API Health Data
  useEffect(() => {
    const fetchHealth = async () => {
  try {
    const response = await dashboardApi.getHealth();
    
    if (response.success && response.data) {
      setHealthData(response.data);
      setApiError(null);
    } else {
      setApiError(response.error || "API connection failed");
    }
  } catch (error) {
    console.error("API Error:", error);
    setApiError("Could not connect to backend");
  } finally {
    setIsLoading(false);
  }
};

    fetchHealth();
    // Refresh every 5 seconds
    const interval = setInterval(fetchHealth, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="pb-12">
      {/* ================= HERO ================= */}
      <div className="page-container page-hero pt-12 md:pt-20">
        <h1 className="heading-accent gradient-cyber text-4xl md:text-5xl font-bold tracking-tight">
          Welcome to <span className="text-primary">CyberGuardian AI</span>
        </h1>
        <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-2xl">
          Your advanced, AI-powered security operations center — combining real-time threat detection,
          behavioral analytics, deception layers, and predictive defense.
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <button className="btn btn-primary motion-safe:transition-transform motion-safe:duration-300 will-change-transform hover:-translate-y-2 hover:scale-[1.04]" aria-label="Get Started">
            🚀 Get Started
          </button>
          <button className="btn btn-ghost motion-safe:transition-transform motion-safe:duration-300 will-change-transform hover:-translate-y-2 hover:scale-[1.04]" aria-label="Learn More">
            Learn More
          </button>
          <span className={`badge ${apiError ? "badge--err" : "badge--ok"} px-4 py-1 text-sm`}>
            {isLoading ? "Connecting..." : apiError ? "API Offline" : "Live Beta"}
          </span>
        </div>
      </div>

      {/* ================= KPI CARDS ================= */}
      <div className="section">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <CardTilt className="card-premium card-hover kpi p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Shield className="h-6 w-6 text-green-500" />
              </div>
              <span className="text-2xl font-bold text-green-500">
                {healthData?.status === "healthy" ? "✓" : "⚠"}
              </span>
            </div>
            <h3 className="text-lg font-semibold mb-1">System Protected</h3>
            <p className="text-sm text-muted-foreground">
              {healthData?.system.platform || "Loading..."}
            </p>
          </CardTilt>

          <CardTilt className="card-premium card-hover kpi p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Activity className="h-6 w-6 text-blue-500" />
              </div>
              <span className="text-2xl font-bold text-blue-500"><CountUp end={5} /></span>
            </div>
            <h3 className="text-lg font-semibold mb-1">Active Monitors</h3>
            <p className="text-sm text-muted-foreground">Real-time scanning</p>
          </CardTilt>

          <CardTilt className="card-premium card-hover kpi p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-lg bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <span className="text-2xl font-bold text-red-500"><CountUp end={12} /></span>
            </div>
            <h3 className="text-lg font-semibold mb-1">Threats Blocked</h3>
            <p className="text-sm text-muted-foreground">Last 24 hours</p>
          </CardTilt>

          <CardTilt className="card-premium card-hover kpi p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Eye className="h-6 w-6 text-purple-500" />
              </div>
              <span className="text-2xl font-bold text-purple-500"><CountUp end={8} /></span>
            </div>
            <h3 className="text-lg font-semibold mb-1">Honeypots Active</h3>
            <p className="text-sm text-muted-foreground">Deception layer ready</p>
          </CardTilt>
        </div>
      </div>

      {/* ================= INFO PANEL - API STATUS ================= */}
      <div className="section">
        <CardTilt className="card-premium card-hover p-8">
          <h2 className="text-2xl font-bold mb-4">
            {apiError ? "⚠️ Backend Connection Issue" : "✅ Dashboard Connected to API!"}
          </h2>
          <div className="space-y-3 text-muted-foreground">
            {apiError ? (
              <>
                <p className="text-red-400"><strong>Error:</strong> {apiError}</p>
                <p>Unable to connect to the backend API. Please check if the backend service is running.</p>
              </>
            ) : (
              <>
                <p><strong className="text-foreground">Live API Data:</strong> Frontend successfully connected to backend!</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <div className="text-sm text-muted-foreground">CPU Usage</div>
                    <div className="text-2xl font-bold text-blue-400">
                      {healthData ? `${healthData.system.cpu_percent.toFixed(1)}%` : "..."}
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <div className="text-sm text-muted-foreground">Memory Usage</div>
                    <div className="text-2xl font-bold text-purple-400">
                      {healthData ? `${healthData.system.memory_percent.toFixed(1)}%` : "..."}
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                    <div className="text-sm text-muted-foreground">Uptime</div>
                    <div className="text-2xl font-bold text-green-400">
                      {healthData ? `${Math.floor(healthData.uptime_seconds / 60)}m` : "..."}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardTilt>
      </div>

      {/* ================= METRICS ================= */}
      <div className="section">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CardTilt className="card-premium card-hover p-6 text-center">
            <div className="text-3xl font-bold text-blue-400 mb-1">99.8%</div>
            <div className="text-sm text-muted-foreground">Detection Rate</div>
          </CardTilt>

          <CardTilt className="card-premium card-hover p-6 text-center">
            <div className="text-3xl font-bold text-green-400 mb-1">&lt; 100ms</div>
            <div className="text-sm text-muted-foreground">Response Time</div>
          </CardTilt>

          <CardTilt className="card-premium card-hover p-6 text-center">
            <div className="text-3xl font-bold text-purple-400 mb-1">24/7</div>
            <div className="text-sm text-muted-foreground">Protection</div>
          </CardTilt>
        </div>
      </div>

      {/* ================= RECENT THREATS ================= */}
      <div className="section">
        <div className="card-premium p-6">
          <div className="flex items-center justify-between">
            <h3>Recent Threats</h3>
            <div className="flex gap-2">
              <span className="badge badge--err">Critical</span>
              <span className="badge badge--warn">High</span>
              <span className="badge badge--info">Info</span>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Source</th>
                  <th>Type</th>
                  <th>Severity</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>09:41</td>
                  <td>198.51.100.42</td>
                  <td>Brute Force</td>
                  <td><span className="badge badge--err">Critical</span></td>
                  <td><button className="btn btn-ghost relative z-10 motion-safe:transition-transform motion-safe:duration-300 will-change-transform hover:-translate-y-1 hover:scale-[1.03] hover:shadow-md">Details</button></td>
                </tr>
                <tr>
                  <td>09:12</td>
                  <td>203.0.113.11</td>
                  <td>Phishing</td>
                  <td><span className="badge badge--warn">High</span></td>
                  <td><button className="btn btn-ghost relative z-10 motion-safe:transition-transform motion-safe:duration-300 will-change-transform hover:-translate-y-1 hover:scale-[1.03] hover:shadow-md">Details</button></td>
                </tr>
                <tr>
                  <td>08:57</td>
                  <td>malware.sig</td>
                  <td>Malware</td>
                  <td><span className="badge badge--info">Info</span></td>
                  <td><button className="btn btn-ghost relative z-10 motion-safe:transition-transform motion-safe:duration-300 will-change-transform hover:-translate-y-1 hover:scale-[1.03] hover:shadow-md">Details</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ================= SYSTEM HEALTH ================= */}
      <div className="section">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <CardTilt className="card-premium card-hover p-5">
            <div className="flex items-center justify-between">
              <span className="muted text-sm">Detection Engine</span>
              <span className="badge badge--ok">OK</span>
            </div>
            <div className="mt-2 text-xl font-semibold">99.99% uptime</div>
          </CardTilt>

          <CardTilt className="card-premium card-hover p-5">
            <div className="flex items-center justify-between">
              <span className="muted text-sm">Deception Layer</span>
              <span className="badge badge--ok">OK</span>
            </div>
            <div className="mt-2 text-xl font-semibold">8 traps live</div>
          </CardTilt>

          <CardTilt className="card-premium card-hover p-5">
            <div className="flex items-center justify-between">
              <span className="muted text-sm">API Latency</span>
              <span className={`badge ${apiError ? "badge--err" : "badge--ok"}`}>
                {apiError ? "Offline" : "Fast"}
              </span>
            </div>
            <div className="mt-2 text-xl font-semibold">&lt; 90ms</div>
          </CardTilt>
        </div>
      </div>

      {/* ================= ANIMATED CHART ================= */}
      <div className="section">
        <ThreatActivityChart />
      </div>
    </main>
  );
}