"use client"

import { useState } from "react"
import { 
  Play, 
  Users, 
  FileText, 
  ArrowRight, 
  Search, 
  Target, 
  Upload, 
  MessageCircle, 
  Download, 
  Bell, 
  Database, 
  Bot, 
  Settings,
  TrendingUp,
  BarChart3,
  Zap,
  Brain,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ShortlistingPage } from "@/components/shortlisting-page"
import type { Agent } from "@/lib/types"

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
  navigateTo?: "data-hub" | "chat" | "configure" | "shortlisting"
  configureTab?: "output" | "notifications"
  color: string
  gradient: string
  status?: "available" | "requires_data" | "in_progress"
  requirements?: string[]
}

const getTasksForAgent = (agentId: string): Task[] => {
  const baseTasks: Task[] = [
    {
      id: "upload",
      name: "Upload & Process Resumes",
      description: "Upload and process resume files for AI analysis",
      detailedDescription: "Upload resume files (PDF, DOC, DOCX, TXT) and automatically extract candidate information, skills, and experience using AI-powered processing. All uploaded files are analyzed for key qualifications and stored for future searches.",
      icon: Upload,
      actionType: "navigate",
      navigateTo: "data-hub",
      color: "bg-blue-50",
      gradient: "from-blue-100 to-blue-50",
      status: "available"
    },
    {
      id: "chat",
      name: "AI Chat Assistant",
      description: "Interactive AI-powered candidate search and analysis",
      detailedDescription: "Engage with the AI chat interface to search for candidates using natural language queries. Ask questions like 'Find Python developers with 5+ years experience' and get instant, contextual responses with relevant candidate matches.",
      icon: MessageCircle,
      actionType: "navigate",
      navigateTo: "chat",
      color: "bg-green-50",
      gradient: "from-green-100 to-green-50",
      status: "available"
    },
    {
      id: "shortlisting",
      name: "Smart Candidate Shortlisting",
      description: "AI-powered candidate ranking and shortlisting",
      detailedDescription: "Use advanced AI algorithms to automatically rank and shortlist candidates based on job requirements. Compare candidates, view detailed match scores, and export shortlisting reports.",
      icon: Target,
      actionType: "action",
      navigateTo: "shortlisting",
      color: "bg-purple-50",
      gradient: "from-purple-100 to-purple-50",
      status: "requires_data",
      requirements: ["At least 1 resume uploaded", "Job description or search criteria"]
    },
    {
      id: "analytics",
      name: "Recruitment Analytics",
      description: "View detailed recruitment metrics and insights",
      detailedDescription: "Access comprehensive analytics about your recruitment process, including candidate quality metrics, skill distribution, search effectiveness, and hiring funnel analysis.",
      icon: BarChart3,
      actionType: "navigate",
      navigateTo: "chat",
      color: "bg-indigo-50",
      gradient: "from-indigo-100 to-indigo-50",
      status: "requires_data",
      requirements: ["Resume data available", "Search history"]
    },
    {
      id: "configure_output",
      name: "Export & Download",
      description: "Configure output formats and export data",
      detailedDescription: "Download and export your search results, candidate profiles, and analytics reports. Configure output formats, create custom reports, and set up automated exports for your recruitment workflow.",
      icon: Download,
      actionType: "navigate",
      navigateTo: "configure",
      configureTab: "output",
      color: "bg-orange-50",
      gradient: "from-orange-100 to-orange-50",
      status: "available"
    },
    {
      id: "notifications",
      name: "Setup Notifications",
      description: "Configure automated recruitment notifications",
      detailedDescription: "Set up and manage automated notifications for candidates, team members, and stakeholders. Configure email templates, notification triggers, and delivery schedules to streamline your recruitment communication workflow.",
      icon: Bell,
      actionType: "navigate",
      navigateTo: "configure",
      configureTab: "notifications",
      color: "bg-yellow-50",
      gradient: "from-yellow-100 to-yellow-50",
      status: "available"
    }
  ]

  // Customize tasks based on agent type
  if (agentId === "hira") {
    return baseTasks
  } else if (agentId === "reva") {
    // Resume Evaluator specific tasks
    return [
      {
        ...baseTasks[0],
        name: "Upload Resumes for Evaluation",
        description: "Upload resumes for detailed AI evaluation and scoring"
      },
      {
        ...baseTasks[1],
        name: "Resume Analysis Chat",
        description: "Ask detailed questions about resume quality and candidate fit"
      },
      {
        id: "detailed_evaluation",
        name: "Detailed Resume Evaluation",
        description: "Comprehensive resume analysis with scoring",
        detailedDescription: "Get detailed evaluation of resumes including skill assessment, experience analysis, qualification matching, and overall candidate scoring with improvement recommendations.",
        icon: BarChart3,
        actionType: "action",
        navigateTo: "shortlisting",
        color: "bg-green-50",
        gradient: "from-green-100 to-green-50",
        status: "requires_data",
        requirements: ["Resumes uploaded for analysis"]
      },
      ...baseTasks.slice(4)
    ]
  }
  
  return baseTasks
}

