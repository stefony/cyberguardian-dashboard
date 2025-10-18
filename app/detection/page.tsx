"use client";

import { useEffect, useState } from "react";
import { Shield, Activity, Search, PlayCircle, Clock, AlertTriangle } from "lucide-react";

// Types
type Scan = {
  id: number;
  scan_type: string;
  status: string;
  started_at: string;
  completed_at?: string;
  duration_seconds?: number;
  items_scanned: number;
  threats_found: number;
  results?: Record<string, any>;
};

type DetectionStatus = {
  engine_status: string;
  last_scan?: string;
  active_scans: number;
  total_scans_today: number;
  threats_detected_today: number;
};

export default function DetectionPage() {
  const [scans, setScans] = useState<Scan[]>([]);
  const [status, setStatus] = useState<DetectionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  
  // Filters
  const [scanTypeFilter, setScanTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Fetch detection status
  const fetchStatus = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/detection/status");
      if (!response.ok) throw new Error("Failed to fetch status");
      const data: DetectionStatus = await response.json();
      setStatus(data);
    } catch (err) {
      console.error("Error fetching status:", err);
    }
  };

  // Fetch scans
  const fetchScans = async () => {
    try {
      setIsLoading(true);
      
      const params = new URLSearchParams();
      if (scanTypeFilter !== "all") params.append("scan_type", scanTypeFilter);
      if (statusFilter !== "all") params.append("status", statusFilter);
      
      const url = `http://localhost:8000/api/detection/scans?${params.toString()}`;
      const response = await fetch(url);
      
      if (!response.ok) throw new Error("Failed to fetch scans");
      
      const data: Scan[] = await response.json();
      setScans(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching scans:", err);
      setError("Could not load scans");
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger manual scan
  const triggerScan = async (scanType: string) => {
    try {
      setIsScanning(true);
      
      const response = await fetch("http://localhost:8000/api/detection/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scan_type: scanType }),
      });
      
      if (!response.ok) throw new Error("Failed to trigger scan");
      
      // Refresh data
      await fetchScans();
      await fetchStatus();
      
      alert(`${scanType} scan started successfully!`);
    } catch (err) {
      console.error("Error triggering scan:", err);
      alert("Failed to start scan");
    } finally {
      setIsScanning(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchScans();
    fetchStatus();
  }, [scanTypeFilter, statusFilter]);

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", { 
      month: "short", 
      day: "numeric", 
      hour: "2-digit", 
      minute: "2-digit" 
    });
  };

  // Format duration
  const formatDuration = (seconds?: number) => {
    if (!seconds) return "N/A";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  // Status badge class
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "running": return "badge badge--info";
      case "completed": return "badge badge--ok";
      case "failed": return "badge badge--err";
      default: return "badge";
    }
  };

  // Scan type badge class
  const getScanTypeBadgeClass = (type: string) => {
    switch (type) {
      case "full": return "badge badge--warn";
      case "quick": return "badge badge--info";
      case "custom": return "badge";
      default: return "badge";
    }
  };

  return (
    <main className="pb-12">
      {/* Hero */}
      <div className="page-container page-hero pt-12 md:pt-16">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="heading-accent gradient-cyber text-3xl md:text-4xl font-bold tracking-tight">
              Detection Engine
            </h1>
            <p className="mt-2 text-muted-foreground">
              Real-time threat detection and system scanning
            </p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => triggerScan("quick")}
              className="btn btn-ghost"
              disabled={isScanning}
            >
              <Search className="h-4 w-4" />
              Quick Scan
            </button>
            <button
              onClick={() => triggerScan("full")}
              className="btn btn-primary"
              disabled={isScanning}
            >
              <PlayCircle className={`h-4 w-4 ${isScanning ? "animate-spin" : ""}`} />
              Full Scan
            </button>
          </div>
        </div>
      </div>

      {/* Status Cards */}
      {status && (
        <div className="section">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="card-premium p-5 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-500/30">
              <div className="flex items-center gap-3 mb-2">
                <Shield className={`h-5 w-5 ${status.engine_status === "active" ? "text-green-500" : "text-muted-foreground"}`} />
                <div className="text-sm text-muted-foreground">Engine Status</div>
              </div>
              <div className={`text-2xl font-bold ${status.engine_status === "active" ? "text-green-500" : "text-muted-foreground"}`}>
                {status.engine_status}
              </div>
            </div>

           <div className="card-premium p-5 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/30">
              <div className="flex items-center gap-3 mb-2">
                <Activity className="h-5 w-5 text-blue-500" />
                <div className="text-sm text-muted-foreground">Active Scans</div>
              </div>
              <div className="text-2xl font-bold text-blue-500">
                {status.active_scans}
              </div>
            </div>

           <div className="card-premium p-5 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/30">
              <div className="flex items-center gap-3 mb-2">
                <Search className="h-5 w-5 text-purple-500" />
                <div className="text-sm text-muted-foreground">Scans Today</div>
              </div>
              <div className="text-2xl font-bold text-purple-500">
                {status.total_scans_today}
              </div>
            </div>

           <div className="card-premium p-5 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/30">
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <div className="text-sm text-muted-foreground">Threats Found</div>
              </div>
              <div className="text-2xl font-bold text-red-500">
                {status.threats_detected_today}
              </div>
            </div>

            <div className="card-premium p-5 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/30">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div className="text-sm text-muted-foreground">Last Scan</div>
              </div>
              <div className="text-sm font-mono text-muted-foreground truncate">
                {status.last_scan ? formatTime(status.last_scan) : "Never"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters & Table */}
      <div className="section">
        <div className="card-premium p-6">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <h2 className="text-xl font-semibold">Scan History</h2>

            <select
  value={scanTypeFilter}
  onChange={(e) => setScanTypeFilter(e.target.value)}
  className="px-4 py-2 rounded-lg bg-card border-2 border-border text-foreground ml-auto transition-all duration-300 hover:border-purple-400 hover:bg-purple-500/5 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer relative z-50"
  style={{ 
    pointerEvents: 'auto',
    colorScheme: 'dark'
  }}
>
  <option value="all" className="bg-[#0a0e27] text-white">All Types</option>
  <option value="full" className="bg-[#0a0e27] text-white">Full Scan</option>
  <option value="quick" className="bg-[#0a0e27] text-white">Quick Scan</option>
  <option value="custom" className="bg-[#0a0e27] text-white">Custom Scan</option>
</select>

          <select
  value={statusFilter}
  onChange={(e) => setStatusFilter(e.target.value)}
  className="px-4 py-2 rounded-lg bg-card border-2 border-border text-foreground transition-all duration-300 hover:border-cyan-400 hover:bg-cyan-500/5 focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer relative z-50"
  style={{ 
    pointerEvents: 'auto',
    colorScheme: 'dark'
  }}
>
  <option value="all" className="bg-[#0a0e27] text-white">All Statuses</option>
  <option value="running" className="bg-[#0a0e27] text-white">Running</option>
  <option value="completed" className="bg-[#0a0e27] text-white">Completed</option>
  <option value="failed" className="bg-[#0a0e27] text-white">Failed</option>
</select>

            <div className="text-sm text-muted-foreground">
              {scans.length} scans
            </div>
          </div>

          {/* Loading / Error */}
          {isLoading && (
            <div className="text-center py-12">
              <Activity className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="mt-4 text-muted-foreground">Loading scans...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <AlertTriangle className="h-8 w-8 mx-auto text-red-500" />
              <p className="mt-4 text-red-500">{error}</p>
            </div>
          )}

          {/* Table */}
          {!isLoading && !error && (
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Type</th>
                    <th>Started</th>
                    <th>Duration</th>
                    <th>Items Scanned</th>
                    <th>Threats Found</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {scans.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-muted-foreground">
                        No scans found
                      </td>
                    </tr>
                  ) : (
                    scans.map((scan) => (
                      <tr key={scan.id}>
                        <td className="font-mono text-sm">#{scan.id}</td>
                        <td>
                          <span className={getScanTypeBadgeClass(scan.scan_type)}>
                            {scan.scan_type}
                          </span>
                        </td>
                        <td className="text-sm">{formatTime(scan.started_at)}</td>
                        <td className="font-mono text-sm">
                          {formatDuration(scan.duration_seconds)}
                        </td>
                        <td className="text-center font-semibold">
                          {scan.items_scanned.toLocaleString()}
                        </td>
                        <td className="text-center">
                          <span className={scan.threats_found > 0 ? "text-red-500 font-bold" : "text-muted-foreground"}>
                            {scan.threats_found}
                          </span>
                        </td>
                        <td>
                          <span className={getStatusBadgeClass(scan.status)}>
                            {scan.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}