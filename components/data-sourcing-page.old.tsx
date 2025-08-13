"use client"

import { useState } from "react"
import { Upload, Eye, Trash2, FileText, Image, File, Database, Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileUploadDialog } from "@/components/file-upload-dialog"

interface FileItem {
  id: string
  name: string
  type: string
  status: "uploaded" | "processing" | "pending" | "error"
  size: string
  uploadDate: Date
  source: "local" | "aws-s3" | "gcp" | "azure-blob"
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

  return <Badge className={config.color}>{config.label}</Badge>
}

export function DataSourcingPage() {
  const [files, setFiles] = useState(mockFiles)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [showConnectorDialog, setShowConnectorDialog] = useState(false)
  const [showFileUploadDialog, setShowFileUploadDialog] = useState(false)

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === "all" || file.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const handleDeleteFile = (fileId: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== fileId))
  }
  
  const handleUploadFiles = (uploadedFiles: File[]) => {
    // Process the uploaded files
    const newFiles: FileItem[] = uploadedFiles.map((file, index) => {
      return {
        id: `new-${Date.now()}-${index}`,
        name: file.name,
        type: file.name.split('.').pop() || 'unknown',
        status: "processing", // Start as processing
        size: formatFileSize(file.size),
        uploadDate: new Date(),
        source: "local",
      }
    })
    
    // Add the new files to the state
    setFiles(prev => [...newFiles, ...prev])
    
    // After a short delay, change the status to "uploaded" to simulate processing
    setTimeout(() => {
      setFiles(prev => prev.map(file => {
        if (file.id.startsWith('new-')) {
          return { ...file, status: "uploaded" }
        }
        return file
      }))
    }, 2000)
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
            <p className="text-gray-600 mt-1 text-2xl">Manage your data files and connections</p>
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
              <CardTitle className="text-sm font-medium text-gray-600">Total Files</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-600">Uploaded</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.uploaded}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-600">Processing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.processing}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-yellow-600">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-600">Errors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.error}</div>
            </CardContent>
          </Card>
        </div>

        {/* Controls Section */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search files by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Upload Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFiles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
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
                            <span className="font-medium">{file.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{file.type.toUpperCase()}</Badge>
                        </TableCell>
                        <TableCell>{getSourceBadge(file.source)}</TableCell>
                        <TableCell>{getStatusBadge(file.status)}</TableCell>
                        <TableCell className="text-sm text-gray-600">{file.size}</TableCell>
                        <TableCell className="text-sm text-gray-600">
                          <div>
                            <div>{file.uploadDate.toLocaleDateString()}</div>
                            <div className="text-xs text-gray-400">{file.uploadDate.toLocaleTimeString()}</div>
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
        title="Upload Files"
        maxFiles={10}
        maxSizeMB={50}
        acceptedFileTypes=".pdf,.doc,.docx,.txt,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.zip"
        description="Drag and drop your files here to upload to Data Storage"
      />
    </div>
  )
}
