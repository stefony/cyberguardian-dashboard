/**
 * CyberGuardian Dashboard - API Client
 * Communicates with Python backend (Detection, Response, Deception, AI engines)
 */

import type {
  Threat,
  ThreatResponse,
  Alert,
  DetectionResult,
  DetectionStats,
  Honeypot,
  HoneypotResponse,  // ADD THIS LINE HERE
  AttackerSession,
  Prediction,
  RiskForecast,
  NLPAnalysis,
  SystemStatus,
  DashboardStats,
  HealthData,
  ResponseAction,
  ApiResponse,
  PaginatedResponse,
} from './types'

// ============================================
// CONFIGURATION
// ============================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000'

// ============================================
// HTTP CLIENT
// ============================================

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  /**
   * Generic fetch wrapper with error handling
   */
  private async fetch<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Unknown error' }))
        return {
          success: false,
          error: error.message || `HTTP ${response.status}`,
        }
      }

      const data = await response.json()
      return {
        success: true,
        data,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      }
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.fetch<T>(endpoint, { method: 'GET' })
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.fetch<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.fetch<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.fetch<T>(endpoint, { method: 'DELETE' })
  }
}

const client = new ApiClient(API_BASE_URL)

// ============================================
// DASHBOARD API
// ============================================

export const dashboardApi = {
  getStats: async (): Promise<ApiResponse<DashboardStats>> => {
    return client.get<DashboardStats>('/api/dashboard/stats')
  },

  getSystemStatus: async (): Promise<ApiResponse<SystemStatus>> => {
    return client.get<SystemStatus>('/api/dashboard/status')
  },

  // ADD THIS NEW FUNCTION:
  getHealth: async (): Promise<ApiResponse<HealthData>> => {
    return client.get<HealthData>('/api/health')
  },
}

// ============================================
// THREATS & ALERTS API
// ============================================

export const threatsApi = {
getThreats: async (params?: {
  level?: string
  type?: string
  limit?: number
}): Promise<ApiResponse<PaginatedResponse<ThreatResponse>>> => {
  const query = new URLSearchParams(params as any).toString()
  return client.get<PaginatedResponse<ThreatResponse>>(
    `/api/threats${query ? `?${query}` : ''}`
  )
},

  getThreatById: async (id: string): Promise<ApiResponse<Threat>> => {
    return client.get<Threat>(`/api/threats/${id}`)
  },

  getAlerts: async (): Promise<ApiResponse<Alert[]>> => {
    return client.get<Alert[]>('/api/alerts')
  },

  dismissAlert: async (id: string): Promise<ApiResponse<void>> => {
    return client.post<void>(`/api/alerts/${id}/dismiss`)
  },

  // ADD THESE 3 NEW FUNCTIONS:
  
  /**
   * Get threat statistics
   */
  getStats: async (): Promise<ApiResponse<any>> => {
    return client.get<any>('/api/threats/stats')
  },

  /**
   * Block a threat
   */
  blockThreat: async (threatId: number): Promise<ApiResponse<any>> => {
    return client.post<any>('/api/threats/block', { 
      threat_id: threatId, 
      action: 'block' 
    })
  },

  /**
   * Dismiss a threat
   */
  dismissThreat: async (threatId: number): Promise<ApiResponse<any>> => {
    return client.post<any>('/api/threats/dismiss', { 
      threat_id: threatId, 
      action: 'dismiss' 
    })
  },
}

// ============================================
// DETECTION ENGINE API
// ============================================

