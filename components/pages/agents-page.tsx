"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Filter, Plus, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import type { Agent } from "@/lib/types"

const mockAgents: Agent[] = [
  {
    id: "hira",
    name: "HIRA",
    role: "Resume Parsing",
    description:
      "Hira parses and shortlists resumes using AI-driven filters, ranking candidates by relevance and role fit. She streamlines the initial screening with precision and speed.",
    avatar: "/agent-avatars/HIRA.jpg",
    status: "active",
  },
  {
    id: "ravi",
    name: "RAVI",
    role: "Interview Scheduler",
    description:
      "Ravi orchestrates interview logistics across candidates and panels, automating reminders, reschedules, and confirmations via calendar integrations. He ensures smooth, timely coordination for recruiters and candidates alike.",
    avatar: "/agent-avatars/RAVI.jpg",
    status: "active",
  },
  {
    id: "lina",
    name: "LINA",
    role: "Candidate Assistant",
    description:
      "Lina guides candidates through the hiring journey, answering queries, sharing updates, and prepping them for interviews. She ensures a warm, informed experience at every step.",
    avatar: "/agent-avatars/LINA.jpg",
    status: "active",
  },
  {
    id: "karim",
    name: "KARIM",
    role: "Interviewer",
    description:
      "Karim conducts structured interviews, captures feedback, and syncs with hiring panels. He ensures fair, consistent evaluation aligned with role expectations.",
    avatar: "/agent-avatars/KARIM.jpg",
    status: "active",
  },
  {
    id: "ava",
    name: "AVA",
    role: "Offer Coordinator",
    description:
      "Ava manages offer approvals, documentation, and negotiation workflows. She ensures fast, compliant, and candidate-friendly offer rollouts.",
    avatar: "/agent-avatars/AVA.jpg",
    status: "active",
  },
  {
    id: "maya",
    name: "MAYA",
    role: "Onboarding Lead",
    description:
      "Maya handles onboarding tasks, document collection, and orientation scheduling. She ensures new hires feel welcomed, informed, and ready to begin.",
    avatar: "/agent-avatars/MAYA.jpg",
    status: "active",
  },
  {
    id: "jin",
    name: "JIN",
    role: "Vendor Manager",
    description:
      "Jin coordinates with staffing vendors, tracks SLAs, and manages external candidate pipelines. He ensures vendor compliance and delivery quality.",
    avatar: "/agent-avatars/JIN.jpg",
    status: "active",
  },
  {
    id: "noor",
    name: "NOOR",
    role: "Hiring Supervisor",
    description:
      "Noor oversees the entire hiring flow, monitors agent performance, and resolves escalations. She ensures alignment with business goals and hiring timelines.",
    avatar: "/agent-avatars/NOOR.jpg",
    status: "active",
  },
]


