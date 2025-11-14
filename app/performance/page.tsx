'use client';

import { useState, useEffect } from 'react';
import { 
  ChartBarIcon,
  CpuChipIcon,
  CircleStackIcon,
  ServerIcon,
  BoltIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  LightBulbIcon,
  ArrowPathIcon,
  ClockIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface SystemHealth {
  health_score: number;
  status: string;
  cpu: {
    percent: number;
    count: number;
    frequency_mhz: number;
  };
  memory: {
    total_mb: number;
    available_mb: number;
    used_mb: number;
    percent: number;
  };
  disk: {
    total_gb: number;
    used_gb: number;
    free_gb: number;
    percent: number;
  };
  process: {
    cpu_percent: number;
    memory_mb: number;
    num_threads: number;
  };
  uptime_seconds: number;
}

interface Summary {
  health_score: number;
  status: string;
  cpu_percent: number;
  memory_percent: number;
  disk_percent: number;
  uptime_hours: number;
  total_scans: number;
  total_queries: number;
  active_alerts: number;
  critical_issues: number;
  needs_attention: boolean;
}

interface Bottleneck {
  type: string;
  severity: string;
  message: string;
  recommendation: string;
}

interface Recommendation {
  category: string;
  priority: string;
  recommendation: string;
  expected_improvement: string;
}

export default function PerformancePage() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [bottlenecks, setBottlenecks] = useState<Bottleneck[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    
    try {
      const [healthRes, summaryRes, bottlenecksRes, recsRes] = await Promise.all([
        fetch(`${API_URL}/api/performance/health`),
        fetch(`${API_URL}/api/performance/report/summary`),
        fetch(`${API_URL}/api/performance/bottlenecks`),
        fetch(`${API_URL}/api/performance/recommendations`)
      ]);

      const healthData = await healthRes.json();
      const summaryData = await summaryRes.json();
      const bottlenecksData = await bottlenecksRes.json();
      const recsData = await recsRes.json();

      if (healthData.success) setHealth(healthData.health);
      if (summaryData.success) setSummary(summaryData.summary);
      if (bottlenecksData.success) setBottlenecks(bottlenecksData.bottlenecks);
      if (recsData.success) setRecommendations(recsData.recommendations);

    } catch (error) {
      console.error('Error fetching performance data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(true), 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-blue-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getUsageColor = (percent: number) => {
    if (percent < 60) return 'bg-green-500';
    if (percent < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'bg-red-100 text-red-800 ring-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 ring-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 ring-yellow-200';
      default:
        return 'bg-blue-100 text-blue-800 ring-blue-200';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800 ring-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 ring-yellow-200';
      default:
        return 'bg-blue-100 text-blue-800 ring-blue-200';
    }
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m`;
    return `${Math.floor(seconds)}s`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="relative">
          <div className="animate-spin rounded-full h-32 w-32 border-8 border-gray-200"></div>
          <div className="animate-spin rounded-full h-32 w-32 border-t-8 border-blue-600 absolute top-0 left-0"></div>
        </div>
        <p className="mt-6 text-lg font-semibold text-gray-700 animate-pulse">Loading performance data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl p-8 text-white">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <ChartBarIcon className="h-10 w-10" />
                  <h1 className="text-4xl font-bold">Performance Monitor</h1>
                </div>
                <p className="text-blue-100 text-lg">Real-time system health and optimization insights</p>
              </div>
              
              <button
                onClick={() => fetchData(true)}
                disabled={refreshing}
                className="group px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50"
              >
                <div className="flex items-center space-x-2">
                  <ArrowPathIcon className={`h-5 w-5 ${refreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                  <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Health Score Hero */}
        {health && summary && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">System Health Overview</h2>
              <p className="text-sm text-gray-500">Current system status and vital statistics</p>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Health Gauge */}
                <div className="lg:col-span-1 flex flex-col items-center justify-center">
                  <div className="relative">
                    {/* Circular Progress */}
                    <svg className="transform -rotate-90 w-48 h-48">
                      <circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="transparent"
                        className="text-gray-200"
                      />
                      <circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="transparent"
                        strokeDasharray={`${2 * Math.PI * 88}`}
                        strokeDashoffset={`${2 * Math.PI * 88 * (1 - summary.health_score / 100)}`}
                        className={`${getHealthColor(summary.health_score)} transition-all duration-1000 ease-out`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className={`text-5xl font-black ${getHealthColor(summary.health_score)}`}>
                        {summary.health_score}
                      </span>
                      <span className="text-sm font-semibold text-gray-500 uppercase mt-1">Health Score</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 text-center">
                    <span className={`inline-flex items-center px-6 py-2 rounded-full text-lg font-bold ${
                      summary.status === 'excellent' ? 'bg-green-100 text-green-800' :
                      summary.status === 'good' ? 'bg-blue-100 text-blue-800' :
                      summary.status === 'fair' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {summary.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center space-x-2 text-sm text-gray-600">
                    <ClockIcon className="h-4 w-4" />
                    <span>Uptime: {formatUptime(health.uptime_seconds)}</span>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* CPU */}
                  <div className="p-6 bg-gradient-to-br from-blue-50 to-sky-50 rounded-xl border-2 border-blue-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-3 bg-blue-500 rounded-lg shadow-lg">
                          <CpuChipIcon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-600 uppercase">CPU Usage</p>
                          <p className="text-3xl font-black text-blue-900">{summary.cpu_percent.toFixed(1)}%</p>
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full ${getUsageColor(summary.cpu_percent)} transition-all duration-500 rounded-full`}
                        style={{ width: `${summary.cpu_percent}%` }}
                      ></div>
                    </div>
                    <p className="mt-2 text-xs text-gray-600">{health.cpu.count} cores @ {health.cpu.frequency_mhz.toFixed(0)} MHz</p>
                  </div>

                  {/* Memory */}
                  <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-3 bg-purple-500 rounded-lg shadow-lg">
                          <CircleStackIcon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-600 uppercase">Memory Usage</p>
                          <p className="text-3xl font-black text-purple-900">{summary.memory_percent.toFixed(1)}%</p>
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full ${getUsageColor(summary.memory_percent)} transition-all duration-500 rounded-full`}
                        style={{ width: `${summary.memory_percent}%` }}
                      ></div>
                    </div>
                    <p className="mt-2 text-xs text-gray-600">
                      {(health.memory.used_mb / 1024).toFixed(1)} GB / {(health.memory.total_mb / 1024).toFixed(1)} GB
                    </p>
                  </div>

                  {/* Disk */}
                  <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-3 bg-green-500 rounded-lg shadow-lg">
                          <ServerIcon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-600 uppercase">Disk Usage</p>
                          <p className="text-3xl font-black text-green-900">{summary.disk_percent.toFixed(1)}%</p>
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full ${getUsageColor(summary.disk_percent)} transition-all duration-500 rounded-full`}
                        style={{ width: `${summary.disk_percent}%` }}
                      ></div>
                    </div>
                    <p className="mt-2 text-xs text-gray-600">
                      {health.disk.free_gb.toFixed(1)} GB free of {health.disk.total_gb.toFixed(1)} GB
                    </p>
                  </div>

                  {/* Process */}
                  <div className="p-6 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border-2 border-orange-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-3 bg-orange-500 rounded-lg shadow-lg">
                          <BoltIcon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-600 uppercase">Process</p>
                          <p className="text-3xl font-black text-orange-900">{health.process.num_threads}</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 space-y-1 text-xs text-gray-600">
                      <p>CPU: {health.process.cpu_percent.toFixed(1)}%</p>
                      <p>Memory: {health.process.memory_mb.toFixed(1)} MB</p>
                      <p>Threads: {health.process.num_threads}</p>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 uppercase">Total Scans</p>
                  <p className="text-3xl font-black text-gray-900 mt-1">{summary.total_scans}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <ChartBarIcon className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 uppercase">Total Queries</p>
                  <p className="text-3xl font-black text-gray-900 mt-1">{summary.total_queries}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <CircleStackIcon className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 uppercase">Active Alerts</p>
                  <p className="text-3xl font-black text-gray-900 mt-1">{summary.active_alerts}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 uppercase">Critical Issues</p>
                  <p className="text-3xl font-black text-gray-900 mt-1">{summary.critical_issues}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-lg">
                  <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Bottlenecks */}
        {bottlenecks.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-red-50 to-orange-50 px-8 py-6 border-b border-red-200">
              <div className="flex items-center space-x-3">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                <h2 className="text-2xl font-bold text-gray-900">Performance Bottlenecks</h2>
              </div>
              <p className="text-sm text-gray-600 mt-1">Issues detected that may impact performance</p>
            </div>

            <div className="p-8 space-y-4">
              {bottlenecks.map((bottleneck, index) => (
                <div key={index} className="p-6 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border-2 border-red-200">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{bottleneck.type}</h3>
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold ring-2 ${getSeverityBadge(bottleneck.severity)}`}>
                          {bottleneck.severity.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-3">{bottleneck.message}</p>
                      <div className="p-4 bg-white rounded-lg border border-red-200">
                        <p className="text-sm font-semibold text-gray-900 mb-1">💡 Recommendation:</p>
                        <p className="text-sm text-gray-700">{bottleneck.recommendation}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Bottlenecks */}
        {bottlenecks.length === 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                <CheckCircleIcon className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No Bottlenecks Detected! 🎉</h3>
              <p className="text-gray-600">Your system is running smoothly with optimal performance.</p>
            </div>
          </div>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-8 py-6 border-b border-blue-200">
              <div className="flex items-center space-x-3">
                <LightBulbIcon className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Optimization Recommendations</h2>
              </div>
              <p className="text-sm text-gray-600 mt-1">Smart tips to improve system performance</p>
            </div>

            <div className="p-8 space-y-4">
              {recommendations.map((rec, index) => (
                <div key={index} className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <SparklesIcon className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{rec.category}</h3>
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold ring-2 ${getPriorityBadge(rec.priority)}`}>
                          {rec.priority.toUpperCase()} PRIORITY
                        </span>
                      </div>
                      <p className="text-gray-700 mb-3">{rec.recommendation}</p>
                      <div className="p-4 bg-white rounded-lg border border-blue-200">
                        <p className="text-sm font-semibold text-gray-900 mb-1">📈 Expected Improvement:</p>
                        <p className="text-sm text-gray-700">{rec.expected_improvement}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}