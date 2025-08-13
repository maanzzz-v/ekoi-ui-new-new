"use client"

import { useState } from "react"
import { ArrowLeft, Settings, MessageSquare, Database } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChatTab } from "@/components/agent-workspace/chat-tab"
import { DataHubTab } from "@/components/agent-workspace/data-hub-tab"
import { TasksTab } from "@/components/agent-workspace/tasks-tab"
import { useRouter } from "next/navigation"
import type { Agent } from "@/lib/types"

interface AgentWorkspaceProps {
  agent: Agent | null
  onBack: () => void
}

export function AgentWorkspace({ agent, onBack }: AgentWorkspaceProps) {
  const [activeTab, setActiveTab] = useState("tasks")
  const router = useRouter()

  const handleNavigateToDataHub = (selectionType: "resumes" | "job-descriptions") => {
    setActiveTab("data-hub")
  }

  const handleNavigateToChat = () => {
    setActiveTab("chat")
  }

  const handleNavigateToConfigure = (tab?: "output" | "notifications") => {
    if (agent?.id) {
      const url = tab ? `/agents/${agent.id}/configure?tab=${tab}` : `/agents/${agent.id}/configure`
      router.push(url)
    }
  }

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
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack} className="hover:bg-gray-100">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Agents
            </Button>
            <div className="h-6 w-px bg-gray-300" />
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                {agent.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{agent.name}</h1>
                <p className="text-gray-600">{agent.role}</p>
              </div>
            </div>
          </div>
          
          <Button
            variant="outline"
            onClick={() => handleNavigateToConfigure()}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Configure
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="bg-white border-b border-gray-200">
          <TabsList className="w-full justify-start bg-transparent h-auto p-0">
            <TabsTrigger
              value="tasks"
              className="flex items-center gap-2 px-6 py-4 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
            >
              <Settings className="h-5 w-5" />
              Tasks
            </TabsTrigger>
            <TabsTrigger
              value="data-hub"
              className="flex items-center gap-2 px-6 py-4 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
            >
              <Database className="h-5 w-5" />
              Data Hub
            </TabsTrigger>
            <TabsTrigger
              value="chat"
              className="flex items-center gap-2 px-6 py-4 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
            >
              <MessageSquare className="h-5 w-5" />
              AI Chat
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <TabsContent value="tasks" className="h-full m-0 p-0">
            <TasksTab 
              agent={agent} 
              onNavigateToDataHub={handleNavigateToDataHub}
              onNavigateToChat={handleNavigateToChat}
              onNavigateToConfigure={handleNavigateToConfigure}
            />
          </TabsContent>
          <TabsContent value="data-hub" className="h-full m-0 p-0">
            <DataHubTab agent={agent} />
          </TabsContent>
          <TabsContent value="chat" className="h-full m-0 p-0">
            <ChatTab agent={agent} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
