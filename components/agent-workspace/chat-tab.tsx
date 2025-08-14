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
  User,
  Upload,
  FileText,
  Download,
  CheckCircle
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

export function ChatTab({ agent }: ChatTabProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [selectedChat, setSelectedChat] = useState<ChatSession | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [isProcessingFile, setIsProcessingFile] = useState(false)
  const [fileProcessed, setFileProcessed] = useState(false)
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Sample starter queries
  const starterQueries = [
    "Find Python developers with 5 years experience",
    "Show me frontend developers with React skills",
    "Why were these candidates selected?",
    "Compare the top 3 candidates"
  ]

  useEffect(() => {
    loadChatSessions()
  }, [])

  const loadChatSessions = async () => {
    try {
      const response = await resumeApi.getChatSessions()
      if (response.success && Array.isArray(response.data)) {
        setSessions(response.data)
        if (response.data.length > 0 && !selectedChat) {
          setSelectedChat(response.data[0])
        }
      }
    } catch (error) {
      console.error('Failed to load chat sessions:', error)
    }
  }

  const createNewSession = async () => {
    try {
      const response = await resumeApi.createChatSession({
        title: `Chat ${new Date().toLocaleString()}`,
        agent_id: agent?.id
      })
      
      if (response.success && response.session) {
        // The API returns the session data under 'session' key, not 'data'
        const newSession = {
          ...response.session,
          id: response.session.id || `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: response.session.title || `Chat ${new Date().toLocaleString()}`,
          messages: response.session.messages || []
        }
        setSessions(prev => [newSession, ...prev])
        setSelectedChat(newSession)
      }
    } catch (error) {
      console.error('Failed to create new session:', error)
      // Create a fallback session if API fails
      const now = new Date().toISOString()
      const fallbackSession = {
        id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: `Chat ${new Date().toLocaleString()}`,
        messages: [],
        created_at: now,
        updated_at: now
      }
      setSessions(prev => [fallbackSession, ...prev])
      setSelectedChat(fallbackSession)
    }
  }

  const deleteSession = async (sessionId: string) => {
    try {
      await resumeApi.deleteChatSession(sessionId)
      setSessions(prev => prev.filter(s => s.id !== sessionId))
      if (selectedChat?.id === sessionId) {
        setSelectedChat(sessions.length > 1 ? sessions[0] : null)
      }
    } catch (error) {
      console.error('Failed to delete session:', error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || isSending) return

    setIsSending(true)
    const messageContent = newMessage.trim()
    setNewMessage("")

    // Add user message immediately
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: messageContent,
      timestamp: new Date().toISOString()
    }

    setSelectedChat(prev => prev ? {
      ...prev,
      messages: [...prev.messages, userMessage]
    } : null)

    try {
      // Check if this is a follow-up question
      const followUpQuestions = [
        "why were these selected",
        "what are their strengths", 
        "compare these candidates",
        "what are their experience levels",
        "what are their technical skills"
      ]
      
      const isFollowUp = followUpQuestions.some(q => 
        messageContent.toLowerCase().includes(q)
      )

      let response;
      
      if (isFollowUp && selectedChat.messages.length > 1) {
        // Use follow-up endpoint
        response = await resumeApi.askFollowUp(selectedChat.id, {
          question: messageContent
        })
        
        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          type: 'assistant',
          content: response.answer,
          timestamp: new Date().toISOString()
        }

        setSelectedChat(prev => prev ? {
          ...prev,
          messages: [...prev.messages.slice(0, -1), userMessage, assistantMessage]
        } : null)
      } else {
        // Use search endpoint
        const searchResponse = await resumeApi.chatSearch({
          message: messageContent
        })
        
        let responseContent = searchResponse.message || `Found ${searchResponse.total_results} candidates.`
        
        if (searchResponse.matches && searchResponse.matches.length > 0) {
          responseContent += "\n\nTop candidates:\n"
          searchResponse.matches.slice(0, 3).forEach((match, index) => {
            responseContent += `\n${index + 1}. ${match.extracted_info.name || 'Candidate'} (Score: ${(match.score * 100).toFixed(1)}%)`
            if (match.extracted_info.skills.length > 0) {
              responseContent += `\n   Skills: ${match.extracted_info.skills.slice(0, 5).join(', ')}`
            }
          })
        }

        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          type: 'assistant',
          content: responseContent,
          timestamp: new Date().toISOString()
        }

        setSelectedChat(prev => prev ? {
          ...prev,
          messages: [...prev.messages.slice(0, -1), userMessage, assistantMessage]
        } : null)
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (file.type !== 'application/pdf') {
      alert('Please select a PDF file')
      return
    }

    setIsProcessingFile(true)
    setUploadedFileName(file.name)

    try {
      // TODO: Replace with actual API call when backend is ready
      // const formData = new FormData()
      // formData.append('file', file)
      // const response = await fetch('/api/process-job-description', {
      //   method: 'POST',
      //   body: formData
      // })
      // const result = await response.json()

      // Simulate API processing delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setFileProcessed(true)
    } catch (error) {
      console.error('Error processing file:', error)
      alert('Error processing file. Please try again.')
      setUploadedFileName(null)
    } finally {
      setIsProcessingFile(false)
    }

    // Clear the input so same file can be uploaded again
    event.target.value = ''
  }

  const handleDownloadResults = () => {
    // TODO: Implement actual download when backend is ready
    // For now, create a dummy download
    const dummyData = `Job Description Analysis Results
    
File: ${uploadedFileName}
Processed: ${new Date().toLocaleString()}

Key Requirements Extracted:
- Technical Skills: React, Node.js, TypeScript
- Experience Level: 3-5 years
- Education: Bachelor's degree preferred
- Soft Skills: Team collaboration, Communication

Recommended Candidate Filters:
- Skills match threshold: 80%
- Experience range: 2-6 years
- Location: Remote/Hybrid acceptable

This is a placeholder result. Actual analysis will be provided by the backend API.`

    const blob = new Blob([dummyData], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `job_analysis_${uploadedFileName?.replace('.pdf', '')}_results.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const filteredSessions = sessions.filter(session =>
    (session?.title || 'Untitled Chat').toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex h-[600px] bg-gray-50 rounded-lg overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
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
            className="w-full"
          />
        </div>

        {/* Chat Sessions List */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-2">
            {filteredSessions.map((session, index) => (
              <Card
                key={session?.id || `session-${index}`}
                className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                  selectedChat?.id === session?.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                }`}
                onClick={() => setSelectedChat(session)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm text-gray-900 truncate">
                        {session?.title || 'Untitled Chat'}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {session?.messages?.length || 0} messages
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(session.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteSession(session.id)
                          }}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{selectedChat?.title || 'Untitled Chat'}</h2>
                  <p className="text-sm text-gray-500">
                    {selectedChat?.messages?.length || 0} messages • AI Assistant
                  </p>
                </div>
                
                {/* Upload Job Description Button */}
                <div className="flex items-center gap-3">
                  {fileProcessed ? (
                    <Button
                      onClick={handleDownloadResults}
                      className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 h-10"
                    >
                      <Download className="h-4 w-4" />
                      Download Results
                    </Button>
                  ) : isProcessingFile ? (
                    <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-200 rounded-lg h-10">
                      <Loader2 className="h-4 w-4 animate-spin text-orange-600" />
                      <div className="text-sm">
                        <span className="font-medium text-orange-800">Processing...</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        variant="outline"
                        className="flex items-center gap-2 border-orange-300 text-orange-700 hover:bg-orange-50 hover:border-orange-400 transition-all duration-200 h-10"
                      >
                        <Upload className="h-4 w-4" />
                        Upload Job Description
                      </Button>
                    </>
                  )}
                </div>
              </div>
              
              {/* File Status Indicator */}
              {uploadedFileName && (
                <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border">
                  <FileText className="h-4 w-4 text-gray-600" />
                  <span className="text-sm text-gray-700">{uploadedFileName}</span>
                  {fileProcessed && (
                    <CheckCircle className="h-4 w-4 text-green-600 ml-auto" />
                  )}
                </div>
              )}
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {selectedChat.messages.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Start a conversation</h3>
                    <p className="text-gray-500 mb-6">Try one of these queries:</p>
                    <div className="grid grid-cols-1 gap-3 max-w-md mx-auto">
                      {starterQueries.map((query, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          className="text-left justify-start h-auto py-3 px-4 whitespace-normal"
                          onClick={() => handleStarterQuery(query)}
                        >
                          {query}
                        </Button>
                      ))}
                    </div>
                  </div>
                ) : (
                  selectedChat.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex gap-3 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className="flex-shrink-0">
                          {message.type === 'user' ? (
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                              <User className="h-4 w-4 text-white" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                              <Bot className="h-4 w-4 text-white" />
                            </div>
                          )}
                        </div>
                        <div className={`px-4 py-2 rounded-lg ${
                          message.type === 'user' 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Textarea
                    ref={inputRef}
                    placeholder="Type your message..."
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
