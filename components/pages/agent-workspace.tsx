"use client"

import { useState } from "react"
import { ArrowLeft, Settings, MessageSquare, Database } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChatTab } from "@/components/agent-workspace/chat-tab"
import { DataHubTab } from "@/components/agent-workspace/data-hub-tab"
import { TasksTab } from "@/components/agent-workspace/tasks-tab"
import type { Agent } from "@/lib/types"

interface AgentWorkspaceProps {
  agent: Agent | null
  onBack: () => void
}

export function AgentWorkspace({ agent, onBack }: AgentWorkspaceProps) {
  const [activeTab, setActiveTab] = useState("chat")

  if (!agent) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">No Agent Selected</h1>
        <p className="text-lg text-gray-500 mb-8 max-w-lg">
          Please select an agent from the Agents page to view its workspace and manage settings.
        </p>
        <Button onClick={onBack} className="bg-orange-600 hover:bg-orange-700 text-lg px-8 py-4 shadow-md">
          <ArrowLeft className="h-5 w-5 mr-2" />
          Go to Agents
        </Button>
      </div>
    )
  }

  return (
    <div className="p-6 h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="flex items-center gap-6 mb-6 bg-white p-4 rounded-xl shadow-sm border">
        <Button variant="ghost" size="lg" onClick={onBack} className="text-lg hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </Button>
        <h1 className="text-5xl font-semibold text-gray-900">
          Agent Workspace: <span className="text-orange-600">{agent.name}</span>
        </h1>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3 text-lg bg-orange-150 border border-orange-300 rounded-lg overflow-hidden shadow-sm">
          <TabsTrigger
            value="tasks"
            className="flex items-center gap-2 py-3 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-600"
          >
            <Settings className="h-5 w-5" /> Tasks
          </TabsTrigger>
          <TabsTrigger
            value="data-hub"
            className="flex items-center gap-2 py-3 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-600"
          >
            <Database className="h-5 w-5" /> Data Hub
          </TabsTrigger>
          <TabsTrigger
            value="chat"
            className="flex items-center gap-2 py-3 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-600"
          >
            <MessageSquare className="h-5 w-5" /> Chat
          </TabsTrigger>
        </TabsList>

        {/* Content */}
        <div className="flex-1 mt-4 bg-white rounded-xl shadow-sm border p-6 overflow-auto">
          <TabsContent value="tasks" className="flex-1">
            <TasksTab agent={agent} />
          </TabsContent>
          <TabsContent value="data-hub" className="flex-1">
            <DataHubTab agent={agent} />
          </TabsContent>
          <TabsContent value="chat" className="flex-1">
            <ChatTab agent={agent} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
