"use client"

import { useState } from "react"
import { Play, Users, FileText, ArrowRight, Search, Target, Upload, MessageCircle, Download, Bell, Database, Bot, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ShortlistingPage } from "@/components/shortlisting-page"

interface Agent {
  id: string
  name: string
  role: string
  description: string
  avatar?: string
}

interface TasksTabProps {
  agent: Agent
  onNavigateToDataHub?: (selectionType: "resumes" | "job-descriptions") => void
  onNavigateToChat?: () => void
  onNavigateToConfigure?: (tab?: "output" | "notifications") => void
}

interface Task {
  id: string
  name: string
  description: string
  detailedDescription: string
  icon: any
  actionType: "navigate" | "action"
  navigateTo?: "data-hub" | "chat" | "configure"
  configureTab?: "output" | "notifications"
  color: string
  gradient: string
}

const hiratasks: Task[] = [
  {
    id: "1",
    name: "Upload & Process",
    description: "Upload and process resume files for AI analysis",
    detailedDescription: "Upload resume files (PDF, DOC, DOCX, TXT) and automatically extract candidate information, skills, and experience using AI-powered processing. All uploaded files are analyzed for key qualifications and stored for future searches.",
    icon: Upload,
    actionType: "navigate",
    navigateTo: "data-hub",
    color: "bg-blue-50",
    gradient: "from-blue-100 to-blue-50",
  },
  {
    id: "2",
    name: "AI Chat Assistant",
    description: "Interactive AI-powered candidate search and analysis",
    detailedDescription: "Engage with HIRA's intelligent chat interface to search for candidates using natural language queries. Ask questions like 'Find Python developers with 5+ years experience' and get instant, contextual responses with relevant candidate matches.",
    icon: MessageCircle,
    actionType: "navigate",
    navigateTo: "chat",
    color: "bg-green-50",
    gradient: "from-green-100 to-green-50",
  },
  {
    id: "3",
    name: "Download Chat Content",
    description: "Export conversation history and search results",
    detailedDescription: "Download and export your chat conversations with HIRA, including all search queries, candidate recommendations, and analysis results. Perfect for creating reports, sharing insights with team members, or maintaining recruitment records.",
    icon: Download,
    actionType: "navigate",
    navigateTo: "configure",
    configureTab: "output",
    color: "bg-purple-50",
    gradient: "from-purple-100 to-purple-50",
  },
  {
    id: "4",
    name: "Send Notifications",
    description: "Configure and send automated recruitment notifications",
    detailedDescription: "Set up and manage automated notifications for candidates, team members, and stakeholders. Configure email templates, notification triggers, and delivery schedules to streamline your recruitment communication workflow.",
    icon: Bell,
    actionType: "navigate",
    navigateTo: "configure",
    configureTab: "notifications",
    color: "bg-orange-50",
    gradient: "from-orange-100 to-orange-50",
  },
]

export function TasksTab({
  agent = {
    id: "hira",
    name: "HIRA",
    role: "Hiring Agent",
    description:
      "Assists in the hiring process by shortlisting candidates, ranking resumes, and matching profiles to job descriptions.",
    avatar: "/agent-avatars/HIRA.jpg",
  },
  onNavigateToDataHub = () => {},
  onNavigateToChat = () => {},
  onNavigateToConfigure = () => {},
}: Partial<TasksTabProps>) {
  const [showShortlistingDialog, setShowShortlistingDialog] = useState(false)
  const [shortlistingJobDescription, setShortlistingJobDescription] = useState("")

  const handleRunTask = async (taskId: string) => {
    const task = hiratasks.find(t => t.id === taskId)
    if (!task) return
    
    if (task.actionType === "navigate") {
      if (task.navigateTo === "data-hub") {
        onNavigateToDataHub?.("resumes")
      } else if (task.navigateTo === "chat") {
        onNavigateToChat?.()
      } else if (task.navigateTo === "configure") {
        onNavigateToConfigure?.(task.configureTab)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8 bg-white rounded-lg p-6 shadow-sm">
        <div className="flex items-start gap-6">
          <div className="w-24 h-32 overflow-hidden flex-shrink-0 rounded-lg">
            <img
              src={agent.avatar || "/placeholder.svg"}
              alt={`${agent.name} avatar`}
              className="w-full h-full object-contain scale-x-[-1]"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                // Fallback to colored rectangle with initial if image fails
                target.style.display = "none"
                const fallback = target.parentElement
                if (fallback) {
                  fallback.className =
                    "w-24 h-32 bg-orange-500 flex items-center justify-center flex-shrink-0 rounded-lg"
                  fallback.innerHTML = `<div class="text-white font-bold text-2xl">${agent.name.charAt(0)}</div>`
                }
              }}
            />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-orange-600">{agent.name}</h1>
            <p className="text-gray-600 font-medium">{agent.role}</p>
            <p className="text-gray-500 text-sm mt-1">{agent.description}</p>
          </div>
        </div>
      </div>

      {/* Tasks Section */}
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Quick Actions</h2>
          <span className="bg-gray-200 px-2 py-1 rounded text-sm font-medium">
            {hiratasks.length.toString().padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* Tasks Grid - 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {hiratasks.map((task) => {
          const IconComponent = task.icon

          return (
            <Card key={task.id} className={`${task.color} border-none shadow-sm hover:shadow-md transition-shadow`}>
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${task.gradient}`}>
                    <IconComponent className="h-6 w-6 text-gray-700" />
                  </div>
                  {task.name}
                </CardTitle>
                <p className="text-sm text-gray-600 leading-relaxed">{task.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Detailed Description */}
                <div className="bg-white/60 p-4 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {task.detailedDescription}
                  </p>
                </div>

                {/* Action Button */}
                <Button 
                  onClick={() => handleRunTask(task.id)} 
                  className="w-full bg-gray-800 hover:bg-gray-900 text-white font-medium h-12 flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02]"
                >
                  <IconComponent className="h-4 w-4" />
                  <span>Go to {task.navigateTo === 'data-hub' ? 'Data Hub' : task.navigateTo === 'chat' ? 'Chat' : 'Configure'}</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Advanced Shortlisting Dialog - Keep for backward compatibility */}
      <Dialog open={showShortlistingDialog} onOpenChange={setShowShortlistingDialog}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-orange-600" />
              AI-Powered Candidate Shortlisting
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto">
            <ShortlistingPage 
              initialJobDescription={shortlistingJobDescription}
              onClose={() => setShowShortlistingDialog(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
