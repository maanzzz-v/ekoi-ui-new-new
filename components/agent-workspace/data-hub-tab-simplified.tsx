"use client"

import { useState, useRef, useEffect } from "react"
import { 
  Eye, 
  Trash2, 
  Upload, 
  FileText, 
  File, 
  Check, 
  Plus, 
  Database,
  RefreshCw,
  Search,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { FileUploadDialog } from "@/components/file-upload-dialog"
import { resumeApi, UploadResponse, Resume } from "@/lib/api"
import type { Agent } from "@/lib/types"

interface DataHubTabProps {
  agent: Agent
  selectionMode?: "resumes" | "job-descriptions" | null
  onSelectionComplete?: (selectedFiles: Resume[]) => void
  onExitSelection?: () => void
}

export function DataHubTab({ 
  agent, 
  selectionMode = null, 
  onSelectionComplete,
  onExitSelection 
}: DataHubTabProps) {
  const [resumes, setResumes] = useState<Resume[]>([])
  const [selectedResumes, setSelectedResumes] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalResumes, setTotalResumes] = useState(0)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const itemsPerPage = 20

  useEffect(() => {
    loadResumes()
  }, [currentPage])

  const loadResumes = async () => {
    try {
      setIsLoading(true)
      const skip = (currentPage - 1) * itemsPerPage
      const response = await resumeApi.listResumes(skip, itemsPerPage)
      
      if (response.success) {
        setResumes(response.resumes)
        setTotalPages(Math.ceil(response.total / itemsPerPage))
        setTotalResumes(response.total)
      }
    } catch (error) {
      console.error('Failed to load resumes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpload = async (files: File[]) => {
    try {
      const response = await resumeApi.uploadResumes(files)
      loadResumes() // Refresh the list
      setShowUploadDialog(false)
    } catch (error) {
      console.error('Upload failed:', error)
    }
  }

  const handleDelete = async (resumeId: string) => {
    if (!confirm('Are you sure you want to delete this resume?')) return
    
    try {
      await resumeApi.deleteResume(resumeId)
      await loadResumes() // Refresh the list
    } catch (error) {
      console.error('Failed to delete resume:', error)
      alert('Failed to delete resume')
    }
  }

  const toggleResumeSelection = (resumeId: string) => {
    setSelectedResumes(prev => 
      prev.includes(resumeId) 
        ? prev.filter(id => id !== resumeId)
        : [...prev, resumeId]
    )
  }

  const handleSelectionComplete = () => {
    if (onSelectionComplete) {
      const selectedResumeObjects = resumes.filter(resume => selectedResumes.includes(resume.id))
      onSelectionComplete(selectedResumeObjects)
    }
  }

  const filteredResumes = resumes.filter(resume =>
    resume.file_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return <FileText className="h-4 w-4 text-red-500" />
    return <File className="h-4 w-4 text-gray-500" />
  }

  const getStatusBadge = (processed: boolean) => {
    if (processed) {
      return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Processed</Badge>
    }
    return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Processing</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Database className="h-6 w-6 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Data Hub</h2>
            <p className="text-gray-600">Manage resume files and data sources</p>
          </div>
        </div>
        
        {selectionMode && (
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onExitSelection}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button 
              onClick={handleSelectionComplete} 
              disabled={selectedResumes.length === 0}
            >
              <Check className="h-4 w-4 mr-2" />
              Select {selectedResumes.length} Files
            </Button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Resumes</p>
                <p className="text-2xl font-bold text-gray-900">{totalResumes}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Processed</p>
                <p className="text-2xl font-bold text-green-600">
                  {resumes.filter(r => r.processed).length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Processing</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {resumes.filter(r => !r.processed).length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search resumes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button variant="outline" onClick={loadResumes} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <Button onClick={() => setShowUploadDialog(true)}>
          <Upload className="h-4 w-4 mr-2" />
          Upload Resumes
        </Button>
      </div>

      {/* Resume Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Resume Files ({filteredResumes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading resumes...</span>
            </div>
          ) : filteredResumes.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">No resumes found</p>
              <Button onClick={() => setShowUploadDialog(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Your First Resume
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {selectionMode && (
                        <TableHead className="w-12">
                          <Checkbox 
                            checked={selectedResumes.length === filteredResumes.length && filteredResumes.length > 0}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedResumes(filteredResumes.map(r => r.id))
                              } else {
                                setSelectedResumes([])
                              }
                            }}
                          />
                        </TableHead>
                      )}
                      <TableHead>File</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Uploaded</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredResumes.map((resume) => (
                      <TableRow key={resume.id} className="hover:bg-gray-50">
                        {selectionMode && (
                          <TableCell>
                            <Checkbox
                              checked={selectedResumes.includes(resume.id)}
                              onCheckedChange={() => toggleResumeSelection(resume.id)}
                            />
                          </TableCell>
                        )}
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getFileIcon(resume.file_type)}
                            <span className="font-medium truncate max-w-[200px]">
                              {resume.file_name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-gray-900">
                            {resume.file_name.split('.')[0]}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{resume.file_type}</Badge>
                        </TableCell>
                        <TableCell>
                          {(resume.file_size / 1024).toFixed(1)} KB
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(resume.processed)}
                        </TableCell>
                        <TableCell>
                          {new Date(resume.upload_timestamp).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="ghost">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>{resume.file_name}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="text-center py-8">
                                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500 mb-4">Resume details</p>
                                    <div className="space-y-2 text-sm text-gray-600">
                                      <p><strong>File:</strong> {resume.file_name}</p>
                                      <p><strong>Type:</strong> {resume.file_type}</p>
                                      <p><strong>Size:</strong> {(resume.file_size / 1024).toFixed(1)} KB</p>
                                      <p><strong>Uploaded:</strong> {new Date(resume.upload_timestamp).toLocaleDateString()}</p>
                                      <p><strong>Status:</strong> {resume.processed ? 'Processed' : 'Processing'}</p>
                                    </div>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => handleDelete(resume.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalResumes)} of {totalResumes} results
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
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
          )}
        </CardContent>
      </Card>

      {/* File Upload Dialog */}
      <FileUploadDialog
        isOpen={showUploadDialog}
        onClose={() => setShowUploadDialog(false)}
        onUpload={handleUpload}
        title="Upload Resume Files"
        description="Select PDF, DOC, DOCX, or TXT files to upload. Maximum 10MB per file."
        acceptedFileTypes=".pdf,.doc,.docx,.txt"
        maxSizeMB={10}
        maxFiles={10}
      />
    </div>
  )
}
