"use client"

import { useState, useRef, useEffect } from "react"
import { 
  Eye, 
  Trash2, 
  Upload, 
  FileText, 
  ImageIcon, 
  File, 
  Check, 
  ArrowLeft, 
  Plus, 
  Database,
  RefreshCw,
  Download,
  Search,
  Filter,
  AlertCircle,
  CheckCircle,
  Clock,
  X,
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { resumeApi, type Resume } from "@/lib/api"
import type { Agent } from "@/lib/types"

interface DataHubTabProps {
  agent: Agent
  selectionMode?: "resumes" | "job-descriptions" | null
  onSelectionComplete?: (selectedFiles: Resume[]) => void
  onExitSelection?: () => void
}

interface UploadProgress {
  file: File
  progress: number
  status: 'uploading' | 'completed' | 'error'
  error?: string
}

export function DataHubTab({ 
  agent, 
  selectionMode, 
  onSelectionComplete, 
  onExitSelection 
}: DataHubTabProps) {
  // State management
  const [resumes, setResumes] = useState<Resume[]>([])
  const [filteredResumes, setFilteredResumes] = useState<Resume[]>([])
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([])
  const [isUploading, setIsUploading] = useState(false)
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalResumes, setTotalResumes] = useState(0)
  const itemsPerPage = 20
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load resumes on component mount
  useEffect(() => {
    loadResumes()
  }, [currentPage])

  // Filter resumes based on search and filters
  useEffect(() => {
    let filtered = resumes

    // Search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(resume => 
        resume.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resume.extracted_info?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resume.extracted_info?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      if (statusFilter === "processed") {
        filtered = filtered.filter(resume => resume.processed)
      } else if (statusFilter === "unprocessed") {
        filtered = filtered.filter(resume => !resume.processed)
      }
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter(resume => resume.file_type === typeFilter)
    }

    setFilteredResumes(filtered)
  }, [resumes, searchTerm, statusFilter, typeFilter])

  const loadResumes = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const skip = (currentPage - 1) * itemsPerPage
      const response = await resumeApi.list(skip, itemsPerPage)
      
      setResumes(response.resumes)
      setTotalPages(response.pagination.total_pages)
      setTotalResumes(response.pagination.total)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load resumes'
      setError(errorMessage)
      console.error('Error loading resumes:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const fileArray = Array.from(files)
    setIsUploading(true)
    
    // Initialize upload progress
    const initialProgress = fileArray.map(file => ({
      file,
      progress: 0,
      status: 'uploading' as const
    }))
    setUploadProgress(initialProgress)

    try {
      // Upload files
      const response = await resumeApi.upload(fileArray)
      
      // Update progress to completed
      setUploadProgress(prev => 
        prev.map(item => ({
          ...item,
          progress: 100,
          status: 'completed'
        }))
      )

      // Reload resumes after upload
      setTimeout(() => {
        loadResumes()
        setUploadProgress([])
      }, 1000)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed'
      setError(errorMessage)
      
      // Mark as error
      setUploadProgress(prev => 
        prev.map(item => ({
          ...item,
          status: 'error',
          error: errorMessage
        }))
      )
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteResume = async (resumeId: string) => {
    try {
      await resumeApi.delete(resumeId)
      setResumes(prev => prev.filter(resume => resume.id !== resumeId))
      setSelectedFiles(prev => {
        const newSet = new Set(prev)
        newSet.delete(resumeId)
        return newSet
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete resume'
      setError(errorMessage)
      console.error('Error deleting resume:', err)
    }
  }

  const handleDownloadResume = async (resumeId: string, fileName: string) => {
    try {
      const blob = await resumeApi.download(resumeId)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to download resume'
      setError(errorMessage)
      console.error('Error downloading resume:', err)
    }
  }

  const handleSelectionToggle = (resumeId: string) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev)
      if (newSet.has(resumeId)) {
        newSet.delete(resumeId)
      } else {
        newSet.add(resumeId)
      }
      return newSet
    })
  }

  const handleSelectAll = () => {
    if (selectedFiles.size === filteredResumes.length) {
      setSelectedFiles(new Set())
    } else {
      setSelectedFiles(new Set(filteredResumes.map(resume => resume.id)))
    }
  }

  const handleCompleteSelection = () => {
    const selectedResumes = filteredResumes.filter(resume => 
      selectedFiles.has(resume.id)
    )
    onSelectionComplete?.(selectedResumes)
  }

  const getStatusIcon = (resume: Resume) => {
    if (resume.processed) {
      return <CheckCircle className="h-4 w-4 text-green-500" />
    } else {
      return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  const getFileTypeIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'pdf':
        return <FileText className="h-4 w-4 text-red-500" />
      case 'docx':
      case 'doc':
        return <File className="h-4 w-4 text-blue-500" />
      case 'txt':
        return <FileText className="h-4 w-4 text-gray-500" />
      default:
        return <File className="h-4 w-4 text-gray-500" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {selectionMode && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onExitSelection}
                className="mr-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <Database className="h-6 w-6 text-blue-500" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {selectionMode ? `Select ${selectionMode}` : 'Data Hub'}
              </h2>
              <p className="text-sm text-gray-600">
                {selectionMode 
                  ? `Choose ${selectionMode} for ${agent.name}` 
                  : `Manage resumes and documents for ${agent.name}`
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadResumes}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            
            {!selectionMode && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Files
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Selection Mode Actions */}
        {selectionMode && (
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-sm text-blue-800">
                {selectedFiles.size} of {filteredResumes.length} files selected
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
                className="text-blue-600 hover:text-blue-700"
              >
                {selectedFiles.size === filteredResumes.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
            <Button
              onClick={handleCompleteSelection}
              disabled={selectedFiles.size === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Check className="h-4 w-4 mr-2" />
              Confirm Selection
            </Button>
          </div>
        )}

        {/* Upload Progress */}
        {uploadProgress.length > 0 && (
          <div className="mt-4 space-y-2">
            {uploadProgress.map((item, index) => (
              <Card key={index} className="bg-blue-50 border-blue-200">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-900">
                      {item.file.name}
                    </span>
                    <span className="text-xs text-blue-700">
                      {item.status === 'uploading' && `${item.progress}%`}
                      {item.status === 'completed' && 'Completed'}
                      {item.status === 'error' && 'Error'}
                    </span>
                  </div>
                  {item.status === 'uploading' && (
                    <Progress value={item.progress} className="h-2" />
                  )}
                  {item.status === 'error' && item.error && (
                    <p className="text-xs text-red-600 mt-1">{item.error}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="mt-4 flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search resumes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="processed">Processed</SelectItem>
              <SelectItem value="unprocessed">Unprocessed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="docx">DOCX</SelectItem>
              <SelectItem value="doc">DOC</SelectItem>
              <SelectItem value="txt">TXT</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4">
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setError(null)}
                className="ml-2 text-red-600 hover:text-red-700"
              >
                <X className="h-3 w-3" />
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
              <p className="text-gray-600">Loading resumes...</p>
            </div>
          </div>
        ) : filteredResumes.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <Database className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm || statusFilter !== "all" || typeFilter !== "all" 
                  ? 'No matching resumes found' 
                  : 'No resumes uploaded yet'
                }
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || statusFilter !== "all" || typeFilter !== "all"
                  ? 'Try adjusting your search criteria or filters'
                  : 'Upload resume files to get started with AI-powered candidate analysis'
                }
              </p>
              {!selectionMode && !searchTerm && statusFilter === "all" && typeFilter === "all" && (
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Your First Resume
                </Button>
              )}
            </div>
          </div>
        ) : (
          <ScrollArea className="h-full">
            <div className="p-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-blue-600">{totalResumes}</div>
                    <div className="text-sm text-gray-600">Total Resumes</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-green-600">
                      {resumes.filter(r => r.processed).length}
                    </div>
                    <div className="text-sm text-gray-600">Processed</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-yellow-600">
                      {resumes.filter(r => !r.processed).length}
                    </div>
                    <div className="text-sm text-gray-600">Pending</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-purple-600">
                      {filteredResumes.length}
                    </div>
                    <div className="text-sm text-gray-600">Showing</div>
                  </CardContent>
                </Card>
              </div>

              {/* Resumes Table */}
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {selectionMode && (
                          <TableHead className="w-12">
                            <Checkbox
                              checked={selectedFiles.size === filteredResumes.length && filteredResumes.length > 0}
                              onCheckedChange={handleSelectAll}
                            />
                          </TableHead>
                        )}
                        <TableHead>File</TableHead>
                        <TableHead>Candidate</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Upload Date</TableHead>
                        <TableHead>Skills</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredResumes.map((resume) => (
                        <TableRow 
                          key={resume.id}
                          className={selectionMode && selectedFiles.has(resume.id) ? 'bg-blue-50' : ''}
                        >
                          {selectionMode && (
                            <TableCell>
                              <Checkbox
                                checked={selectedFiles.has(resume.id)}
                                onCheckedChange={() => handleSelectionToggle(resume.id)}
                              />
                            </TableCell>
                          )}
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getFileTypeIcon(resume.file_type)}
                              <div>
                                <div className="font-medium text-gray-900">
                                  {resume.file_name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {resume.file_type.toUpperCase()}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium text-gray-900">
                                {resume.extracted_info?.name || 'Unknown'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {resume.extracted_info?.email || 'No email'}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(resume)}
                              <Badge variant={resume.processed ? "default" : "secondary"}>
                                {resume.processed ? 'Processed' : 'Processing'}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-600">
                              {formatFileSize(resume.file_size)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-600">
                              {new Date(resume.upload_timestamp).toLocaleDateString()}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {resume.extracted_info?.skills.slice(0, 3).map((skill, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                              {(resume.extracted_info?.skills.length || 0) > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{(resume.extracted_info?.skills.length || 0) - 3}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="sm" variant="ghost">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl max-h-[80vh]">
                                  <DialogHeader>
                                    <DialogTitle>{resume.file_name}</DialogTitle>
                                  </DialogHeader>
                                  <ScrollArea className="max-h-[60vh]">
                                    <div className="space-y-4">
                                      {resume.extracted_info && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <div>
                                            <h4 className="font-semibold mb-2">Personal Information</h4>
                                            <div className="space-y-1 text-sm">
                                              <p><strong>Name:</strong> {resume.extracted_info.name}</p>
                                              <p><strong>Email:</strong> {resume.extracted_info.email}</p>
                                              <p><strong>Phone:</strong> {resume.extracted_info.phone}</p>
                                            </div>
                                          </div>
                                          <div>
                                            <h4 className="font-semibold mb-2">Skills</h4>
                                            <div className="flex flex-wrap gap-1">
                                              {resume.extracted_info.skills.map((skill, index) => (
                                                <Badge key={index} variant="outline" className="text-xs">
                                                  {skill}
                                                </Badge>
                                              ))}
                                            </div>
                                          </div>
                                          <div className="md:col-span-2">
                                            <h4 className="font-semibold mb-2">Summary</h4>
                                            <p className="text-sm text-gray-600">
                                              {resume.extracted_info.summary}
                                            </p>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </ScrollArea>
                                </DialogContent>
                              </Dialog>
                              
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDownloadResume(resume.id, resume.file_name)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              
                              {!selectionMode && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteResume(resume.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-600">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalResumes)} of {totalResumes} resumes
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  )
}
