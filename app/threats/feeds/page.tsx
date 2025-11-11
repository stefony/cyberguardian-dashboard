"use client";

import { useState, useEffect } from "react";
import {
  RefreshCw,
  Activity,
  Database,
  CheckCircle,
  XCircle,
  ExternalLink,
  Shield,
  Key,
} from "lucide-react";

interface Feed {
  id: number;
  name: string;
  type: string;
  enabled: boolean;
  url: string;
  last_update: string;
  status: string;
  ioc_count: number;
  api_key_required: boolean;
  description: string;
}

interface FeedStats {
  total_feeds: number;
  active_feeds: number;
  inactive_feeds: number;
  total_iocs: number;
}

export default function ThreatFeedsPage() {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [stats, setStats] = useState<FeedStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshingId, setRefreshingId] = useState<number | null>(null);

  useEffect(() => {
    fetchFeeds();
  }, []);

  const fetchFeeds = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/threat-intel/feeds`
      );
      const data = await response.json();

      if (data.success) {
        setFeeds(data.feeds);
        setStats(data.statistics);
      }
    } catch (error) {
      console.error("Failed to fetch feeds:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFeed = async (feedId: number) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/threat-intel/feeds/${feedId}/toggle`,
        { method: "POST" }
      );
      const data = await response.json();

      if (data.success) {
        await fetchFeeds();
      }
    } catch (error) {
      console.error("Failed to toggle feed:", error);
    }
  };

  const refreshFeed = async (feedId: number) => {
    setRefreshingId(feedId);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/threat-intel/feeds/${feedId}/refresh`,
        { method: "POST" }
      );
      const data = await response.json();

      if (data.success) {
        await fetchFeeds();
      }
    } catch (error) {
      console.error("Failed to refresh feed:", error);
    } finally {
      setRefreshingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return date.toLocaleDateString();
  };

  const formatNumber = (num: number) =>
    new Intl.NumberFormat().format(num ?? 0);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-12 bg-gray-800/50 rounded w-64" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-800/50 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Database className="w-8 h-8 text-cyan-400" />
            Threat Intelligence Feeds
          </h1>
          <p className="text-gray-400 mt-1">
            Manage external threat intelligence sources
          </p>
        </div>

        <button
          onClick={fetchFeeds}
          className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg 
                     transition-all duration-200 flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh All
        </button>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/20 
                        rounded-xl p-6 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-cyan-500/10 rounded-lg">
                <Database className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-1">Total Feeds</p>
            <p className="text-3xl font-bold text-cyan-400">
              {stats.total_feeds}
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 
                        rounded-xl p-6 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-1">Active Feeds</p>
            <p className="text-3xl font-bold text-green-400">
              {stats.active_feeds}
            </p>
          </div>

          <div className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border border-orange-500/20 
                        rounded-xl p-6 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-500/10 rounded-lg">
                <XCircle className="w-6 h-6 text-orange-400" />
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-1">Inactive Feeds</p>
            <p className="text-3xl font-bold text-orange-400">
              {stats.inactive_feeds}
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 
                        rounded-xl p-6 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <Shield className="w-6 h-6 text-purple-400" />
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-1">Total IOCs</p>
            <p className="text-3xl font-bold text-purple-400">
              {formatNumber(stats.total_iocs)}
            </p>
          </div>
        </div>
      )}

      {/* Auto-Update Status */}
      <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/30 
                    rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <RefreshCw className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Automated Intelligence Updates</h3>
            <p className="text-xs text-gray-400">Updates run every 6 hours automatically</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
          <span className="text-sm text-green-400 font-medium">Active</span>
        </div>
      </div>

      {/* Feed Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {feeds.map((feed) => (
          <div
            key={feed.id}
            className={`bg-gray-800/50 border rounded-xl p-6 transition-all duration-300 hover:shadow-lg ${
              feed.enabled
                ? "border-cyan-500/30 hover:border-cyan-500/50"
                : "border-gray-700 hover:border-gray-600"
            }`}
          >
            {/* Feed Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-white">{feed.name}</h3>
                  {feed.enabled ? (
                    <span
                      className="px-2 py-1 bg-green-500/20 border border-green-500/30 
                                   rounded text-xs text-green-400 font-medium"
                    >
                      Active
                    </span>
                  ) : (
                    <span
                      className="px-2 py-1 bg-gray-500/20 border border-gray-500/30 
                                   rounded text-xs text-gray-400 font-medium"
                    >
                      Inactive
                    </span>
                  )}
                  {feed.api_key_required && (
                    <Key className="w-4 h-4 text-yellow-400"
                    />
                  )}
                </div>
                <p className="text-sm text-gray-400">{feed.description}</p>
              </div>
            </div>

            {/* Feed Stats */}
            <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-gray-900/50 rounded-lg">
              <div>
                <p className="text-xs text-gray-400 mb-1">IOC Count</p>
                <p className="text-lg font-bold text-white">
                  {formatNumber(feed.ioc_count)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Type</p>
                <p className="text-sm font-medium text-cyan-400">
                  {feed.type}
                </p>
              </div>
            </div>

            {/* Last Update */}
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
              <Activity className="w-4 h-4" />
              <span>Last updated: {formatDate(feed.last_update)}</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleFeed(feed.id)}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  feed.enabled
                    ? "bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30"
                    : "bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30"
                }`}
              >
                {feed.enabled ? "Disable" : "Enable"}
              </button>

              <button
                onClick={() => refreshFeed(feed.id)}
                disabled={!feed.enabled || refreshingId === feed.id}
                className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 
                         rounded-lg font-medium transition-all duration-200 hover:bg-cyan-500/30
                         disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <RefreshCw
                  className={`w-4 h-4 ${
                    refreshingId === feed.id ? "animate-spin" : ""
                  }`}
                />
                Refresh
              </button>

              <a
                href={feed.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-gray-700/50 border border-gray-600 text-gray-300 
                         rounded-lg font-medium transition-all duration-200 hover:bg-gray-700
                         flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                View
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
