"use client"

import { useState } from "react"
import { Play, Users, FileText, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

interface Agent {
  id: string
  name: string
  role: string
  description: string
  avatar?: string
}

interface TasksTabProps {
  agent: Agent
  onNavigateToDataHub: (selectionType: "resumes" | "job-descriptions") => void
}

interface Task {
  id: string
  name: string
  description: string
  inputType: string
  inputOptions: string[]
  allowMultiple?: boolean
  useDataHub?: boolean
  color: string
}

const mockTasks: Task[] = [
  {
    id: "1",
    name: "Process Resumes",
    description: "Process the resumes and extracts needed info about all candidates",
    inputType: "Select Resumes",
    inputOptions: ["resume_1.pdf", "resume_2.pdf", "resume_3.pdf"],
    allowMultiple: true,
    useDataHub: true,
    color: "bg-blue-100"
  },
  {
    id: "2",
    name: "Shortlist",
    description: "Shortlists the candidates based on the given job description",
    inputType: "Select JD",
    inputOptions: ["Senior Developer", "Product Manager", "Data Scientist"],
    useDataHub: true,
    color: "bg-orange-100"
  },
  {
    id: "3",
    name: "Finalize",
    description: "Finalize the candidates who are going to be interviewed and send inform them",
    inputType: "Select Candidates",
    inputOptions: ["John Doe", "Jane Smith", "Mike Johnson"],
    allowMultiple: true,
    color: "bg-purple-100"
  },
  {
    id: "4",
    name: "Process Resumes",
    description: "Process the resumes and extracts needed info about all candidates",
    inputType: "Select Resumes",
    inputOptions: ["resume_4.pdf", "resume_5.pdf", "resume_6.pdf"],
    allowMultiple: true,
    useDataHub: true,
    color: "bg-teal-100"
  },
  {
    id: "5",
    name: "Lorem ipsum dolor",
    description: "Process the resumes and extracts needed info about all candidates",
    inputType: "Select Resumes",
    inputOptions: ["Portfolio A", "Portfolio B", "Portfolio C"],
    allowMultiple: true,
    useDataHub: true,
    color: "bg-green-100"
  },
  {
    id: "6",
    name: "Lorem ipsum dolor",
    description: "Shortlists the candidates based on the given job description",
    inputType: "Select JD",
    inputOptions: ["Reference Set 1", "Reference Set 2"],
    useDataHub: true,
    color: "bg-yellow-100"
  },
  {
    id: "7",
    name: "Lorem ipsum dolor",
    description: "Finalize the candidates who are going to be interviewed and send inform them",
    inputType: "Select Candidates",
    inputOptions: ["Profile 1", "Profile 2", "Profile 3"],
    allowMultiple: true,
    color: "bg-pink-100"
  },
  {
    id: "8",
    name: "Lorem ipsum dolor",
    description: "Process the resumes and extracts needed info about all candidates",
    inputType: "Select Resumes",
    inputOptions: ["Junior Dev", "Senior Dev", "Lead Dev"],
    useDataHub: true,
    color: "bg-indigo-100"
  }
]

export function TasksTab({ agent = { id: "hira", name: "HIRA", role: "Hiring Agent", description: "Assists in the hiring process by shortlisting candidates, ranking resumes, and matching profiles to job descriptions." }, onNavigateToDataHub = () => {} }: Partial<TasksTabProps>) {
  const [selectedInputs, setSelectedInputs] = useState<Record<string, string | string[]>>({})
  const [runningTasks, setRunningTasks] = useState<Record<string, number>>({})

  const handleInputChange = (taskId: string, value: string | string[]) => {
    setSelectedInputs((prev) => ({ ...prev, [taskId]: value }))
  }

  const handleDataHubNavigation = (taskId: string) => {
    const task = mockTasks.find((t) => t.id === taskId)
    if (task?.inputType.toLowerCase().includes("resume")) {
      onNavigateToDataHub("resumes")
    } else if (task?.inputType.toLowerCase().includes("jd") || task?.inputType.toLowerCase().includes("job")) {
      onNavigateToDataHub("job-descriptions")
    }
  }

  const handleRunTask = (taskId: string) => {
    setRunningTasks((prev) => ({ ...prev, [taskId]: 0 }))

    // Simulate progress
    const interval = setInterval(() => {
      setRunningTasks((prev) => {
        const currentProgress = prev[taskId] || 0
        if (currentProgress >= 100) {
          clearInterval(interval)
          const { [taskId]: _, ...rest } = prev
          return rest
        }
        return { ...prev, [taskId]: currentProgress + 10 }
      })
    }, 200)
  }

  const isTaskReady = (taskId: string) => {
    const selected = selectedInputs[taskId]
    if (Array.isArray(selected)) {
      return selected.length > 0
    }
    return !!selected
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8 bg-white rounded-lg p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center">
            <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              H
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-orange-600">{agent.name}</h1>
            <p className="text-gray-600 font-medium">{agent.role}</p>
            <p className="text-gray-500 text-sm mt-1">{agent.description}</p>
          </div>
        </div>
      </div>

      {/* Tasks Section */}
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Tasks</h2>
          <span className="bg-gray-200 px-2 py-1 rounded text-sm font-medium">
            {mockTasks.length.toString().padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Tasks Grid - 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {mockTasks.map((task) => {
          const isSelected = isTaskReady(task.id)
          const isRunning = runningTasks[task.id] !== undefined
          const progress = runningTasks[task.id] || 0
          const selectedValue = selectedInputs[task.id]

          return (
            <Card key={task.id} className={`${task.color} border-none shadow-sm`}>
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  {task.name}
                  {task.allowMultiple && <Users className="h-5 w-5 text-blue-500" />}
                </CardTitle>
                <p className="text-sm text-gray-600 leading-relaxed">{task.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {task.useDataHub ? (
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-between bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-medium h-12"
                      onClick={() => handleDataHubNavigation(task.id)}
                    >
                      <span className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        {task.inputType}
                      </span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                    {selectedValue && (
                      <div className="text-xs text-gray-600">
                        {Array.isArray(selectedValue) ? (
                          <div className="flex flex-wrap gap-1">
                            {selectedValue.slice(0, 2).map((item, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {item}
                              </Badge>
                            ))}
                            {selectedValue.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{selectedValue.length - 2} more
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            {selectedValue}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <Select
                    value={Array.isArray(selectedInputs[task.id]) ? "" : (selectedInputs[task.id] as string) || ""}
                    onValueChange={(value) => handleInputChange(task.id, value)}
                    disabled={isRunning}
                  >
                    <SelectTrigger className="bg-white border-2 border-gray-300 h-12">
                      <SelectValue placeholder={task.inputType} />
                    </SelectTrigger>
                    <SelectContent>
                      {task.inputOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {isRunning && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Processing...</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )}

                <Button
                  className="w-full bg-gray-800 hover:bg-gray-900 text-white font-medium h-12"
                  disabled={!isSelected || isRunning}
                  onClick={() => handleRunTask(task.id)}
                >
                  <Play className="h-4 w-4 mr-2" />
                  {isRunning ? "Running..." : "Run"}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
