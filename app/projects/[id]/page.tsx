import { CanvasPage } from "@/components/pages/canvas-page"
import { notFound } from "next/navigation"

// Mock data - in a real app, this would come from a database
const mockProjects = [
  {
    id: "1",
    name: "Customer Analytics Pipeline",
    description: "Automated pipeline for analyzing customer behavior and generating insights.",
    createdDate: new Date("2024-01-15"),
    status: "active" as const,
  },
  {
    id: "2",
    name: "Content Moderation System",
    description: "AI-powered system for moderating user-generated content across platforms.",
    createdDate: new Date("2024-02-01"),
    status: "completed" as const,
  },
]

interface ProjectCanvasPageProps {
  params: { id: string }
}

export default function ProjectCanvasPage({ params }: ProjectCanvasPageProps) {
  const project = mockProjects.find((p) => p.id === params.id)

  if (!project) {
    notFound()
  }

  return <CanvasPage project={project} />
}
