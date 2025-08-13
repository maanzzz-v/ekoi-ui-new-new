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
    role: "Hiring Agent",
    description:
      "Assists in the hiring process by shortlisting candidates, ranking resumes, and matching profiles to job descriptions.",
    avatar: "/agent-avatars/HIRA.jpg",
    status: "active",
  },
  {
    id: "reva",
    name: "REVA",
    role: "Resume Evaluator",
    description: "Evaluates and analyzes resumes for key qualifications and experience matching.",
    avatar: "/agent-avatars/REVA.jpg",
    status: "active",
  },
  {
    id: "juno",
    name: "JUNO",
    role: "Job Matching Agent",
    description: "Matches candidates with suitable job positions based on skills and requirements.",
    avatar: "/agent-avatars/JUNO.jpg",
    status: "active",
  },
  {
    id: "luna",
    name: "LUNA",
    role: "Language Optimization Agent",
    description: "Optimizes job descriptions and candidate communications for better engagement.",
    avatar: "/agent-avatars/LUNA.jpg",
    status: "active",
  },
  {
    id: "seera",
    name: "SEERA",
    role: "Screening Agent",
    description: "Conducts initial candidate screening and qualification assessment.",
    avatar: "/agent-avatars/SEERA.jpg",
    status: "active",
  },
  {
    id: "navi",
    name: "NAVI",
    role: "Navigation Assistant",
    description: "Guides users through the recruitment process with intelligent assistance.",
    avatar: "/agent-avatars/NAVI.jpg",
    status: "active",
  },
  {
    id: "orbi",
    name: "ORBI",
    role: "Opportunity Recommender",
    description: "Recommends suitable opportunities and career paths for candidates.",
    avatar: "/agent-avatars/ORBI.jpg",
    status: "active",
  },
  {
    id: "reva2",
    name: "REVA2",
    role: "Resume Evaluator",
    description: "Advanced resume evaluation with detailed analysis and scoring.",
    avatar: "/agent-avatars/REVA2.jpg",
    status: "active",
  },
]

export function AgentsPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>("hira")
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
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div>
          <h1 className="text-5xl font-semibold text-gray-900 mb-2">Agent</h1>
          <div className="flex items-center text-sm text-gray-500">
            <span className="hover:text-gray-700 cursor-pointer text-2xl" onClick={handleHomeNavigation}>
              Home
            </span>
            <ChevronLeft className="h-4 w-4 mx-1 rotate-180" />
            <span className="text-gray-900 text-2xl">Agent</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-6 py-6">
        {/* Controls Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-gray-900">Available Agents</h2>
            <span className="bg-gray-200 text-gray-700 text-sm px-2 py-1 rounded-full min-w-[24px] text-center">
              {filteredAgents.length}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64 border-gray-300"
              />
            </div>
            <Button variant="outline" className="border-gray-300 bg-transparent">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button onClick={handleCreateAgent} className="bg-orange-500 hover:bg-orange-600 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Create New
            </Button>
          </div>
        </div>

        {/* Agents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredAgents.map((agent) => (
            <Card
              key={agent.id}
              className={`cursor-pointer overflow-hidden relative hover:shadow-md transition-all duration-200 ${
                selectedAgentId === agent.id
                  ? "border-orange-200 ring-1 ring-orange-200"
                  : "border-gray-200 hover:border-gray-300"
              }`}
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
                className={`p-0 h-96 relative ${selectedAgentId === agent.id ? "bg-orange-50" : "bg-white"}`}
              >
                {/* Main Card Layout */}
                <div className="h-full flex flex-col">
                  {/* Image Section - Takes most of the space */}
                  <div className="flex-1 relative overflow-hidden">
                    <img
                      src={agent.avatar || "/placeholder.svg"}
                      alt={`${agent.name} avatar`}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = "/placeholder.svg"
                      }}
                    />
                  </div>

                  {/* Text Section - Name and Role below image */}
                  <div className="p-4 text-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">{agent.name}</h3>
                    <p className="text-lg text-gray-600">{agent.role}</p>
                  </div>
                </div>

                {/* Hover Overlay with Description and Buttons */}
                {hoveredAgentId === agent.id && (
                  <div
                    className={`absolute inset-0 bg-orange-50/95 flex transition-all duration-3000 ease-in-out 
    ${hoveredAgentId === agent.id ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                  >
                    {/* Left side - Agent Info */}
                    <div className="w-1/2 p-4 flex flex-col justify-between">
                      <div>
                        <div className="text-center mb-4">
                          <h3 className="text-lg font-bold text-gray-900 mb-1">{agent.name}</h3>
                          <p className="text-sm text-gray-600 mb-3">{agent.role}</p>
                        </div>

                        <div className="mb-4">
                          <p className="text-sm text-gray-700 leading-relaxed">{agent.description}</p>
                        </div>
                      </div>

                      {/* Buttons Section */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-orange-600 border-orange-200 hover:bg-orange-100 bg-transparent"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setSelectedAgentId(agent.id)
                            handleSelectAgent(agent)
                          }}
                        >
                          Select →
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 border-gray-300 hover:bg-gray-50 bg-transparent"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setSelectedAgentId(agent.id)
                            handleConfigureAgent(agent)
                          }}
                        >
                          Configure →
                        </Button>
                      </div>
                    </div>

                    {/* Right side - Image */}
                    <div className="w-1/2 relative overflow-hidden">
                      <img
                        src={agent.avatar || "/placeholder.svg"}
                        alt={`${agent.name} avatar`}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "/placeholder.svg"
                        }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
