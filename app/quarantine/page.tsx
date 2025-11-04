"use client";

import { useEffect, useState } from "react";
import {
  Shield,
  Trash2,
  RotateCcw,
  AlertTriangle,
  FileWarning,
  HardDrive,
  Clock,
  RefreshCw,
  Search,
} from "lucide-react";
import { quarantineApi } from "@/lib/api";

export default function QuarantinePage() {
  const [files, setFiles] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([loadFiles(), loadStats()]);
    setLoading(false);
  };

  const loadFiles = async () => {
    try {
      const res = await quarantineApi.getFiles();
      if (res.success && res.data) {
        setFiles(Array.isArray(res.data) ? res.data : []);
      } else {
        setFiles([]);
      }
    } catch (err) {
      console.error("Error loading files:", err);
      setFiles([]);
    }
  };

  const loadStats = async () => {
    try {
      const res = await quarantineApi.getStats();
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.error("Error loading stats:", err);
    }
  };

  const refresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleRestore = async (id: string, name: string) => {
    if (!confirm(`Restore "${name}" to original location?`)) return;

    try {
      const res = await quarantineApi.restoreFile(id);
      if (res.success) {
        alert("File restored successfully!");
        await loadData();
      } else {
        alert(`Failed to restore file: ${res.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Error restoring file:", err);
      alert("Error restoring file");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Permanently delete "${name}"? This cannot be undone!`)) return;

    try {
      const res = await quarantineApi.deleteFile(id);
      if (res.success) {
        alert("File permanently deleted");
        await loadData();
      } else {
        alert(`Failed to delete file: ${res.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Error deleting file:", err);
      alert("Error deleting file");
    }
  };

  const getThreatColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case "critical": return "text-red-500";
      case "high": return "text-orange-500";
      case "medium": return "text-yellow-500";
      case "low": return "text-green-500";
      default: return "text-gray-500";
    }
  };

  const getThreatBg = (level: string) => {
    switch (level?.toLowerCase()) {
      case "critical": return "bg-red-500/10 border-red-500/30";
      case "high": return "bg-orange-500/10 border-orange-500/30";
      case "medium": return "bg-yellow-500/10 border-yellow-500/30";
      case "low": return "bg-green-500/10 border-green-500/30";
      default: return "bg-gray-500/10 border-gray-500/30";
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const filteredFiles = files.filter((file) =>
    file.original_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.original_path?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              Quarantine Vault
            </h1>
            <p className="mt-2 text-muted-foreground">
              Isolated threats and suspicious files
            </p>
          </div>

          <button
            onClick={refresh}
            disabled={refreshing}
            className="btn btn-primary"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="section">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Total Files */}
            <div className="card-premium p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/20">
              <div className="flex items-center gap-3 mb-2">
                <FileWarning className="h-5 w-5 text-purple-400" />
                <span className="text-sm text-muted-foreground">Total Files</span>
              </div>
              <div className="text-3xl font-bold text-purple-400">
                {stats.total_files || 0}
              </div>
            </div>

            {/* Total Size */}
            <div className="card-premium p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/20">
              <div className="flex items-center gap-3 mb-2">
                <HardDrive className="h-5 w-5 text-blue-400" />
                <span className="text-sm text-muted-foreground">Total Size</span>
              </div>
              <div className="text-3xl font-bold text-blue-400">
                {formatBytes(stats.total_size_bytes || 0)}
              </div>
            </div>

            {/* Critical Threats */}
            <div className="card-premium p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-red-500/20">
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <span className="text-sm text-muted-foreground">Critical</span>
              </div>
              <div className="text-3xl font-bold text-red-400">
                {stats.threat_counts?.critical || 0}
              </div>
            </div>

            {/* High Threats */}
            <div className="card-premium p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-orange-500/20">
              <div className="flex items-center gap-3 mb-2">
                <Shield className="h-5 w-5 text-orange-400" />
                <span className="text-sm text-muted-foreground">High Risk</span>
              </div>
              <div className="text-3xl font-bold text-orange-400">
                {stats.threat_counts?.high || 0}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      {/* Search */}
<div className="section">
  <div className="card-premium p-4">
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search by filename or path..."
        className="w-full pl-10 pr-4 py-3 rounded-lg bg-card border-2 border-border text-foreground focus:border-purple-500 focus:outline-none transition-colors"
        autoComplete="off"
      />
    </div>
  </div>
</div>

      {/* Files Table */}
      <div className="section">
        <div className="card-premium p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-500" />
            Quarantined Files ({filteredFiles.length})
          </h2>

          {filteredFiles.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm
                  ? "No files match your search"
                  : "No quarantined files. Your system is clean!"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>File Name</th>
                    <th>Original Path</th>
                    <th>Size</th>
                    <th>Threat Score</th>
                    <th>Threat Level</th>
                    <th>Quarantined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFiles.map((file) => (
                    <tr key={file.id}>
                      <td className="font-medium">
                        <div className="flex items-center gap-2">
                          <FileWarning className="h-4 w-4 text-red-400" />
                          {file.original_name}
                        </div>
                      </td>
                      <td className="font-mono text-xs truncate max-w-xs" title={file.original_path}>
                        {file.original_path}
                      </td>
                      <td className="text-sm">{formatBytes(file.file_size || 0)}</td>
                      <td className={`font-bold ${getThreatColor(file.threat_level)}`}>
                        {Math.round(file.threat_score || 0)}
                      </td>
                      <td>
                        <span className={`badge border-2 ${getThreatBg(file.threat_level)}`}>
                          <span className={getThreatColor(file.threat_level)}>
                            {file.threat_level?.toUpperCase() || "UNKNOWN"}
                          </span>
                        </span>
                      </td>
                      <td className="text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {new Date(file.quarantined_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleRestore(file.id, file.original_name)}
                            className="p-2 rounded-lg hover:bg-card transition-colors group"
                            title="Restore file"
                          >
                            <RotateCcw className="h-4 w-4 text-green-500 group-hover:text-green-400" />
                          </button>
                          <button
                            onClick={() => handleDelete(file.id, file.original_name)}
                            className="p-2 rounded-lg hover:bg-card transition-colors group"
                            title="Delete permanently"
                          >
                            <Trash2 className="h-4 w-4 text-red-500 group-hover:text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}