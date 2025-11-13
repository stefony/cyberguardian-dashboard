'use client';

import { useState, useEffect } from 'react';
import { 
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  ClockIcon,
  DocumentArrowDownIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

interface ConfigBackup {
  filename: string;
  path: string;
  size_bytes: number;
  created_at: string;
}

interface ExportConfig {
  config_version: string;
  exported_at: string;
  cyberguardian_version: string;
  sections: {
    protection?: any;
    exclusions?: any[];
    scan_schedules?: any[];
    update_settings?: any;
  };
}

export default function ConfigurationPage() {
  const [backups, setBackups] = useState<ConfigBackup[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [lastExport, setLastExport] = useState<ExportConfig | null>(null);

  // Fetch backups
  const fetchBackups = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/configuration/backups');
      const data = await response.json();
      if (data.success) {
        setBackups(data.backups);
      }
    } catch (error) {
      console.error('Error fetching backups:', error);
    }
  };

  // Export configuration
  const exportConfiguration = async () => {
    setExporting(true);
    try {
      const response = await fetch('http://localhost:8000/api/configuration/export');
      const data = await response.json();
      
      if (data.success) {
        setLastExport(data.config);
        
        // Download as JSON file
        const blob = new Blob([JSON.stringify(data.config, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cyberguardian_config_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        alert('Configuration exported successfully!');
      }
    } catch (error) {
      console.error('Error exporting configuration:', error);
      alert('Error exporting configuration');
    } finally {
      setExporting(false);
    }
  };

  // Import configuration from file
  const importConfiguration = async (file: File) => {
    setImporting(true);
    try {
      const text = await file.text();
      const config = JSON.parse(text);
      
      // Validate first
      const validateResponse = await fetch('http://localhost:8000/api/configuration/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      
      const validateData = await validateResponse.json();
      
      if (!validateData.valid) {
        alert('Invalid configuration file');
        return;
      }
      
      // Import
      const importResponse = await fetch('http://localhost:8000/api/configuration/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      
      const importData = await importResponse.json();
      
      if (importData.success) {
        alert('Configuration imported successfully!');
        await fetchBackups();
      } else {
        alert('Configuration import failed: ' + (importData.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error importing configuration:', error);
      alert('Error importing configuration');
    } finally {
      setImporting(false);
    }
  };

  // Download backup
  const downloadBackup = async (filename: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/configuration/backups/${filename}/download`);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading backup:', error);
      alert('Error downloading backup');
    }
  };

  // Restore backup
  const restoreBackup = async (filename: string) => {
    if (!confirm(`Are you sure you want to restore from ${filename}? Current configuration will be backed up.`)) {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:8000/api/configuration/backups/${filename}/restore`, {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Configuration restored successfully!');
        await fetchBackups();
      } else {
        alert('Restore failed: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error restoring backup:', error);
      alert('Error restoring backup');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchBackups();
      setLoading(false);
    };
    loadData();
  }, []);

  const formatBytes = (bytes: number) => {
    const kb = bytes / 1024;
    return `${kb.toFixed(2)} KB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Configuration Management</h1>
        <p className="text-gray-600">Export, import, and manage system configuration backups</p>
      </div>

      {/* Export/Import Actions */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Configuration Actions</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Export */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 transition-colors">
            <div className="text-center">
              <ArrowDownTrayIcon className="h-12 w-12 mx-auto mb-3 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Export Configuration</h3>
              <p className="text-sm text-gray-600 mb-4">
                Download current system configuration as JSON file
              </p>
              <button
                onClick={exportConfiguration}
                disabled={exporting}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                {exporting ? 'Exporting...' : 'Export Configuration'}
              </button>
            </div>
          </div>

          {/* Import */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-green-500 transition-colors">
            <div className="text-center">
              <ArrowUpTrayIcon className="h-12 w-12 mx-auto mb-3 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Import Configuration</h3>
              <p className="text-sm text-gray-600 mb-4">
                Restore system configuration from JSON file
              </p>
              <label className="block">
                <input
                  type="file"
                  accept=".json"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) importConfiguration(file);
                  }}
                  disabled={importing}
                  className="hidden"
                />
                <span className="w-full inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors cursor-pointer">
                  {importing ? 'Importing...' : 'Import Configuration'}
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Last Export Info */}
      {lastExport && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <CheckCircleIcon className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-blue-900 mb-1">
                Configuration Exported Successfully
              </h3>
              <div className="text-xs text-blue-700 space-y-1">
                <p>Version: {lastExport.cyberguardian_version}</p>
                <p>Exported: {formatDate(lastExport.exported_at)}</p>
                <p>Config Version: {lastExport.config_version}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backups List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Configuration Backups</h2>
          <button
            onClick={fetchBackups}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Refresh
          </button>
        </div>

        {backups.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <DocumentArrowDownIcon className="h-16 w-16 mx-auto mb-3 text-gray-400" />
            <p className="text-lg mb-1">No backups available</p>
            <p className="text-sm">Backups are created automatically when importing configurations</p>
          </div>
        ) : (
          <div className="space-y-3">
            {backups.map((backup) => (
              <div 
                key={backup.filename}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <ClockIcon className="h-5 w-5 text-gray-400" />
                      <h3 className="font-semibold text-gray-900">{backup.filename}</h3>
                    </div>
                    <div className="text-sm text-gray-600 space-x-4">
                      <span>Size: {formatBytes(backup.size_bytes)}</span>
                      <span>Created: {formatDate(backup.created_at)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => downloadBackup(backup.filename)}
                      className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Download
                    </button>
                    <button
                      onClick={() => restoreBackup(backup.filename)}
                      className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Restore
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <ExclamationCircleIcon className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-yellow-900 mb-2">Important Notes</h3>
            <ul className="text-xs text-yellow-800 space-y-1 list-disc list-inside">
              <li>Backups are created automatically before importing configurations</li>
              <li>Exported configurations include: protection settings, exclusions, scan schedules, and update settings</li>
              <li>Restoring a backup will override current configuration</li>
              <li>Keep exported configuration files secure as they contain system settings</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}