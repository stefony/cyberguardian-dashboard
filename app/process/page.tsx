'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CountUp from 'react-countup';
import { 
  ShieldCheckIcon,
  ServerIcon,
  LockClosedIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  LightBulbIcon,
  ArrowPathIcon,
  SparklesIcon,
  BoltIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline';
import { processProtectionApi } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface ProtectionStatus {
  platform: string;
  is_protected: boolean;
  service_installed: boolean;
  can_protect: boolean;
  is_admin: boolean;
  is_root: boolean;
  username: string;
  recommendations: string[];
}

interface Statistics {
  platform: string;
  is_protected: boolean;
  service_installed: boolean;
  has_admin_rights: boolean;
  has_root_rights: boolean;
  can_enable_protection: boolean;
  recommendations_count: number;
}

export default function ProcessProtectionPage() {
  const [status, setStatus] = useState<ProtectionStatus | null>(null);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    
  try {
  const [statusRes, statsRes] = await Promise.all([
    processProtectionApi.getStatus(),
    processProtectionApi.getStatistics()
  ]);

  if (statusRes.success && statusRes.data) setStatus(statusRes.data);
  if (statsRes.success && statsRes.data) setStatistics(statsRes.data);

} catch (error) {
      console.error('Error fetching process protection data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(true), 30000);
    return () => clearInterval(interval);
  }, []);

  const handleEnableAntiTermination = async () => {
    setActionLoading('anti-termination');
    try {
      const response = await processProtectionApi.enableAntiTermination();
      if (response.success) {
        await fetchData();
      }
    } catch (error) {
      console.error('Error enabling anti-termination:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleEnableSelfHealing = async () => {
    setActionLoading('self-healing');
    try {
      const response = await processProtectionApi.enableSelfHealing();
      if (response.success) {
        await fetchData();
      }
    } catch (error) {
      console.error('Error enabling self-healing:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleEnableMaxProtection = async () => {
    setActionLoading('max-protection');
    try {
      const response = await processProtectionApi.enableMaximumProtection();
      if (response.success) {
        await fetchData();
      }
    } catch (error) {
      console.error('Error enabling maximum protection:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleInstallService = async () => {
    setActionLoading('install-service');
    try {
      const response = await processProtectionApi.installService();
      if (response.success) {
        await fetchData();
      }
    } catch (error) {
      console.error('Error installing service:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const getPlatformIcon = (platform: string) => {
    if (platform === 'Windows') return '🪟';
    if (platform === 'Linux') return '🐧';
    if (platform === 'Darwin') return '🍎';
    return '💻';
  };

  const getStatusColor = (isProtected: boolean) => {
    return isProtected ? 'text-green-500' : 'text-red-500';
  };

  const getStatusBg = (isProtected: boolean) => {
    return isProtected ? 'bg-green-500/20 border-green-500/30' : 'bg-red-500/20 border-red-500/30';
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg p-8">
        <div className="max-w-7xl mx-auto animate-pulse space-y-8">
          <div className="h-10 w-64 bg-muted/30 rounded"></div>
          <div className="h-64 bg-muted/20 rounded-xl"></div>
          <div className="grid grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted/20 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-dark-bg p-6"
    >
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl p-8 text-white"
        >
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <ShieldCheckIcon className="h-10 w-10" />
                  </motion.div>
                  <h1 className="text-4xl font-bold">Process Protection</h1>
                </div>
                <p className="text-blue-100 text-lg">Anti-termination and self-healing mechanisms</p>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => fetchData(true)}
                disabled={refreshing}
                className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 hover:shadow-lg"
              >
                <div className="flex items-center space-x-2">
                  <ArrowPathIcon className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
                  <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
                </div>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Status Cards */}
        {status && statistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Platform */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              whileHover={{ scale: 1.02, y: -4 }}
              className="p-6 bg-blue-500/10 rounded-xl border-2 border-blue-500/20 hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="p-3 bg-blue-500 rounded-lg shadow-lg"
                  >
                    <ComputerDesktopIcon className="h-6 w-6 text-white" />
                  </motion.div>
                  <div>
                    <p className="text-sm font-semibold text-dark-text/70 uppercase">Platform</p>
                    <p className="text-2xl font-black text-blue-400 flex items-center space-x-2">
                      <span>{getPlatformIcon(status.platform)}</span>
                      <span>{status.platform}</span>
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Protection Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              whileHover={{ scale: 1.02, y: -4 }}
              className={`p-6 rounded-xl border-2 hover:shadow-xl transition-all duration-300 ${
                status.is_protected 
                  ? 'bg-green-500/10 border-green-500/20 hover:shadow-green-500/20' 
                  : 'bg-red-500/10 border-red-500/20 hover:shadow-red-500/20'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <motion.div
                    animate={{ scale: status.is_protected ? [1, 1.2, 1] : 1 }}
                    transition={{ duration: 2, repeat: status.is_protected ? Infinity : 0 }}
                    className={`p-3 rounded-lg shadow-lg ${
                      status.is_protected ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  >
                    <ShieldCheckIcon className="h-6 w-6 text-white" />
                  </motion.div>
                  <div>
                    <p className="text-sm font-semibold text-dark-text/70 uppercase">Protected</p>
                    <p className={`text-2xl font-black ${getStatusColor(status.is_protected)}`}>
                      {status.is_protected ? 'ENABLED' : 'DISABLED'}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Service Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              whileHover={{ scale: 1.02, y: -4 }}
              className={`p-6 rounded-xl border-2 hover:shadow-xl transition-all duration-300 ${
                status.service_installed
                  ? 'bg-green-500/10 border-green-500/20 hover:shadow-green-500/20'
                  : 'bg-orange-500/10 border-orange-500/20 hover:shadow-orange-500/20'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className={`p-3 rounded-lg shadow-lg ${
                      status.service_installed ? 'bg-green-500' : 'bg-orange-500'
                    }`}
                  >
                    <ServerIcon className="h-6 w-6 text-white" />
                  </motion.div>
                  <div>
                    <p className="text-sm font-semibold text-dark-text/70 uppercase">Service</p>
                    <p className={`text-2xl font-black ${
                      status.service_installed ? 'text-green-400' : 'text-orange-400'
                    }`}>
                      {status.service_installed ? 'INSTALLED' : 'NOT INSTALLED'}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Privileges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              whileHover={{ scale: 1.02, y: -4 }}
              className={`p-6 rounded-xl border-2 hover:shadow-xl transition-all duration-300 ${
                status.can_protect
                  ? 'bg-purple-500/10 border-purple-500/20 hover:shadow-purple-500/20'
                  : 'bg-yellow-500/10 border-yellow-500/20 hover:shadow-yellow-500/20'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <motion.div
                    whileHover={{ scale: 1.2 }}
                    transition={{ type: "spring", stiffness: 400 }}
                    className={`p-3 rounded-lg shadow-lg ${
                      status.can_protect ? 'bg-purple-500' : 'bg-yellow-500'
                    }`}
                  >
                    <LockClosedIcon className="h-6 w-6 text-white" />
                  </motion.div>
                  <div>
                    <p className="text-sm font-semibold text-dark-text/70 uppercase">Privileges</p>
                    <p className={`text-2xl font-black ${
                      status.can_protect ? 'text-purple-400' : 'text-yellow-400'
                    }`}>
                      {status.can_protect ? 'ELEVATED' : 'LIMITED'}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        )}

        {/* Protection Controls */}
        {status && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-dark-card rounded-2xl shadow-xl overflow-hidden border border-dark-border"
          >
            <div className="px-8 py-6 border-b border-dark-border">
              <div className="flex items-center space-x-3">
                <BoltIcon className="h-6 w-6 text-purple-500" />
                <h2 className="text-2xl font-bold text-dark-text">Protection Controls</h2>
              </div>
              <p className="text-sm text-dark-text/70 mt-1">Enable and manage protection mechanisms</p>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Enable Anti-Termination */}
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleEnableAntiTermination}
                  disabled={actionLoading === 'anti-termination' || !status.can_protect}
                  className={`p-6 rounded-xl border-2 font-semibold transition-all duration-300 ${
                    status.is_protected
                      ? 'bg-green-500/10 border-green-500/20 text-green-400'
                      : 'bg-purple-600 hover:bg-purple-700 border-purple-500/20 text-white hover:shadow-lg hover:shadow-purple-500/30'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <ShieldCheckIcon className="h-6 w-6" />
                      <span>Enable Anti-Termination</span>
                    </div>
                    {actionLoading === 'anti-termination' && (
                      <ArrowPathIcon className="h-5 w-5 animate-spin" />
                    )}
                  </div>
                  {!status.can_protect && (
                    <p className="text-xs text-left mt-2 opacity-70">Requires elevated privileges</p>
                  )}
                </motion.button>

                {/* Enable Self-Healing */}
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleEnableSelfHealing}
                  disabled={actionLoading === 'self-healing'}
                  className="p-6 bg-blue-600 hover:bg-blue-700 rounded-xl border-2 border-blue-500/20 font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <SparklesIcon className="h-6 w-6" />
                      <span>Enable Self-Healing</span>
                    </div>
                    {actionLoading === 'self-healing' && (
                      <ArrowPathIcon className="h-5 w-5 animate-spin" />
                    )}
                  </div>
                </motion.button>

                {/* Maximum Protection */}
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleEnableMaxProtection}
                  disabled={actionLoading === 'max-protection' || !status.can_protect}
                  className="p-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl border-2 border-purple-500/20 font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/30 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <BoltIcon className="h-6 w-6" />
                      <span>🚀 Maximum Protection</span>
                    </div>
                    {actionLoading === 'max-protection' && (
                      <ArrowPathIcon className="h-5 w-5 animate-spin" />
                    )}
                  </div>
                  {!status.can_protect && (
                    <p className="text-xs text-left mt-2 opacity-70">Requires elevated privileges</p>
                  )}
                </motion.button>

                {/* Install Service */}
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleInstallService}
                  disabled={actionLoading === 'install-service' || status.service_installed || !status.can_protect}
                  className={`p-6 rounded-xl border-2 font-semibold transition-all duration-300 text-white disabled:opacity-50 disabled:cursor-not-allowed ${
                    status.service_installed
                      ? 'bg-green-500/20 border-green-500/30 text-green-400'
                      : 'bg-orange-600 hover:bg-orange-700 border-orange-500/20 hover:shadow-lg hover:shadow-orange-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <ServerIcon className="h-6 w-6" />
                      <span>{status.service_installed ? '✅ Service Installed' : 'Install as Service'}</span>
                    </div>
                    {actionLoading === 'install-service' && (
                      <ArrowPathIcon className="h-5 w-5 animate-spin" />
                    )}
                  </div>
                  {!status.can_protect && !status.service_installed && (
                    <p className="text-xs text-left mt-2 opacity-70">Requires elevated privileges</p>
                  )}
                </motion.button>

              </div>
            </div>
          </motion.div>
        )}

        {/* Recommendations */}
        {status && status.recommendations && status.recommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="bg-dark-card rounded-2xl shadow-xl overflow-hidden border border-dark-border"
          >
            <div className="px-8 py-6 border-b border-dark-border">
              <div className="flex items-center space-x-3">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <LightBulbIcon className="h-6 w-6 text-yellow-500" />
                </motion.div>
                <h2 className="text-2xl font-bold text-dark-text">Security Recommendations</h2>
              </div>
              <p className="text-sm text-dark-text/70 mt-1">
                <CountUp end={status.recommendations.length} duration={1} /> recommendations to improve security
              </p>
            </div>

            <div className="p-8 space-y-3">
              {status.recommendations.map((rec, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ scale: 1.01, x: 4 }}
                  className="p-4 bg-yellow-500/10 rounded-xl border-2 border-yellow-500/20 hover:shadow-lg hover:shadow-yellow-500/20 transition-all duration-300"
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
                    </div>
                    <p className="text-dark-text/80">{rec}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* All Good Message */}
       {status && (!status.recommendations || status.recommendations.length === 0) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-dark-card rounded-2xl shadow-xl p-8 border border-dark-border"
          >
            <div className="text-center py-8">
              <motion.div
                animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-4"
              >
                <CheckCircleIcon className="h-10 w-10 text-green-500" />
              </motion.div>
              <h3 className="text-2xl font-bold text-dark-text mb-2">All Security Measures Active! 🎉</h3>
              <p className="text-dark-text/70">Your system is fully protected with all available mechanisms.</p>
            </div>
          </motion.div>
        )}

      </div>
    </motion.div>
  );
}