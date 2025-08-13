"use client"

import { useState } from "react"
import { Search, Filter, Plus, Play, Pause, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Project } from "@/lib/types"

const mockProjects: Project[] = [
  {
    id: "1",
    name: "Automated HR Onboarding",
    description: "Automate the entire HR onboarding process from document collection to system access.",
    createdDate: new Date("2023-10-01"),
    status: "active",
  },
  {
    id: "2",
    name: "Customer Support AI",
    description: "Implement an AI-powered chatbot for first-line customer support inquiries.",
    createdDate: new Date("2023-09-15"),
    status: "paused",
  },
  {
    id: "3",
    name: "Sales Lead Qualification",
    description: "Automatically qualify sales leads based on predefined criteria and data points.",
    createdDate: new Date("2023-11-01"),
    status: "completed",
  },
  {
    id: "4",
    name: "Financial Data Analysis",
    description: "Analyze quarterly financial reports and generate key insights for stakeholders.",
    createdDate: new Date("2023-08-20"),
    status: "active",
  },
  {
    id: "5",
    name: "Inventory Management Bot",
    description: "Automated inventory tracking and reorder notifications for warehouse operations.",
    createdDate: new Date("2023-12-05"),
    status: "active",
  },
  {
    id: "6",
    name: "Email Campaign Optimizer",
    description: "AI-driven email marketing campaigns with personalized content generation.",
    createdDate: new Date("2023-09-28"),
    status: "completed",
  },
  {
    id: "7",
    name: "Document Processing Pipeline",
    description: "Extract and process data from invoices, receipts, and contracts automatically.",
    createdDate: new Date("2024-01-12"),
    status: "paused",
  },
  {
    id: "8",
    name: "Social Media Monitor",
    description: "Track brand mentions and sentiment analysis across social platforms.",
    createdDate: new Date("2023-11-20"),
    status: "active",
  },
  {
    id: "9",
    name: "Expense Report Automation",
    description: "Streamline expense reporting with receipt scanning and auto-categorization.",
    createdDate: new Date("2023-08-15"),
    status: "completed",
  },
]

interface ProjectsPageProps {
  onSelectProject: (project: Project) => void
  onCreateProject: () => void
}

export function ProjectsPage({ onSelectProject, onCreateProject }: ProjectsPageProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)

  const availableStatuses = ["active", "completed", "paused"]

  const filteredProjects = mockProjects.filter(
    (project) =>
      (project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedStatuses.length === 0 || selectedStatuses.includes(project.status)),
  )

  const handleStatusChange = (status: string, checked: boolean) => {
    const newStatuses = checked ? [...selectedStatuses, status] : selectedStatuses.filter((s) => s !== status)
    setSelectedStatuses(newStatuses)
  }

  const getStatusIcon = (status: Project["status"]) => {
    switch (status) {
      case "active":
        return <Play className="h-5 w-5 text-green-600" />
      case "paused":
        return <Pause className="h-5 w-5 text-yellow-600" />
      case "completed":
        return <CheckCircle className="h-5 w-5 text-blue-600" />
      default:
        return null
    }
  }

  const getStatusColor = (status: Project["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "paused":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-5xl font-bold text-gray-900">Projects</h1>
          <p className="text-2xl text-gray-600 mt-2">
            {filteredProjects.length} of {mockProjects.length} projects
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 w-80 h-12 text-lg"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-12 px-6 text-lg bg-transparent">
                <Filter className="h-5 w-5 mr-2" />
                Filter
                {selectedStatuses.length > 0 && (
                  <Badge className="ml-2 bg-gray-200 text-gray-800 hover:bg-gray-300">{selectedStatuses.length}</Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {availableStatuses.map((status) => (
                <DropdownMenuCheckboxItem
                  key={status}
                  checked={selectedStatuses.includes(status)}
                  onCheckedChange={(checked) => handleStatusChange(status, checked)}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={onCreateProject} className="bg-orange-600 hover:bg-orange-700 h-12 px-8 text-lg">
            <Plus className="h-5 w-5 mr-2" />
            Create New
          </Button>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="p-16 text-center border border-dashed border-gray-300 rounded-xl">
          <p className="text-xl text-gray-500">
            {searchTerm || selectedStatuses.length > 0
              ? "No matching projects found."
              : 'No projects created yet. Click "Create New" to get started.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className={`cursor-pointer transition-all duration-200 border rounded-xl p-8 h-80 group ${
                selectedProjectId === project.id
                  ? "ring-2 ring-orange-500 bg-gradient-to-br from-orange-50 to-orange-100 shadow-lg"
                  : "hover:shadow-xl bg-white hover:border-gray-300 shadow-md"
              }`}
              onClick={() => setSelectedProjectId(project.id)}
            >
              <div className="h-full flex flex-col">
                <div className="mb-6">
                  <h3 className="text-2xl font-semibold text-gray-900 line-clamp-2 leading-tight mb-3 group-hover:text-orange-600">
                    {project.name}
                  </h3>
                  <p className="text-base text-gray-500 mb-4">
                    {project.createdDate.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <Badge
                    className={`text-base px-4 py-2 inline-flex items-center gap-2 ${getStatusColor(project.status)}`}
                  >
                    {getStatusIcon(project.status)}
                    {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                  </Badge>
                </div>

                {selectedProjectId === project.id && (
                  <div className="mb-6 flex-1">
                    <p className="text-base text-gray-600 leading-relaxed">{project.description}</p>
                  </div>
                )}

                <div className="flex gap-3 mt-auto">
                  <Button
                    size="lg"
                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-base py-4 h-12"
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelectProject(project)
                    }}
                  >
                    Open Workflow
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="flex-1 bg-transparent text-base py-4 h-12 hover:bg-gray-50"
                    onClick={(e) => {
                      e.stopPropagation()
                    }}
                  >
                    Configure
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