export function AgentsPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)
  const [hoveredAgentId, setHoveredAgentId] = useState<string | null>(null)

  const filteredAgents = mockAgents.filter(
    (agent) =>
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.role.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleSelectAgent = (agent: Agent) => {
    router.push(`/agents/${agent.id}`)
  }

  const handleCreateAgent = () => {
    router.push("/agents/create")
  }

  const handleConfigureAgent = (agent: Agent) => {
    router.push(`/agents/${agent.id}/configure`)
  }

  const handleHomeNavigation = () => {
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Responsive */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 sm:py-6">
        <div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-gray-900 mb-2 tracking-tight">
            Agent
          </h1>
          <div className="flex items-center text-sm sm:text-base lg:text-lg text-gray-500">
            <span 
              className="hover:text-gray-700 cursor-pointer transition-colors duration-200 hover:scale-105" 
              onClick={handleHomeNavigation}
            >
              Home
            </span>
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 mx-1 rotate-180 text-gray-400" />
            <span className="text-gray-900 font-medium">Agent</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-4 sm:px-6 py-4 sm:py-6">
        {/* Controls Bar - Enhanced responsive design */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6 mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900">
              Available Agents
            </h2>
            <span className="bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 text-sm sm:text-base px-3 py-1 rounded-full min-w-[32px] text-center font-semibold shadow-sm">
              {filteredAgents.length}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
              <Input
                placeholder="Search agents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 sm:pl-12 w-full sm:w-64 lg:w-72 border-gray-300 focus:border-orange-300 focus:ring-orange-200 transition-all duration-200"
              />
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1 sm:flex-initial border-gray-300 bg-white hover:bg-gray-50 transition-all duration-200 hover:scale-105 hover:shadow-md"
              >
                <Filter className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Filter</span>
              </Button>
              <Button 
                onClick={handleCreateAgent} 
                className="flex-1 sm:flex-initial bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white transition-all duration-200 hover:scale-105 hover:shadow-lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Create New</span>
                <span className="sm:hidden">Create</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Agents Grid - Responsive with dynamic sizing */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
          {filteredAgents.map((agent, index) => (
            <Card
              key={agent.id}
              className={`cursor-pointer overflow-hidden relative group transform transition-all duration-300 ease-out hover:scale-[1.02] hover:-translate-y-2 ${
                selectedAgentId === agent.id
                  ? "ring-2 ring-orange-300 shadow-xl scale-[1.02] border-orange-300" 
                  : "border-gray-200 hover:border-orange-200 hover:shadow-xl"
              }`}
              style={{
                animationDelay: `${index * 100}ms`,
                animation: "fadeInUp 0.6s ease-out forwards"
              }}
              onClick={(e) => {
                if (!(e.target as HTMLElement).closest('button')) {
                  setSelectedAgentId(agent.id)
                  handleSelectAgent(agent)
                }
              }}
              onMouseEnter={() => setHoveredAgentId(agent.id)}
              onMouseLeave={() => setHoveredAgentId(null)}
            >
              <CardContent
                className={`p-0 relative transition-all duration-300 ${
                  selectedAgentId === agent.id 
                    ? "bg-gradient-to-br from-orange-50 to-orange-100" 
                    : "bg-white group-hover:bg-gray-50"
                } 
                h-64 sm:h-72 md:h-80 lg:h-72 xl:h-80 2xl:h-96`}
              >
                {/* Main Card Layout */}
                <div className="h-full flex flex-col">
                  {/* Image Section - Takes most of the space */}
                  <div className="flex-1 relative overflow-hidden">
                    {/* Subtle gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
                    
                    <img
                      src={agent.avatar || "/placeholder.svg"}
                      alt={`${agent.name} avatar`}
                      className="w-full h-full object-contain transition-all duration-500 group-hover:scale-105"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = "/placeholder.svg"
                      }}
                    />
                  </div>

                  {/* Text Section - Better typography and spacing */}
                  <div className="p-4 text-center bg-gradient-to-t from-white to-transparent">
                    <h3 className="text-lg sm:text-xl lg:text-2xl xl:text-xl 2xl:text-2xl font-bold text-gray-900 mb-2 tracking-tight leading-tight">
                      {agent.name}
                    </h3>
                    <p className="text-sm sm:text-base lg:text-lg xl:text-base 2xl:text-lg text-gray-600 font-medium">
                      {agent.role}
                    </p>
                  </div>
                </div>

                {/* Enhanced Hover Overlay - Full description with ghosted background */}
                <div
                  className={`absolute inset-0 transition-all duration-400 ease-out ${
                    hoveredAgentId === agent.id 
                      ? "opacity-100" 
                      : "opacity-0 pointer-events-none"
                  }`}
                >
                  {/* Ghosted background image */}
                  <div className="absolute inset-0 overflow-hidden">
                    <img
                      src={agent.avatar || "/placeholder.svg"}
                      alt={`${agent.name} background`}
                      className="w-full h-full object-contain opacity-10 scale-110 filter blur-sm"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = "/placeholder.svg"
                      }}
                    />
                    {/* Gradient overlay for better text readability */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/95 via-white/90 to-white/95"></div>
                  </div>
                  
                  {/* Content overlay */}
                  <div className="relative z-10 h-full w-full p-4 flex flex-col justify-between">
                    {/* Header Section */}
                    <div className="text-center flex-shrink-0 mb-3">
                      <h3 className="text-lg font-bold text-gray-900 mb-1 leading-tight">
                        {agent.name}
                      </h3>
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <div className="h-0.5 w-6 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full"></div>
                        <p className="text-sm text-orange-600 font-semibold uppercase tracking-wide">
                          {agent.role}
                        </p>
                        <div className="h-0.5 w-6 bg-gradient-to-r from-orange-500 to-orange-400 rounded-full"></div>
                      </div>
                    </div>

                    {/* Description Section - Full text display */}
                    <div className="flex-1 flex items-center justify-center px-2">
                      <div className="w-full text-center">
                        <p className="text-sm leading-relaxed text-gray-800 font-medium"
                           style={{
                             fontSize: `${Math.max(0.75, Math.min(1, 300 / agent.description.length))}rem`,
                             lineHeight: '1.4'
                           }}>
                          {agent.description}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 flex-shrink-0 mt-3">
                      <Button
                        size="sm"
                        className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium py-2 h-9 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-md"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setSelectedAgentId(agent.id)
                          handleSelectAgent(agent)
                        }}
                      >
                        <span className="flex items-center justify-center gap-1">
                          Select
                          <span className="transform transition-transform group-hover:translate-x-1">→</span>
                        </span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-gray-400 bg-white/90 hover:bg-gray-100 text-gray-700 font-medium py-2 h-9 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-md"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setSelectedAgentId(agent.id)
                          handleConfigureAgent(agent)
                        }}
                      >
                        <span className="flex items-center justify-center gap-1">
                          Configure
                          <span className="transform transition-transform group-hover:rotate-90">⚙</span>
                        </span>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
