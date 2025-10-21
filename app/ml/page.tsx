'use client'

import { useState, useEffect } from 'react'
import { RefreshCw, Brain, TrendingUp, AlertTriangle, CheckCircle, Zap, Activity } from 'lucide-react'

interface ModelStatus {
  model_trained: boolean
  training_date: string | null
  training_samples: number
  anomaly_detector_available: boolean
  behavior_clusterer_available: boolean
  feature_count: number
  features: string[]
}

interface ThreatScore {
  threat_score: number
  threat_level: string
  is_anomaly: boolean
  anomaly_score: number
  behavior_cluster: string
  confidence: number
}

export default function MLPage() {
  const [status, setStatus] = useState<ModelStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [training, setTraining] = useState(false)
  const [testResult, setTestResult] = useState<ThreatScore | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Test log inputs
  const [testIP, setTestIP] = useState('192.168.1.100')
  const [testPayload, setTestPayload] = useState('GET /api/data')

  useEffect(() => {
    fetchStatus()
  }, [])

  const fetchStatus = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/ml/status')
      const data = await response.json()
      setStatus(data)
      setLoading(false)
      setError(null)
    } catch (err) {
      console.error('Failed to fetch ML status:', err)
      setError('Failed to load ML status')
      setLoading(false)
    }
  }

  const trainModels = async () => {
    setTraining(true)
    setError(null)

    try {
      const response = await fetch('http://localhost:8000/api/ml/train', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          n_clusters: 3,
          contamination: 0.1
        })
      })

      if (response.ok) {
        // Wait 3 seconds for training to complete
        setTimeout(() => {
          fetchStatus()
          setTraining(false)
        }, 3000)
      } else {
        throw new Error('Training failed')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to train models')
      setTraining(false)
    }
  }

  const testThreatDetection = async () => {
    try {
      const testLog = {
        timestamp: new Date().toISOString(),
        source_ip: testIP,
        source_port: 8080,
        payload: testPayload,
        request_type: 'HTTP'
      }

      const response = await fetch('http://localhost:8000/api/ml/threat-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testLog)
      })

      if (response.ok) {
        const data = await response.json()
        setTestResult(data)
      } else {
        const errorData = await response.json()
        setError(errorData.detail || 'Test failed')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to test threat detection')
    }
  }

  const getThreatColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-500'
      case 'high': return 'text-orange-500'
      case 'medium': return 'text-yellow-500'
      case 'low': return 'text-green-500'
      default: return 'text-gray-500'
    }
  }

  const getThreatBg = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-500/10 border-red-500/20'
      case 'high': return 'bg-orange-500/10 border-orange-500/20'
      case 'medium': return 'bg-yellow-500/10 border-yellow-500/20'
      case 'low': return 'bg-green-500/10 border-green-500/20'
      default: return 'bg-gray-500/10 border-gray-500/20'
    }
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
          <span className="gradient-cyber">Machine Learning Models</span>
        </h1>
        <p className="text-dark-text/70">
          AI-powered threat detection and behavioral analysis
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Model Status */}
        <div className={`p-6 rounded-xl border transition-all duration-300 hover:scale-105 ${
          status?.model_trained 
            ? 'bg-green-500/10 border-green-500/20' 
            : 'bg-orange-500/10 border-orange-500/20'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <Brain className={`w-8 h-8 ${status?.model_trained ? 'text-green-500' : 'text-orange-500'}`} />
            <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
              status?.model_trained 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-orange-500/20 text-orange-400'
            }`}>
              {status?.model_trained ? 'Trained' : 'Not Trained'}
            </span>
          </div>
          <h3 className="text-sm text-dark-text/70 mb-1">Model Status</h3>
          <p className="text-2xl font-bold text-dark-text">
            {status?.model_trained ? 'Ready' : 'Needs Training'}
          </p>
        </div>

        {/* Training Samples */}
        <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-xl hover:scale-105 transition-all">
          <div className="flex items-center justify-between mb-4">
            <Activity className="w-8 h-8 text-blue-500" />
          </div>
          <h3 className="text-sm text-dark-text/70 mb-1">Training Samples</h3>
          <p className="text-2xl font-bold text-dark-text">{status?.training_samples || 0}</p>
        </div>

        {/* Feature Count */}
        <div className="p-6 bg-purple-500/10 border border-purple-500/20 rounded-xl hover:scale-105 transition-all">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-8 h-8 text-purple-500" />
          </div>
          <h3 className="text-sm text-dark-text/70 mb-1">Features</h3>
          <p className="text-2xl font-bold text-dark-text">{status?.feature_count || 0}</p>
        </div>

        {/* Models Available */}
        <div className="p-6 bg-cyan-500/10 border border-cyan-500/20 rounded-xl hover:scale-105 transition-all">
          <div className="flex items-center justify-between mb-4">
            <CheckCircle className="w-8 h-8 text-cyan-500" />
          </div>
          <h3 className="text-sm text-dark-text/70 mb-1">Models Ready</h3>
          <p className="text-2xl font-bold text-dark-text">
            {(status?.anomaly_detector_available ? 1 : 0) + (status?.behavior_clusterer_available ? 1 : 0)}/2
          </p>
        </div>
      </div>

      {/* Training Section */}
      <div className="mb-8 p-6 bg-dark-card border border-dark-border rounded-xl">
        <h2 className="text-xl font-bold mb-4 text-dark-text">Model Training</h2>
        
        <div className="mb-4">
          <p className="text-sm text-dark-text/70 mb-2">
            Train ML models on security logs to detect anomalies and analyze behavioral patterns
          </p>
          
          {status?.training_date && (
            <p className="text-xs text-dark-text/50">
              Last trained: {new Date(status.training_date).toLocaleString()}
            </p>
          )}
        </div>

        <button
          onClick={trainModels}
          disabled={training}
          className={`w-full px-6 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
            training
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 hover:shadow-lg hover:shadow-purple-500/20'
          }`}
        >
          {training ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Training Models...
            </>
          ) : (
            <>
              <Zap className="w-5 h-5" />
              Train ML Models
            </>
          )}
        </button>

        {error && (
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
            ⚠️ {error}
          </div>
        )}
      </div>

      {/* Test Console */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Test Input */}
        <div className="p-6 bg-dark-card border border-dark-border rounded-xl">
          <h2 className="text-xl font-bold mb-4 text-dark-text">Test Threat Detection</h2>
          
          <div className="space-y-4 mb-4">
            <div>
              <label className="block text-sm text-dark-text/70 mb-2">Source IP</label>
              <input
                type="text"
                value={testIP}
                onChange={(e) => setTestIP(e.target.value)}
                className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-dark-text focus:border-purple-500 focus:outline-none"
                placeholder="192.168.1.100"
              />
            </div>

            <div>
              <label className="block text-sm text-dark-text/70 mb-2">Payload</label>
              <textarea
                value={testPayload}
                onChange={(e) => setTestPayload(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-dark-text focus:border-purple-500 focus:outline-none resize-none"
                placeholder="GET /api/data"
              />
            </div>
          </div>

          <button
            onClick={testThreatDetection}
            disabled={!status?.model_trained}
            className={`w-full px-6 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
              !status?.model_trained
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
            Analyze Threat
          </button>

          {!status?.model_trained && (
            <p className="mt-2 text-xs text-orange-400 text-center">
              Train models first to enable threat detection
            </p>
          )}

          {/* Quick Test Buttons */}
          <div className="mt-4 space-y-2">
            <p className="text-xs text-dark-text/50 mb-2">Quick Tests:</p>
            <button
              onClick={() => {
                setTestIP('192.168.1.100')
                setTestPayload('GET /api/data?id=123')
              }}
              className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-xs text-dark-text hover:border-green-500/50 transition-all"
            >
              ✅ Normal Request
            </button>
            <button
              onClick={() => {
                setTestIP('10.0.0.1')
                setTestPayload("admin' OR '1'='1'; DROP TABLE users; <script>alert('XSS')</script>")
              }}
              className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-xs text-dark-text hover:border-red-500/50 transition-all"
            >
              ⚠️ SQL Injection + XSS
            </button>
          </div>
        </div>

        {/* Test Results */}
        <div className="p-6 bg-dark-card border border-dark-border rounded-xl">
          <h2 className="text-xl font-bold mb-4 text-dark-text">Analysis Results</h2>
          
          {testResult ? (
            <div className="space-y-4">
              {/* Threat Score */}
              <div className={`p-6 rounded-xl border ${getThreatBg(testResult.threat_level)}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-dark-text">Threat Score</h3>
                  <span className={`text-sm font-semibold px-3 py-1 rounded-full bg-dark-bg`}>
                    {testResult.threat_level.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className={`text-6xl font-bold ${getThreatColor(testResult.threat_level)}`}>
                    {Math.round(testResult.threat_score)}
                  </div>
                  <div className="flex-1">
                    <div className="h-4 bg-dark-bg rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          testResult.threat_level === 'critical' ? 'bg-red-500' :
                          testResult.threat_level === 'high' ? 'bg-orange-500' :
                          testResult.threat_level === 'medium' ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${testResult.threat_score}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-dark-bg rounded-lg">
                  <span className="text-sm text-dark-text/70">Anomaly Detected</span>
                  <span className={`font-bold ${testResult.is_anomaly ? 'text-red-400' : 'text-green-400'}`}>
                    {testResult.is_anomaly ? 'YES' : 'NO'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-dark-bg rounded-lg">
                  <span className="text-sm text-dark-text/70">Anomaly Score</span>
                  <span className="font-bold text-dark-text">{testResult.anomaly_score.toFixed(3)}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-dark-bg rounded-lg">
                  <span className="text-sm text-dark-text/70">Behavior Cluster</span>
                  <span className="font-bold text-dark-text">{testResult.behavior_cluster}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-dark-bg rounded-lg">
                  <span className="text-sm text-dark-text/70">Confidence</span>
                  <span className="font-bold text-dark-text">{(testResult.confidence * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-dark-text/50">
              <Brain className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No analysis results yet</p>
              <p className="text-sm">Test a log to see threat detection in action</p>
            </div>
          )}
        </div>
      </div>

      {/* Features List */}
      {status?.features && status.features.length > 0 && (
        <div className="p-6 bg-dark-card border border-dark-border rounded-xl">
          <h2 className="text-xl font-bold mb-4 text-dark-text">ML Features ({status.features.length})</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {status.features.map((feature, index) => (
              <div
                key={index}
                className="p-3 bg-dark-bg border border-dark-border rounded-lg text-sm text-dark-text/70 hover:border-purple-500/50 transition-all"
              >
                {feature.replace(/_/g, ' ')}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}