"use client"

import { useState } from "react"
import { Search, Filter, Plus, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import type { Agent } from "@/lib/types"

interface AgentsPageProps {
  onSelectAgent: (agent: Agent) => void
  onCreateAgent: () => void
  onConfigureAgent: (agent: Agent) => void
}

const mockAgents: Agent[] = [
  {
    id: "hira",
    name: "HIRA",
    role: "Hiring Agent",
    description:
      "Assists in the hiring process by shortlisting candidates, ranking resumes, and matching profiles to job descriptions.",
    avatar: "/agent-avatar.jpg",
    status: "active",
  },
  {
    id: "2",
    name: "REVA",
    role: "Resume Evaluator",
    description: "Evaluates and analyzes resumes for key qualifications and experience matching.",
    avatar: "/agent-avatar.jpg",
    status: "active",
  },
  {
    id: "3",
    name: "JUNO",
    role: "Job Matching Agent",
    description: "Matches candidates with suitable job positions based on skills and requirements.",
    avatar: "/agent-avatar.jpg",
    status: "active",
  },
  {
    id: "4",
    name: "LUNA",
    role: "Language Optimization Agent",
    description: "Optimizes job descriptions and candidate communications for better engagement.",
    avatar: "/agent-avatar.jpg",
    status: "active",
  },
  {
    id: "5",
    name: "ORBI",
    role: "Opportunity Recommender",
    description: "Recommends suitable opportunities and career paths for candidates.",
    avatar: "/agent-avatar.jpg",
    status: "active",
  },
  {
    id: "6",
    name: "NAVI",
    role: "Navigation Assistant",
    description: "Guides users through the recruitment process with intelligent assistance.",
    avatar: "/agent-avatar.jpg",
    status: "active",
  },
  {
    id: "7",
    name: "SEERA",
    role: "Screening Agent",
    description: "Conducts initial candidate screening and qualification assessment.",
    avatar: "/agent-avatar.jpg",
    status: "active",
  },
  {
    id: "8",
    name: "REVA",
    role: "Resume Evaluator",
    description: "Advanced resume evaluation with detailed analysis and scoring.",
    avatar: "/agent-avatar.jpg",
    status: "active",
  },
]

export function AgentsPage({ onSelectAgent, onCreateAgent, onConfigureAgent }: AgentsPageProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>("1")

  const filteredAgents = mockAgents.filter(
    (agent) =>
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.role.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div>
          <h1 className="text-5xl font-semibold text-gray-900 mb-2">Agent</h1>
          <div className="flex items-center text-sm text-gray-500">
            <span className="hover:text-gray-700 cursor-pointer text-2xl">Home</span>
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
            <Button onClick={onCreateAgent} className="bg-orange-500 hover:bg-orange-600 text-white">
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
              className={`cursor-pointer transition-all duration-200 hover:shadow-md overflow-hidden ${
                selectedAgentId === agent.id
                  ? "border-orange-200 ring-1 ring-orange-200"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setSelectedAgentId(agent.id)}
              style={{
                backgroundImage: `url(${agent.avatar || "/placeholder.svg"})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            >
              <CardContent className="p-6 bg-white/90 backdrop-blur-sm h-full">
                <div className="text-center mb-4">
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">{agent.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{agent.role}</p>
                </div>

                <div className="h-48 mb-4"></div>

                {selectedAgentId === agent.id && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-700 leading-relaxed">{agent.description}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-orange-600 border-orange-200 hover:bg-orange-50 bg-transparent"
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelectAgent(agent)
                    }}
                  >
                    Select →
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 border-gray-300 hover:bg-gray-50 bg-transparent"
                    onClick={(e) => {
                      e.stopPropagation()
                      onConfigureAgent(agent)
                    }}
                  >
                    Configure →
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
