"use client"

import { useState, useRef, useEffect } from "react"
import { Upload, Eye, Trash2, FileText, Image, File, Database, Search, Filter, ChevronLeft, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { FileUploadDialog } from "@/components/file-upload-dialog"
import { resumeApi, type Resume } from "@/lib/api"
import { useResumeUpload, getUploadStatusMessage } from "@/lib/hooks/useResumeUpload"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface FilterOptions {
  fileTypes: string[]
  sources: string[]
  status: string[]
  sizeRange: [number, number] // in MB
  dateRange: { start: Date | null; end: null | Date }
  sortBy: "name" | "date" | "size" | "type"
  sortOrder: "asc" | "desc"
  namePattern: string
  excludePattern: string
  datePreset: "today" | "last7days" | "last30days" | "custom"
  sizePreset: "small" | "medium" | "large" | "custom" // small: <1MB, medium: 1-10MB, large: >10MB
  tags: string[]
  favorites: boolean
}

interface FileItem {
  id: string
  name: string
  type: string
  status: "uploaded" | "processing" | "pending" | "error"
  size: string
  uploadDate: Date
  source: "local" | "aws-s3" | "gcp" | "azure-blob"
  tags?: string[]
  favorite?: boolean
  content?: string
  metadata?: Record<string, any>
  extractedInfo?: {
    name?: string
    email?: string
    phone?: string
    skills?: string[]
    experience?: Array<{description: string; extracted: boolean}>
    education?: Array<{description: string; extracted: boolean}>
    summary?: string
  }
  hasVectors?: boolean
  vectorCount?: number
}

const mockFiles: FileItem[] = [
  {
    id: "1",
    name: "employee_handbook.pdf",
    type: "pdf",
    status: "uploaded",
    size: "5.2 MB",
    uploadDate: new Date("2024-01-15T10:30:00"),
    source: "local",
  },
  {
    id: "2",
    name: "training_materials.zip",
    type: "zip",
    status: "processing",
    size: "25.8 MB",
    uploadDate: new Date("2024-01-15T09:15:00"),
    source: "aws-s3",
  },
  {
    id: "3",
    name: "company_policies.docx",
    type: "docx",
    status: "uploaded",
    size: "890 KB",
    uploadDate: new Date("2024-01-14T16:45:00"),
    source: "gcp",
  },
  {
    id: "4",
    name: "org_chart.xlsx",
    type: "xlsx",
    status: "pending",
    size: "245 KB",
    uploadDate: new Date("2024-01-14T14:20:00"),
    source: "azure-blob",
  },
  {
    id: "5",
    name: "logo_assets.png",
    type: "png",
    status: "error",
    size: "1.8 MB",
    uploadDate: new Date("2024-01-13T11:10:00"),
    source: "local",
  },
  {
    id: "6",
    name: "meeting_transcripts.txt",
    type: "txt",
    status: "uploaded",
    size: "156 KB",
    uploadDate: new Date("2024-01-12T15:30:00"),
    source: "gcp",
  },
]

const getFileIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case "pdf":
    case "docx":
    case "xlsx":
    case "txt":
      return <FileText className="h-4 w-4" />
    case "jpg":
    case "png":
    case "gif":
      return <Image className="h-4 w-4" />
    default:
      return <File className="h-4 w-4" />
  }
}

const getStatusBadge = (status: string) => {
  const variants = {
    uploaded: "bg-green-100 text-green-800",
    processing: "bg-blue-100 text-blue-800",
    pending: "bg-yellow-100 text-yellow-800",
    error: "bg-red-100 text-red-800",
  }

  return (
    <Badge className={variants[status as keyof typeof variants] || ""}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )
}

const getSourceBadge = (source: string) => {
  const sourceConfig = {
    local: { label: "Local", color: "bg-gray-100 text-gray-800" },
    "aws-s3": { label: "AWS S3", color: "bg-orange-100 text-orange-800" },
    gcp: { label: "GCP", color: "bg-blue-100 text-blue-800" },
    "azure-blob": { label: "Azure Blob", color: "bg-purple-100 text-purple-800" },
  }

  const config = sourceConfig[source as keyof typeof sourceConfig] || sourceConfig.local

  return <Badge className={`${config.color} text-lg`}>{config.label}</Badge>
}

const applyDatePreset = (preset: string) => {
  const now = new Date()
  switch (preset) {
    case 'today':
      return {
        start: new Date(now.setHours(0, 0, 0, 0)),
        end: new Date(now.setHours(23, 59, 59, 999))
      }
    case 'last7days':
      return {
        start: new Date(now.setDate(now.getDate() - 7)),
        end: new Date()
      }
    case 'last30days':
      return {
        start: new Date(now.setDate(now.getDate() - 30)),
        end: new Date()
      }
    default:
      return { start: null, end: null }
  }
}

