"use client"

import { AgentWorkspace } from "@/components/pages/agent-workspace"
import { notFound, useRouter } from "next/navigation"
import { use } from "react"

// Mock data - in a real app, this would come from a database
const mockAgents = [
  {
    id: "hira",
    name: "HIRA",
    role: "Hiring Agent",
    description:
      "Assists in the hiring process by shortlisting candidates, ranking resumes, and matching profiles to job descriptions.",
    avatar: "/agent-avatars/HIRA.jpg",
    status: "active" as const,
  },
  {
    id: "reva",
    name: "REVA",
    role: "Resume Evaluator",
    description: "Evaluates and analyzes resumes for key qualifications and experience matching.",
    avatar: "/agent-avatars/REVA.jpg",
    status: "active" as const,
  },
  {
    id: "juno",
    name: "JUNO",
    role: "Job Matching Agent",
    description: "Matches candidates with suitable job positions based on skills and requirements.",
    avatar: "/agent-avatars/JUNO.jpg",
    status: "active" as const,
  },
  {
    id: "luna",
    name: "LUNA",
    role: "Language Optimization Agent",
    description: "Optimizes job descriptions and candidate communications for better engagement.",
    avatar: "/agent-avatars/LUNA.jpg",
    status: "active" as const,
  },
  {
    id: "seera",
    name: "SEERA",
    role: "Screening Agent",
    description: "Conducts initial candidate screening and qualification assessment.",
    avatar: "/agent-avatars/SEERA.jpg",
    status: "active" as const,
  },
  {
    id: "navi",
    name: "NAVI",
    role: "Navigation Assistant",
    description: "Guides users through the recruitment process with intelligent assistance.",
    avatar: "/agent-avatars/NAVI.jpg",
    status: "active" as const,
  },
  {
    id: "orbi",
    name: "ORBI",
    role: "Opportunity Recommender",
    description: "Recommends suitable opportunities and career paths for candidates.",
    avatar: "/agent-avatars/ORBI.jpg",
    status: "active" as const,
  },
  {
    id: "reva2",
    name: "REVA2",
    role: "Resume Evaluator",
    description: "Advanced resume evaluation with detailed analysis and scoring.",
    avatar: "/agent-avatars/REVA2.jpg",
    status: "active" as const,
  },
]

interface AgentWorkspacePageProps {
  params: { id: string }
}

export default function AgentWorkspacePage({ params }: AgentWorkspacePageProps) {
  const router = useRouter()
  const resolvedParams = use(params)
  const agent = mockAgents.find((a) => a.id === resolvedParams.id)

  if (!agent) {
    notFound()
  }

  const handleBack = () => {
    router.push('/agents')
  }

  return <AgentWorkspace agent={agent} onBack={handleBack} />
}
