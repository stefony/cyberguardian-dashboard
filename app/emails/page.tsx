'use client'

import { useState, useEffect } from 'react'
import { RefreshCw, Mail, AlertTriangle, Shield, CheckCircle, XCircle, Link as LinkIcon, Paperclip } from 'lucide-react'
import { emailsApi } from '@/lib/api'

interface EmailScanResult {
  email_id: string
  subject: string
  sender: string
  date: string
  is_phishing: boolean
  phishing_score: number
  threat_level: string
  indicators: string[]
  urls: string[]
  attachments: string[]
  recommendations: string[]
}

interface EmailStatus {
  scanner_available: boolean
  configured: boolean
  server: string
  username: string
  status: string
  message: string
}

export default function EmailsPage() {
  const [status, setStatus] = useState<EmailStatus | null>(null)
  const [emails, setEmails] = useState<EmailScanResult[]>([])
  const [loading, setLoading] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedEmail, setSelectedEmail] = useState<EmailScanResult | null>(null)
  
  const [folder, setFolder] = useState('INBOX')
  const [limit, setLimit] = useState(10)

  useEffect(() => {
    fetchStatus()
  }, [])

 const fetchStatus = async () => {
  try {
    const response = await emailsApi.getStatus()
    if (response.success) {
      setStatus(response.data || null)
    }
  } catch (err) {
    console.error('Failed to fetch status:', err)
  }
}
const scanEmails = async () => {
  if (!status?.configured) {
    setError('Email scanner not configured. Please add credentials in Settings.')
    return
  }

  setScanning(true)
  setError(null)

  try {
    const response = await emailsApi.scan({ folder, limit })

    if (response.success) {
      setEmails(response.data || [])
    } else {
      setError(response.error || 'Scan failed')
    }
  } catch (err: any) {
    setError(err.message || 'Failed to scan emails')
  } finally {
    setScanning(false)
  }
}

  const getThreatColor = (level: string) => {
    switch (level) {
      case 'dangerous': return 'text-red-500'
      case 'suspicious': return 'text-orange-500'
      case 'safe': return 'text-green-500'
      default: return 'text-gray-500'
    }
  }

  const getThreatBg = (level: string) => {
    switch (level) {
      case 'dangerous': return 'bg-red-500/10 border-red-500/20'
      case 'suspicious': return 'bg-orange-500/10 border-orange-500/20'
      case 'safe': return 'bg-green-500/10 border-green-500/20'
      default: return 'bg-gray-500/10 border-gray-500/20'
    }
  }

  const phishingCount = emails.filter(e => e.is_phishing).length
  const suspiciousCount = emails.filter(e => e.threat_level === 'suspicious').length
  const safeCount = emails.filter(e => e.threat_level === 'safe').length

  return (
    <div className="min-h-screen bg-dark-bg p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">
          <span className="gradient-cyber">Email & Phishing Scanner</span>
        </h1>
        <p className="text-dark-text/70">
          Scan your inbox for phishing attempts and malicious emails
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Scanner Status */}
        <div className={`p-6 rounded-xl border transition-all duration-300 hover:scale-105 ${
          status?.configured 
            ? 'bg-green-500/10 border-green-500/20' 
            : 'bg-orange-500/10 border-orange-500/20'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <Mail className={`w-8 h-8 ${status?.configured ? 'text-green-500' : 'text-orange-500'}`} />
            <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
              status?.configured 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-orange-500/20 text-orange-400'
            }`}>
              {status?.configured ? 'Connected' : 'Not Configured'}
            </span>
          </div>
          <h3 className="text-sm text-dark-text/70 mb-1">Scanner Status</h3>
          <p className="text-2xl font-bold text-dark-text">
            {status?.configured ? status.username : 'Not Setup'}
          </p>
        </div>

        {/* Total Scanned */}
        <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-xl hover:scale-105 transition-all">
          <div className="flex items-center justify-between mb-4">
            <Mail className="w-8 h-8 text-blue-500" />
          </div>
          <h3 className="text-sm text-dark-text/70 mb-1">Total Scanned</h3>
          <p className="text-2xl font-bold text-dark-text">{emails.length}</p>
        </div>

        {/* Phishing Detected */}
        <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl hover:scale-105 transition-all">
          <div className="flex items-center justify-between mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-sm text-dark-text/70 mb-1">Phishing Detected</h3>
          <p className="text-2xl font-bold text-red-500">{phishingCount}</p>
        </div>

        {/* Safe Emails */}
        <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-xl hover:scale-105 transition-all">
          <div className="flex items-center justify-between mb-4">
            <Shield className="w-8 h-8 text-green-500" />
          </div>
          <h3 className="text-sm text-dark-text/70 mb-1">Safe Emails</h3>
          <p className="text-2xl font-bold text-green-500">{safeCount}</p>
        </div>
      </div>

      {/* Scan Controls */}
      <div className="mb-8 p-6 bg-dark-card border border-dark-border rounded-xl">
        <h2 className="text-xl font-bold mb-4 text-dark-text">Scan Configuration</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Folder Select */}
          <div>
            <label className="block text-sm text-dark-text/70 mb-2">Email Folder</label>
            <select
  value={folder}
  onChange={(e) => setFolder(e.target.value)}
  className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:border-purple-500 focus:outline-none"
  style={{ colorScheme: 'dark' }}
