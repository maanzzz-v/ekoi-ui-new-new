"use client"

import { Bot, Database, Brain, Target, Upload, MessageCircle, BarChart3 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Agent } from "@/lib/types"

interface TasksTabProps {
  agent: Agent
}

interface Task {
  id: string
  name: string
  description: string
  icon: any
  color: string
  gradient: string
}

const getTasksForAgent = (agentId: string): Task[] => {
  const baseTasks: Task[] = [
    {
      id: "upload",
      name: "Upload & Process Resumes",
      description: "Upload resume files (PDF, DOC, DOCX, TXT) and automatically extract candidate information, skills, and experience using AI-powered processing. All uploaded files are analyzed for key qualifications and stored for future searches.",
      icon: Upload,
      color: "bg-blue-50",
      gradient: "from-blue-100 to-blue-50"
    },
    {
      id: "chat",
      name: "AI Chat Assistant",
      description: "Engage with the AI chat interface to search for candidates using natural language queries. Ask questions like 'Find Python developers with 5+ years experience' and get instant, contextual responses with relevant candidate matches.",
      icon: MessageCircle,
      color: "bg-green-50",
      gradient: "from-green-100 to-green-50"
    },
    {
      id: "shortlisting",
      name: "Smart Candidate Shortlisting",
      description: "Use advanced AI algorithms to automatically rank and shortlist candidates based on job requirements. Compare candidates, view detailed match scores, and export shortlisting reports with comprehensive analytics.",
      icon: Target,
      color: "bg-purple-50",
      gradient: "from-purple-100 to-purple-50"
    },
    {
      id: "analytics",
      name: "Recruitment Analytics",
      description: "Access comprehensive analytics about your recruitment process, including candidate quality metrics, skill distribution, search effectiveness, and hiring funnel analysis with real-time insights.",
      icon: BarChart3,
      color: "bg-indigo-50",
      gradient: "from-indigo-100 to-indigo-50"
    }
  ]

  return baseTasks
}

export function TasksTab({ agent }: TasksTabProps) {
  const tasks = getTasksForAgent(agent.id)

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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {tasks.map((task) => {
          const IconComponent = task.icon
          
          return (
            <Card 
              key={task.id} 
              className={`
                transition-all duration-300 border-2 border-gray-200
                bg-gradient-to-br ${task.gradient}
              `}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${task.color}`}>
                    <IconComponent className="h-6 w-6 text-gray-700" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
                      {task.name}
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-gray-600 leading-relaxed">
                  {task.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
