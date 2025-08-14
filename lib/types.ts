export type PageType =
  | "landing"
  | "agents"
  | "projects"
  | "data-sourcing"
  | "create-agent"
  | "agent-workspace"
  | "canvas"
  | "configure-agent"

export interface Agent {
  id: string
  name: string
  role: string
  description: string
  avatar: string
  status: "active" | "inactive"
  model: string
}

export interface Project {
  id: string
  name: string
  description: string
  createdDate: Date
  status: "active" | "completed" | "paused"
}
