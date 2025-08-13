"use client"

import { useState } from "react"
import { 
  Search, 
  Filter, 
  Plus, 
  Play, 
  Pause, 
  CheckCircle, 
  ChevronLeft,
  Users,
  Bot,
  Target,
  BarChart3,
  Package,
  Mail,
  FileText,
  Monitor,
  Receipt,
  FolderOpen,
  Edit,
  Sparkles,
  TrendingUp,
  Zap,
  Clock
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Project {
  id: string
  name: string
  description: string
  createdDate: Date
  status: "active" | "completed" | "paused"
}

interface ProjectsPageProps {
  onSelectProject?: (project: Project) => void
  onCreateProject?: () => void
}

const mockProjects: Project[] = [
  {
    id: "1",
    name: "Automated HR Onboarding",
    description: "Streamline your entire HR onboarding workflow from day one. This comprehensive automation handles document collection, form processing, background checks, system account creation, and equipment assignment. New employees receive automated welcome emails, task checklists, and training schedules. Integration with HRIS systems ensures seamless data flow and compliance tracking throughout the onboarding journey.",
    createdDate: new Date("2023-10-01"),
    status: "active",
  },
  {
    id: "2",
    name: "Customer Support AI",
    description: "Deploy an intelligent AI-powered customer support system that handles 80% of common inquiries automatically. Features include natural language processing, sentiment analysis, ticket routing, and escalation management. The chatbot learns from interactions, provides instant responses 24/7, and seamlessly transfers complex issues to human agents with full context and conversation history.",
    createdDate: new Date("2023-09-15"),
    status: "paused",
  },
  {
    id: "3",
    name: "Sales Lead Qualification",
    description: "Transform your sales pipeline with intelligent lead scoring and qualification. This system analyzes prospect behavior, company data, engagement metrics, and demographic information to automatically score and prioritize leads. It integrates with CRM systems, sends personalized follow-ups, schedules meetings, and provides sales teams with detailed prospect insights and recommended actions.",
    createdDate: new Date("2023-11-01"),
    status: "completed",
  },
  {
    id: "4",
    name: "Financial Data Analysis",
    description: "Automate comprehensive financial reporting and analysis workflows. This system processes quarterly reports, performs variance analysis, generates executive dashboards, and identifies key performance trends. Features include automated data validation, exception reporting, budget vs. actual comparisons, and predictive analytics for forecasting. Delivers actionable insights directly to stakeholders via automated reports.",
    createdDate: new Date("2023-08-20"),
    status: "active",
  },
  {
    id: "5",
    name: "Inventory Manager",
    description: "Optimize warehouse operations with intelligent inventory tracking and management. This system monitors stock levels in real-time, predicts demand patterns, automates reorder points, and manages supplier relationships. Features include barcode scanning integration, automated purchase order generation, expiration date tracking, and comprehensive reporting on inventory turnover, carrying costs, and stockout prevention.",
    createdDate: new Date("2023-12-05"),
    status: "active",
  },
  {
    id: "6",
    name: "Email Campaign Optimizer",
    description: "Revolutionize your email marketing with AI-driven personalization and optimization. This system segments audiences automatically, generates personalized content, optimizes send times, and performs A/B testing on subject lines and content. Includes advanced analytics, deliverability monitoring, automated follow-up sequences, and integration with CRM systems for comprehensive customer journey tracking.",
    createdDate: new Date("2023-09-28"),
    status: "completed",
  },
]

export function ProjectsPage({ onSelectProject, onCreateProject }: ProjectsPageProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [projects, setProjects] = useState<Project[]>(mockProjects)
  const [newProject, setNewProject] = useState({
    name: "",
    description: ""
  })

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

  const getProjectIcon = (projectName: string) => {
    const name = projectName.toLowerCase()
    if (name.includes('hr') || name.includes('onboarding')) {
      return <Users className="h-8 w-8 text-orange-600" />
    } else if (name.includes('ai') || name.includes('bot') || name.includes('support')) {
      return <Bot className="h-8 w-8 text-orange-600" />
    } else if (name.includes('sales') || name.includes('lead')) {
      return <Target className="h-8 w-8 text-orange-600" />
    } else if (name.includes('financial') || name.includes('analysis')) {
      return <BarChart3 className="h-8 w-8 text-orange-600" />
    } else if (name.includes('inventory') || name.includes('manager')) {
      return <Package className="h-8 w-8 text-orange-600" />
    } else if (name.includes('email') || name.includes('campaign')) {
      return <Mail className="h-8 w-8 text-orange-600" />
    } else if (name.includes('document') || name.includes('processing')) {
      return <FileText className="h-8 w-8 text-orange-600" />
    } else if (name.includes('social') || name.includes('monitor')) {
      return <Monitor className="h-8 w-8 text-orange-600" />
    } else if (name.includes('expense') || name.includes('report')) {
      return <Receipt className="h-8 w-8 text-orange-600" />
    }
    return <FileText className="h-8 w-8 text-orange-600" />
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

  const handleCreateProjectClick = () => {
    if (onCreateProject) {
      onCreateProject()
    } else {
      setShowCreateDialog(true)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100">
      <div className="p-8 space-y-8">
        {/* Header with enhanced styling */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-600/10 via-orange-500/5 to-orange-400/10 rounded-3xl"></div>
          <div className="relative p-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <FolderOpen className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-5xl font-bold text-gray-900">Projects</h1>
                    <div className="flex items-center text-sm text-gray-500 mt-2">
                      <span className="hover:text-gray-700 cursor-pointer text-2xl">Home</span>
                      <ChevronLeft className="h-4 w-4 mx-1 rotate-180" />
                      <span className="text-gray-900 text-2xl">Projects</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    placeholder="Search projects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 w-80 h-12 text-lg border border-gray-300 rounded-lg px-4 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div className="relative">
                  <button 
                    className="h-12 px-6 text-lg bg-white border border-gray-300 rounded-lg flex items-center hover:bg-gray-50 transition-colors"
                    onClick={() => {/* Filter logic would go here */}}
                  >
                    <Filter className="h-5 w-5 mr-2" />
                    Filter
                    {selectedStatuses.length > 0 && (
                      <Badge className="ml-2 bg-gray-200 text-gray-800 hover:bg-gray-300">{selectedStatuses.length}</Badge>
                    )}
                  </button>
                </div>
                <button 
                  onClick={handleCreateProjectClick} 
                  className="bg-orange-600 hover:bg-orange-700 h-12 px-8 text-lg text-white rounded-lg flex items-center shadow-lg hover:shadow-xl transition-all"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create New
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="p-16 text-center bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
            <div className="w-32 h-32 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-8">
              <FolderOpen className="h-16 w-16 text-orange-600" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">No projects yet</h3>
            <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
              {searchTerm || selectedStatuses.length > 0
                ? "No matching projects found."
                : 'Create your first project to start building automated workflows'}
            </p>
            <button onClick={handleCreateProjectClick} className="text-lg h-14 px-8 bg-orange-600 hover:bg-orange-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all">
              <Plus className="mr-2 h-5 w-5 inline" />
              Create Your First Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-10">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className={`cursor-pointer transition-all duration-300 border rounded-xl p-8 group min-h-[500px] hover:shadow-2xl hover:-translate-y-2 ${
                  selectedProjectId === project.id
                    ? "ring-2 ring-orange-500 bg-gradient-to-br from-orange-50 to-orange-100 shadow-lg"
                    : "hover:shadow-xl bg-white/90 backdrop-blur-sm hover:border-gray-300 shadow-md"
                }`}
                onClick={() => setSelectedProjectId(project.id)}
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 rounded-t-xl"></div>
                <div className="h-full flex flex-col">
                  {/* Project Header with Icon */}
                  <div className="flex items-start gap-5 mb-6">
                    <div className="flex-shrink-0 p-4 bg-orange-50 rounded-lg group-hover:bg-orange-100 transition-colors group-hover:scale-110 duration-300">
                      {getProjectIcon(project.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-2xl font-bold text-gray-900 line-clamp-2 leading-tight mb-3 group-hover:text-orange-600 transition-colors">
                        {project.name}
                      </h3>
                      <p className="text-lg text-gray-500 mb-4">{project.createdDate.toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</p>
                      <Badge className={`text-lg px-4 py-2 inline-flex items-center gap-2 ${getStatusColor(project.status)}`}>
                        {getStatusIcon(project.status)}
                        {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                      </Badge>
                    </div>
                  </div>

                  {/* Project Description */}
                  <div className="mb-8 flex-1">
                    <p className="text-base text-gray-600 leading-relaxed">{project.description}</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 mt-auto">
                    <button
                      className="flex-1 bg-orange-600 hover:bg-orange-700 text-white text-lg py-3 h-12 rounded-lg transition-all shadow-lg hover:shadow-xl"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (onSelectProject) onSelectProject(project)
                      }}
                    >
                      Open Workflow
                    </button>
                    <button
                      className="flex-1 bg-white border border-gray-300 text-gray-700 text-lg py-3 h-12 rounded-lg hover:bg-gray-50 transition-all"
                      onClick={(e) => {
                        e.stopPropagation()
                        // Configure logic would go here
                      }}
                    >
                      Configure
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Project Dialog Overlay */}
        {showCreateDialog && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowCreateDialog(false)}>
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="h-6 w-6 text-orange-600" />
                <h2 className="text-2xl font-bold text-gray-900">Create New Project</h2>
              </div>
              <p className="text-gray-600 mb-6">Start a new workflow automation project</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Project Name *</label>
                  <input
                    placeholder="Enter project name"
                    className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Project Description</label>
                  <textarea
                    placeholder="Describe your project goals and objectives"
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 mt-6 border-t">
                <button 
                  onClick={() => setShowCreateDialog(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => setShowCreateDialog(false)}
                  className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
                >
                  Create Project
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
