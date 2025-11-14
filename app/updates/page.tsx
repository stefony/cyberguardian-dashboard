'use client';

import { useState, useEffect } from 'react';
import { 
  ArrowDownTrayIcon, 
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  RocketLaunchIcon,
  SparklesIcon,
  BoltIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { 
  CheckCircleIcon as CheckCircleSolid,
  XCircleIcon,
  ClockIcon as ClockSolid
} from '@heroicons/react/24/solid';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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
      const response = await fetch(`${API_URL}/api/updates/version`);
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
      const response = await fetch(`${API_URL}/api/updates/check?force=${force}`);
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
      const response = await fetch(`${API_URL}/api/updates/history?limit=10`);
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
      const response = await fetch(`${API_URL}/api/updates/download`, {
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
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleSolid className="h-6 w-6 text-green-500" />;
      case 'failed':
        return <XCircleIcon className="h-6 w-6 text-red-500" />;
      case 'in_progress':
        return <ClockSolid className="h-6 w-6 text-blue-500 animate-pulse" />;
      case 'downloaded':
        return <ArrowDownTrayIcon className="h-6 w-6 text-yellow-500" />;
      default:
        return <ClockSolid className="h-6 w-6 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 ring-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 ring-red-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 ring-blue-200';
      case 'downloaded':
        return 'bg-yellow-100 text-yellow-800 ring-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 ring-gray-200';
    }
  };

  const getUpdateTypeBadge = (type: string) => {
    switch (type.toLowerCase()) {
      case 'major':
        return 'bg-purple-100 text-purple-800 ring-purple-200';
      case 'minor':
        return 'bg-blue-100 text-blue-800 ring-blue-200';
      case 'patch':
        return 'bg-green-100 text-green-800 ring-green-200';
      default:
        return 'bg-gray-100 text-gray-800 ring-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="relative">
          <div className="animate-spin rounded-full h-32 w-32 border-8 border-gray-200"></div>
          <div className="animate-spin rounded-full h-32 w-32 border-t-8 border-blue-600 absolute top-0 left-0"></div>
        </div>
        <p className="mt-6 text-lg font-semibold text-gray-700 animate-pulse">Loading updates...</p>
      </div>
    );
  }

  // Calculate progress (6 out of 11 phases completed)
  const completedPhases = 6;
  const totalPhases = 11;
  const progressPercentage = (completedPhases / totalPhases) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header with Gradient */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl p-8 text-white">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-4">
              <RocketLaunchIcon className="h-10 w-10" />
              <h1 className="text-4xl font-bold">Software Updates</h1>
            </div>
            <p className="text-blue-100 text-lg">Keep your CyberGuardian AI secure and up-to-date</p>
          </div>
        </div>

        {/* Current Version - Hero Card */}
        <div className="relative overflow-hidden bg-white rounded-2xl shadow-xl">
          {/* Gradient Background Effect */}
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-50 to-transparent"></div>
          
          <div className="relative z-10 p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              
              {/* Left Side - Version Info */}
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                    <ShieldCheckIcon className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Current Version</h2>
                    <p className="text-sm text-gray-500">Actively protecting your system</p>
                  </div>
                </div>

                {/* Version Display */}
                <div className="mb-6">
                  <div className="inline-flex items-baseline space-x-3">
                    <span className="text-6xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {versionInfo?.version}
                    </span>
                    <div className="flex flex-col">
                      <span className="px-4 py-1.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full text-sm font-bold shadow-lg flex items-center space-x-2">
                        <SparklesIcon className="h-4 w-4" />
                        <span>{versionInfo?.codename}</span>
                      </span>
                      <span className="text-sm text-gray-500 mt-2">Built on {versionInfo?.build_date}</span>
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                    <div className="flex items-center space-x-2 mb-1">
                      <CheckCircleIcon className="h-5 w-5 text-green-600" />
                      <span className="text-xs font-semibold text-green-700 uppercase">Major</span>
                    </div>
                    <p className="text-2xl font-bold text-green-900">{versionInfo?.major}</p>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-sky-50 rounded-xl border border-blue-200">
                    <div className="flex items-center space-x-2 mb-1">
                      <BoltIcon className="h-5 w-5 text-blue-600" />
                      <span className="text-xs font-semibold text-blue-700 uppercase">Minor</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-900">{versionInfo?.minor}</p>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                    <div className="flex items-center space-x-2 mb-1">
                      <SparklesIcon className="h-5 w-5 text-purple-600" />
                      <span className="text-xs font-semibold text-purple-700 uppercase">Patch</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-900">{versionInfo?.patch}</p>
                  </div>
                </div>
              </div>

              {/* Right Side - Progress Circle */}
              <div className="flex flex-col items-center lg:items-end space-y-4">
                <div className="relative">
                  {/* Progress Circle */}
                  <svg className="transform -rotate-90 w-40 h-40">
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="transparent"
                      className="text-gray-200"
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="transparent"
                      strokeDasharray={`${2 * Math.PI * 70}`}
                      strokeDashoffset={`${2 * Math.PI * 70 * (1 - progressPercentage / 100)}`}
                      className="text-blue-600 transition-all duration-1000 ease-out"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-gray-900">{completedPhases}/{totalPhases}</span>
                    <span className="text-xs font-semibold text-gray-500 uppercase">Phases</span>
                  </div>
                </div>
                
                <div className="text-center lg:text-right">
                  <p className="text-sm font-semibold text-gray-700">Development Progress</p>
                  <p className="text-xs text-gray-500">{progressPercentage.toFixed(0)}% Complete</p>
                </div>
              </div>
            </div>

            {/* Release Notes */}
            {versionInfo?.release_notes && (
              <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                <div className="flex items-start space-x-3">
                  <ChartBarIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-1">Release Highlights</h3>
                    <p className="text-sm text-gray-700 leading-relaxed">{versionInfo.release_notes}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Update Status Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <ArrowPathIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Update Status</h2>
                  <p className="text-sm text-gray-500">Check for the latest security updates</p>
                </div>
              </div>
              
              <button
                onClick={() => checkForUpdates(true)}
                disabled={checking}
                className="group relative px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <div className="flex items-center space-x-2">
                  <ArrowPathIcon className={`h-5 w-5 ${checking ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                  <span>{checking ? 'Checking...' : 'Check for Updates'}</span>
                </div>
              </button>
            </div>
          </div>

          <div className="p-8">
            {updateInfo?.available ? (
              <div className="relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200 p-8">
                {/* Animated background effect */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-green-200 opacity-20 rounded-full blur-3xl animate-pulse"></div>
                
                <div className="relative z-10">
                  <div className="flex items-start space-x-6">
                    <div className="flex-shrink-0">
                      <div className="p-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl shadow-xl">
                        <ArrowDownTrayIcon className="h-12 w-12 text-white" />
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-2xl font-bold text-green-900">
                          New Update Available!
                        </h3>
                        <span className="px-4 py-1.5 bg-green-500 text-white rounded-full text-sm font-bold shadow-lg animate-bounce">
                          v{updateInfo.latest_version}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 mb-6">
                        <div className="flex items-center space-x-2">
                          <div className={`px-3 py-1.5 rounded-lg text-sm font-semibold ring-2 ${getUpdateTypeBadge(updateInfo.update_type || '')}`}>
                            {updateInfo.update_type?.toUpperCase()} UPDATE
                          </div>
                        </div>
                        
                        {updateInfo.size_bytes && (
                          <div className="flex items-center space-x-2 text-sm text-green-700">
                            <ArrowDownTrayIcon className="h-4 w-4" />
                            <span className="font-semibold">{formatBytes(updateInfo.size_bytes)}</span>
                          </div>
                        )}
                        
                        {updateInfo.release_date && (
                          <div className="flex items-center space-x-2 text-sm text-green-700">
                            <ClockIcon className="h-4 w-4" />
                            <span className="font-semibold">{formatDate(updateInfo.release_date)}</span>
                          </div>
                        )}
                      </div>

                      {updateInfo.release_notes && (
                        <div className="mb-6 p-6 bg-white rounded-xl border border-green-200 shadow-sm">
                          <h4 className="font-bold text-gray-900 mb-3 flex items-center space-x-2">
                            <SparklesIcon className="h-5 w-5 text-green-600" />
                            <span>What's New:</span>
                          </h4>
                          <div className="prose prose-sm max-w-none text-gray-700">
                            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                              {updateInfo.release_notes}
                            </pre>
                          </div>
                        </div>
                      )}

                      <button
                        onClick={downloadUpdate}
                        disabled={downloading}
                        className="group px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        <div className="flex items-center space-x-3">
                          <ArrowDownTrayIcon className={`h-6 w-6 ${downloading ? 'animate-bounce' : 'group-hover:translate-y-1 transition-transform'}`} />
                          <span className="text-lg">
                            {downloading ? 'Downloading Update...' : 'Download & Install Update'}
                          </span>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl border-2 border-gray-200 p-8">
                <div className="flex items-center space-x-6">
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <div className="p-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl shadow-lg">
                        <CheckCircleIcon className="h-12 w-12 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1">
                        <SparklesIcon className="h-6 w-6 text-yellow-400 animate-pulse" />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      You're Up to Date! 🎉
                    </h3>
                    <p className="text-gray-600 text-lg">
                      {updateInfo?.message || 'Your CyberGuardian is running the latest version with all security patches.'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Update History - Timeline */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <ClockIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Update History</h2>
                <p className="text-sm text-gray-500">Track all system updates and changes</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            {updateHistory.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                  <ClockIcon className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Update History Yet</h3>
                <p className="text-gray-500">Update history will appear here once you perform system updates</p>
              </div>
            ) : (
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-purple-200 to-pink-200"></div>

                <div className="space-y-8">
                  {updateHistory.map((update, index) => (
                    <div key={update.id} className="relative pl-20 group">
                      {/* Timeline Dot */}
                      <div className="absolute left-5 top-1 flex items-center justify-center">
                        <div className="relative">
                          <div className="w-8 h-8 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center ring-4 ring-gray-100 group-hover:ring-blue-100 transition-all">
                            {getStatusIcon(update.status)}
                          </div>
                        </div>
                      </div>

                      {/* Content Card */}
                      <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl border-2 border-gray-200 p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-200">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
                          <div className="flex items-center space-x-4">
                            <div>
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="text-lg font-bold text-gray-900">
                                  {update.from_version}
                                </span>
                                <ArrowPathIcon className="h-4 w-4 text-gray-400" />
                                <span className="text-lg font-bold text-blue-600">
                                  {update.to_version}
                                </span>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <span className={`px-3 py-1 rounded-lg text-xs font-bold ring-2 ${getStatusBadge(update.status)}`}>
                                  {update.status.toUpperCase()}
                                </span>
                                <span className={`px-3 py-1 rounded-lg text-xs font-bold ring-2 ${getUpdateTypeBadge(update.update_type)}`}>
                                  {update.update_type.toUpperCase()}
                                </span>
                              </div>
                            </div>
                          </div>

                          {update.duration_seconds && (
                            <div className="flex items-center space-x-2 px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
                              <BoltIcon className="h-5 w-5 text-blue-600" />
                              <span className="text-sm font-semibold text-blue-900">
                                {update.duration_seconds}s
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center space-x-2 text-gray-600">
                            <ClockIcon className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">Started:</span>
                            <span>{formatDate(update.started_at)}</span>
                          </div>
                          
                          {update.completed_at && (
                            <div className="flex items-center space-x-2 text-gray-600">
                              <CheckCircleIcon className="h-4 w-4 text-gray-400" />
                              <span className="font-medium">Completed:</span>
                              <span>{formatDate(update.completed_at)}</span>
                            </div>
                          )}
                        </div>

                        {update.error_message && (
                          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-start space-x-3">
                              <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-semibold text-red-900 mb-1">Error Details:</p>
                                <p className="text-sm text-red-700">{update.error_message}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}