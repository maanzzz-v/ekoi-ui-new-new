"use client"

import { useState } from "react"
import { Send, Search, Plus, MoreHorizontal, MessageSquare, Database, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Agent {
  id: string
  name: string
  avatar: string
}

interface ChatMessage {
  id: string
  content: string
  sender: "user" | "agent"
  timestamp: Date
}

interface ChatSession {
  id: string
  name: string
  lastMessage: string
  timestamp: Date
  messages: ChatMessage[]
}

const mockAgent: Agent = {
  id: "1",
  name: "HIRA",
  avatar: "👩‍💼"
}

const mockChatSessions: ChatSession[] = [
  {
    id: "1",
    name: "I've analyzed your uploaded resume",
    lastMessage: "Let's go with a summary first.",
    timestamp: new Date("2024-01-15T10:30:00"),
    messages: [
      {
        id: "1",
        content: "Hi! I've analyzed your uploaded resume. Would you like a summary or detailed feedback?",
        sender: "agent",
        timestamp: new Date("2024-01-15T10:25:00"),
      },
      {
        id: "2",
        content: "Let's go with a summary first.",
        sender: "user",
        timestamp: new Date("2024-01-15T10:26:00"),
      },
      {
        id: "3",
        content: "Great! Here's a brief summary of what I found:\n✅ Strong experience in [industry/field]\n✅ Clear career progression\n✅ Good use of action verbs and quantifiable results\n🔧 A few areas could be improved for better impact (e.g., formatting, keyword alignment)",
        sender: "agent",
        timestamp: new Date("2024-01-15T10:27:00"),
      },
      {
        id: "4",
        content: "Yes, please. I'd like detailed feedback.",
        sender: "user",
        timestamp: new Date("2024-01-15T10:28:00"),
      },
      {
        id: "5",
        content: "Sure! Here's what I noticed:\n\nConsectetur adipiscing elit.",
        sender: "agent",
        timestamp: new Date("2024-01-15T10:29:00"),
      }
    ],
  },
  {
    id: "2",
    name: "Portfolio Review",
    lastMessage: "Can you help me optimize my portfolio?",
    timestamp: new Date("2024-01-14T15:20:00"),
    messages: [
      {
        id: "1",
        content: "Can you help me optimize my portfolio?",
        sender: "user",
        timestamp: new Date("2024-01-14T15:20:00"),
      }
    ],
  },
  {
    id: "3",
    name: "Job Role Suggestions",
    lastMessage: "What roles would be a good fit?",
    timestamp: new Date("2024-01-13T09:15:00"),
    messages: [],
  },
  {
    id: "4",
    name: "Mock Interview Practice",
    lastMessage: "Let's practice some interview questions",
    timestamp: new Date("2024-01-12T14:30:00"),
    messages: [],
  },
  {
    id: "5",
    name: "LinkedIn Profile Optimization",
    lastMessage: "How can I improve my LinkedIn profile?",
    timestamp: new Date("2024-01-11T11:45:00"),
    messages: [],
  },
  {
    id: "6",
    name: "Cover Letter Draft",
    lastMessage: "Need help with my cover letter",
    timestamp: new Date("2024-01-10T16:20:00"),
    messages: [],
  },
  {
    id: "7",
    name: "Design System Audit",
    lastMessage: "Can you review my design system?",
    timestamp: new Date("2024-01-09T13:10:00"),
    messages: [],
  },
  {
    id: "8",
    name: "Skill Gap Analysis",
    lastMessage: "What skills should I develop?",
    timestamp: new Date("2024-01-08T10:00:00"),
    messages: [],
  }
]

export function ChatTab() {
  const [selectedChat, setSelectedChat] = useState<ChatSession | null>(mockChatSessions[0])
  const [newMessage, setNewMessage] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("chat")

  const filteredChats = mockChatSessions.filter((chat) => 
    chat.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedChat) return

    const message: ChatMessage = {
      id: Date.now().toString(),
      content: newMessage,
      sender: "user",
      timestamp: new Date(),
    }

    // Add user message to selected chat
    const updatedChat = {
      ...selectedChat,
      messages: [...selectedChat.messages, message]
    }
    setSelectedChat(updatedChat)

    // Simulate agent response
    setTimeout(() => {
      const agentMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: "I understand your request. Let me help you with that...",
        sender: "agent",
        timestamp: new Date(),
      }
      setSelectedChat(prev => prev ? {
        ...prev,
        messages: [...prev.messages, agentMessage]
      } : null)
    }, 1000)

    setNewMessage("")
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Sidebar */}
        <div className="w-72 bg-gray-50 border-r flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 space-y-3">
            <Button className="w-full bg-gray-800 hover:bg-gray-900 text-white">
              <Plus className="h-4 w-4 mr-2" />
              New Chats
            </Button>
            <Button variant="outline" className="w-full">
              <Search className="h-4 w-4 mr-2" />
              Search Chats
            </Button>
          </div>

          {/* Search Bar */}
          <div className="px-4 pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search chats..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white"
              />
            </div>
          </div>

          {/* Chat List */}
          <div className="px-4 pb-2">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Chats</h3>
          </div>
          
          <ScrollArea className="flex-1 px-4">
            <div className="space-y-1">
              {filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors relative group ${
                    selectedChat?.id === chat.id 
                      ? "bg-white shadow-sm border" 
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => setSelectedChat(chat)}
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-sm text-gray-900 truncate pr-2">
                      {chat.name}
                    </h4>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Rename</DropdownMenuItem>
                        <DropdownMenuItem>Archive</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white min-h-0">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="flex-shrink-0 p-6 border-b bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-lg">{mockAgent.avatar}</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{mockAgent.name}</h2>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full p-6">
                  <div className="max-w-4xl mx-auto space-y-6">
                    {selectedChat.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${message.sender === "user" ? "flex-row-reverse" : ""}`}
                      >
                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                          {message.sender === "agent" ? (
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                              <span className="text-sm">{mockAgent.avatar}</span>
                            </div>
                          ) : (
                            <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm">👤</span>
                            </div>
                          )}
                        </div>
                        <div className={`flex-1 max-w-2xl ${message.sender === "user" ? "text-right" : ""}`}>
                          <div
                            className={`inline-block px-4 py-3 rounded-2xl ${
                              message.sender === "user"
                                ? "bg-gray-100 text-gray-900"
                                : "bg-blue-600 text-white"
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* Input Area */}
              <div className="flex-shrink-0 p-6 border-t bg-white">
                <div className="max-w-4xl mx-auto">
                  <div className="flex gap-3 items-end">
                    <div className="flex-1 relative">
                      <Input
                        placeholder="Say something..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                        className="pr-20 py-3 rounded-xl border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          📎
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          🎤
                        </Button>
                      </div>
                    </div>
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl px-4 py-3"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-lg">Select a chat to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
