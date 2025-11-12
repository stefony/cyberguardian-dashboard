"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { 
  Shield, 
  FileSearch, 
  Wrench, 
  Settings, 
  Clock, 
  Database,
  AlertTriangle,
  CheckCircle2,
  Activity
} from "lucide-react"

export default function RemediationPage() {
  const router = useRouter()

  const remediationModules = [
    {
      id: "registry",
      title: "Registry Cleanup",
      description: "Scan and remove malicious Windows registry entries",
      icon: Database,
      status: "available",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      path: "/remediation/registry",
      features: [
        "Scan autorun registry keys",
        "Detect suspicious entries",
        "Automatic backup before removal",
        "One-click restore"
      ]
    },
  {
  id: "services",
  title: "Services Cleanup",
  description: "Identify and remove malicious Windows services",
  icon: Settings,
  status: "available",  // ← Променено
  color: "text-purple-500",
  bgColor: "bg-purple-500/10",
  path: "/remediation/services",  // ← Променено
  features: [
    "Enumerate all services",
    "Detect suspicious services",
    "Stop and delete services",
    "Service backup"
  ]
},
    {
  id: "tasks",
  title: "Tasks Cleanup",
  description: "Scan and clean malicious scheduled tasks",
  icon: Clock,
  status: "available",  // ← Променено от "planned"
  color: "text-green-500",
  bgColor: "bg-green-500/10",
  path: "/remediation/tasks",  // ← Променено от "#"
  features: [
    "Scan Task Scheduler",
    "Identify malicious tasks",
    "Remove suspicious tasks",
    "Task backup"
  ]
},
    {
  id: "deep-quarantine",
  title: "Deep Quarantine",
  description: "Complete malware removal with deep scanning",
  icon: Shield,
  status: "available",  // ← Променено от "planned"
  color: "text-red-500",
  bgColor: "bg-red-500/10",
  path: "/remediation/quarantine",  // ← Променено от "#"
  features: [
    "Deep file analysis",
    "Registry reference scan",
    "Service dependency check",
    "Complete removal"
  ]
},
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/30">Available</Badge>
      case "planned":
        return <Badge className="bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30">Coming Soon</Badge>
      default:
        return null
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Wrench className="h-8 w-8 text-primary" />
            Malware Remediation
          </h1>
          <p className="text-muted-foreground mt-2">
            Advanced tools for complete malware removal and system cleanup
          </p>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-transparent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registry Entries</CardTitle>
            <Database className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Suspicious entries found</p>
          </CardContent>
        </Card>

        <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-transparent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Services</CardTitle>
            <Settings className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Malicious services</p>
          </CardContent>
        </Card>

        <Card className="border-green-500/20 bg-gradient-to-br from-green-500/10 to-transparent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled Tasks</CardTitle>
            <Clock className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Suspicious tasks</p>
          </CardContent>
        </Card>

        <Card className="border-red-500/20 bg-gradient-to-br from-red-500/10 to-transparent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Threats</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Persistence mechanisms</p>
          </CardContent>
        </Card>
      </div>

      {/* Remediation Modules */}
      <div className="grid gap-6 md:grid-cols-2">
        {remediationModules.map((module) => {
          const Icon = module.icon
          return (
            <Card key={module.id} className="hover:border-primary/50 transition-all">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${module.bgColor}`}>
                      <Icon className={`h-6 w-6 ${module.color}`} />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{module.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {module.description}
                      </CardDescription>
                    </div>
                  </div>
                  {getStatusBadge(module.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Features List */}
                <div className="space-y-2">
                  {module.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      {feature}
                    </div>
                  ))}
                </div>

                {/* Action Button */}
                <Button
                  className="w-full"
                  disabled={module.status !== "available"}
                  onClick={() => router.push(module.path)}
                >
                  {module.status === "available" ? (
                    <>
                      <FileSearch className="mr-2 h-4 w-4" />
                      Open Module
                    </>
                  ) : (
                    <>
                      <Activity className="mr-2 h-4 w-4" />
                      Coming Soon
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Info Card */}
      <Card className="border-yellow-500/20 bg-gradient-to-br from-yellow-500/10 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Important Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">⚠️ Administrator Rights Required:</strong> Most remediation operations require administrator privileges to modify system registry, services, and scheduled tasks.
          </p>
          <p>
            <strong className="text-foreground">💾 Automatic Backups:</strong> All modifications are automatically backed up before removal. You can restore any changes if needed.
          </p>
          <p>
            <strong className="text-foreground">🔍 Deep Scanning:</strong> Our remediation tools perform comprehensive scans to identify all persistence mechanisms used by malware.
          </p>
          <p>
            <strong className="text-foreground">🛡️ Safe Removal:</strong> Files and registry entries are analyzed before removal to prevent false positives and system damage.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}