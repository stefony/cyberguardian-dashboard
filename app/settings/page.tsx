"use client";

import { useEffect, useState } from "react";
import { Settings as SettingsIcon, Bell, Palette, Shield, Info, Key, Save, RotateCcw, Check } from "lucide-react";
import { settingsApi } from "@/lib/api"; 

// Types
type NotificationSettings = {
  email_alerts: boolean;
  desktop_alerts: boolean;
  critical_only: boolean;
  alert_sound: boolean;
};

type AppearanceSettings = {
  theme: string;
  compact_mode: boolean;
  animations_enabled: boolean;
};

type SecuritySettings = {
  auto_block_threats: boolean;
  honeypots_enabled: boolean;
  real_time_scanning: boolean;
  quarantine_auto: boolean;
};

type Settings = {
  notifications: NotificationSettings;
  appearance: AppearanceSettings;
  security: SecuritySettings;
  last_updated: string;
};

type SystemInfo = {
  os: string;
  os_version: string;
  python_version: string;
  cpu_count: number;
  total_memory_gb: number;
  hostname: string;
};

type LicenseInfo = {
  license_type: string;
  status: string;
  expires_at: string | null;
  features: string[];
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [licenseInfo, setLicenseInfo] = useState<LicenseInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch settings
 const fetchSettings = async () => {
  try {
    setIsLoading(true);
    const response = await settingsApi.getSettings();
    if (response.success) {
      setSettings(response.data || null);
      setError(null);
    } else {
      setError(response.error || "Could not load settings");
    }
  } catch (err) {
    console.error("Error fetching settings:", err);
    setError("Could not load settings");
  } finally {
    setIsLoading(false);
  }
};

  // Fetch system info
const fetchSystemInfo = async () => {
  try {
    const response = await settingsApi.getSystemInfo();
    if (response.success) {
      setSystemInfo(response.data || null);
    }
  } catch (err) {
    console.error("Error fetching system info:", err);
  }
};

  // Fetch license info
const fetchLicenseInfo = async () => {
  try {
    const response = await settingsApi.getLicense();
    if (response.success) {
      setLicenseInfo(response.data || null);
    }
  } catch (err) {
    console.error("Error fetching license info:", err);
  }
};

  // Save settings
const handleSave = async () => {
  if (!settings) return;
  
  try {
    setIsSaving(true);
    const response = await settingsApi.saveSettings(settings);
    
    if (response.success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } else {
      alert(response.error || "Failed to save settings");
    }
  } catch (err) {
    console.error("Error saving settings:", err);
    alert("Failed to save settings");
  } finally {
    setIsSaving(false);
  }
};

  // Reset settings
const handleReset = async () => {
  if (!confirm("Are you sure you want to reset all settings to default?")) return;
  
  try {
    const response = await settingsApi.resetSettings();
    
    if (response.success) {
      await fetchSettings();
      alert("Settings reset to default successfully!");
    } else {
      alert(response.error || "Failed to reset settings");
    }
  } catch (err) {
    console.error("Error resetting settings:", err);
    alert("Failed to reset settings");
  }
};

  // Initial load
  useEffect(() => {
    fetchSettings();
    fetchSystemInfo();
    fetchLicenseInfo();
  }, []);

  // Update settings helper
  const updateSettings = (section: keyof Settings, key: string, value: any) => {
    if (!settings) return;
    setSettings({
      ...settings,
      [section]: {
        ...(settings[section] as any),
        [key]: value,
      },
    });
  };

  // Toggle component
  const Toggle = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300
        ${enabled ? 'bg-purple-500' : 'bg-gray-600'}
        hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900
      `}
    >
      <span
        className={`
          inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300
          ${enabled ? 'translate-x-6' : 'translate-x-1'}
        `}
      />
    </button>
  );

  if (isLoading) {
    return (
      <main className="section text-center py-12">
        <SettingsIcon className="h-8 w-8 animate-spin mx-auto text-purple-500" />
        <p className="mt-4 text-muted-foreground">Loading settings...</p>
      </main>
    );
  }

  if (error || !settings) {
    return (
      <main className="section text-center py-12">
        <SettingsIcon className="h-8 w-8 mx-auto text-red-500" />
        <p className="mt-4 text-red-500">{error || "Failed to load settings"}</p>
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
              Settings
            </h1>
            <p className="mt-2 text-muted-foreground">
              Configure your CyberGuardian preferences and system settings
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="px-4 py-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 border-2 border-red-500/30 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/50 flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </button>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 rounded-lg bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 border-2 border-purple-500/30 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saveSuccess ? (
                <>
                  <Check className="h-4 w-4" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className={`h-4 w-4 ${isSaving ? 'animate-spin' : ''}`} />
                  Save
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Notifications */}
            <div className="card-premium p-6 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Bell className="h-5 w-5 text-purple-500" />
                Notifications
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Email Alerts</div>
                    <div className="text-sm text-muted-foreground">Receive threat alerts via email</div>
                  </div>
                  <Toggle
                    enabled={settings.notifications.email_alerts}
                    onChange={() => updateSettings('notifications', 'email_alerts', !settings.notifications.email_alerts)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Desktop Alerts</div>
                    <div className="text-sm text-muted-foreground">Show desktop notifications</div>
                  </div>
                  <Toggle
                    enabled={settings.notifications.desktop_alerts}
                    onChange={() => updateSettings('notifications', 'desktop_alerts', !settings.notifications.desktop_alerts)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Critical Only</div>
                    <div className="text-sm text-muted-foreground">Only notify for critical threats</div>
                  </div>
                  <Toggle
                    enabled={settings.notifications.critical_only}
                    onChange={() => updateSettings('notifications', 'critical_only', !settings.notifications.critical_only)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Alert Sound</div>
                    <div className="text-sm text-muted-foreground">Play sound for new alerts</div>
                  </div>
                  <Toggle
                    enabled={settings.notifications.alert_sound}
                    onChange={() => updateSettings('notifications', 'alert_sound', !settings.notifications.alert_sound)}
                  />
                </div>
              </div>
            </div>

            {/* Appearance */}
            <div className="card-premium p-6 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Palette className="h-5 w-5 text-cyan-500" />
                Appearance
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Theme</div>
                    <div className="text-sm text-muted-foreground">Choose your preferred theme</div>
                  </div>
                 <select
  value={settings.appearance.theme}
  onChange={(e) => updateSettings('appearance', 'theme', e.target.value)}
  className="px-4 py-2 rounded-lg bg-card border-2 border-border text-foreground transition-all duration-300 hover:border-cyan-400 hover:bg-cyan-500/5 focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer relative z-50"
  style={{ 
    pointerEvents: 'auto',
    colorScheme: 'dark'
  }}
>
                    <option value="dark" className="bg-[#0a0e27] text-white">Dark</option>
                    <option value="light" className="bg-[#0a0e27] text-white">Light</option>
                    <option value="auto" className="bg-[#0a0e27] text-white">Auto</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Compact Mode</div>
                    <div className="text-sm text-muted-foreground">Reduce spacing and padding</div>
                  </div>
                  <Toggle
                    enabled={settings.appearance.compact_mode}
                    onChange={() => updateSettings('appearance', 'compact_mode', !settings.appearance.compact_mode)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Animations</div>
                    <div className="text-sm text-muted-foreground">Enable smooth animations</div>
                  </div>
                  <Toggle
                    enabled={settings.appearance.animations_enabled}
                    onChange={() => updateSettings('appearance', 'animations_enabled', !settings.appearance.animations_enabled)}
                  />
                </div>
              </div>
            </div>

            {/* Security */}
            <div className="card-premium p-6 transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/20">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-pink-500" />
                Security
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Auto-Block Threats</div>
                    <div className="text-sm text-muted-foreground">Automatically block detected threats</div>
                  </div>
                  <Toggle
                    enabled={settings.security.auto_block_threats}
                    onChange={() => updateSettings('security', 'auto_block_threats', !settings.security.auto_block_threats)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Honeypots Enabled</div>
                    <div className="text-sm text-muted-foreground">Activate deception layer</div>
                  </div>
                  <Toggle
                    enabled={settings.security.honeypots_enabled}
                    onChange={() => updateSettings('security', 'honeypots_enabled', !settings.security.honeypots_enabled)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Real-time Scanning</div>
                    <div className="text-sm text-muted-foreground">Continuous file monitoring</div>
                  </div>
                  <Toggle
                    enabled={settings.security.real_time_scanning}
                    onChange={() => updateSettings('security', 'real_time_scanning', !settings.security.real_time_scanning)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Auto Quarantine</div>
                    <div className="text-sm text-muted-foreground">Automatically quarantine threats</div>
                  </div>
                  <Toggle
                    enabled={settings.security.quarantine_auto}
                    onChange={() => updateSettings('security', 'quarantine_auto', !settings.security.quarantine_auto)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Info */}
          <div className="space-y-6">
            {/* System Info */}
            {systemInfo && (
              <div className="card-premium p-6 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Info className="h-5 w-5 text-blue-500" />
                  System Information
                </h3>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Operating System</span>
                    <span className="font-medium">{systemInfo.os}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Hostname</span>
                    <span className="font-medium">{systemInfo.hostname}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Python Version</span>
                    <span className="font-medium">{systemInfo.python_version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">CPU Cores</span>
                    <span className="font-medium">{systemInfo.cpu_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Memory</span>
                    <span className="font-medium">{systemInfo.total_memory_gb} GB</span>
                  </div>
                </div>
              </div>
            )}

            {/* License Info */}
            {licenseInfo && (
              <div className="card-premium p-6 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Key className="h-5 w-5 text-green-500" />
                  License Information
                </h3>

                <div className="space-y-3 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">License Type</span>
                    <span className="font-medium text-green-500">{licenseInfo.license_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span className="badge badge--ok capitalize">{licenseInfo.status}</span>
                  </div>
                  {licenseInfo.expires_at && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Expires</span>
                      <span className="font-medium">{new Date(licenseInfo.expires_at).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                <div>
                  <div className="text-sm font-medium mb-2">Features</div>
                  <div className="space-y-1">
                    {licenseInfo.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="h-4 w-4 text-green-500" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}