/**
 * Resume Shortlisting Component
 * Complete UI for AI-powered candidate shortlisting
 */

"use client"

import { useState, useEffect } from "react"
import { Search, Users, Zap, Brain, TrendingUp, Clock, Award, Mail, Phone, Download, Eye, Filter, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useShortlisting } from "@/lib/hooks/useShortlisting"
import { resumeApi } from "@/lib/api"

interface ShortlistingPageProps {
  onCandidateSelect?: (candidate: any) => void;
  onBulkAction?: (candidates: any[], action: string) => void;
  initialJobDescription?: string;
  onClose?: () => void;
}

export function ShortlistingPage({ 
  onCandidateSelect, 
  onBulkAction, 
  initialJobDescription = '',
  onClose 
}: ShortlistingPageProps) {
  const [jobDescription, setJobDescription] = useState(initialJobDescription)
  const [selectedMethod, setSelectedMethod] = useState<'vector' | 'chat' | 'hybrid'>('hybrid')
  const [topK, setTopK] = useState(10)
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([])
  const [filterMinScore, setFilterMinScore] = useState(0.3)
  const [previewCandidate, setPreviewCandidate] = useState<any>(null)

  const {
    shortlistCandidates,
    analyzeJobRequirements,
    vectorSearch,
    chatSearch,
    changeMethod,
    clearResults,
    results,
    analysis,
    isLoading,
    isAnalyzing,
    error,
    progress,
    method,
    hasResults,
    candidateCount,
    getTopCandidates,
    getCandidatesByScore
  } = useShortlisting({
    autoAnalyze: true,
    defaultMethod: 'hybrid',
    defaultTopK: 10
  })

  // Sample job descriptions for quick testing
  const sampleJobs = [
    {
      title: "Senior Full-Stack Developer",
      description: "Looking for a senior full-stack developer with React, Node.js, and AWS experience. Must have 5+ years of experience building scalable web applications."
    },
    {
      title: "DevOps Engineer",
      description: "Seeking a DevOps engineer with Kubernetes, Docker, and CI/CD pipeline experience. Experience with Terraform and monitoring tools preferred."
    },
    {
      title: "Product Manager",
      description: "Product manager role requiring experience with agile methodologies, user research, and cross-functional team leadership. Technical background preferred."
    },
    {
      title: "Data Scientist",
      description: "Data scientist position requiring Python, machine learning, and statistical analysis skills. Experience with big data technologies and visualization tools."
    }
  ]

  const handleShortlist = async () => {
    if (!jobDescription.trim()) {
      return
    }

    try {
      await shortlistCandidates(jobDescription, {
        method: selectedMethod,
        topK,
        includeAnalysis: true
      })
    } catch (err) {
      console.error('Shortlisting failed:', err)
    }
  }

  const handleQuickSearch = async (method: 'vector' | 'chat') => {
    if (!jobDescription.trim()) return

    try {
      if (method === 'vector') {
        await vectorSearch(jobDescription, topK)
      } else {
        await chatSearch(jobDescription, topK)
      }
    } catch (err) {
      console.error('Quick search failed:', err)
    }
  }

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) return

    try {
      await analyzeJobRequirements(jobDescription)
    } catch (err) {
      console.error('Analysis failed:', err)
    }
  }

  const handleSampleJob = (job: typeof sampleJobs[0]) => {
    setJobDescription(job.description)
  }

  const handleCandidateSelection = (candidateId: string, selected: boolean) => {
    setSelectedCandidates(prev => 
      selected 
        ? [...prev, candidateId]
        : prev.filter(id => id !== candidateId)
    )
  }

  const handleSelectAll = () => {
    const filteredCandidates = getCandidatesByScore(filterMinScore)
    setSelectedCandidates(filteredCandidates.map(c => c.id))
  }

  const handleDeselectAll = () => {
    setSelectedCandidates([])
  }

  const handleBulkAction = (action: string) => {
    const candidates = results?.candidates.filter(c => selectedCandidates.includes(c.id)) || []
    onBulkAction?.(candidates, action)
  }

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return "text-green-600 bg-green-50"
    if (score >= 0.6) return "text-blue-600 bg-blue-50"
    if (score >= 0.4) return "text-yellow-600 bg-yellow-50"
    return "text-red-600 bg-red-50"
  }

  const getExperienceBadgeColor = (level: string) => {
    switch (level) {
      case 'senior': return "bg-purple-100 text-purple-800"
      case 'lead': return "bg-indigo-100 text-indigo-800"
      case 'mid': return "bg-blue-100 text-blue-800"
      case 'junior': return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const filteredCandidates = getCandidatesByScore(filterMinScore)

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI-Powered Resume Shortlisting</h1>
          <p className="text-gray-600 mt-1">Find the perfect candidates using advanced AI matching</p>
        </div>
        <div className="flex items-center gap-2">
          {onClose && (
            <Button variant="outline" onClick={onClose} className="mr-2">
              Close
            </Button>
          )}
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            <Brain className="h-3 w-3 mr-1" />
            AI Enhanced
          </Badge>
          <Badge variant="outline" className="bg-green-50 text-green-700">
            <Zap className="h-3 w-3 mr-1" />
            Vector Search
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Job Description & Controls */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Job Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Sample Jobs */}
              <div>
                <label className="text-sm font-medium">Quick Start Templates:</label>
                <div className="grid grid-cols-1 gap-2 mt-2">
                  {sampleJobs.map((job, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSampleJob(job)}
                      className="justify-start h-auto p-2 text-left"
                    >
                      <div>
                        <div className="font-medium text-xs">{job.title}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {job.description.substring(0, 60)}...
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Job Description Input */}
              <div>
                <label className="text-sm font-medium">Job Description:</label>
                <Textarea
                  placeholder="Describe the position, required skills, experience level, and any specific requirements..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={6}
                  className="mt-2"
                />
              </div>

              {/* Search Configuration */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm font-medium">Method:</label>
                  <Select value={selectedMethod} onValueChange={setSelectedMethod as any}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hybrid">🔀 Hybrid (Best)</SelectItem>
                      <SelectItem value="chat">🤖 AI Chat</SelectItem>
                      <SelectItem value="vector">🎯 Vector</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Results:</label>
                  <Select value={topK.toString()} onValueChange={(v) => setTopK(parseInt(v))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">Top 5</SelectItem>
                      <SelectItem value="10">Top 10</SelectItem>
                      <SelectItem value="20">Top 20</SelectItem>
                      <SelectItem value="50">Top 50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button
                  onClick={handleShortlist}
                  disabled={isLoading || !jobDescription.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      {isAnalyzing ? 'Analyzing...' : 'Shortlisting...'}
                    </>
                  ) : (
                    <>
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Start Shortlisting
                    </>
                  )}
                </Button>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickSearch('vector')}
                    disabled={isLoading || !jobDescription.trim()}
                  >
                    <Zap className="h-3 w-3 mr-1" />
                    Vector
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickSearch('chat')}
                    disabled={isLoading || !jobDescription.trim()}
                  >
                    <Brain className="h-3 w-3 mr-1" />
                    AI Chat
                  </Button>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !jobDescription.trim()}
                  className="w-full"
                >
                  <Search className="h-3 w-3 mr-1" />
                  Analyze Requirements
                </Button>
              </div>

              {/* Progress */}
              {(isLoading || isAnalyzing) && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}

              {/* Error Display */}
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Analysis Results */}
          {analysis && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">📊 Job Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-xs font-medium text-gray-600">Detected Skills:</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {analysis.keywords?.slice(0, 6).map((skill: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <div className="text-xs font-medium text-gray-600">Experience Level:</div>
                  <Badge className={getExperienceBadgeColor(analysis.intent?.experience_level || 'any')}>
                    {analysis.intent?.experience_level || 'Any Level'}
                  </Badge>
                </div>

                {analysis.suggestions && analysis.suggestions.length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-gray-600">Suggestions:</div>
                    <ul className="text-xs text-gray-600 mt-1 space-y-1">
                      {analysis.suggestions.slice(0, 3).map((suggestion: string, index: number) => (
                        <li key={index}>• {suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Panel - Results */}
        <div className="lg:col-span-2 space-y-4">
          {hasResults && (
            <>
              {/* Results Header */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-blue-600" />
                        <span className="font-semibold">{candidateCount} Candidates Found</span>
                      </div>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        Method: {method}
                      </Badge>
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        <Clock className="h-3 w-3 mr-1" />
                        {results?.processingTime.toFixed(2)}s
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span>Min Score:</span>
                        <Select value={filterMinScore.toString()} onValueChange={(v) => setFilterMinScore(parseFloat(v))}>
                          <SelectTrigger className="w-20 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">All</SelectItem>
                            <SelectItem value="0.3">30%</SelectItem>
                            <SelectItem value="0.5">50%</SelectItem>
                            <SelectItem value="0.7">70%</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {selectedCandidates.length > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{selectedCandidates.length} selected</span>
                          <Button size="sm" variant="outline" onClick={handleDeselectAll}>
                            Clear
                          </Button>
                          <Button size="sm" onClick={() => handleBulkAction('export')}>
                            Export
                          </Button>
                        </div>
                      )}
                      
                      <Button size="sm" variant="outline" onClick={handleSelectAll}>
                        Select All
                      </Button>
                      <Button size="sm" variant="outline" onClick={clearResults}>
                        Clear
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Summary */}
              {results?.summary && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Brain className="h-4 w-4" />
                      AI Analysis Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700">{results.summary}</p>
                  </CardContent>
                </Card>
              )}

              {/* Candidates List */}
              <div className="space-y-3">
                {filteredCandidates.map((candidate, index) => (
                  <Card key={candidate.id} className={`transition-all ${selectedCandidates.includes(candidate.id) ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={selectedCandidates.includes(candidate.id)}
                              onChange={(e) => handleCandidateSelection(candidate.id, e.target.checked)}
                              className="rounded"
                            />
                            <div className="text-lg font-bold text-gray-400">#{index + 1}</div>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {candidate.name}
                              </h3>
                              <Badge className={getScoreColor(candidate.score)}>
                                {(candidate.score * 100).toFixed(1)}% Match
                              </Badge>
                              <Badge className={getExperienceBadgeColor(candidate.experienceLevel || 'junior')}>
                                {candidate.experienceLevel || 'Junior'}
                              </Badge>
                            </div>

                            <div className="space-y-2">
                              {candidate.email && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Mail className="h-3 w-3" />
                                  {candidate.email}
                                </div>
                              )}
                              
                              {candidate.phone && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Phone className="h-3 w-3" />
                                  {candidate.phone}
                                </div>
                              )}

                              <div className="flex flex-wrap gap-1">
                                {candidate.skills.slice(0, 8).map((skill, skillIndex) => (
                                  <Badge key={skillIndex} variant="outline" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                                {candidate.skills.length > 8 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{candidate.skills.length - 8} more
                                  </Badge>
                                )}
                              </div>

                              {candidate.relevantText && (
                                <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                  <span className="font-medium">Relevant: </span>
                                  {candidate.relevantText.substring(0, 150)}...
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 ml-4">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                <Eye className="h-3 w-3" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Candidate Details - {candidate.name}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-medium">Contact Information</h4>
                                  <div className="text-sm text-gray-600 space-y-1">
                                    {candidate.email && <div>Email: {candidate.email}</div>}
                                    {candidate.phone && <div>Phone: {candidate.phone}</div>}
                                  </div>
                                </div>
                                
                                <div>
                                  <h4 className="font-medium">Skills</h4>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {candidate.skills.map((skill, i) => (
                                      <Badge key={i} variant="outline" className="text-xs">
                                        {skill}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>

                                {candidate.experience.length > 0 && (
                                  <div>
                                    <h4 className="font-medium">Experience</h4>
                                    <div className="space-y-1 mt-1">
                                      {candidate.experience.slice(0, 3).map((exp, i) => (
                                        <div key={i} className="text-sm text-gray-600">
                                          • {exp.description}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {candidate.summary && (
                                  <div>
                                    <h4 className="font-medium">Summary</h4>
                                    <p className="text-sm text-gray-600 mt-1">{candidate.summary}</p>
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                          
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => onCandidateSelect?.(candidate)}
                          >
                            <Award className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}

          {!hasResults && !isLoading && !error && (
            <Card className="h-96 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Start Your Search</h3>
                  <p className="text-gray-600 mt-1">
                    Enter a job description to find matching candidates using AI
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default ShortlistingPage
