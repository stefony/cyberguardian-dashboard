'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { Zap, Shield, Search, CheckCircle2, AlertCircle, Clock, Cpu, FileSearch } from 'lucide-react'

type Profile = {
  name: string
  description: string
  scan_type: string
  threads: number
  max_files: number
  extensions: string[]
  skip_archives: boolean
  recursive: boolean
  duration_estimate: string
  icon: string
  color: string
}

export default function ScanProfiles() {
  const [profiles, setProfiles] = useState<Record<string, Profile>>({})
  const [loading, setLoading] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    loadProfiles()
  }, [])

  const loadProfiles = async () => {
    try {
      const response = await api.scans.getScanProfiles()
      if (response.success && response.data) {
        setProfiles(response.data.profiles)
      }
    } catch (error) {
      console.error('Failed to load profiles:', error)
    }
  }

  const handleStartScan = async (profileKey: string) => {
    if (loading) return
    
    setLoading(profileKey)
    setMessage(null)
    
    try {
      const response = await api.scans.startScanWithProfile(profileKey)
      
      if (response.success) {
        setMessage({ 
          type: 'success', 
          text: response.data?.message || 'Scan started successfully!' 
        })
        setTimeout(() => setMessage(null), 5000)
      }
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to start scan' 
      })
    } finally {
      setLoading(null)
    }
  }

  const getProfileIcon = (iconName: string) => {
    switch (iconName) {
      case 'zap': return <Zap className="w-6 h-6" />
      case 'shield': return <Shield className="w-6 h-6" />
      case 'search': return <Search className="w-6 h-6" />
      default: return <FileSearch className="w-6 h-6" />
    }
  }

  const getProfileGradient = (color: string) => {
    switch (color) {
      case 'blue': return 'from-blue-500 to-cyan-500'
      case 'purple': return 'from-purple-500 to-pink-500'
      case 'red': return 'from-red-500 to-orange-500'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  return (
    <div className="space-y-6">
      {/* Success/Error Message */}
      {message && (
        <div className={`p-4 rounded-xl border-2 backdrop-blur-sm animate-in slide-in-from-top-2 duration-300 ${
          message.type === 'success' 
            ? 'bg-green-500/10 border-green-500/30 text-green-400' 
            : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          <div className="flex items-center gap-2">
            {message.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="font-medium">{message.text}</span>
          </div>
        </div>
      )}

      {/* Profile Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(profiles).map(([key, profile]) => {
          const isLoading = loading === key
          
          return (
            <div
              key={key}
              className="relative group"
            >
              {/* Glow Effect */}
              <div className={`absolute -inset-0.5 bg-gradient-to-r ${getProfileGradient(profile.color)} rounded-xl opacity-20 group-hover:opacity-30 blur transition duration-300`} />
              
              {/* Card */}
              <div className="relative p-6 bg-dark-card/90 backdrop-blur-xl border-2 border-dark-border/50 hover:border-dark-border rounded-xl shadow-2xl transition-all duration-300">
                {/* Icon */}
                <div className={`inline-flex p-3 bg-gradient-to-br ${getProfileGradient(profile.color)} rounded-xl mb-4 shadow-lg`}>
                  <div className="text-white">
                    {getProfileIcon(profile.icon)}
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  {profile.name}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-400 mb-4 min-h-[2.5rem]">
                  {profile.description}
                </p>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="p-2 bg-dark-bg/50 rounded-lg border border-dark-border/50">
                    <div className="flex items-center gap-1 mb-1">
                      <Clock className="w-3 h-3 text-gray-500" />
                      <span className="text-xs text-gray-500">Duration</span>
                    </div>
                    <span className="text-xs font-semibold text-white">{profile.duration_estimate}</span>
                  </div>

                  <div className="p-2 bg-dark-bg/50 rounded-lg border border-dark-border/50">
                    <div className="flex items-center gap-1 mb-1">
                      <Cpu className="w-3 h-3 text-gray-500" />
                      <span className="text-xs text-gray-500">Threads</span>
                    </div>
                    <span className="text-xs font-semibold text-white">{profile.threads}</span>
                  </div>

                  <div className="p-2 bg-dark-bg/50 rounded-lg border border-dark-border/50">
                    <div className="flex items-center gap-1 mb-1">
                      <FileSearch className="w-3 h-3 text-gray-500" />
                      <span className="text-xs text-gray-500">Max Files</span>
                    </div>
                    <span className="text-xs font-semibold text-white">{profile.max_files.toLocaleString()}</span>
                  </div>

                  <div className="p-2 bg-dark-bg/50 rounded-lg border border-dark-border/50">
                    <div className="flex items-center gap-1 mb-1">
                      <Shield className="w-3 h-3 text-gray-500" />
                      <span className="text-xs text-gray-500">Recursive</span>
                    </div>
                    <span className="text-xs font-semibold text-white">{profile.recursive ? 'Yes' : 'No'}</span>
                  </div>
                </div>

                {/* Extensions */}
                <div className="mb-4 p-2 bg-dark-bg/50 rounded-lg border border-dark-border/50">
                  <span className="text-xs text-gray-500 block mb-1">Extensions:</span>
                  <div className="flex flex-wrap gap-1">
                    {profile.extensions.slice(0, 4).map((ext, idx) => (
                      <span key={idx} className="text-xs px-1.5 py-0.5 bg-purple-500/20 text-purple-400 rounded font-mono">
                        {ext}
                      </span>
                    ))}
                    {profile.extensions.length > 4 && (
                      <span className="text-xs px-1.5 py-0.5 bg-gray-500/20 text-gray-400 rounded">
                        +{profile.extensions.length - 4}
                      </span>
                    )}
                  </div>
                </div>

                {/* Start Scan Button */}
                <button
                  onClick={() => handleStartScan(key)}
                  disabled={isLoading || loading !== null}
                  className={`group/btn relative w-full px-4 py-3 rounded-xl font-bold text-white shadow-lg transition-all duration-300 transform overflow-hidden ${
                    isLoading || loading !== null
                      ? 'bg-gray-600 cursor-not-allowed opacity-50'
                      : `bg-gradient-to-r ${getProfileGradient(profile.color)} hover:scale-[1.02] active:scale-[0.98] cursor-pointer`
                  }`}
                  style={{ position: 'relative', zIndex: 10 }}
                >
                  {/* Shine Effect */}
                  {!isLoading && loading === null && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover/btn:translate-x-[200%] transition-transform duration-1000" />
                  )}
                  
                  <div className="relative flex items-center justify-center gap-2">
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Starting...
                      </>
                    ) : (
                      <>
                        {getProfileIcon(profile.icon)}
                        Start Scan
                      </>
                    )}
                  </div>
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Info Box */}
      <div className="p-6 bg-blue-500/10 border-2 border-blue-500/30 rounded-xl backdrop-blur-sm">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg flex-shrink-0">
            <FileSearch className="w-5 h-5 text-blue-400" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-blue-400 mb-1">Scan Profiles</h4>
            <p className="text-sm text-gray-400">
              Choose a predefined scan profile to quickly start scanning with optimal settings. 
              Quick scans are fast but limited, while Deep scans are comprehensive but take longer.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}