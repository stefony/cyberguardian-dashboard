"use client";

import { useEffect, useState } from "react";
import { 
  Trash2, 
  Clock, 
  Shield, 
  AlertTriangle, 
  Save,
  Eye,
  Play,
  Zap
} from "lucide-react";
import { quarantineApi } from "@/lib/api";

interface AutoPurgeSettingsProps {
  onSettingsChanged?: () => void;
}

export default function AutoPurgeSettings({ onSettingsChanged }: AutoPurgeSettingsProps) {
  const [settings, setSettings] = useState({
    enabled: false,
    days_threshold: 30,
    auto_purge_critical: false,
    auto_purge_high: false,
    auto_purge_medium: true,
    auto_purge_low: true,
  });

  const [preview, setPreview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [executing, setExecuting] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await quarantineApi.getAutoPurgeSettings();
      if (res.success && res.data) {
        setSettings(res.data);
      }
    } catch (err) {
      console.error("Error loading settings:", err);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await quarantineApi.updateAutoPurgeSettings(settings);
      if (res.success) {
        alert("✅ Auto-purge settings saved successfully!");
        if (onSettingsChanged) onSettingsChanged();
      } else {
        alert(`❌ Failed to save: ${res.error}`);
      }
    } catch (err) {
      console.error("Error saving settings:", err);
      alert("❌ Error saving settings");
    }
    setSaving(false);
  };

  const handlePreview = async () => {
    setPreviewing(true);
    try {
      const res = await quarantineApi.previewAutoPurge();
      if (res.success && res.data) {
        setPreview(res.data);
      } else {
        alert(`❌ Failed to preview: ${res.error}`);
      }
    } catch (err) {
      console.error("Error previewing:", err);
      alert("❌ Error loading preview");
    }
    setPreviewing(false);
  };

  const handleExecute = async () => {
    if (!settings.enabled) {
      alert("⚠️ Auto-purge is disabled. Enable it first!");
      return;
    }

    if (!confirm("⚠️ Execute auto-purge now? This will permanently delete old files!")) {
      return;
    }

    setExecuting(true);
    try {
      const res = await quarantineApi.executeAutoPurge();
      if (res.success && res.data) {
        alert(`✅ Auto-purge completed!\n\nDeleted: ${res.data.deleted_count} files\nFreed: ${formatBytes(res.data.deleted_size_bytes)}`);
        setPreview(null);
        if (onSettingsChanged) onSettingsChanged();
      } else {
        alert(`❌ Failed to execute: ${res.error}`);
      }
    } catch (err) {
      console.error("Error executing:", err);
      alert("❌ Error executing auto-purge");
    }
    setExecuting(false);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  if (loading) {
    return (
      <div className="card-premium p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="card-premium p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Auto-Purge Policy
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Automatically delete old quarantined files
          </p>
        </div>

        {/* Enable Toggle */}
        <button
          onClick={() => setSettings({ ...settings, enabled: !settings.enabled })}
          className="relative inline-flex items-center cursor-pointer"
        >
          <div className={`w-14 h-7 rounded-full transition-colors ${settings.enabled ? 'bg-purple-600' : 'bg-gray-700'}`}>
            <div className={`absolute top-0.5 left-0.5 bg-white rounded-full h-6 w-6 transition-transform ${settings.enabled ? 'translate-x-7' : 'translate-x-0'}`}></div>
          </div>
          <span className="ml-3 text-sm font-medium">
            {settings.enabled ? "Enabled" : "Disabled"}
          </span>
        </button>
      </div>

      {/* Days Threshold Slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-400" />
            Delete files older than:
          </label>
          <span className="text-2xl font-bold text-purple-400">
            {settings.days_threshold} days
          </span>
        </div>

        <div className="relative">
          <input
            type="range"
            min="1"
            max="90"
            value={settings.days_threshold}
            onChange={(e) => setSettings({ ...settings, days_threshold: parseInt(e.target.value) })}
            className="slider-thumb w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${((settings.days_threshold - 1) / 89) * 100}%, #374151 ${((settings.days_threshold - 1) / 89) * 100}%, #374151 100%)`
            }}
          />
        </div>

        <div className="flex justify-between text-xs text-muted-foreground">
          <span>1 day</span>
          <span>30 days</span>
          <span>90 days</span>
        </div>
      </div>

      {/* Threat Level Toggles */}
      <div className="space-y-3">
        <label className="text-sm font-medium flex items-center gap-2">
          <Shield className="h-4 w-4 text-green-400" />
          Auto-purge by threat level:
        </label>

        <div className="grid grid-cols-2 gap-3">
          {/* Critical */}
          <button
            onClick={() => setSettings({ ...settings, auto_purge_critical: !settings.auto_purge_critical })}
            className="flex items-center gap-3 p-3 rounded-lg bg-red-500/10 border-2 border-red-500/30 hover:bg-red-500/20 transition-colors cursor-pointer text-left"
          >
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${settings.auto_purge_critical ? 'bg-red-500 border-red-500' : 'bg-gray-800 border-gray-600'}`}>
              {settings.auto_purge_critical && (
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                </svg>
              )}
            </div>
            <div className="flex-1">
              <div className="font-medium text-red-400">Critical</div>
              <div className="text-xs text-muted-foreground">Highest risk</div>
            </div>
          </button>

          {/* High */}
          <button
            onClick={() => setSettings({ ...settings, auto_purge_high: !settings.auto_purge_high })}
            className="flex items-center gap-3 p-3 rounded-lg bg-orange-500/10 border-2 border-orange-500/30 hover:bg-orange-500/20 transition-colors cursor-pointer text-left"
          >
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${settings.auto_purge_high ? 'bg-orange-500 border-orange-500' : 'bg-gray-800 border-gray-600'}`}>
              {settings.auto_purge_high && (
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                </svg>
              )}
            </div>
            <div className="flex-1">
              <div className="font-medium text-orange-400">High</div>
              <div className="text-xs text-muted-foreground">High risk</div>
            </div>
          </button>

          {/* Medium */}
          <button
            onClick={() => setSettings({ ...settings, auto_purge_medium: !settings.auto_purge_medium })}
            className="flex items-center gap-3 p-3 rounded-lg bg-yellow-500/10 border-2 border-yellow-500/30 hover:bg-yellow-500/20 transition-colors cursor-pointer text-left"
          >
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${settings.auto_purge_medium ? 'bg-yellow-500 border-yellow-500' : 'bg-gray-800 border-gray-600'}`}>
              {settings.auto_purge_medium && (
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                </svg>
              )}
            </div>
            <div className="flex-1">
              <div className="font-medium text-yellow-400">Medium</div>
              <div className="text-xs text-muted-foreground">Moderate risk</div>
            </div>
          </button>

          {/* Low */}
          <button
            onClick={() => setSettings({ ...settings, auto_purge_low: !settings.auto_purge_low })}
            className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border-2 border-green-500/30 hover:bg-green-500/20 transition-colors cursor-pointer text-left"
          >
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${settings.auto_purge_low ? 'bg-green-500 border-green-500' : 'bg-gray-800 border-gray-600'}`}>
              {settings.auto_purge_low && (
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                </svg>
              )}
            </div>
            <div className="flex-1">
              <div className="font-medium text-green-400">Low</div>
              <div className="text-xs text-muted-foreground">Low risk</div>
            </div>
          </button>
        </div>
      </div>

      {/* Preview Section */}
      {preview && (
        <div className="p-4 rounded-lg bg-blue-500/10 border-2 border-blue-500/30 space-y-2">
          <div className="flex items-center gap-2 text-blue-400 font-medium">
            <Eye className="h-4 w-4" />
            Preview Results
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Files to delete:</div>
              <div className="text-xl font-bold text-blue-400">{preview.total_count}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Space to free:</div>
              <div className="text-xl font-bold text-blue-400">{formatBytes(preview.total_size_bytes)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className={`h-4 w-4 ${saving ? "animate-spin" : ""}`} />
          {saving ? "Saving..." : "Save Settings"}
        </button>

        <button
          onClick={handlePreview}
          disabled={previewing}
          className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Eye className={`h-4 w-4 ${previewing ? "animate-spin" : ""}`} />
          {previewing ? "Loading..." : "Preview"}
        </button>

        <button
          onClick={handleExecute}
          disabled={!settings.enabled || executing}
          className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play className={`h-4 w-4 ${executing ? "animate-spin" : ""}`} />
          {executing ? "Running..." : "Execute Now"}
        </button>
      </div>

      {/* Warning */}
      <div className="flex items-start gap-3 p-4 rounded-lg bg-yellow-500/10 border-2 border-yellow-500/30">
        <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-yellow-200/90">
          <div className="font-medium mb-1">Warning</div>
          Auto-purge permanently deletes files. Make sure you understand the policy before enabling it.
        </div>
      </div>
    </div>
  );
}