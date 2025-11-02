"use client";


import { Shield, AlertTriangle, TrendingUp, Filter, RefreshCw, Ban, X } from "lucide-react";
import { threatsApi } from "@/lib/api";
import type { ThreatResponse, ThreatStats } from "@/lib/types";
import { useWebSocketContext } from "@/lib/contexts/WebSocketContext";
import { useEffect, useState, useCallback } from "react";

// ✅ Add here
function normalizeThreatList(resp: any): ThreatResponse[] {
  if (Array.isArray(resp)) return resp as ThreatResponse[];
  if (Array.isArray(resp?.data)) return resp.data as ThreatResponse[];
  if (Array.isArray(resp?.data?.data)) return resp.data.data as ThreatResponse[];
  if (Array.isArray(resp?.items)) return resp.items as ThreatResponse[];
  if (Array.isArray(resp?.data?.items)) return resp.data.items as ThreatResponse[];
  return [];
}

export default function ThreatsPage() {
 const [threats, setThreats] = useState<ThreatResponse[]>([]);
  const [stats, setStats] = useState<ThreatStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // WebSocket integration for live updates
const { lastMessage } = useWebSocketContext();
  
  // Filters
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

// Fetch threats
const fetchThreats = useCallback(async () => {
  try {
    setIsLoading(true);

    // Build query params
    const params: Record<string, string> = {};
    if (severityFilter !== "all") params.severity = severityFilter;
    if (statusFilter !== "all") params.status = statusFilter;

    const response = await threatsApi.getThreats(params);

    // ✅ NEW: Handle ApiResponse wrapper
    if (response.success && response.data) {
      // Backend returns array directly
      const items = Array.isArray(response.data) 
        ? response.data 
        : normalizeThreatList(response.data);
      
      setThreats(items);
      setError(null);
    } else {
      setError(response.error || "Failed to load threats");
      setThreats([]);
    }

  } catch (err) {
    console.error("Error fetching threats:", err);
    setError("Could not load threats");
    setThreats([]);
  } finally {
    setIsLoading(false);
  }
}, [severityFilter, statusFilter]);


  // Fetch stats
const fetchStats = useCallback(async () => {
  try {
    const response = await threatsApi.getStats();
    if (response.success && response.data) {
      setStats(response.data);
    }
  } catch (err) {
    console.error("Error fetching stats:", err);
  }
}, []);

  // Block threat
 const blockThreat = async (threatId: number) => {
  try {
    const response = await threatsApi.blockThreat(threatId);
    
    if (response.success) {
      // Refresh threats
      await fetchThreats();
      await fetchStats();
    } else {
      alert(response.error || "Failed to block threat");
    }
  } catch (err) {
    console.error("Error blocking threat:", err);
    alert("Failed to block threat");
  }
};

  // Dismiss threat
 const dismissThreat = async (threatId: number) => {
  try {
    const response = await threatsApi.dismissThreat(threatId);
    
    if (response.success) {
      // Refresh threats
      await fetchThreats();
      await fetchStats();
    } else {
      alert(response.error || "Failed to dismiss threat");
    }
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

  // Listen for live threat updates via WebSocket
// Listen for live threat updates via WebSocket
useEffect(() => {
  if (!lastMessage) return;
  
  if (lastMessage.type === 'threat_update') {
    console.log('🚨 New threat received via WebSocket!', lastMessage.data);
    
    // Refresh threats list
    fetchThreats();
    fetchStats();
  }
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [lastMessage]);

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
            <div className="card-premium p-5 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/30">
  <div className="flex items-center gap-3 mb-2">
    <Shield className="h-5 w-5 text-blue-500" />
    <div className="text-sm text-muted-foreground">Total Threats</div>
  </div>
  <div className="text-2xl font-bold">
    {stats.total_threats}
  </div>
</div>

            <div className="card-premium p-5 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/30">
  <div className="flex items-center gap-3 mb-2">
    <AlertTriangle className="h-5 w-5 text-red-500" />
    <div className="text-sm text-muted-foreground">Critical</div>
  </div>
  <div className="text-2xl font-bold text-red-500">
    {stats.severity_breakdown.critical || 0}
  </div>
</div>

            <div className="card-premium p-5 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-yellow-500/30">
  <div className="flex items-center gap-3 mb-2">
    <TrendingUp className="h-5 w-5 text-yellow-500" />
    <div className="text-sm text-muted-foreground">Active</div>
  </div>
  <div className="text-2xl font-bold text-yellow-500">
    {stats.status_breakdown.active || 0}
  </div>
</div>

           <div className="card-premium p-5 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-500/30">
  <div className="flex items-center gap-3 mb-2">
    <Shield className="h-5 w-5 text-green-500" />
    <div className="text-sm text-muted-foreground">Blocked</div>
  </div>
  <div className="text-2xl font-bold text-green-500">
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
  className="px-4 py-2 rounded-lg bg-card border-2 border-border text-foreground ml-auto transition-all duration-300 hover:border-purple-400 hover:bg-purple-500/5 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer relative z-50"
  style={{ 
    pointerEvents: 'auto',
    colorScheme: 'dark'
  }}
>
  <option value="all" className="bg-[#0a0e27] text-white">All Severities</option>
  <option value="critical" className="bg-[#0a0e27] text-white">Critical</option>
  <option value="high" className="bg-[#0a0e27] text-white">High</option>
  <option value="medium" className="bg-[#0a0e27] text-white">Medium</option>
  <option value="low" className="bg-[#0a0e27] text-white">Low</option>
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
  <option value="active" className="bg-[#0a0e27] text-white">Active</option>
  <option value="blocked" className="bg-[#0a0e27] text-white">Blocked</option>
  <option value="dismissed" className="bg-[#0a0e27] text-white">Dismissed</option>
</select>

            <div className="ml-auto text-sm text-muted-foreground">
              {threats?.length || 0} threats
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
                  {threats?.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-muted-foreground">
                        No threats found
                      </td>
                    </tr>
                  ) : (
                    threats?.map((threat) => (
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