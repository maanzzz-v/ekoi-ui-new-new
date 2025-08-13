"use client"

import React, { useState, useEffect, useRef } from "react"
import { 
  Send, 
  Plus, 
  MoreHorizontal, 
  MessageSquare, 
  Loader2, 
  Trash2, 
  Bot,
  User
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Textarea } from "@/components/ui/textarea"
import { resumeApi, ChatSession, ChatMessage } from "@/lib/api"
import type { Agent } from "@/lib/types"

interface ChatTabProps {
  agent?: Agent
}

interface SimpleCandidate {
  id: string
  name: string
  title: string
  experience: string
  skills: string[]
  score?: number
}

export function ChatTab({ agent }: ChatTabProps = {}) {
  // Core state
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
  const [selectedChat, setSelectedChat] = useState<ChatSession | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  
  // Results state - persisted
  const [searchResults, setSearchResults] = useState<SimpleCandidate[]>([])
  const [lastQuery, setLastQuery] = useState("")
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [selectedChat?.messages])

  // Load chat sessions on mount
  useEffect(() => {
    loadChatSessions()
  }, [])

  const loadChatSessions = async () => {
    setIsLoading(true)
    try {
      const response = await resumeApi.listSessions()
      setChatSessions(response.sessions)
      if (response.sessions.length > 0 && !selectedChat) {
        setSelectedChat(response.sessions[0])
      }
    } catch (error) {
      console.error('Failed to load chat sessions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const createNewSession = async () => {
    try {
      const response = await resumeApi.createSession({})
      setChatSessions(prev => [response.session, ...prev])
      setSelectedChat(response.session)
      setSearchResults([]) // Clear results for new session
      setLastQuery("")
    } catch (error) {
      console.error('Failed to create session:', error)
    }
  }

  const deleteSession = async (sessionId: string) => {
    try {
      await resumeApi.deleteSession(sessionId)
      setChatSessions(prev => prev.filter(s => s.id !== sessionId))
      if (selectedChat?.id === sessionId) {
        setSelectedChat(chatSessions[0] || null)
        setSearchResults([])
        setLastQuery("")
      }
    } catch (error) {
      console.error('Failed to delete session:', error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || isSending) return

    const messageContent = newMessage.trim()
    setIsSending(true)

    // Immediately add user message to UI
    const userMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      type: 'user',
      content: messageContent,
      timestamp: new Date().toISOString()
    }

    // Update UI immediately
    setSelectedChat(prev => prev ? {
      ...prev,
      messages: [...prev.messages, userMessage]
    } : null)

    setChatSessions(prev => prev.map(session => 
      session.id === selectedChat.id 
        ? { ...session, messages: [...session.messages, userMessage] }
        : session
    ))

    setNewMessage("")
    setLastQuery(messageContent)

    try {
      // Send message using session search
      const response = await resumeApi.searchInSession(selectedChat.id, {
        message: messageContent
      })
      
      // Add AI response
      const aiMessage: ChatMessage = {
        id: response.session_id || `ai-${Date.now()}`,
        type: 'assistant',
        content: response.message || "I've found some candidates for you.",
        timestamp: new Date().toISOString()
      }

      // Update with real response
      setSelectedChat(prev => prev ? {
        ...prev,
        messages: [...prev.messages.filter(m => m.id !== userMessage.id), 
                   { ...userMessage, id: `user-${Date.now()}` }, 
                   aiMessage]
      } : null)

      setChatSessions(prev => prev.map(session => 
        session.id === selectedChat.id 
          ? { 
              ...session, 
              messages: [...session.messages.filter(m => m.id !== userMessage.id),
                        { ...userMessage, id: `user-${Date.now()}` },
                        aiMessage]
            }
          : session
      ))

      // Extract simple candidates from matches
      if (response.matches && response.matches.length > 0) {
        const simpleCandidates: SimpleCandidate[] = response.matches.map((match: any) => ({
          id: match.id || `candidate-${Math.random()}`,
          name: match.metadata?.name || match.name || 'Unknown',
          title: match.metadata?.title || match.metadata?.current_role || 'N/A',
          experience: match.metadata?.experience || match.metadata?.years_experience || 'N/A',
          skills: match.metadata?.skills || match.metadata?.key_skills || [],
          score: match.score
        }))
        setSearchResults(simpleCandidates)
      }

    } catch (error) {
      console.error('Failed to send message:', error)
      // Add error message
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        type: 'assistant',
        content: "Sorry, I couldn't process your request. Please try again.",
        timestamp: new Date().toISOString()
      }

      setSelectedChat(prev => prev ? {
        ...prev,
        messages: [...prev.messages, errorMessage]
      } : null)
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleStarterQuery = (query: string) => {
    setNewMessage(query)
    inputRef.current?.focus()
  }

  return (
    <div className="flex h-full bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Chats</h2>
            <Button size="sm" onClick={createNewSession}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <Input
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="text-sm"
          />
        </div>

        {/* Chat List */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                <span className="ml-2 text-sm text-gray-600">Loading...</span>
              </div>
            ) : chatSessions.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-3">No chats yet</p>
                <Button size="sm" onClick={createNewSession}>
                  Start New Chat
                </Button>
              </div>
            ) : (
              <div className="space-y-1">
                {chatSessions
                  .filter(session => 
                    !searchTerm || 
                    session.title.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((session) => (
                    <div
                      key={session.id}
                      className={`
                        p-3 rounded-lg cursor-pointer transition-all duration-200 group
                        ${selectedChat?.id === session.id 
                          ? 'bg-blue-50 border-blue-200 border' 
                          : 'hover:bg-gray-50'
                        }
                      `}
                      onClick={() => setSelectedChat(session)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {session.title}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(session.updated_at).toLocaleDateString()}
                          </p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => deleteSession(session.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))
                }
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedChat.title}</h3>
                  <p className="text-sm text-gray-600">AI Recruitment Assistant</p>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 bg-gray-50">
              <div className="p-6 space-y-4">
                {selectedChat.messages.length === 0 ? (
                  /* Welcome Screen */
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Bot className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      AI Recruitment Assistant
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Ask me to find candidates, analyze resumes, or help with hiring.
                    </p>
                    
                    {/* Simple Quick Starters */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                      {[
                        "Find Python developers with 3+ years experience",
                        "Search for React frontend developers",
                        "Find DevOps engineers with AWS experience",
                        "Look for data scientists with ML skills"
                      ].map((query, index) => (
                        <div 
                          key={index}
                          className="cursor-pointer p-3 rounded-lg bg-white border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all duration-200 text-sm"
                          onClick={() => handleStarterQuery(query)}
                        >
                          {query}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Chat Messages */
                  <div className="space-y-4">
                    {selectedChat.messages.map((message, index) => (
                      <div
                        key={message.id || index}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`
                          flex gap-3 max-w-2xl
                          ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}
                        `}>
                          {/* Avatar */}
                          <div className={`
                            w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1
                            ${message.type === 'user' 
                              ? 'bg-gray-600' 
                              : 'bg-gradient-to-br from-blue-500 to-purple-600'
                            }
                          `}>
                            {message.type === 'user' ? (
                              <User className="h-3 w-3 text-white" />
                            ) : (
                              <Bot className="h-3 w-3 text-white" />
                            )}
                          </div>

                          {/* Message Content */}
                          <div className={`
                            rounded-xl px-4 py-3
                            ${message.type === 'user' 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-white border border-gray-200 text-gray-900 shadow-sm'
                            }
                          `}>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">
                              {message.content}
                            </p>
                            <div className={`
                              text-xs mt-2 opacity-70
                              ${message.type === 'user' ? 'text-blue-100' : 'text-gray-500'}
                            `}>
                              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Loading indicator */}
                    {isSending && (
                      <div className="flex justify-start">
                        <div className="flex gap-3 max-w-2xl">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 mt-1">
                            <Bot className="h-3 w-3 text-white" />
                          </div>
                          <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
                            <div className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                              <span className="text-sm text-gray-600">Thinking...</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>
                )}

                {/* Search Results - Simple and Clean */}
                {searchResults.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">
                      Found Candidates ({searchResults.length})
                    </h4>
                    <div className="grid gap-3">
                      {searchResults.map((candidate) => (
                        <Card key={candidate.id} className="hover:shadow-sm transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h5 className="font-medium text-gray-900">{candidate.name}</h5>
                                <p className="text-sm text-gray-600 mt-1">{candidate.title}</p>
                                <p className="text-sm text-gray-500 mt-1">Experience: {candidate.experience}</p>
                                {candidate.skills.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {candidate.skills.slice(0, 5).map((skill, index) => (
                                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                        {skill}
                                      </span>
                                    ))}
                                    {candidate.skills.length > 5 && (
                                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                        +{candidate.skills.length - 5} more
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                              {candidate.score && (
                                <div className="text-right">
                                  <div className="text-sm font-medium text-green-600">
                                    {Math.round(candidate.score * 100)}% match
                                  </div>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex gap-3">
                <div className="flex-1">
                  <Textarea
                    ref={inputRef}
                    placeholder="Ask me to find candidates..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isSending}
                    className="min-h-[44px] max-h-32 resize-none"
                    rows={1}
                  />
                </div>
                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || isSending}
                  className="px-4"
                >
                  {isSending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">Select a chat to start</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
