"use client";

import { useEffect, useState } from "react";
import { Mail, Shield, AlertTriangle, RefreshCw, Trash2, Settings } from "lucide-react";
import { emailsApi } from "@/lib/api";
import Link from "next/link";

export default function EmailsPage() {
  const [emailAccounts, setEmailAccounts] = useState<any[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [status, setStatus] = useState<any>(null);
  const [emails, setEmails] = useState<any[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [folder, setFolder] = useState("INBOX");
  const [limit, setLimit] = useState(10);

  // Fetch email accounts
  const fetchEmailAccounts = async () => {
    try {
      const response = await emailsApi.getAccounts();
      if (response.success && response.data) {
        setEmailAccounts(response.data);
        // Auto-select first account if available
        if (response.data.length > 0 && !selectedAccountId) {
          setSelectedAccountId(response.data[0].id);
        }
      }
    } catch (err) {
      console.error("Error fetching email accounts:", err);
    }
  };

  // Fetch status
  const fetchStatus = async () => {
    try {
      const response = await emailsApi.getStatus();
      if (response.success) {
        setStatus(response.data);
      }
    } catch (err) {
      console.error("Error fetching status:", err);
    }
  };

  // Scan emails
  const scanEmails = async () => {
    if (!selectedAccountId) {
      setError("Please select an email account first");
      return;
    }

    setIsScanning(true);
    setError(null);

    try {
      const response = await emailsApi.scan({ 
        account_id: selectedAccountId,
        folder, 
        limit 
      });

      if (response.success) {
        setEmails(response.data || []);
        // Refresh accounts to update stats
        await fetchEmailAccounts();
        await fetchStatus();
      } else {
        setError(response.error || "Failed to scan emails");
      }
    } catch (err) {
      console.error("Error scanning emails:", err);
      setError("Failed to scan emails");
    } finally {
      setIsScanning(false);
    }
  };

  useEffect(() => {
    fetchEmailAccounts();
    fetchStatus();
  }, []);

  // Get selected account details
  const selectedAccount = emailAccounts.find(acc => acc.id === selectedAccountId);

  // Calculate stats
  const totalScanned = status?.total_scanned || 0;
  const phishingDetected = status?.phishing_detected || 0;
  const safeEmails = status?.safe_emails || 0;

  return (
    <main className="pb-12">
      {/* Hero */}
      <div className="page-container page-hero pt-12 md:pt-16">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="heading-accent gradient-cyber text-3xl md:text-4xl font-bold tracking-tight">
              Email & Phishing Scanner
            </h1>
            <p className="mt-2 text-muted-foreground">
              Scan your inbox for phishing attempts and malicious emails
            </p>
          </div>
       <Link
  href="/settings"
  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/50 relative z-50 cursor-pointer"
  style={{ pointerEvents: 'auto' }}
>
  <Settings className="h-5 w-5" />
  Go to Settings
</Link>
        </div>
      </div>

      <div className="section">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Scanner Status */}
          <div className="stat-card group hover:scale-105 transition-all duration-300">
            <div className="flex items-start justify-between">
              <div>
                <div className="stat-label">Scanner Status</div>
                <div className="stat-value text-2xl">
                  {status?.configured ? (
                    <span className="text-green-500">Connected</span>
                  ) : (
                    <span className="text-red-500">Not Setup</span>
                  )}
                </div>
                {selectedAccount && (
                  <div className="text-sm text-muted-foreground mt-1">
                    {selectedAccount.email_address}
                  </div>
                )}
              </div>
              <Mail className={`h-8 w-8 ${status?.configured ? 'text-green-500' : 'text-red-500'}`} />
            </div>
          </div>

          {/* Total Scanned */}
          <div className="stat-card stat-card--info group hover:scale-105 transition-all duration-300">
            <div className="flex items-start justify-between">
              <div>
                <div className="stat-label">Total Scanned</div>
                <div className="stat-value">{totalScanned}</div>
              </div>
              <Mail className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          {/* Phishing Detected */}
          <div className="stat-card stat-card--error group hover:scale-105 transition-all duration-300">
            <div className="flex items-start justify-between">
              <div>
                <div className="stat-label">Phishing Detected</div>
                <div className="stat-value text-red-500">{phishingDetected}</div>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </div>

          {/* Safe Emails */}
          <div className="stat-card stat-card--ok group hover:scale-105 transition-all duration-300">
            <div className="flex items-start justify-between">
              <div>
                <div className="stat-label">Safe Emails</div>
                <div className="stat-value text-green-500">{safeEmails}</div>
              </div>
              <Shield className="h-8 w-8 text-green-500" />
            </div>
          </div>
        </div>

        
       {/* No Accounts Warning */}
{emailAccounts.length === 0 ? (
  <div className="card-premium p-8 text-center relative z-50" style={{ pointerEvents: 'auto' }}>
    <Mail className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
    <h3 className="text-xl font-semibold mb-2">No Email Accounts Configured</h3>
    <p className="text-muted-foreground mb-4">
      Add an email account in Settings to start scanning for phishing emails
    </p>
    <Link
      href="/settings"
      className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/50 relative z-50 cursor-pointer"
      style={{ pointerEvents: 'auto' }}
    >
      <Settings className="h-5 w-5" />
      Go to Settings
    </Link>
  </div>
        ) : (
          <>
            {/* Scan Configuration */}
            <div className="card-premium p-6 mb-8">
              <h3 className="text-lg font-semibold mb-4">Scan Configuration</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {/* Email Account Selection */}
                <div>
                  <label className="block text-sm font-medium mb-2">Email Account</label>
                  <select
                    value={selectedAccountId || ''}
                    onChange={(e) => setSelectedAccountId(Number(e.target.value))}
                    className="w-full px-4 py-2 rounded-lg bg-card border-2 border-border text-foreground transition-all hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ colorScheme: 'dark' }}
                  >
                    {emailAccounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.email_address} ({account.total_scanned} scanned)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Email Folder */}
                <div>
                  <label className="block text-sm font-medium mb-2">Email Folder</label>
                  <select
                    value={folder}
                    onChange={(e) => setFolder(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-card border-2 border-border text-foreground transition-all hover:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    style={{ colorScheme: 'dark' }}
                  >
                    <option value="INBOX">Inbox</option>
                    <option value="Spam">Spam</option>
                    <option value="Sent">Sent</option>
                    <option value="Drafts">Drafts</option>
                  </select>
                </div>

                {/* Email Limit */}
                <div>
                  <label className="block text-sm font-medium mb-2">Email Limit</label>
                  <select
                    value={limit}
                    onChange={(e) => setLimit(Number(e.target.value))}
                    className="w-full px-4 py-2 rounded-lg bg-card border-2 border-border text-foreground transition-all hover:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    style={{ colorScheme: 'dark' }}
                  >
                    <option value={10}>10 emails</option>
                    <option value={20}>20 emails</option>
                    <option value={50}>50 emails</option>
                    <option value={100}>100 emails</option>
                  </select>
                </div>
              </div>

              {/* Scan Button */}
              <button
                onClick={scanEmails}
                disabled={isScanning || !selectedAccountId}
                className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/50 flex items-center justify-center gap-2"
              >
                <RefreshCw className={`h-5 w-5 ${isScanning ? 'animate-spin' : ''}`} />
                {isScanning ? 'Scanning...' : 'Scan Emails'}
              </button>

              {error && (
                <div className="mt-4 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500">
                  {error}
                </div>
              )}
            </div>

            {/* Scan Results */}
            <div className="card-premium p-6">
              <h3 className="text-lg font-semibold mb-4">
                Scan Results ({emails.length} emails)
              </h3>

              {emails.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Mail className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>No emails scanned yet</p>
                  <p className="text-sm">Configure your email credentials and click "Scan Emails" to start</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {emails.map((email, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border-2 transition-all hover:scale-[1.02] ${
                        email.threat_level === 'dangerous'
                          ? 'bg-red-500/5 border-red-500/30 hover:border-red-500/50'
                          : email.threat_level === 'suspicious'
                          ? 'bg-yellow-500/5 border-yellow-500/30 hover:border-yellow-500/50'
                          : 'bg-green-500/5 border-green-500/30 hover:border-green-500/50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground">{email.subject}</h4>
                          <div className="text-sm text-muted-foreground">
                            From: {email.sender}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {email.date}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              email.threat_level === 'dangerous'
                                ? 'bg-red-500/20 text-red-500'
                                : email.threat_level === 'suspicious'
                                ? 'bg-yellow-500/20 text-yellow-500'
                                : 'bg-green-500/20 text-green-500'
                            }`}
                          >
                            {Math.round(email.phishing_score)}/100
                          </div>
                          <span className={`badge ${
                            email.threat_level === 'dangerous'
                              ? 'badge--error'
                              : email.threat_level === 'suspicious'
                              ? 'badge--warning'
                              : 'badge--ok'
                          }`}>
                            {email.threat_level.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      {/* Indicators */}
                      {email.indicators && email.indicators.length > 0 && (
                        <div className="mt-3 space-y-1">
                          {email.indicators.slice(0, 3).map((indicator: string, i: number) => (
                            <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                              <AlertTriangle className="h-4 w-4 text-yellow-500" />
                              {indicator}
                            </div>
                          ))}
                          {email.indicators.length > 3 && (
                            <div className="text-sm text-muted-foreground">
                              +{email.indicators.length - 3} more indicators
                            </div>
                          )}
                        </div>
                      )}

                      {/* URLs */}
                      {email.urls && email.urls.length > 0 && (
                        <div className="mt-2 text-sm text-muted-foreground">
                          🔗 {email.urls.length} URL(s) detected
                        </div>
                      )}

                      {/* Recommendations */}
                      {email.is_phishing && email.recommendations && (
                        <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                          <div className="font-semibold text-red-500 mb-2">⚠️ Recommendations:</div>
                          <ul className="text-sm space-y-1 text-red-400">
                            {email.recommendations.slice(0, 2).map((rec: string, i: number) => (
                              <li key={i}>• {rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}