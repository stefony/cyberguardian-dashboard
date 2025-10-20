'use client'

import { useState, useEffect } from 'react'
import { RefreshCw, Activity, AlertTriangle, Shield, Globe, MapPin, Clock } from 'lucide-react'

interface HoneypotStatus {
  name: string
  type: string
  port: number
  running: boolean
  attacks_logged: number
}

interface AttackLog {
  timestamp: string
  honeypot_type: string
  source_ip: string
  source_port: number
  attack_type: string
  payload: string
  country: string | null
  city: string | null
}

interface HoneypotStats {
  total_attacks: number
  active_honeypots: number
  attack_types: Record<string, number>
  top_countries: Record<string, number>
}

export default function HoneypotsPage() {
  const [honeypots, setHoneypots] = useState<HoneypotStatus[]>([])
  const [attacks, setAttacks] = useState<AttackLog[]>([])
  const [stats, setStats] = useState<HoneypotStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 5000) // Refresh every 5 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    try {
      // Fetch honeypot status
      const statusRes = await fetch('http://localhost:8000/api/honeypots/status')
      const statusData = await statusRes.json()
      setHoneypots(statusData)

      // Fetch recent attacks
      const attacksRes = await fetch('http://localhost:8000/api/honeypots/attacks?limit=20')
      const attacksData = await attacksRes.json()
      setAttacks(attacksData)

      // Fetch statistics
      const statsRes = await fetch('http://localhost:8000/api/honeypots/statistics')
      const statsData = await statsRes.json()
      setStats(statsData)

      setLoading(false)
      setError(null)
    } catch (err) {
      console.error('Failed to fetch data:', err)
      setError('Failed to load honeypot data')
      setLoading(false)
    }
  }

  const startHoneypot = async (type: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/honeypots/start/${type}`, {
        method: 'POST'
      })
      
      if (response.ok) {
        setTimeout(fetchData, 1000) // Refresh after 1 second
      }
    } catch (err) {
      console.error('Failed to start honeypot:', err)
    }
  }

  const stopHoneypot = async (type: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/honeypots/stop/${type}`, {
        method: 'POST'
      })
      
      if (response.ok) {
        setTimeout(fetchData, 1000)
      }
    } catch (err) {
      console.error('Failed to stop honeypot:', err)
    }
  }

  const startAll = async () => {
    try {
      await fetch('http://localhost:8000/api/honeypots/start-all', { method: 'POST' })
      setTimeout(fetchData, 1000)
    } catch (err) {
      console.error('Failed to start all:', err)
    }
  }

  const stopAll = async () => {
    try {
      await fetch('http://localhost:8000/api/honeypots/stop-all', { method: 'POST' })
      setTimeout(fetchData, 1000)
    } catch (err) {
      console.error('Failed to stop all:', err)
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString()
  }

  const getHoneypotColor = (type: string) => {
    return type === 'ssh' ? 'text-cyan-400' : 'text-purple-400'
  }

  const getHoneypotBg = (type: string) => {
    return type === 'ssh' ? 'bg-cyan-500/10 border-cyan-500/20' : 'bg-purple-500/10 border-purple-500/20'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-bg p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">
          <span className="gradient-cyber">Live Honeypots</span>
        </h1>
        <p className="text-dark-text/70">
          Real-time attack capture and analysis
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Total Attacks */}
        <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl hover:scale-105 transition-all">
          <div className="flex items-center justify-between mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-sm text-dark-text/70 mb-1">Total Attacks</h3>
          <p className="text-2xl font-bold text-red-500">{stats?.total_attacks || 0}</p>
        </div>

        {/* Active Honeypots */}
        <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-xl hover:scale-105 transition-all">
          <div className="flex items-center justify-between mb-4">
            <Activity className="w-8 h-8 text-green-500" />
          </div>
          <h3 className="text-sm text-dark-text/70 mb-1">Active Honeypots</h3>
          <p className="text-2xl font-bold text-green-500">{stats?.active_honeypots || 0}/2</p>
        </div>

        {/* Attack Types */}
        <div className="p-6 bg-orange-500/10 border border-orange-500/20 rounded-xl hover:scale-105 transition-all">
          <div className="flex items-center justify-between mb-4">
            <Shield className="w-8 h-8 text-orange-500" />
          </div>
          <h3 className="text-sm text-dark-text/70 mb-1">Attack Types</h3>
          <p className="text-2xl font-bold text-orange-500">
            {stats ? Object.keys(stats.attack_types).length : 0}
          </p>
        </div>

        {/* Countries */}
        <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-xl hover:scale-105 transition-all">
          <div className="flex items-center justify-between mb-4">
            <Globe className="w-8 h-8 text-blue-500" />
          </div>
          <h3 className="text-sm text-dark-text/70 mb-1">Countries</h3>
          <p className="text-2xl font-bold text-blue-500">
            {stats ? Object.keys(stats.top_countries).length : 0}
          </p>
        </div>
      </div>

      {/* Honeypot Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {honeypots.map((honeypot) => (
          <div
            key={honeypot.type}
            className={`p-6 rounded-xl border transition-all ${getHoneypotBg(honeypot.type)}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className={`text-xl font-bold ${getHoneypotColor(honeypot.type)}`}>
                  {honeypot.name}
                </h3>
                <p className="text-sm text-dark-text/70">Port: {honeypot.port}</p>
              </div>
              <div className="text-right">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    honeypot.running
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-gray-500/20 text-gray-400'
                  }`}
                >
                  {honeypot.running ? '🟢 Running' : '🔴 Stopped'}
                </span>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-dark-text/70">Attacks Captured</p>
              <p className="text-3xl font-bold text-dark-text">{honeypot.attacks_logged}</p>
            </div>

            <button
              onClick={() =>
                honeypot.running ? stopHoneypot(honeypot.type) : startHoneypot(honeypot.type)
              }
              className={`w-full px-4 py-2 rounded-lg font-semibold transition-all ${
                honeypot.running
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {honeypot.running ? 'Stop' : 'Start'} Honeypot
            </button>
          </div>
        ))}
      </div>

      {/* Control All */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={startAll}
          className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-all"
        >
          🚀 Start All Honeypots
        </button>
        <button
          onClick={stopAll}
          className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-all"
        >
          🛑 Stop All Honeypots
        </button>
        <button
          onClick={fetchData}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-all flex items-center gap-2"
        >
          <RefreshCw className="w-5 h-5" />
          Refresh
        </button>
      </div>

      {/* Recent Attacks */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-dark-text">
          Recent Attacks ({attacks.length})
        </h2>

        {attacks.length === 0 ? (
          <div className="p-12 bg-dark-card border border-dark-border rounded-xl text-center">
            <Shield className="w-16 h-16 mx-auto mb-4 text-dark-text/30" />
            <p className="text-dark-text/50">No attacks captured yet</p>
            <p className="text-sm text-dark-text/30">Start honeypots to begin capturing attacks</p>
          </div>
        ) : (
          <div className="space-y-3">
            {attacks.map((attack, index) => (
              <div
                key={index}
                className="p-4 bg-dark-card border border-dark-border rounded-lg hover:border-purple-500/50 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          attack.honeypot_type === 'ssh'
                            ? 'bg-cyan-500/20 text-cyan-400'
                            : 'bg-purple-500/20 text-purple-400'
                        }`}
                      >
                        {attack.honeypot_type.toUpperCase()}
                      </span>
                      <h3 className="font-bold text-dark-text">{attack.attack_type}</h3>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-dark-text/70">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        {attack.source_ip}
                      </div>
                      {attack.country && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {attack.city}, {attack.country}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {formatTimestamp(attack.timestamp)}
                      </div>
                    </div>

                    {attack.payload && (
                      <div className="mt-3 p-3 bg-dark-bg rounded-lg">
                        <p className="text-xs text-dark-text/50 mb-1">Payload:</p>
                        <pre className="text-xs text-dark-text/70 overflow-x-auto whitespace-pre-wrap break-all">
                          {attack.payload.substring(0, 200)}
                          {attack.payload.length > 200 && '...'}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Attack Statistics */}
      {stats && Object.keys(stats.attack_types).length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Attack Types */}
          <div className="p-6 bg-dark-card border border-dark-border rounded-xl">
            <h3 className="text-xl font-bold mb-4 text-dark-text">Attack Types</h3>
            <div className="space-y-3">
              {Object.entries(stats.attack_types)
                .sort(([, a], [, b]) => b - a)
                .map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-dark-text/70">{type}</span>
                    <span className="font-bold text-dark-text">{count}</span>
                  </div>
                ))}
            </div>
          </div>

          {/* Top Countries */}
          <div className="p-6 bg-dark-card border border-dark-border rounded-xl">
            <h3 className="text-xl font-bold mb-4 text-dark-text">Top Countries</h3>
            <div className="space-y-3">
              {Object.entries(stats.top_countries)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 10)
                .map(([country, count]) => (
                  <div key={country} className="flex items-center justify-between">
                    <span className="text-dark-text/70">{country}</span>
                    <span className="font-bold text-dark-text">{count}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}