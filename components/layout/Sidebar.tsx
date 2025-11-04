'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/contexts/AuthContext'

import { 
  Shield, 
  Activity, 
  AlertTriangle, 
  Eye, 
  Brain, 
  BarChart3, 
  Settings,
  Mail,
  Target,
  ChevronLeft,
  ChevronRight,
  Zap,
  LogOut,
  Calendar,
  Lock,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/',
    icon: Activity,
  },
  {
    label: 'Threats',
    href: '/threats',
    icon: AlertTriangle,
    badge: 3,
  },
  {
    label: 'Detection',
    href: '/detection',
    icon: Zap,
  },
  {
    label: 'Protection',      
    href: '/protection',       
    icon: Shield,              
  },    
  {
    label: 'Scans',           // ← ADD THIS
    href: '/scans',           // ← ADD THIS
    icon: Calendar,           // ← ADD THIS (need to import)
  },   
  {
    label: 'Quarantine',      // ← ADD THIS
    href: '/quarantine',      // ← ADD THIS
    icon: Lock,             // ← ADD THIS (we can use Shield or import new icon)
  },
  {
    label: 'Deception',
    href: '/deception',
    icon: Eye,
  },
  {
   label: 'Insights',
  href: '/insights', 
  icon: Brain,
  },
  {
    label: 'ML Models',
    href: '/ml',
    icon: Zap,
  },
  {
    label: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
  },
  {
    label: 'Email Scanner',
    href: '/emails',
    icon: Mail,
  },
  {
    label: 'Honeypots',
    href: '/honeypots',
    icon: Target,
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: Settings,
  },
]

export function Sidebar() {
  const { logout } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  console.log('Current pathname:', pathname) // DEBUG

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen transition-all duration-300',
        'bg-dark-surface border-r border-dark-border',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-dark-border px-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyber-purple to-cyber-blue">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold gradient-cyber">
                CyberGuardian
              </h1>
              <p className="text-xs text-muted-foreground">AI Security</p>
            </div>
          </div>
        )}
        
        {collapsed && (
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyber-purple to-cyber-blue">
            <Shield className="h-6 w-6 text-white" />
          </div>
        )}

        {/* Collapse Toggle (hidden when collapsed, shown on hover) */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'absolute -right-3 top-6 z-50 flex h-6 w-6 items-center justify-center rounded-full',
            'bg-dark-surface border border-dark-border shadow-lg',
            'hover:bg-dark-bg transition-all duration-200',
            'opacity-0 group-hover:opacity-100',
            collapsed && 'opacity-100'
          )}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200',
                'hover:bg-dark-bg',
                isActive && 'bg-dark-bg text-purple-500',
                !isActive && 'text-muted-foreground hover:text-foreground'
              )}
            >
              {/* Active Indicator */}
              {isActive && (
                <div className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-purple-500" />
              )}

              <Icon 
                className={cn(
                  'h-5 w-5 flex-shrink-0 transition-colors',
                  isActive && 'text-purple-500',
                  !isActive && 'text-muted-foreground group-hover:text-foreground'
                )} 
              />
              
              {!collapsed && (
                <>
                  <span className="flex-1 text-sm font-medium">
                    {item.label}
                  </span>
                  
                  {/* Badge */}
                  {item.badge && item.badge > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-threat-critical px-1.5 text-xs font-bold text-white">
                      {item.badge}
                    </span>
                  )}
                </>
              )}

              {/* Tooltip for collapsed state */}
              {collapsed && (
                <div className="pointer-events-none absolute left-full ml-2 hidden rounded-md bg-dark-bg px-2 py-1 text-sm font-medium shadow-lg group-hover:block">
                  {item.label}
                  {item.badge && item.badge > 0 && (
                    <span className="ml-2 rounded-full bg-threat-critical px-1.5 text-xs text-white">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </Link>
          )
        })}
      </nav>

     {/* System Status */}
      <div className={cn(
        'border-t border-dark-border',
        collapsed ? 'p-2' : 'p-4'
      )}>
        {!collapsed && (
          <div className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">System Status</span>
                <span className="flex items-center gap-1 text-cyber-green">
                  <span className="h-2 w-2 rounded-full bg-cyber-green animate-pulse" />
                  Protected
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-dark-bg overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyber-blue to-cyber-green transition-all duration-500"
                  style={{ width: '94%' }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                All systems operational
              </p>
            </div>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-red-500 hover:bg-dark-bg transition-all duration-200"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        )}

        {collapsed && (
          <div className="space-y-2">
            <div className="flex justify-center">
              <div className="h-8 w-8 rounded-full bg-cyber-green/20 flex items-center justify-center">
                <Shield className="h-4 w-4 text-cyber-green" />
              </div>
            </div>
            {/* Logout Icon for collapsed */}
            <button
              onClick={logout}
              className="w-full flex justify-center items-center py-2 text-muted-foreground hover:text-red-500 transition-colors"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}