"use client"

import React, { useState, useEffect, useRef } from "react"
import { 
  Send, 
  Search, 
  Plus, 
  MoreHorizontal, 
  MessageSquare, 
  Loader2, 
  AlertCircle, 
  Trash2, 
  RefreshCw, 
  Settings,
  Zap,
  TrendingUp,
  Clock,
  CheckCircle,
  Lightbulb,
  Target,
  Brain,
  Sparkles,
  Bot,
  User
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"

// Enhanced imports
import { 
  resumeApi, 
  ChatSession, 
  ChatMessage, 
  SessionSearchResponse,
  QueryAnalysisResponse,
  QuickAction,
  UIComponents,
  ConversationFlow
} from "@/lib/api"
import type { Agent } from "@/lib/types"
import { 
  UIComponentsRenderer,
  ConversationFlowRenderer,
  QuickActionsPanel
} from "@/components/enhanced-ui-components"

interface QueryValidation {
  isValid: boolean
  suggestions: string[]
  confidence: number
}

interface ChatTabProps {
  agent?: Agent
}

const conversationStarters = [
  {
    title: "Find Python Developers",
    query: "Find experienced Python developers with backend experience",
    description: "Search for candidates with Python programming skills",
    icon: "🐍"
  },
  {
    title: "React Frontend Engineers",
    query: "Find React frontend developers with 3+ years experience",
    description: "Look for frontend specialists with React expertise",
    icon: "⚛️"
  },
  {
    title: "DevOps Engineers", 
    query: "Find DevOps engineers with AWS and Kubernetes experience",
    description: "Search for cloud infrastructure specialists",
    icon: "☁️"
  },
  {
    title: "Data Scientists",
    query: "Find data scientists with machine learning experience",
    description: "Look for candidates with ML and analytics skills",
    icon: "📊"
  }
]

export function ChatTab({ agent }: ChatTabProps = {}) {
  // Core state management
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
  const [selectedChat, setSelectedChat] = useState<ChatSession | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Enhanced features
  const [lastSearchResponse, setLastSearchResponse] = useState<SessionSearchResponse | null>(null)
  const [queryValidation, setQueryValidation] = useState<QueryAnalysisResponse | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const queryAnalysisTimeout = useRef<NodeJS.Timeout | null>(null)

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [selectedChat?.messages])

  // Load chat sessions on component mount
  useEffect(() => {
    loadChatSessions()
  }, [])

  // Real-time query analysis
  useEffect(() => {
    if (newMessage.trim().length > 3) {
      if (queryAnalysisTimeout.current) {
        clearTimeout(queryAnalysisTimeout.current)
      }
      
      queryAnalysisTimeout.current = setTimeout(() => {
        analyzeQuery(newMessage)
      }, 500)
    } else {
      setQueryValidation(null)
    }

    return () => {
      if (queryAnalysisTimeout.current) {
        clearTimeout(queryAnalysisTimeout.current)
      }
    }
  }, [newMessage])

  const loadChatSessions = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await resumeApi.listSessions(20, 0, true)
      setChatSessions(response.sessions)
      
      // Auto-select first session if available
      if (response.sessions.length > 0 && !selectedChat) {
        setSelectedChat(response.sessions[0])
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load chat sessions'
      setError(errorMessage)
      console.error('Error loading chat sessions:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const createNewSession = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await resumeApi.createSession({
        user_id: 'user123',
        name: `Chat Session ${new Date().toLocaleString()}`
      })
      
      const newSession = response.session
      setChatSessions(prev => [newSession, ...prev])
      setSelectedChat(newSession)
      
      // Focus input after creating session
      setTimeout(() => inputRef.current?.focus(), 100)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create new session'
      setError(errorMessage)
      console.error('Error creating session:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const analyzeQuery = async (query: string) => {
    if (!query.trim()) return
    
    setIsAnalyzing(true)
    try {
      const analysis = await resumeApi.analyzeQuery({ message: query })
      setQueryValidation(analysis)
    } catch (err) {
      console.error('Error analyzing query:', err)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || isSending) return

    setIsSending(true)
    setError(null)

    try {
      // Perform session search with the message
      const response = await resumeApi.searchInSession(selectedChat.id, {
        message: newMessage.trim(),
        top_k: 10
      })
      
      setLastSearchResponse(response)
      
      // Refresh the session to get updated messages
      const updatedSession = await resumeApi.getSession(selectedChat.id)
      setSelectedChat(updatedSession.session)
      
      // Update sessions list
      setChatSessions(prev => 
        prev.map(session => 
          session.id === selectedChat.id ? updatedSession.session : session
        )
      )
      
      setNewMessage("")
      setQueryValidation(null)
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message'
      setError(errorMessage)
      console.error('Error sending message:', err)
    } finally {
      setIsSending(false)
    }
  }

  const handleFollowUpQuestion = async (question: string) => {
    if (!selectedChat) return

    setIsSending(true)
    try {
      const response = await resumeApi.askFollowUp(selectedChat.id, {
        question,
        context: {
          last_search: lastSearchResponse?.query
        }
      })
      
      // Refresh the session
      const updatedSession = await resumeApi.getSession(selectedChat.id)
      setSelectedChat(updatedSession.session)
      
      setChatSessions(prev => 
        prev.map(session => 
          session.id === selectedChat.id ? updatedSession.session : session
        )
      )
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to ask follow-up question'
      setError(errorMessage)
      console.error('Error asking follow-up:', err)
    } finally {
      setIsSending(false)
    }
  }

  const handleQuickAction = async (action: QuickAction) => {
    if (action.action === 'search' && action.query) {
      setNewMessage(action.query)
      setTimeout(() => sendMessage(), 100)
    } else if (action.action === 'contact') {
      // Handle contact action
      window.open(`mailto:candidate@example.com`, '_blank')
    } else if (action.action === 'compare' && action.query) {
      await handleFollowUpQuestion(action.query)
    }
  }

  const handleStarterQuery = (starter: typeof conversationStarters[0]) => {
    setNewMessage(starter.query)
    setTimeout(() => sendMessage(), 100)
  }

  const deleteSession = async (sessionId: string) => {
    try {
      await resumeApi.deleteSession(sessionId)
      setChatSessions(prev => prev.filter(session => session.id !== sessionId))
      
      if (selectedChat?.id === sessionId) {
        setSelectedChat(null)
        setLastSearchResponse(null)
      }
    } catch (err) {
      console.error('Error deleting session:', err)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex h-full bg-gray-50">
      {/* Sidebar - Chat Sessions */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              AI Chat
            </h2>
            <Button 
              size="sm" 
              onClick={createNewSession}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Search Sessions */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Sessions List */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                <span className="ml-2 text-sm text-gray-600">Loading sessions...</span>
              </div>
            ) : chatSessions.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-3">No chat sessions yet</p>
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
                          : 'hover:bg-gray-50 border border-transparent'
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
                      
                      {session.messages.length > 0 && (
                        <div className="mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {session.messages.length} messages
                          </Badge>
                        </div>
                      )}
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
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{selectedChat.title}</h3>
                    <p className="text-sm text-gray-600">
                      {agent?.name || 'HIRA'} - AI-Powered Recruitment Assistant
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" onClick={loadChatSessions}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 bg-gray-50">
              <div className="p-6 space-y-6">
                {selectedChat.messages.length === 0 ? (
                  /* Clean Welcome Screen */
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Bot className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      AI Recruitment Assistant
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      Ask me to find candidates, analyze resumes, or help with your hiring process.
                    </p>
                    
                    {/* Simplified Conversation Starters */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-3xl mx-auto">
                      {conversationStarters.map((starter, index) => (
                        <div 
                          key={index}
                          className="cursor-pointer p-4 rounded-lg bg-white border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all duration-200"
                          onClick={() => handleStarterQuery(starter)}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{starter.icon}</span>
                            <div className="text-left">
                              <h4 className="font-medium text-gray-900 text-sm">
                                {starter.title}
                              </h4>
                              <p className="text-xs text-gray-500 mt-1">
                                {starter.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Clean Chat Messages */
                  <div className="space-y-4">
                    {selectedChat.messages.map((message, index) => (
                      <div
                        key={message.id || index}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`
                          flex gap-3 max-w-3xl
                          ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}
                        `}>
                          {/* Simplified Avatar */}
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

                          {/* Clean Message Content */}
                          <div className={`
                            rounded-xl px-4 py-3 max-w-2xl
                            ${message.type === 'user' 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-white border border-gray-200 text-gray-900 shadow-sm'
                            }
                          `}>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">
                              {message.content}
                            </p>
                            {/* Minimal timestamp */}
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
                    <div ref={messagesEndRef} />
                  </div>
                )}

                {/* Search Results - Clean and Minimal */}
                {lastSearchResponse && (
                  <div className="mt-6">
                    <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50/50 to-transparent">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                          <Search className="h-5 w-5 text-blue-600" />
                          <CardTitle className="text-lg">Search Results</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <UIComponentsRenderer
                          components={lastSearchResponse.ui_components}
                          onCandidateContact={(id) => window.open(`mailto:candidate@example.com`, '_blank')}
                          onCandidateView={(id) => console.log('View candidate:', id)}
                          onCandidateDownload={(id) => console.log('Download resume:', id)}
                          onTagClick={(tag) => setNewMessage(`Find candidates with ${tag} skills`)}
                          onFollowUpQuestion={handleFollowUpQuestion}
                          onQuickAction={handleQuickAction}
                        />
                        
                        {/* Simplified Follow-up Suggestions */}
                        {lastSearchResponse.conversation_flow?.follow_up_questions && 
                         lastSearchResponse.conversation_flow.follow_up_questions.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <p className="text-sm font-medium text-gray-700 mb-2">Suggested follow-ups:</p>
                            <div className="flex flex-wrap gap-2">
                              {lastSearchResponse.conversation_flow.follow_up_questions.slice(0, 3).map((question, index) => (
                                <Button
                                  key={index}
                                  variant="outline"
                                  size="sm"
                                  className="text-xs h-8 bg-white hover:bg-blue-50"
                                  onClick={() => handleFollowUpQuestion(question)}
                                >
                                  {question.length > 40 ? question.substring(0, 40) + '...' : question}
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              {/* Simplified Query Analysis */}
              {queryValidation && queryValidation.optimization_tips.length > 0 && (
                <div className="mb-3">
                  <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <Lightbulb className="h-4 w-4 text-amber-600 flex-shrink-0" />
                    <div className="text-sm text-amber-800">
                      <span className="font-medium">Tip:</span> {queryValidation.optimization_tips[0]}
                    </div>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <Alert className="mb-4 border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Input Area */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <Textarea
                    ref={inputRef}
                    placeholder="Ask me anything about finding candidates..."
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
                  className="bg-blue-600 hover:bg-blue-700 px-4"
                >
                  {isSending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              <div className="mt-2 text-xs text-gray-500">
                Press Enter to send, Shift+Enter for new line
              </div>
            </div>
          </>
        ) : (
          /* No Session Selected */
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center max-w-md">
              <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Ready to start recruiting?
              </h3>
              <p className="text-gray-600 mb-6">
                Create a new chat session or select an existing one to begin your AI-powered candidate search.
              </p>
              <Button onClick={createNewSession} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Start New Chat
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
