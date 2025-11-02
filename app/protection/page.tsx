"use client";

import { useEffect, useState } from "react";
import {
  Shield,
  ToggleLeft,
  ToggleRight,
  FolderOpen,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { protectionApi } from "@/lib/api";

export default function ProtectionPage() {
  const [enabled, setEnabled] = useState(false);
  const [paths, setPaths] = useState<string>("");
  const [autoQuarantine, setAutoQuarantine] = useState(false);
  const [threatThreshold, setThreatThreshold] = useState(80);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadStatus();
    loadEvents();
  }, []);

  const loadStatus = async () => {
    try {
      const res = await protectionApi.getStatus();
      console.log("🟣 STATUS RESPONSE:", res);

      const ok =
        (typeof res?.success === "boolean" ? res.success : true) && (res?.data || res);
      const data = res?.data ?? res;

      if (ok && data) {
        setEnabled(!!data.enabled);
        const pathStr = Array.isArray(data.paths) ? data.paths.join("; ") : (data.paths || "");
        setPaths(pathStr);
        setAutoQuarantine(!!(data.auto_quarantine ?? data.autoQuarantine));
        setThreatThreshold(Number(data.threat_threshold ?? data.threatThreshold ?? 80));
      }
    } catch (err) {
      console.error("❌ Error loading status:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadEvents = async (limit = 100) => {
    try {
      const res = await protectionApi.getEvents(limit);
      console.log("🟣 EVENTS RESPONSE:", res);

      const data = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
        ? res
        : [];

      setEvents(data);
    } catch (err) {
      console.error("❌ Error loading events:", err);
      setEvents([]);
    }
  };

  const refresh = async () => {
    console.log("🔄 REFRESH CLICKED");
    setRefreshing(true);
    await loadEvents();
    setRefreshing(false);
  };

  const toggle = async () => {
    console.log("🔵 TOGGLE CLICKED!", {
      enabled,
      paths,
      autoQuarantine,
      threatThreshold,
    });

    setToggling(true);
    try {
      const pathList = paths
        .split(";")
        .map((s) => s.trim())
        .filter(Boolean);

      console.log("🔵 PATH LIST:", pathList);

      const res = await protectionApi.toggle(
        !enabled,
        pathList,
        autoQuarantine,
        threatThreshold
      );

      console.log("🔵 API RESPONSE:", res);

      const data = res?.data ?? res;
      if (data && typeof data.enabled === "boolean") {
        setEnabled(data.enabled);
        if (data.enabled) {
          setTimeout(refresh, 2000);
        }
      }
    } catch (err) {
      console.error("❌ Error toggling protection:", err);
    } finally {
      setToggling(false);
    }
  };

  const getSeverityColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case "critical":
        return "text-red-500";
      case "high":
        return "text-orange-500";
      case "medium":
        return "text-yellow-500";
      case "low":
        return "text-green-500";
      default:
        return "text-gray-500";
    }
  };

  const getSeverityBg = (level: string) => {
    switch (level?.toLowerCase()) {
      case "critical":
        return "bg-red-500/10 border-red-500/30";
      case "high":
        return "bg-orange-500/10 border-orange-500/30";
      case "medium":
        return "bg-yellow-500/10 border-yellow-500/30";
      case "low":
        return "bg-green-500/10 border-green-500/30";
      default:
        return "bg-gray-500/10 border-gray-500/30";
    }
  };

  if (loading) {
    return (
      <main className="pb-12">
        <div className="flex items-center justify-center h-screen">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </div>
      </main>
    );
  }

  return (
    <main className="pb-12">
      {/* Hero */}
      <div className="page-container page-hero pt-12 md:pt-16">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="heading-accent gradient-cyber text-3xl md:text-4xl font-bold tracking-tight">
              Real-Time Protection
            </h1>
            <p className="mt-2 text-muted-foreground">
              File system monitoring with ML-powered threat detection
            </p>
          </div>

          <button
            onClick={refresh}
            disabled={refreshing}
            className="btn btn-primary relative z-10 pointer-events-auto"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="section">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Protection Status */}
          <div className="card-premium p-6 transition-all duration-300 relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Shield
                  className={`h-6 w-6 ${
                    enabled ? "text-green-500" : "text-orange-500"
                  }`}
                />
                <span className="font-semibold text-lg">Protection Status</span>
              </div>
              <button
                onClick={toggle}
                disabled={toggling}
                className={`p-2 rounded-lg transition-all relative z-10 pointer-events-auto ${
                  enabled
                    ? "bg-green-500/10 hover:bg-green-500/20"
                    : "bg-orange-500/10 hover:bg-orange-500/20"
                }`}
              >
                {enabled ? (
                  <ToggleRight className="h-6 w-6 text-green-500" />
                ) : (
                  <ToggleLeft className="h-6 w-6 text-orange-500" />
                )}
              </button>
            </div>
            <div
              className={`text-2xl font-bold ${
                enabled ? "text-green-500" : "text-orange-500"
              }`}
            >
              {enabled ? "ACTIVE" : "DISABLED"}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {enabled
                ? "File system is being monitored"
                : "Click to enable protection"}
            </p>
          </div>

          {/* Watch Paths */}
          <div className="card-premium p-6 transition-all duration-300 relative">
            <div className="flex items-center gap-3 mb-4">
              <FolderOpen className="h-6 w-6 text-blue-500" />
              <span className="font-semibold text-lg">Watch Paths</span>
            </div>
            <input
              type="text"
              value={paths}
              onChange={(e) => setPaths(e.target.value)}
              placeholder="C:\\Users\\Downloads; D:\\Projects"
              className="w-full px-3 py-2 rounded-lg bg-card border-2 border-border text-foreground focus:border-blue-500 focus:outline-none"
              disabled={enabled}
            />
            <p className="text-xs text-muted-foreground mt-2">
              Separate multiple paths with semicolon (;)
            </p>
          </div>

          {/* Settings */}
          <div className="card-premium p-6 transition-all duration-300 relative">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-cyan-500" />
              <span className="font-semibold text-lg">Settings</span>
            </div>
            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <span className="text-sm">Auto-Quarantine</span>
                <input
                  type="checkbox"
                  checked={autoQuarantine}
                  onChange={(e) => setAutoQuarantine(e.target.checked)}
                  disabled={enabled}
                  className="w-4 h-4 rounded border-border"
                />
              </label>
              <div>
                <label className="text-sm block mb-1">Threat Threshold</label>
                <input
                  type="number"
                  value={threatThreshold}
                  onChange={(e) =>
                    setThreatThreshold(Number(e.target.value))
                  }
                  disabled={enabled}
                  min={0}
                  max={100}
                  className="w-full px-3 py-1 rounded-lg bg-card border-2 border-border text-foreground focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Events Table */}
      <div className="section">
        <div className="card-premium p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-purple-500" />
            File System Events ({events.length})
          </h2>

          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Event</th>
                  <th>File Path</th>
                  <th>Size</th>
                  <th>Threat Score</th>
                  <th>Level</th>
                </tr>
              </thead>
              <tbody>
                {events.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground"
                    >
                      {enabled
                        ? "No events yet. Create or modify a file in watched directories."
                        : "Enable protection to start monitoring files."}
                    </td>
                  </tr>
                ) : (
                  events.map((ev, idx) => (
                    <tr key={idx}>
                      <td className="font-mono text-sm">
                        {new Date(ev.timestamp).toLocaleTimeString()}
                      </td>
                      <td>
                        <span className="badge badge--info">
                          {ev.event_type}
                        </span>
                      </td>
                      <td
                        className="font-mono text-xs truncate max-w-xs"
                        title={ev.file_path}
                      >
                        {ev.file_path}
                      </td>
                      <td className="text-sm">
                        {ev.file_size
                          ? `${(ev.file_size / 1024).toFixed(1)} KB`
                          : "—"}
                      </td>
                      <td
                        className={`font-bold ${getSeverityColor(
                          ev.threat_level
                        )}`}
                      >
                        {Math.round(ev.threat_score || 0)}
                      </td>
                      <td>
                        <span
                          className={`badge border-2 ${getSeverityBg(
                            ev.threat_level
                          )}`}
                        >
                          {ev.threat_level?.toUpperCase() || "UNKNOWN"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
