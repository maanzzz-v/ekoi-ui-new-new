"use client"

import { useState } from "react"
import { Eye, Trash2, Upload, FileText, ImageIcon, File, Check, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DataFiltersComponent, applyDataFilters, type DataFilters } from "@/components/data-filters"
import { Checkbox } from "@/components/ui/checkbox"
import type { Agent } from "@/lib/types"

interface DataHubTabProps {
  agent: Agent
  selectionMode?: "resumes" | "job-descriptions" | null
  onSelectionComplete?: (selectedFiles: FileItem[]) => void
  onExitSelection?: () => void
}

interface FileItem {
  id: string
  name: string
  type: string
  status: "uploaded" | "processing" | "pending" | "error"
  size: string
  uploadDate: Date
}

const mockFiles: FileItem[] = [
  {
    id: "1",
    name: "resume_john_doe.pdf",
    type: "pdf",
    status: "uploaded",
    size: "2.4 MB",
    uploadDate: new Date("2024-01-15T10:30:00"),
  },
  {
    id: "2",
    name: "resume_jane_smith.pdf",
    type: "pdf",
    status: "uploaded",
    size: "1.8 MB",
    uploadDate: new Date("2024-01-14T15:20:00"),
  },
  {
    id: "3",
    name: "senior_developer_jd.docx",
    type: "docx",
    status: "uploaded",
    size: "156 KB",
    uploadDate: new Date("2024-01-14T16:45:00"),
  },
  {
    id: "4",
    name: "product_manager_jd.docx",
    type: "docx",
    status: "uploaded",
    size: "142 KB",
    uploadDate: new Date("2024-01-13T11:30:00"),
  },
  {
    id: "5",
    name: "resume_mike_johnson.pdf",
    type: "pdf",
    status: "processing",
    size: "2.1 MB",
    uploadDate: new Date("2024-01-13T09:15:00"),
  },
  {
    id: "6",
    name: "data_scientist_jd.docx",
    type: "docx",
    status: "uploaded",
    size: "178 KB",
    uploadDate: new Date("2024-01-12T14:20:00"),
  },
  {
    id: "7",
    name: "interview_notes.txt",
    type: "txt",
    status: "pending",
    size: "12 KB",
    uploadDate: new Date("2024-01-12T10:10:00"),
  },
  {
    id: "8",
    name: "profile_image.jpg",
    type: "jpg",
    status: "error",
    size: "3.2 MB",
    uploadDate: new Date("2024-01-11T16:30:00"),
  },
]

const getFileIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case "pdf":
    case "docx":
    case "txt":
      return <FileText className="h-4 w-4" />
    case "jpg":
    case "png":
    case "gif":
      return <ImageIcon className="h-4 w-4" />
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

const isRelevantFile = (file: FileItem, selectionMode: "resumes" | "job-descriptions" | null) => {
  if (!selectionMode) return true

  const fileName = file.name.toLowerCase()
  if (selectionMode === "resumes") {
    return fileName.includes("resume") || fileName.includes("cv")
  }
  if (selectionMode === "job-descriptions") {
    return fileName.includes("jd") || fileName.includes("job") || fileName.includes("description")
  }
  return true
}

export function DataHubTab({ agent, selectionMode, onSelectionComplete, onExitSelection }: DataHubTabProps) {
  const [filters, setFilters] = useState<DataFilters>({
    dateRange: { from: null, to: null },
    fileTypes: [],
    sources: [],
    status: [],
    sizeRange: { min: 0, max: 1000 },
    searchTerm: "",
  })
  const [files, setFiles] = useState(mockFiles)
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])

  const relevantFiles = files.filter((file) => isRelevantFile(file, selectionMode))
  const filteredFiles = applyDataFilters(relevantFiles, filters)

  const handleDeleteFile = (fileId: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== fileId))
  }

  const handleFileSelection = (fileId: string, checked: boolean) => {
    setSelectedFiles((prev) => (checked ? [...prev, fileId] : prev.filter((id) => id !== fileId)))
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedFiles(filteredFiles.map((file) => file.id))
    } else {
      setSelectedFiles([])
    }
  }

  const handleConfirmSelection = () => {
    const selected = files.filter((file) => selectedFiles.includes(file.id))
    onSelectionComplete?.(selected)
  }

  const getSelectionTitle = () => {
    switch (selectionMode) {
      case "resumes":
        return "Select Resumes"
      case "job-descriptions":
        return "Select Job Descriptions"
      default:
        return "Data Hub"
    }
  }

  return (
    <div className="space-y-6">
      {/* Selection Mode Header */}
      {selectionMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={onExitSelection}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Tasks
              </Button>
              <div>
                <h3 className="font-semibold text-blue-900">{getSelectionTitle()}</h3>
                <p className="text-sm text-blue-700">
                  Select the files you want to use for this task. {selectedFiles.length} file(s) selected.
                </p>
              </div>
            </div>
            <Button
              onClick={handleConfirmSelection}
              disabled={selectedFiles.length === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Check className="h-4 w-4 mr-2" />
              Use Selected ({selectedFiles.length})
            </Button>
          </div>
        </div>
      )}

      {/* Header Actions */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <DataFiltersComponent filters={filters} onFiltersChange={setFilters} showSources={false} />
          {!selectionMode && (
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Upload className="h-4 w-4 mr-2" />
              Upload Files
            </Button>
          )}
        </div>
      </div>

      {/* Files Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              {selectionMode && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedFiles.length === filteredFiles.length && filteredFiles.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
              )}
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Upload Date</TableHead>
              {!selectionMode && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFiles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={selectionMode ? 6 : 6} className="text-center py-8 text-gray-500">
                  {Object.values(filters).some(
                    (v) =>
                      (Array.isArray(v) && v.length > 0) ||
                      (typeof v === "object" && v !== null && (v.from || v.to)) ||
                      (typeof v === "string" && v) ||
                      (typeof v === "object" && v !== null && "min" in v && (v.min > 0 || v.max < 1000)),
                  )
                    ? `No matching ${selectionMode ? selectionMode.replace("-", " ") : "files"} found.`
                    : `No ${selectionMode ? selectionMode.replace("-", " ") : "files"} uploaded yet.`}
                </TableCell>
              </TableRow>
            ) : (
              filteredFiles.map((file) => (
                <TableRow
                  key={file.id}
                  className={selectionMode && selectedFiles.includes(file.id) ? "bg-blue-50" : ""}
                >
                  {selectionMode && (
                    <TableCell>
                      <Checkbox
                        checked={selectedFiles.includes(file.id)}
                        onCheckedChange={(checked) => handleFileSelection(file.id, !!checked)}
                      />
                    </TableCell>
                  )}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getFileIcon(file.type)}
                      <span className="font-medium">{file.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{file.type.toUpperCase()}</Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(file.status)}</TableCell>
                  <TableCell>{file.size}</TableCell>
                  <TableCell>
                    {file.uploadDate.toLocaleDateString()} {file.uploadDate.toLocaleTimeString()}
                  </TableCell>
                  {!selectionMode && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>File Preview: {file.name}</DialogTitle>
                            </DialogHeader>
                            <div className="p-4 bg-gray-50 rounded-lg">
                              <p className="text-gray-600">File preview not available for this file type.</p>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteFile(file.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
