"use client";

import { useEffect, useState } from "react";
import { Shield, AlertTriangle, Filter, RefreshCw, Ban, X } from "lucide-react";

// Types
type Threat = {
  id: number;
  timestamp: string;
  source_ip: string;
  threat_type: string;
  severity: "critical" | "high" | "medium" | "low";
  description: string;
  status: "active" | "blocked" | "dismissed";
  details?: Record<string, any>;
  created_at: string;
  updated_at: string;
};

type ThreatStats = {
  total_threats: number;
  severity_breakdown: Record<string, number>;
  status_breakdown: Record<string, number>;
  last_updated: string;
};

export default function ThreatsPage() {
  const [threats, setThreats] = useState<Threat[]>([]);
  const [stats, setStats] = useState<ThreatStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Fetch threats
  const fetchThreats = async () => {
    try {
      setIsLoading(true);
      
      // Build query params
      const params = new URLSearchParams();
      if (severityFilter !== "all") params.append("severity", severityFilter);
      if (statusFilter !== "all") params.append("status", statusFilter);
      
      const url = `http://localhost:8000/api/threats?${params.toString()}`;
      const response = await fetch(url);
      
      if (!response.ok) throw new Error("Failed to fetch threats");
      
      const data: Threat[] = await response.json();
      setThreats(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching threats:", err);
      setError("Could not load threats");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/threats/stats");
      if (!response.ok) throw new Error("Failed to fetch stats");
      const data: ThreatStats = await response.json();
      setStats(data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  // Block threat
  const blockThreat = async (threatId: number) => {
    try {
      const response = await fetch("http://localhost:8000/api/threats/block", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threat_id: threatId, action: "block" }),
      });
      
      if (!response.ok) throw new Error("Failed to block threat");
      
      // Refresh threats
      await fetchThreats();
      await fetchStats();
    } catch (err) {
      console.error("Error blocking threat:", err);
      alert("Failed to block threat");
    }
  };

  // Dismiss threat
  const dismissThreat = async (threatId: number) => {
    try {
      const response = await fetch("http://localhost:8000/api/threats/dismiss", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threat_id: threatId, action: "dismiss" }),
      });
      
      if (!response.ok) throw new Error("Failed to dismiss threat");
      
      // Refresh threats
      await fetchThreats();
      await fetchStats();
    } catch (err) {
      console.error("Error dismissing threat:", err);
      alert("Failed to dismiss threat");
    }
  };

  // Initial load
  useEffect(() => {
    fetchThreats();
    fetchStats();
  }, [severityFilter, statusFilter]);

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };

  // Severity badge class
  const getSeverityBadgeClass = (severity: string) => {
    switch (severity) {
      case "critical": return "badge badge--err";
      case "high": return "badge badge--warn";
      case "medium": return "badge badge--info";
      case "low": return "badge badge--ok";
      default: return "badge";
    }
  };

  // Status badge class
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "active": return "badge badge--err";
      case "blocked": return "badge badge--ok";
      case "dismissed": return "badge";
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
              Threat Management
            </h1>
            <p className="mt-2 text-muted-foreground">
              Monitor and respond to security threats in real-time
            </p>
          </div>
          
          <button
            onClick={() => {
              fetchThreats();
              fetchStats();
            }}
            className="btn btn-primary"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="section">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card-premium p-5">
              <div className="text-sm text-muted-foreground">Total Threats</div>
              <div className="text-3xl font-bold text-foreground mt-1">
                {stats.total_threats}
              </div>
            </div>

            <div className="card-premium p-5">
              <div className="text-sm text-muted-foreground">Critical</div>
              <div className="text-3xl font-bold text-red-500 mt-1">
                {stats.severity_breakdown.critical || 0}
              </div>
            </div>

            <div className="card-premium p-5">
              <div className="text-sm text-muted-foreground">Active</div>
              <div className="text-3xl font-bold text-yellow-500 mt-1">
                {stats.status_breakdown.active || 0}
              </div>
            </div>

            <div className="card-premium p-5">
              <div className="text-sm text-muted-foreground">Blocked</div>
              <div className="text-3xl font-bold text-green-500 mt-1">
                {stats.status_breakdown.blocked || 0}
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
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Filters:</span>
            </div>

            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-4 py-2 rounded-lg bg-card border border-border text-foreground"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 rounded-lg bg-card border border-border text-foreground"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
              <option value="dismissed">Dismissed</option>
            </select>

            <div className="ml-auto text-sm text-muted-foreground">
              {threats.length} threats
            </div>
          </div>

          {/* Loading / Error */}
          {isLoading && (
            <div className="text-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="mt-4 text-muted-foreground">Loading threats...</p>
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
                    <th>Time</th>
                    <th>Source IP</th>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Severity</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {threats.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-muted-foreground">
                        No threats found
                      </td>
                    </tr>
                  ) : (
                    threats.map((threat) => (
                      <tr key={threat.id}>
                        <td className="font-mono text-sm">
                          {formatTime(threat.timestamp)}
                        </td>
                        <td className="font-mono text-sm text-blue-400">
                          {threat.source_ip}
                        </td>
                        <td className="font-semibold">{threat.threat_type}</td>
                        <td className="max-w-xs truncate">{threat.description}</td>
                        <td>
                          <span className={getSeverityBadgeClass(threat.severity)}>
                            {threat.severity}
                          </span>
                        </td>
                        <td>
                          <span className={getStatusBadgeClass(threat.status)}>
                            {threat.status}
                          </span>
                        </td>
                        <td>
                          <div className="flex gap-2">
                            {threat.status === "active" && (
                              <>
                                <button
                                  onClick={() => blockThreat(threat.id)}
                                  className="btn btn-ghost text-red-500 hover:bg-red-500/10"
                                  title="Block Threat"
                                >
                                  <Ban className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => dismissThreat(threat.id)}
                                  className="btn btn-ghost hover:bg-muted"
                                  title="Dismiss Threat"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </>
                            )}
                            {threat.status !== "active" && (
                              <span className="text-xs text-muted-foreground">
                                {threat.status}
                              </span>
                            )}
                          </div>
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