>
  <option value="INBOX" style={{ background: '#1e293b', color: '#fff' }}>Inbox</option>
  <option value="Spam" style={{ background: '#1e293b', color: '#fff' }}>Spam</option>
  <option value="Sent" style={{ background: '#1e293b', color: '#fff' }}>Sent</option>
  <option value="Drafts" style={{ background: '#1e293b', color: '#fff' }}>Drafts</option>
</select>
          </div>

          {/* Limit */}
          <div>
            <label className="block text-sm text-dark-text/70 mb-2">Email Limit</label>
            <select
  value={limit}
  onChange={(e) => setLimit(Number(e.target.value))}
  className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:border-purple-500 focus:outline-none"
  style={{ colorScheme: 'dark' }}
>
  <option value={5} style={{ background: '#1e293b', color: '#fff' }}>5 emails</option>
  <option value={10} style={{ background: '#1e293b', color: '#fff' }}>10 emails</option>
  <option value={20} style={{ background: '#1e293b', color: '#fff' }}>20 emails</option>
  <option value={50} style={{ background: '#1e293b', color: '#fff' }}>50 emails</option>
</select>
          </div>

          {/* Scan Button */}
          <div className="flex items-end">
            <button
              onClick={scanEmails}
              disabled={scanning || !status?.configured}
              className={`w-full px-6 py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                scanning || !status?.configured
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700 hover:shadow-lg hover:shadow-purple-500/20'
              }`}
            >
              <RefreshCw className={`w-5 h-5 ${scanning ? 'animate-spin' : ''}`} />
              {scanning ? 'Scanning...' : 'Scan Emails'}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
            ⚠️ {error}
          </div>
        )}

        {/* Not Configured Warning */}
        {!status?.configured && (
          <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg text-orange-400">
            ℹ️ Email scanner not configured. Add your email credentials in the .env file to enable scanning.
          </div>
        )}
      </div>

      {/* Email List */}
      {emails.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-dark-text mb-4">
            Scan Results ({emails.length} emails)
          </h2>

          {emails.map((email, index) => (
            <div
              key={index}
              className={`p-6 rounded-xl border transition-all duration-300 hover:scale-[1.02] cursor-pointer ${getThreatBg(email.threat_level)}`}
              onClick={() => setSelectedEmail(selectedEmail?.email_id === email.email_id ? null : email)}
            >
              {/* Email Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-dark-text">{email.subject}</h3>
                    {email.is_phishing && (
                      <span className="px-3 py-1 bg-red-500/20 text-red-400 text-sm font-semibold rounded-full">
                        ⛔ PHISHING
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-dark-text/70">From: {email.sender}</p>
                  <p className="text-xs text-dark-text/50">{email.date}</p>
                </div>

                {/* Threat Score */}
                <div className="text-right">
                  <p className={`text-3xl font-bold ${getThreatColor(email.threat_level)}`}>
                    {email.phishing_score.toFixed(0)}
                  </p>
                  <p className="text-sm text-dark-text/70">Risk Score</p>
                  <p className={`text-sm font-semibold uppercase ${getThreatColor(email.threat_level)}`}>
                    {email.threat_level}
                  </p>
                </div>
              </div>

              {/* Quick Info */}
              <div className="flex gap-4 text-sm text-dark-text/70 mb-4">
                {email.urls.length > 0 && (
                  <div className="flex items-center gap-1">
                    <LinkIcon className="w-4 h-4" />
                    {email.urls.length} URL{email.urls.length !== 1 ? 's' : ''}
                  </div>
                )}
                {email.attachments.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Paperclip className="w-4 h-4" />
                    {email.attachments.length} attachment{email.attachments.length !== 1 ? 's' : ''}
                  </div>
                )}
                {email.indicators.length > 0 && (
                  <div className="flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    {email.indicators.length} indicator{email.indicators.length !== 1 ? 's' : ''}
                  </div>
                )}
              </div>

              {/* Expanded Details */}
              {selectedEmail?.email_id === email.email_id && (
                <div className="mt-4 pt-4 border-t border-dark-border space-y-4">
                  {/* Indicators */}
                  {email.indicators.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 text-dark-text">⚠️ Threat Indicators:</h4>
                      <ul className="space-y-1">
                        {email.indicators.map((indicator, i) => (
                          <li key={i} className="text-sm text-dark-text/70 flex items-start gap-2">
                            <span className="text-orange-400">•</span>
                            {indicator}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* URLs */}
                  {email.urls.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 text-dark-text">🔗 URLs Found:</h4>
                      <ul className="space-y-1">
                        {email.urls.map((url, i) => (
                          <li key={i} className="text-sm text-blue-400 truncate">
                            {url}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Attachments */}
                  {email.attachments.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 text-dark-text">📎 Attachments:</h4>
                      <ul className="space-y-1">
                        {email.attachments.map((attachment, i) => (
                          <li key={i} className="text-sm text-dark-text/70">
                            {attachment}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recommendations */}
                  {email.recommendations.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 text-dark-text">💡 Recommendations:</h4>
                      <ul className="space-y-1">
                        {email.recommendations.map((rec, i) => (
                          <li key={i} className="text-sm text-dark-text/70">
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {emails.length === 0 && !scanning && (
        <div className="text-center py-16 text-dark-text/50">
          <Mail className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">No emails scanned yet</p>
          <p className="text-sm">Configure your email credentials and click "Scan Emails" to start</p>
        </div>
      )}
    </div>
  )
}