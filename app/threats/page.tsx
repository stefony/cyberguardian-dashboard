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
// Batch selection state
const [selectedThreats, setSelectedThreats] = useState<Set<number>>(new Set());
const [isSelectAll, setIsSelectAll] = useState(false);
  
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

  // Toggle select all
const toggleSelectAll = () => {
  console.log('🔵 toggleSelectAll CALLED!');
  console.log('🔵 Current isSelectAll:', isSelectAll);
  console.log('🔵 Threats array:', threats);
  
  if (isSelectAll) {
    setSelectedThreats(new Set());
    setIsSelectAll(false);
  } else {
    const allIds = new Set(threats.map(t => t.id));
    console.log('🔵 All IDs:', Array.from(allIds));
    setSelectedThreats(allIds);
    setIsSelectAll(true);
  }
};

// Debug: Log when selection changes
useEffect(() => {
  console.log('🔍 Selected Threats Size:', selectedThreats.size);
  console.log('🔍 Selected Threats IDs:', Array.from(selectedThreats));
}, [selectedThreats]);

// Toggle single threat selection
const toggleThreatSelection = (threatId: number) => {
  const newSelected = new Set(selectedThreats);
  if (newSelected.has(threatId)) {
    newSelected.delete(threatId);
  } else {
    newSelected.add(threatId);
  }
  setSelectedThreats(newSelected);
  setIsSelectAll(newSelected.size === threats.length);
};

// Batch block threats
const batchBlockThreats = async () => {
  if (selectedThreats.size === 0) return;
  
  if (!confirm(`Block ${selectedThreats.size} threats?`)) return;
  
  try {
    const response = await threatsApi.batchAction({
      threat_ids: Array.from(selectedThreats),
      action: 'block',
      reason: 'Bulk block action'
    });
    
    if (response.success) {
      await fetchThreats();
      await fetchStats();
      setSelectedThreats(new Set());
      setIsSelectAll(false);
    } else {
      alert(response.error || 'Failed to block threats');
    }
  } catch (err) {
    console.error('Batch block failed:', err);
    alert('Failed to block threats');
  }
};

// Batch dismiss threats
const batchDismissThreats = async () => {
  if (selectedThreats.size === 0) return;
  
  if (!confirm(`Dismiss ${selectedThreats.size} threats?`)) return;
  
  try {
    const response = await threatsApi.batchAction({
      threat_ids: Array.from(selectedThreats),
      action: 'dismiss',
      reason: 'Bulk dismiss action'
    });
    
    if (response.success) {
      await fetchThreats();
      await fetchStats();
      setSelectedThreats(new Set());
      setIsSelectAll(false);
    } else {
      alert(response.error || 'Failed to dismiss threats');
    }
  } catch (err) {
    console.error('Batch dismiss failed:', err);
    alert('Failed to dismiss threats');
  }
};

// Batch delete threats
const batchDeleteThreats = async () => {
  if (selectedThreats.size === 0) return;
  
  if (!confirm(`Permanently delete ${selectedThreats.size} threats? This cannot be undone!`)) return;
  
  try {
    const response = await threatsApi.batchAction({
      threat_ids: Array.from(selectedThreats),
      action: 'delete',
      reason: 'Bulk delete action'
    });
    
    if (response.success) {
      await fetchThreats();
      await fetchStats();
      setSelectedThreats(new Set());
      setIsSelectAll(false);
    } else {
      alert(response.error || 'Failed to delete threats');
    }
  } catch (err) {
    console.error('Batch delete failed:', err);
    alert('Failed to delete threats');
  }
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

{/* Batch Actions */}
{selectedThreats.size > 0 && (
  <div className="mb-4 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-2 border-purple-500/30 rounded-lg animate-in fade-in slide-in-from-top-2 duration-300">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-500/20">
          <span className="text-sm font-bold text-purple-400">{selectedThreats.size}</span>
        </div>
        <div>
          <div className="text-sm font-semibold text-foreground">
            {selectedThreats.size} threat{selectedThreats.size > 1 ? 's' : ''} selected
          </div>
          <div className="text-xs text-muted-foreground">
            Choose an action to apply to selected threats
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={batchBlockThreats}
          className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/50 flex items-center gap-2 relative z-50"
          style={{ pointerEvents: 'auto' }}
        >
          <Ban className="h-4 w-4" />
          Block All
        </button>
        <button
          onClick={batchDismissThreats}
          className="px-4 py-2 rounded-lg bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 border border-yellow-500/30 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-yellow-500/50 flex items-center gap-2 relative z-50"
          style={{ pointerEvents: 'auto' }}
        >
          <X className="h-4 w-4" />
          Dismiss All
        </button>
        <button
          onClick={batchDeleteThreats}
          className="px-4 py-2 rounded-lg bg-gray-500/20 text-gray-400 hover:bg-gray-500/30 border border-gray-500/30 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-gray-500/50 flex items-center gap-2 relative z-50"
          style={{ pointerEvents: 'auto' }}
        >
          <X className="h-4 w-4" />
          Delete All
        </button>
      </div>
    </div>
  </div>
)}

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
    <th className="w-12">
      <input
        type="checkbox"
        checked={isSelectAll}
        onChange={toggleSelectAll}
        className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-primary focus:ring-primary focus:ring-offset-gray-900"
        style={{ pointerEvents: 'auto', cursor: 'pointer' }}
      />
    </th>
    <th>Time</th>
    <th>Source IP</th>
    <th>Type</th>
    <th>Description</th>
    <th>Severity</th>
    <th>Confidence</th>
    <th>Status</th>
    <th>Actions</th>
  </tr>
</thead>
<tbody>
  {threats?.length === 0 ? (
    <tr>
      <td colSpan={9} className="text-center py-8 text-muted-foreground">
        No threats found
      </td>
    </tr>
  ) : (
    threats?.map((threat) => (
      <tr key={threat.id}>
        {/* Checkbox */}
        <td>
          <input
            type="checkbox"
            checked={selectedThreats.has(threat.id)}
            onChange={() => toggleThreatSelection(threat.id)}
            className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-primary focus:ring-primary focus:ring-offset-gray-900"
            style={{ pointerEvents: 'auto', cursor: 'pointer' }}
          />
        </td>
        
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
        
        {/* Confidence Score - НОВА КОЛОНА */}
        <td>
          <div className="flex items-center gap-2">
            <div className="w-16 bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  (threat.confidence_score || 0) >= 80 ? 'bg-green-500' :
                  (threat.confidence_score || 0) >= 60 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${threat.confidence_score || 0}%` }}
              />
            </div>
            <span className="text-sm font-mono">
              {(threat.confidence_score || 0).toFixed(1)}%
            </span>
          </div>
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