const applySizePreset = (preset: string): [number, number] => {
  switch (preset) {
    case 'small':
      return [0, 1] // 0-1MB
    case 'medium':
      return [1, 10] // 1-10MB
    case 'large':
      return [10, 1024] // 10MB-1GB
    default:
      return [0, 1024]
  }
}

export function DataSourcingPage() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [showConnectorDialog, setShowConnectorDialog] = useState(false)
  const [showFileUploadDialog, setShowFileUploadDialog] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [backendConnected, setBackendConnected] = useState<boolean | null>(null)
  const [availableTags] = useState<string[]>([
    "Important", "Archive", "Draft", "Template", "Review", "Confidential"
  ])

  // Use the resume upload hook for better state management
  const { uploadState, uploadResumes, resetUpload, clearError } = useResumeUpload()

  const [filters, setFilters] = useState<FilterOptions>({
    fileTypes: [],
    sources: [],
    status: [],
    sizeRange: [0, 1024],
    dateRange: { start: null, end: null },
    sortBy: "date",
    sortOrder: "desc",
    namePattern: "",
    excludePattern: "",
    datePreset: "custom",
    sizePreset: "custom",
    tags: [],
    favorites: false
  })

  const [selectedStatus, setSelectedStatus] = useState<string>("all")

  // Create a ref to track if we're already processing uploads to prevent duplicates
  const isProcessingUpload = useRef(false);
  
  // Track processed file signatures to avoid duplicate processing
  const processedFilesRef = useRef(new Set());

  // Check backend connectivity and load data on component mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true)
        
        // Check backend health
        const isHealthy = await resumeApi.healthCheck()
        setBackendConnected(isHealthy)
        
        if (isHealthy) {
          // Load existing resumes from backend
          await loadResumes()
        } else {
          setError("Backend server is not accessible. Please ensure the FastAPI server is running on localhost:8000")
        }
      } catch (err) {
        console.error("Failed to initialize data:", err)
        setError("Failed to connect to backend service")
        setBackendConnected(false)
      } finally {
        setLoading(false)
      }
    }

    initializeData()
  }, [])

  // Load resumes from backend
  const loadResumes = async () => {
    try {
      const response = await resumeApi.list(0, 100) // Load first 100 resumes
      
      const backendFiles: FileItem[] = response.resumes.map((resume) => ({
        id: resume.id,
        name: resume.file_name,
        type: resume.file_type,
        status: resume.processed ? "uploaded" as const : "processing" as const,
        size: formatFileSize(resume.file_size),
        uploadDate: new Date(resume.upload_timestamp),
        source: "local" as const,
        content: resume.extracted_info?.summary || '',
        metadata: resume.extracted_info || {},
      }))
      
      setFiles(backendFiles)
      setError(null)
    } catch (err) {
      console.error("Failed to load resumes:", err)
      setError("Failed to load files from backend")
    }
  }

  // Search resumes using backend API when search term is provided
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      // If search is empty, reload all resumes
      await loadResumes()
      return
    }

    try {
      setLoading(true)
      const response = await resumeApi.search({
        query: query.trim(),
        top_k: 50
      })
      
      const searchResults: FileItem[] = response.matches.map((match) => ({
        id: match.id,
        name: match.file_name,
        type: match.file_name.split('.').pop()?.toLowerCase() || 'unknown',
        status: "uploaded" as const,
        size: "N/A", // Size not available in search results
        uploadDate: new Date(), // Use current date as placeholder
        source: "local" as const,
        content: match.relevant_text || '',
        metadata: {},
        extractedInfo: match.extracted_info,
      }))
      
      setFiles(searchResults)
      setError(null)
    } catch (err) {
      console.error("Failed to search resumes:", err)
      setError("Failed to search files in backend")
      // Fall back to local filtering if backend search fails
      await loadResumes()
    } finally {
      setLoading(false)
    }
  }

  const filteredFiles = files.filter(file => {
    // Basic search
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    // File type and source filters
    const matchesFileType = filters.fileTypes.length === 0 || filters.fileTypes.includes(file.type)
    const matchesSource = filters.sources.length === 0 || filters.sources.includes(file.source)
    // Use selectedStatus for status filtering in the UI dropdown
    const matchesStatus =
      selectedStatus === "all"
        ? true
        : file.status === selectedStatus

    // Name pattern matching
    const matchesNamePattern = !filters.namePattern || 
      new RegExp(filters.namePattern, 'i').test(file.name)
    const notExcluded = !filters.excludePattern || 
      !new RegExp(filters.excludePattern, 'i').test(file.name)
    
    // Size filtering
    const fileSize = convertSizeToMB(file.size)
    const matchesSize = fileSize >= filters.sizeRange[0] && fileSize <= filters.sizeRange[1]
    
    // Date filtering
    const matchesDate = (!filters.dateRange.start || file.uploadDate >= filters.dateRange.start) &&
                       (!filters.dateRange.end || file.uploadDate <= filters.dateRange.end)

    // Tags and favorites (mock implementation - you would need to add these properties to your files)
    const matchesTags = filters.tags.length === 0 || 
      filters.tags.some(tag => file.tags?.includes(tag))
    const matchesFavorites = !filters.favorites || file.favorite

    return matchesSearch && 
           matchesFileType && 
           matchesSource && 
           matchesStatus && 
           matchesSize && 
           matchesDate && 
           matchesNamePattern && 
           notExcluded && 
           matchesTags && 
           matchesFavorites
  })

  const handleDeleteFile = async (fileId: string) => {
    try {
      await resumeApi.delete(fileId)
      setFiles((prev) => prev.filter((file) => file.id !== fileId))
      setError(null)
    } catch (err) {
      console.error("Failed to delete file:", err)
      setError("Failed to delete file from backend")
    }
  }

  const handleUploadFiles = async (uploadedFiles: File[]) => {
  const handleUploadFiles = async (uploadedFiles: File[]) => {
    // Create a signature for this batch of files
    const fileSignature = uploadedFiles.map(f => `${f.name}_${f.size}`).join('|');
    
    // Check if we've already processed this exact batch of files
    if (processedFilesRef.current.has(fileSignature)) {
      return;
    }
    
    // Prevent duplicate processing if we're already handling uploads
    if (isProcessingUpload.current) {
      return;
    }
    
    isProcessingUpload.current = true;
    processedFilesRef.current.add(fileSignature);
    
    try {
      // Create temporary file entries to show upload progress
      const tempFiles: FileItem[] = uploadedFiles.map((file, index) => ({
        id: `temp-${Date.now()}-${index}`,
        name: file.name,
        type: file.name.split('.').pop() || 'unknown',
        status: "processing" as const,
        size: formatFileSize(file.size),
        uploadDate: new Date(),
        source: "local" as const,
      }))
      
      // Add temporary files to state to show upload progress
      setFiles(prev => [...tempFiles, ...prev])
      setError(null)
      
      // Upload files using the hook
      const response = await uploadResumes(uploadedFiles)
      
      if (response.success) {
        // Remove temporary files and reload from backend to get actual data
        setFiles(prev => prev.filter(file => !file.id.startsWith('temp-')))
        await loadResumes() // Reload all files from backend
        
        // Show success message with details
        const successMessage = getUploadStatusMessage(response)
        console.log(successMessage)
        
        // Log upload success
        console.log(`Successfully uploaded ${response.uploaded_files.length} files:`, response.uploaded_files)
      } else {
        // Handle partial success
        setError(`Upload completed with issues: ${response.message}`)
        // Still reload to get whatever was successfully uploaded
        await loadResumes()
      }
      
    } catch (err) {
      console.error("Failed to upload files:", err)
      setError(err instanceof Error ? err.message : "Failed to upload files to backend")
      
      // Remove temporary files on error
      setFiles(prev => prev.filter(file => !file.id.startsWith('temp-')))
    } finally {
      // Reset the processing flag after completion
      isProcessingUpload.current = false;
      
      // Clear the processed files set after a while to allow re-uploads of the same files later
      setTimeout(() => {
        processedFilesRef.current.clear();
      }, 5000);
    }
  }
  }
  
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getStatusStats = () => {
    return {
      total: files.length,
      uploaded: files.filter(f => f.status === 'uploaded').length,
      processing: files.filter(f => f.status === 'processing').length,
      pending: files.filter(f => f.status === 'pending').length,
      error: files.filter(f => f.status === 'error').length
    }
  }

  const stats = getStatusStats()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-5xl font-bold text-gray-900">Data Sourcing</h1>
            <div className="flex items-center text-sm text-gray-500">
            <span className="hover:text-gray-700 cursor-pointer text-2xl">Home</span>
            <ChevronLeft className="h-4 w-4 mx-1 rotate-180" />
            <span className="text-gray-900 text-2xl">Data Source</span>
          </div>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={() => setShowConnectorDialog(true)} className="bg-blue-600 hover:bg-blue-700">
              <Database className="h-4 w-4 mr-2" />
              Connect Storage
            </Button>
            <Button onClick={() => setShowFileUploadDialog(true)} className="bg-orange-600 hover:bg-orange-700">
              <Upload className="h-4 w-4 mr-2" />
              Upload Files
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-gray-600">Total Files</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-green-600">Uploaded</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-green-600">{stats.uploaded}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-blue-600">Processing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-blue-600">{stats.processing}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-yellow-600">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-red-600">Errors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-red-600">{stats.error}</div>
            </CardContent>
          </Card>
        </div>

        {/* Backend Status and Error Alerts */}
        {backendConnected === false && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              ⚠️ Backend server is not connected. Please ensure your FastAPI server is running on localhost:8000
            </AlertDescription>
          </Alert>
        )}
        
        {error && (
          <Alert className="mb-6 border-orange-200 bg-orange-50">
            <AlertDescription className="text-orange-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Upload Progress */}
        {uploadState.isUploading && (
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <AlertDescription className="text-blue-800">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>Uploading resumes...</span>
                  <span>{Math.round(uploadState.progress)}%</span>
                </div>
                <Progress value={uploadState.progress} className="h-2" />
                <div className="text-sm text-blue-600">
                  Processing files and creating vector embeddings...
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Upload Success */}
        {uploadState.result && uploadState.result.success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">
              {getUploadStatusMessage(uploadState.result)}
              <div className="mt-2 text-sm">
                <strong>Successfully uploaded files:</strong>
                <ul className="list-disc pl-5 mt-1">
                  {uploadState.result.uploaded_files.map((filename, index) => (
                    <li key={index} className="text-green-700">
                      {filename}: Successfully processed and indexed
                    </li>
                  ))}
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {loading && (
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <AlertDescription className="text-blue-800">
              Loading files from backend...
            </AlertDescription>
          </Alert>
        )}

        {/* Controls Section */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search files by content and name (press Enter to search)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch(searchTerm)
                    }
                  }}
                  className="pl-10 text-lg"
                />
              </div>
              <Button
                onClick={() => handleSearch(searchTerm)}
                disabled={loading || backendConnected === false}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Search
              </Button>
              <Button
                onClick={() => {
                  setSearchTerm("")
                  loadResumes()
                }}
                variant="outline"
                disabled={loading}
              >
                Clear
              </Button>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="uploaded">Uploaded</option>
                  <option value="processing">Processing</option>
                  <option value="pending">Pending</option>
                  <option value="error">Error</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Files Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Files ({filteredFiles.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-auto max-h-[600px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-lg">Name</TableHead>
                    <TableHead className="text-lg">Type</TableHead>
                    <TableHead className="text-lg">Source</TableHead>
                    <TableHead className="text-lg">Status</TableHead>
                    <TableHead className="text-lg">Size</TableHead>
                    <TableHead className="text-lg">Upload Date</TableHead>
                    <TableHead className="text-lg text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFiles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500 text-lg">
                        {searchTerm || selectedStatus !== "all" 
                          ? "No matching files found." 
                          : 'No files uploaded yet. Click "Upload Files" to get started.'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredFiles.map((file) => (
                      <TableRow key={file.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getFileIcon(file.type)}
                            <span className="font-medium text-lg">{file.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{file.type.toUpperCase()}</Badge>
                        </TableCell>
                        <TableCell>{getSourceBadge(file.source)}</TableCell>
                        <TableCell>{getStatusBadge(file.status)}</TableCell>
                        <TableCell className="text-lg text-gray-600">{file.size}</TableCell>
                        <TableCell className="text-lg text-gray-600">
                          <div>
                            <div>{file.uploadDate.toLocaleDateString()}</div>
                            <div className="text-base text-gray-400">{file.uploadDate.toLocaleTimeString()}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>File Preview: {file.name}</DialogTitle>
                                </DialogHeader>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                  <p className="text-gray-600 mb-4">File preview not available for this file type.</p>
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <span className="font-medium">Type:</span> {file.type.toUpperCase()}
                                    </div>
                                    <div>
                                      <span className="font-medium">Size:</span> {file.size}
                                    </div>
                                    <div>
                                      <span className="font-medium">Source:</span> {file.source}
                                    </div>
                                    <div>
                                      <span className="font-medium">Status:</span> {file.status}
                                    </div>
                                    <div className="col-span-2">
                                      <span className="font-medium">Uploaded:</span> {file.uploadDate.toLocaleString()}
                                    </div>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteFile(file.id)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* File Upload Dialog */}
      <FileUploadDialog
        isOpen={showFileUploadDialog}
        onClose={() => setShowFileUploadDialog(false)}
        onUpload={handleUploadFiles}
        title="Upload Resume Files"
        maxFiles={10}
        maxSizeMB={10}
        acceptedFileTypes=".pdf,.doc,.docx,.txt"
        description="Drag and drop your resume files here (PDF, DOCX, TXT supported)"
      />
    </div>
  )
}


function convertSizeToMB(size: string): number {
  // Accepts formats like "5.2 MB", "890 KB", "156 KB", "1.8 MB"
  const regex = /^([\d.]+)\s*(MB|KB|GB)$/i
  const match = size.match(regex)
  if (!match) return 0
  const value = parseFloat(match[1])
  const unit = match[2].toUpperCase()
  switch (unit) {
    case "KB":
      return value / 1024
    case "MB":
      return value
    case "GB":
      return value * 1024
    default:
      return 0
  }
}