export function TasksTab({
  agent,
  onNavigateToDataHub = () => {},
  onNavigateToChat = () => {},
  onNavigateToConfigure = () => {},
}: TasksTabProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isShortlistingOpen, setIsShortlistingOpen] = useState(false)
  const [taskProgress, setTaskProgress] = useState<Record<string, number>>({})

  const tasks = getTasksForAgent(agent.id)

  const handleTaskAction = (task: Task) => {
    if (task.status === "requires_data") {
      // Show requirements alert
      setSelectedTask(task)
      return
    }

    if (task.actionType === "navigate") {
      switch (task.navigateTo) {
        case "data-hub":
          onNavigateToDataHub?.("resumes")
          break
        case "chat":
          onNavigateToChat?.()
          break
        case "configure":
          onNavigateToConfigure?.(task.configureTab)
          break
        case "shortlisting":
          setIsShortlistingOpen(true)
          break
      }
    } else if (task.actionType === "action") {
      if (task.id === "shortlisting") {
        setIsShortlistingOpen(true)
      }
    }
  }

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "available":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "requires_data":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case "in_progress":
        return <Clock className="h-4 w-4 text-blue-500" />
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />
    }
  }

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "available":
        return <Badge variant="default" className="bg-green-100 text-green-800">Ready</Badge>
      case "requires_data":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Needs Data</Badge>
      case "in_progress":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">In Progress</Badge>
      default:
        return <Badge variant="default" className="bg-green-100 text-green-800">Ready</Badge>
    }
  }

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{agent.name} Tasks</h1>
            <p className="text-gray-600">{agent.description}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-500" />
                <div>
                  <div className="text-lg font-semibold text-gray-900">Data Hub</div>
                  <div className="text-sm text-gray-600">Manage resumes & files</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-green-500" />
                <div>
                  <div className="text-lg font-semibold text-gray-900">AI Assistant</div>
                  <div className="text-sm text-gray-600">Smart conversations</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-500" />
                <div>
                  <div className="text-lg font-semibold text-gray-900">Smart Matching</div>
                  <div className="text-sm text-gray-600">AI-powered shortlisting</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Task Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {tasks.map((task) => {
          const IconComponent = task.icon
          const progress = taskProgress[task.id] || 0
          
          return (
            <Card 
              key={task.id} 
              className={`
                group cursor-pointer transition-all duration-300 hover:shadow-lg border-2
                ${task.status === "requires_data" 
                  ? 'border-yellow-200 hover:border-yellow-300' 
                  : 'border-gray-200 hover:border-blue-300'
                }
                bg-gradient-to-br ${task.gradient}
              `}
              onClick={() => handleTaskAction(task)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-lg ${task.color} group-hover:scale-110 transition-transform duration-200`}>
                    <IconComponent className="h-6 w-6 text-gray-700" />
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(task.status)}
                    {getStatusBadge(task.status)}
                  </div>
                </div>
                <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                  {task.name}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600 leading-relaxed">
                  {task.description}
                </p>
                
                {progress > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )}
                
                {task.requirements && task.status === "requires_data" && (
                  <Alert className="border-yellow-200 bg-yellow-50">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800 text-xs">
                      <div className="font-medium mb-1">Requirements:</div>
                      <ul className="list-disc list-inside space-y-1">
                        {task.requirements.map((req, index) => (
                          <li key={index}>{req}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
                
                <Button 
                  className={`
                    w-full group-hover:scale-105 transition-all duration-200
                    ${task.status === "requires_data" 
                      ? 'bg-yellow-600 hover:bg-yellow-700' 
                      : 'bg-blue-600 hover:bg-blue-700'
                    }
                  `}
                  disabled={task.status === "in_progress"}
                >
                  {task.status === "requires_data" && "Setup Required"}
                  {task.status === "in_progress" && (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      In Progress
                    </>
                  )}
                  {task.status === "available" && (
                    <>
                      <ArrowRight className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform" />
                      Start Task
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Requirements Dialog */}
      <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              Task Requirements
            </DialogTitle>
          </DialogHeader>
          
          {selectedTask && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">{selectedTask.name}</h4>
                <p className="text-sm text-gray-600 mb-4">
                  {selectedTask.detailedDescription}
                </p>
              </div>
              
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  <div className="font-medium mb-2">Before you can use this task:</div>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {selectedTask.requirements?.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
              
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => {
                    setSelectedTask(null)
                    onNavigateToDataHub?.("resumes")
                  }}
                  className="flex-1"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Resumes
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedTask(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Shortlisting Dialog */}
      <Dialog open={isShortlistingOpen} onOpenChange={setIsShortlistingOpen}>
        <DialogContent className="max-w-7xl max-h-[90vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-500" />
              AI-Powered Candidate Shortlisting
            </DialogTitle>
          </DialogHeader>
          
          <div className="p-6 pt-0 max-h-[80vh] overflow-auto">
            <ShortlistingPage
              onCandidateSelect={(candidate) => {
                console.log('Selected candidate:', candidate)
              }}
              onBulkAction={(action, candidates) => {
                console.log('Bulk action:', action, candidates)
              }}
              onClose={() => setIsShortlistingOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
