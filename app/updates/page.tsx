'use client';

import { useState, useEffect } from 'react';
import { 
  ArrowDownTrayIcon, 
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface VersionInfo {
  version: string;
  major: number;
  minor: number;
  patch: number;
  codename: string;
  build_date: string;
  release_notes: string;
}

interface UpdateInfo {
  available: boolean;
  current_version: string;
  latest_version?: string;
  update_type?: string;
  release_date?: string;
  release_notes?: string;
  download_url?: string;
  size_bytes?: number;
  message?: string;
}

interface UpdateHistory {
  id: number;
  from_version: string;
  to_version: string;
  update_type: string;
  status: string;
  started_at: string;
  completed_at?: string;
  duration_seconds?: number;
  error_message?: string;
}

export default function UpdatesPage() {
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [updateHistory, setUpdateHistory] = useState<UpdateHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Fetch current version
  const fetchVersion = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/updates/version');
      const data = await response.json();
      if (data.success) {
        setVersionInfo(data.version);
      }
    } catch (error) {
      console.error('Error fetching version:', error);
    }
  };

  // Check for updates
  const checkForUpdates = async (force: boolean = false) => {
    setChecking(true);
    try {
      const response = await fetch(`http://localhost:8000/api/updates/check?force=${force}`);
      const data = await response.json();
      if (data.success) {
        setUpdateInfo(data);
      }
    } catch (error) {
      console.error('Error checking updates:', error);
    } finally {
      setChecking(false);
    }
  };

  // Fetch update history
  const fetchHistory = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/updates/history?limit=10');
      const data = await response.json();
      if (data.success) {
        setUpdateHistory(data.history);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  // Download update
  const downloadUpdate = async () => {
    setDownloading(true);
    try {
      const response = await fetch('http://localhost:8000/api/updates/download', {
        method: 'POST'
      });
      const data = await response.json();
      
      if (data.success) {
        alert('Update downloaded successfully!');
        await fetchHistory();
      } else {
        alert(data.message || 'Failed to download update');
      }
    } catch (error) {
      console.error('Error downloading update:', error);
      alert('Error downloading update');
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchVersion(),
        checkForUpdates(),
        fetchHistory()
      ]);
      setLoading(false);
    };
    loadData();
  }, []);

  const formatBytes = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'downloaded': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Software Updates</h1>
        <p className="text-gray-600">Manage CyberGuardian updates and version history</p>
      </div>

      {/* Current Version Card */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Current Version</h2>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            {versionInfo?.codename}
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">Version</p>
            <p className="text-2xl font-bold text-gray-900">{versionInfo?.version}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Build Date</p>
            <p className="text-lg font-semibold text-gray-700">{versionInfo?.build_date}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Codename</p>
            <p className="text-lg font-semibold text-gray-700">🏰 {versionInfo?.codename}</p>
          </div>
        </div>

        {versionInfo?.release_notes && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">{versionInfo.release_notes}</p>
          </div>
        )}
      </div>

      {/* Update Check Card */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Update Status</h2>
          <button
            onClick={() => checkForUpdates(true)}
            disabled={checking}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            <ArrowPathIcon className={`h-5 w-5 ${checking ? 'animate-spin' : ''}`} />
            <span>{checking ? 'Checking...' : 'Check for Updates'}</span>
          </button>
        </div>

        {updateInfo?.available ? (
          <div className="border-2 border-green-200 bg-green-50 rounded-lg p-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <ArrowDownTrayIcon className="h-12 w-12 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-green-900 mb-2">
                  Update Available: v{updateInfo.latest_version}
                </h3>
                <p className="text-sm text-green-700 mb-4">
                  Update Type: <span className="font-semibold capitalize">{updateInfo.update_type}</span>
                  {updateInfo.size_bytes && ` • Size: ${formatBytes(updateInfo.size_bytes)}`}
                  {updateInfo.release_date && ` • Released: ${formatDate(updateInfo.release_date)}`}
                </p>
                
                {updateInfo.release_notes && (
                  <div className="mb-4 p-4 bg-white rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Release Notes:</h4>
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                      {updateInfo.release_notes}
                    </pre>
                  </div>
                )}

                <button
                  onClick={downloadUpdate}
                  disabled={downloading}
                  className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                >
                  <ArrowDownTrayIcon className="h-5 w-5" />
                  <span>{downloading ? 'Downloading...' : 'Download Update'}</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="border-2 border-gray-200 bg-gray-50 rounded-lg p-6">
            <div className="flex items-center space-x-4">
              <CheckCircleIcon className="h-12 w-12 text-gray-400" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  You're up to date!
                </h3>
                <p className="text-sm text-gray-600">
                  {updateInfo?.message || 'No updates available at this time'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Update History */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Update History</h2>
        
        {updateHistory.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <ClockIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p>No update history available</p>
          </div>
        ) : (
          <div className="space-y-4">
            {updateHistory.map((update) => (
              <div key={update.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {update.from_version} → {update.to_version}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(update.status)}`}>
                        {update.status}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium capitalize">
                        {update.update_type}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Started: {formatDate(update.started_at)}</p>
                      {update.completed_at && (
                        <p>Completed: {formatDate(update.completed_at)}</p>
                      )}
                      {update.duration_seconds && (
                        <p>Duration: {update.duration_seconds}s</p>
                      )}
                      {update.error_message && (
                        <p className="text-red-600 flex items-center space-x-1">
                          <ExclamationTriangleIcon className="h-4 w-4" />
                          <span>{update.error_message}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}