export const detectionApi = {
  /**
   * Get detection results
   */
  getDetections: async (params?: {
    type?: string
    limit?: number
  }): Promise<ApiResponse<DetectionResult[]>> => {
    const query = new URLSearchParams(params as any).toString()
    return client.get<DetectionResult[]>(
      `/api/detection/results${query ? `?${query}` : ''}`
    )
  },

  /**
   * Get detection statistics
   */
  getStats: async (): Promise<ApiResponse<DetectionStats>> => {
    return client.get<DetectionStats>('/api/detection/stats')
  },

  /**
   * Trigger manual scan
   */
  triggerScan: async (target: {
    type: 'file' | 'directory' | 'process' | 'full_system'
    path?: string
  }): Promise<ApiResponse<{ scan_id: string }>> => {
    return client.post<{ scan_id: string }>('/api/detection/scan', target)
  },

  // ADD THESE 3 NEW FUNCTIONS BELOW:

  /**
   * Get detection engine status
   */
  getStatus: async (): Promise<ApiResponse<any>> => {
    return client.get<any>('/api/detection/status')
  },

  /**
   * Get recent scans
   */
  getScans: async (limit?: number): Promise<ApiResponse<any[]>> => {
    return client.get<any[]>(`/api/detection/scans${limit ? `?limit=${limit}` : ''}`)
  },

  /**
 * Upload file for scanning
 */
uploadFile: async (file: File): Promise<ApiResponse<any>> => {
  try {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await fetch(`${API_BASE_URL}/api/detection/scan/upload`, {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header - browser will set it with boundary
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Upload failed' }))
      return {
        success: false,
        error: error.message || error.detail || `HTTP ${response.status}`,
      }
    }

    const data = await response.json()
    return {
      success: true,
      data,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    }
  }
},
}

// ============================================
// RESPONSE ENGINE API
// ============================================

export const responseApi = {
  /**
   * Block IP address
   */
  blockIp: async (ip: string, reason: string): Promise<ApiResponse<ResponseAction>> => {
    return client.post<ResponseAction>('/api/response/block-ip', { ip, reason })
  },

  /**
   * Kill process
   */
  killProcess: async (pid: number, reason: string): Promise<ApiResponse<ResponseAction>> => {
    return client.post<ResponseAction>('/api/response/kill-process', { pid, reason })
  },

  /**
   * Quarantine file
   */
  quarantineFile: async (
    path: string,
    reason: string
  ): Promise<ApiResponse<ResponseAction>> => {
    return client.post<ResponseAction>('/api/response/quarantine', { path, reason })
  },

  /**
   * Isolate network
   */
  isolateNetwork: async (reason: string): Promise<ApiResponse<ResponseAction>> => {
    return client.post<ResponseAction>('/api/response/isolate-network', { reason })
  },

  /**
   * Restore network
   */
  restoreNetwork: async (): Promise<ApiResponse<ResponseAction>> => {
    return client.post<ResponseAction>('/api/response/restore-network')
  },

  /**
   * Get response history
   */
  getHistory: async (limit?: number): Promise<ApiResponse<ResponseAction[]>> => {
    return client.get<ResponseAction[]>(
      `/api/response/history${limit ? `?limit=${limit}` : ''}`
    )
  },
}

// ============================================
// DECEPTION LAYER API
// ============================================

export const deceptionApi = {
  /**
   * Get all honeypots
   */
 getHoneypots: async (): Promise<ApiResponse<HoneypotResponse[]>> => {
  return client.get<HoneypotResponse[]>('/api/deception/honeypots')
},

  /**
   * Create new honeypot
   */
  createHoneypot: async (honeypot: {
    name: string
    type: string
    path: string
  }): Promise<ApiResponse<Honeypot>> => {
    return client.post<Honeypot>('/api/deception/honeypots', honeypot)
  },

  /**
   * Get attacker sessions
   */
  getAttackerSessions: async (): Promise<ApiResponse<AttackerSession[]>> => {
    return client.get<AttackerSession[]>('/api/deception/sessions')
  },

  /**
   * Get session details
   */
  getSessionById: async (id: string): Promise<ApiResponse<AttackerSession>> => {
    return client.get<AttackerSession>(`/api/deception/sessions/${id}`)
  },

  /**
   * Generate honeypots automatically
   */
  generateHoneypots: async (count: number): Promise<ApiResponse<Honeypot[]>> => {
    return client.post<Honeypot[]>('/api/deception/generate', { count })
  },

  // ADD THESE 3 NEW FUNCTIONS BELOW:

  /**
   * Get deception layer status
   */
  getStatus: async (): Promise<ApiResponse<any>> => {
    return client.get<any>('/api/deception/status')
  },

  /**
   * Get honeypot interaction logs
   */
  getLogs: async (limit?: number): Promise<ApiResponse<any[]>> => {
    return client.get<any[]>(`/api/deception/logs${limit ? `?limit=${limit}` : ''}`)
  },

  /**
   * Toggle honeypot status (activate/deactivate)
   */
  toggleHoneypot: async (honeypotId: number, action: 'activate' | 'deactivate'): Promise<ApiResponse<any>> => {
    const status = action === 'activate' ? 'active' : 'inactive'
    return client.post<any>(`/api/deception/honeypots/${action}`, { 
      honeypot_id: honeypotId, 
      status 
    })
  },
}

// ============================================
// AI ENGINES API
// ============================================

export const aiApi = {
  /**
   * Predict attack
   */
  predictAttack: async (indicators: any): Promise<ApiResponse<Prediction>> => {
    return client.post<Prediction>('/api/ai/predict', indicators)
  },

  /**
   * Get risk forecast
   */
  getRiskForecast: async (days: number = 7): Promise<ApiResponse<RiskForecast>> => {
    return client.get<RiskForecast>(`/api/ai/forecast?days=${days}`)
  },

  /**
   * Analyze text with NLP
   */
  analyzeText: async (text: string): Promise<ApiResponse<NLPAnalysis>> => {
    return client.post<NLPAnalysis>('/api/ai/nlp/analyze', { text })
  },

  /**
   * Check for adversarial attack
   */
  checkAdversarial: async (data: {
    input: any
    prediction: any
    confidence: number
  }): Promise<ApiResponse<{ attack_detected: boolean; details: any }>> => {
    return client.post('/api/ai/adversarial/check', data)
  },

  // ADD THESE 4 NEW FUNCTIONS:

  /**
   * Get AI engine status
   */
  getStatus: async (): Promise<ApiResponse<any>> => {
    return client.get<any>('/api/ai/status')
  },

  /**
   * Get threat predictions
   */
  getPredictions: async (): Promise<ApiResponse<any[]>> => {
    return client.get<any[]>('/api/ai/predictions')
  },

  /**
   * Get risk score
   */
  getRiskScore: async (): Promise<ApiResponse<any>> => {
    return client.get<any>('/api/ai/risk-score')
  },

  /**
   * Get AI recommendations
   */
  getRecommendations: async (): Promise<ApiResponse<any[]>> => {
    return client.get<any[]>('/api/ai/recommendations')
  },
}

// ============================================
// WEBSOCKET CLIENT
// ============================================

export class WebSocketClient {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 3000

  /**
   * Connect to WebSocket for real-time updates
   */
  connect(onMessage: (data: any) => void, onError?: (error: Event) => void) {
    try {
      this.ws = new WebSocket(`${WS_BASE_URL}/ws`)

      this.ws.onopen = () => {
        console.log('✅ WebSocket connected')
        this.reconnectAttempts = 0
      }

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          onMessage(data)
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
        }
      }

      this.ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error)
        if (onError) onError(error)
      }

      this.ws.onclose = () => {
        console.log('🔌 WebSocket disconnected')
        this.attemptReconnect(onMessage, onError)
      }
    } catch (error) {
      console.error('Failed to create WebSocket:', error)
      if (onError) onError(error as Event)
    }
  }

  /**
   * Attempt to reconnect
   */
  private attemptReconnect(
    onMessage: (data: any) => void,
    onError?: (error: Event) => void
  ) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(
        `Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
      )
      setTimeout(() => {
        this.connect(onMessage, onError)
      }, this.reconnectDelay)
    } else {
      console.error('Max reconnection attempts reached')
    }
  }

  /**
   * Send message through WebSocket
   */
  send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    } else {
      console.warn('WebSocket not connected')
    }
  }

  /**
   * Close WebSocket connection
   */
  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }
}

// ============================================
// HONEYPOTS API
// ============================================

export const honeypotApi = {
  /**
   * Get honeypot status
   */
  getStatus: async (): Promise<ApiResponse<any[]>> => {
    return client.get<any[]>('/api/honeypots/status')
  },

  /**
   * Get recent attacks
   */
  getAttacks: async (limit?: number): Promise<ApiResponse<any[]>> => {
    return client.get<any[]>(`/api/honeypots/attacks${limit ? `?limit=${limit}` : ''}`)
  },

  /**
   * Get statistics
   */
  getStatistics: async (): Promise<ApiResponse<any>> => {
    return client.get<any>('/api/honeypots/statistics')
  },

  /**
   * Start honeypot
   */
  start: async (type: string): Promise<ApiResponse<any>> => {
    return client.post<any>(`/api/honeypots/start/${type}`)
  },

  /**
   * Stop honeypot
   */
  stop: async (type: string): Promise<ApiResponse<any>> => {
    return client.post<any>(`/api/honeypots/stop/${type}`)
  },

  /**
   * Start all honeypots
   */
  startAll: async (): Promise<ApiResponse<any>> => {
    return client.post<any>('/api/honeypots/start-all')
  },

  /**
   * Stop all honeypots
   */
  stopAll: async (): Promise<ApiResponse<any>> => {
    return client.post<any>('/api/honeypots/stop-all')
  },
}

// ============================================
// EXPORTS
// ============================================

export const api = {
  dashboard: dashboardApi,
  threats: threatsApi,
  detection: detectionApi,
  response: responseApi,
  deception: deceptionApi,
  ai: aiApi,
  honeypot: honeypotApi,
}

export default api