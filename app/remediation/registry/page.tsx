"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  AlertTriangle,
  Database,
  Search,
  Trash2,
  RotateCcw,
  Shield,
  RefreshCw,
  Info,
  History,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { remediationApi } from "@/lib/api";
import { toast } from "sonner";

interface RegistryEntry {
  id: string;
  hive: string;
  key_path: string;
  value_name: string;
  value_data: string;
  value_type: string;
  risk_score: number;
  indicators: string[];
  scanned_at: string;
}

interface RegistryStats {
  total_suspicious: number;
  critical_risk: number;
  high_risk: number;
  medium_risk: number;
  low_risk: number;
  by_hive: Record<string, number>;
}

interface BackupFile {
  filename: string;
  filepath: string;
  hive: string;
  key_path: string;
  value_name: string;
  backed_up_at: string;
}

export default function RegistryCleanupPage() {
  const [scanning, setScanning] = useState(false);
  const [entries, setEntries] = useState<RegistryEntry[]>([]);
  const [stats, setStats] = useState<RegistryStats | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all");
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);
  const [backups, setBackups] = useState<BackupFile[]>([]);
  const [showBackups, setShowBackups] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    handleScan();
    loadBackups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScan = async () => {
    setScanning(true);
    try {
      const response = await remediationApi.scanRegistry();

      if (response.success && response.data) {
        setEntries(response.data.entries);
        setStats(response.data.statistics);

        toast("Scan Complete", {
          description: `Found ${response.data.entries.length} suspicious registry entries`,
        });
      } else {
        toast.error("Scan Failed", {
          description: response.error || "Failed to scan registry",
        });
      }
    } catch (error) {
      toast.error("Error", {
        description: "An error occurred while scanning",
      });
    } finally {
      setScanning(false);
    }
  };

  const loadBackups = async () => {
    try {
      const response = await remediationApi.listRegistryBackups();
      if (response.success && response.data) {
        setBackups(response.data.backups);
      }
    } catch (error) {
      console.error("Failed to load backups:", error);
    }
  };

  const handleRemove = async (entry: RegistryEntry) => {
    if (
      !confirm(
        `Are you sure you want to remove this registry entry?\n\n${entry.hive}\\${entry.key_path}\\${entry.value_name}\n\nA backup will be created automatically.`
      )
    ) {
      return;
    }

    setRemoving(entry.id);
    try {
      const response = await remediationApi.removeRegistryEntry({
        hive: entry.hive,
        key_path: entry.key_path,
        value_name: entry.value_name,
      });

      if (response.success && response.data?.success) {
        toast("Entry Removed", {
          description: `Registry entry removed successfully. Backup: ${response.data.backup_file}`,
        });
        await handleScan();
        await loadBackups();
      } else {
        toast.error("Removal Failed", {
          description:
            response.data?.message || response.error || "Failed to remove entry",
        });
      }
    } catch (error) {
      toast.error("Error", {
        description: "An error occurred during removal",
      });
    } finally {
      setRemoving(null);
    }
  };

  const handleRestore = async (backup: BackupFile) => {
    if (
      !confirm(
        `Restore this registry entry?\n\n${backup.hive}\\${backup.key_path}\\${backup.value_name}`
      )
    ) {
      return;
    }

    try {
      const response = await remediationApi.restoreRegistryEntry({
        backup_file: backup.filepath,
      });

      if (response.success && response.data?.success) {
        toast("Entry Restored", {
          description: response.data.message,
        });
        await handleScan();
        await loadBackups();
      } else {
        toast.error("Restore Failed", {
          description:
            response.data?.message || response.error || "Failed to restore entry",
        });
      }
    } catch (error) {
      toast.error("Error", {
        description: "An error occurred during restore",
      });
    }
  };

  const getRiskBadge = (score: number) => {
    if (score >= 80) {
      return <Badge className="bg-red-500/20 text-red-400">Critical ({score})</Badge>;
    } else if (score >= 60) {
      return (
        <Badge className="bg-orange-500/20 text-orange-400">High ({score})</Badge>
      );
    } else if (score >= 40) {
      return (
        <Badge className="bg-yellow-500/20 text-yellow-400">Medium ({score})</Badge>
      );
    } else {
      return <Badge className="bg-blue-500/20 text-blue-400">Low ({score})</Badge>;
    }
  };

  const filteredEntries = entries.filter((entry) => {
    const q = searchQuery.toLowerCase();

    const matchesSearch =
      entry.value_name.toLowerCase().includes(q) ||
      entry.value_data.toLowerCase().includes(q) ||
      entry.key_path.toLowerCase().includes(q);

    const matchesSeverity =
      selectedSeverity === "all" ||
      (selectedSeverity === "critical" && entry.risk_score >= 80) ||
      (selectedSeverity === "high" &&
        entry.risk_score >= 60 &&
        entry.risk_score < 80) ||
      (selectedSeverity === "medium" &&
        entry.risk_score >= 40 &&
        entry.risk_score < 60) ||
      (selectedSeverity === "low" && entry.risk_score < 40);

    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Database className="h-8 w-8 text-blue-500" />
            Registry Cleanup
          </h1>
          <p className="text-muted-foreground mt-2">
            Scan and remove malicious Windows registry entries
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowBackups(!showBackups)}>
            <History className="mr-2 h-4 w-4" />
            Backups ({backups.length})
          </Button>
          <Button onClick={handleScan} disabled={scanning}>
            {scanning ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Scan Registry
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-5">
          <Card
            className="cursor-pointer hover:border-primary/50 transition-all"
            onClick={() => setSelectedSeverity("all")}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_suspicious}</div>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:border-red-500/50 transition-all"
            onClick={() => setSelectedSeverity("critical")}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">
                {stats.critical_risk}
              </div>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:border-orange-500/50 transition-all"
            onClick={() => setSelectedSeverity("high")}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">
                {stats.high_risk}
              </div>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:border-yellow-500/50 transition-all"
            onClick={() => setSelectedSeverity("medium")}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Medium</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">
                {stats.medium_risk}
              </div>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:border-blue-500/50 transition-all"
            onClick={() => setSelectedSeverity("low")}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low</CardTitle>
              <Info className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">
                {stats.low_risk}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Backups Panel */}
      {showBackups && (
        <Card>
          <CardHeader>
            <CardTitle>Registry Backups</CardTitle>
            <CardDescription>
              Restore previously removed registry entries
            </CardDescription>
          </CardHeader>
          <CardContent>
            {backups.length === 0 ? (
              <p className="text-sm text-muted-foreground">No backups available</p>
            ) : (
              <div className="space-y-2">
                {backups.map((backup) => (
                  <div
                    key={backup.filename}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium">{backup.value_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {backup.hive}\{backup.key_path}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(backup.backed_up_at).toLocaleString()}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRestore(backup)}
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Restore
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by name, value, or path..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <Badge
          variant={selectedSeverity === "all" ? "default" : "outline"}
          className="cursor-pointer px-4"
          onClick={() => setSelectedSeverity("all")}
        >
          All
        </Badge>
      </div>

      {/* Entries Table */}
      <Card>
        <CardHeader>
          <CardTitle>Suspicious Registry Entries</CardTitle>
          <CardDescription>
            Found {filteredEntries.length} entries matching your criteria
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredEntries.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No suspicious entries found</p>
              <p className="text-sm text-muted-foreground">
                {entries.length === 0
                  ? "Click 'Scan Registry' to start scanning"
                  : "Try adjusting your filters"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredEntries.map((entry) => (
                <div key={entry.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <button
                          onClick={() =>
                            setExpandedEntry(
                              expandedEntry === entry.id ? null : entry.id
                            )
                          }
                        >
                          {expandedEntry === entry.id ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </button>
                        <p className="font-medium">{entry.value_name}</p>
                        {getRiskBadge(entry.risk_score)}
                      </div>
                      <p className="text-xs text-muted-foreground ml-6">
                        {entry.hive}\{entry.key_path}
                      </p>
                      {expandedEntry === entry.id && (
                        <div className="mt-4 ml-6 space-y-2 border-l-2 border-primary/20 pl-4">
                          <div>
                            <p className="text-xs font-medium">Value Data:</p>
                            <p className="text-xs text-muted-foreground break-all">
                              {entry.value_data}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-medium">Type:</p>
                            <p className="text-xs text-muted-foreground">
                              {entry.value_type}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-medium">Indicators:</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {entry.indicators.map((indicator, idx) => (
                                <Badge
                                  key={idx}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {indicator}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRemove(entry)}
                      disabled={removing === entry.id}
                    >
                      {removing === entry.id ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Warning */}
      <Alert className="border-yellow-500/50 bg-yellow-500/10">
        <AlertTriangle className="h-4 w-4 text-yellow-500" />
        <AlertDescription>
          <strong>Warning:</strong> Removing registry entries can affect system
          stability. All entries are automatically backed up before removal and can
          be restored if needed.
        </AlertDescription>
      </Alert>
    </div>
  );
}
