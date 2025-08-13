"use client"

import * as React from "react"
import { useCallback, useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Upload, File, X, FileText, Image } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileUploadDialogProps {
  isOpen: boolean
  onClose: () => void
  onUpload: (files: File[]) => void
  title?: string
  acceptedFileTypes?: string
  maxFiles?: number
  maxSizeMB?: number
  description?: string
}

export function FileUploadDialog({
  isOpen,
  onClose,
  onUpload,
  title = "Upload Files",
  acceptedFileTypes = "*/*",
  maxFiles = 10,
  maxSizeMB = 50,
  description = "Drag and drop your files here, or browse to upload",
}: FileUploadDialogProps) {
  const [files, setFiles] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [errors, setErrors] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const validateFile = (file: File): string | null => {
    // Check file size
    if (maxSizeMB && file.size > maxSizeMB * 1024 * 1024) {
      return `"${file.name}" exceeds maximum size of ${maxSizeMB}MB`
    }
    return null
  }

  const processFiles = (newFiles: File[]) => {
    const newErrors: string[] = []
    const validFiles: File[] = []

    // Check max files limit
    if (maxFiles > 0 && files.length + newFiles.length > maxFiles) {
      newErrors.push(`You can only upload up to ${maxFiles} files at once`)
      newFiles = newFiles.slice(0, maxFiles - files.length)
    }

    // Validate each file
    newFiles.forEach(file => {
      const error = validateFile(file)
      if (error) {
        newErrors.push(error)
      } else {
        validFiles.push(file)
      }
    })

    if (newErrors.length > 0) {
      setErrors(prev => [...prev, ...newErrors])
    }

    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles])
    }
  }

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      if (e.dataTransfer.files.length > 0) {
        const droppedFiles = Array.from(e.dataTransfer.files)
        processFiles(droppedFiles)
      }
    },
    [files.length, maxFiles],
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const selectedFiles = Array.from(e.target.files)
        processFiles(selectedFiles)
      }
      // Reset input value so the same file can be selected again if removed
      e.target.value = ""
    },
    [files.length, maxFiles],
  )

  const removeFile = useCallback((index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index))
  }, [])

  const clearAllFiles = () => {
    setFiles([])
    setErrors([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    
    if (['pdf', 'docx', 'doc', 'txt', 'xlsx', 'xls', 'csv'].includes(extension || '')) {
      return <FileText className="h-5 w-5 text-blue-600" />
    } else if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(extension || '')) {
      return <Image className="h-5 w-5 text-green-600" />
    } else {
      return <File className="h-5 w-5 text-gray-600" />
    }
  }

  // Keep track of whether we've already triggered the upload
  const hasUploadedRef = useRef(false);
  
  const handleUpload = useCallback(() => {
    if (files.length === 0) return

    // Check if already uploading to prevent double uploads
    if (uploadProgress !== null) return
    
    // If we've already uploaded these files, don't do it again
    if (hasUploadedRef.current) {
      console.log("Already uploaded these files, preventing duplicate upload");
      return;
    }

    // Reset any previous errors
    setErrors([])
    
    // Start upload progress simulation
    setUploadProgress(0)
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev === null) return 0
        if (prev >= 100) {
          clearInterval(interval)
          // Call the onUpload callback after a short delay
          setTimeout(() => {
            // Create a local copy of files to ensure we don't get affected by state changes
            const filesToUpload = [...files]
            onUpload(filesToUpload)
            setUploadProgress(null)
            setFiles([])
            
            // Reset the upload flag when dialog is closed
            hasUploadedRef.current = false;
            onClose()
          }, 500)
          return 100
        }
        return Math.min(100, prev + Math.random() * 10)
      })
    }, 200)
  }, [files, onClose, onUpload, uploadProgress])

  const triggerFileBrowser = () => {
    fileInputRef.current?.click()
  }

  // Reset the upload flag when the dialog is opened or closed
  useEffect(() => {
    hasUploadedRef.current = false;
  }, [isOpen]);
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px] md:max-w-[650px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">{title}</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto py-4">
          {/* Drag and drop area */}
          <div
            className={cn(
              "flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors",
              isDragging ? "border-orange-500 bg-orange-50" : "border-gray-300 hover:border-orange-400 hover:bg-gray-50",
            )}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              multiple
              accept={acceptedFileTypes}
              onChange={handleFileInput}
            />
            <Upload className={`h-12 w-12 mb-4 ${isDragging ? "text-orange-500" : "text-gray-400"}`} />
            <p className="text-lg font-medium mb-2">
              {isDragging ? "Drop files here" : description}
            </p>
            <p className="text-sm text-gray-500 mb-4">or</p>
            <Button onClick={triggerFileBrowser} className="bg-orange-600 hover:bg-orange-700">
              Browse Files
            </Button>
            <div className="mt-3 text-xs text-gray-500">
              {maxFiles > 0 && (
                <span>Up to {maxFiles} files, </span>
              )}
              {maxSizeMB && (
                <span>max {maxSizeMB}MB per file</span>
              )}
            </div>
          </div>

          {/* Error messages */}
          {errors.length > 0 && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm font-medium text-red-800 mb-1">The following errors occurred:</p>
              <ul className="text-xs text-red-700 list-disc pl-5">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setErrors([])}
                className="text-xs mt-2 h-auto py-1 px-2 text-red-600 hover:text-red-700"
              >
                Clear Errors
              </Button>
            </div>
          )}

          {/* Upload progress */}
          {uploadProgress !== null && (
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-blue-900">Uploading files...</span>
                <span className="text-sm text-blue-700">{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          {/* Selected files list */}
          {files.length > 0 && (
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <p className="font-medium text-gray-700">Selected Files ({files.length})</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFiles}
                  className="text-xs text-gray-600 hover:text-red-600 h-auto py-1"
                >
                  Clear All
                </Button>
              </div>
              <div className="border rounded-md overflow-hidden">
                <div className="max-h-[200px] overflow-y-auto">
                  {files.map((file, index) => (
                    <div
                      key={`${file.name}-${index}`}
                      className="flex items-center justify-between py-2 px-3 border-b last:border-b-0 bg-white hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        {getFileIcon(file.name)}
                        <div className="overflow-hidden">
                          <p className="truncate font-medium text-sm">{file.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="h-8 w-8 p-0 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full"
                        disabled={uploadProgress !== null}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-gray-300"
            disabled={uploadProgress !== null}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            className="bg-orange-600 hover:bg-orange-700"
            disabled={files.length === 0 || uploadProgress !== null}
          >
            {uploadProgress !== null ? "Uploading..." : `Upload ${files.length > 0 ? `(${files.length})` : ""}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
