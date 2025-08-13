"use client"

import { useState } from "react"
import { Calendar, Filter, X, FileText, HardDrive, Database, Cloud } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { format } from "date-fns"

export interface DataFilters {
  dateRange: {
    from: Date | null
    to: Date | null
  }
  fileTypes: string[]
  sources: string[]
  status: string[]
  sizeRange: {
    min: number
    max: number
  }
  searchTerm: string
}

interface DataFiltersComponentProps {
  filters: DataFilters
  onFiltersChange: (filters: DataFilters) => void
  showSources?: boolean
}

const fileTypeOptions = [
  { value: "pdf", label: "PDF", icon: <FileText className="h-4 w-4" /> },
  { value: "docx", label: "DOCX", icon: <FileText className="h-4 w-4" /> },
  { value: "xlsx", label: "XLSX", icon: <FileText className="h-4 w-4" /> },
  { value: "txt", label: "TXT", icon: <FileText className="h-4 w-4" /> },
  { value: "zip", label: "ZIP", icon: <FileText className="h-4 w-4" /> },
  { value: "png", label: "PNG", icon: <FileText className="h-4 w-4" /> },
  { value: "jpg", label: "JPG", icon: <FileText className="h-4 w-4" /> },
  { value: "gif", label: "GIF", icon: <FileText className="h-4 w-4" /> },
]

const sourceOptions = [
  { value: "local", label: "Local", icon: <HardDrive className="h-4 w-4" />, color: "bg-gray-100 text-gray-800" },
  { value: "aws-s3", label: "AWS S3", icon: <Cloud className="h-4 w-4" />, color: "bg-orange-100 text-orange-800" },
  { value: "gcp", label: "GCP", icon: <Database className="h-4 w-4" />, color: "bg-blue-100 text-blue-800" },
  {
    value: "azure-blob",
    label: "Azure Blob",
    icon: <Cloud className="h-4 w-4" />,
    color: "bg-purple-100 text-purple-800",
  },
]

const statusOptions = [
  { value: "uploaded", label: "Uploaded", color: "bg-green-100 text-green-800" },
  { value: "processing", label: "Processing", color: "bg-blue-100 text-blue-800" },
  { value: "pending", label: "Pending", color: "bg-yellow-100 text-yellow-800" },
  { value: "error", label: "Error", color: "bg-red-100 text-red-800" },
]

// Convert file size string to bytes for comparison
const parseFileSize = (sizeStr: string): number => {
  const units = { B: 1, KB: 1024, MB: 1024 * 1024, GB: 1024 * 1024 * 1024 }
  const match = sizeStr.match(/^([\d.]+)\s*([A-Z]+)$/i)
  if (!match) return 0
  const [, size, unit] = match
  return Number.parseFloat(size) * (units[unit.toUpperCase() as keyof typeof units] || 1)
}

// Convert bytes to readable format
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
}

export function DataFiltersComponent({ filters, onFiltersChange, showSources = true }: DataFiltersComponentProps) {
  const [isOpen, setIsOpen] = useState(false)

  const updateFilters = (updates: Partial<DataFilters>) => {
    onFiltersChange({ ...filters, ...updates })
  }

  const toggleArrayFilter = (
    array: string[],
    value: string,
    key: keyof Pick<DataFilters, "fileTypes" | "sources" | "status">,
  ) => {
    const newArray = array.includes(value) ? array.filter((item) => item !== value) : [...array, value]
    updateFilters({ [key]: newArray })
  }

  const clearAllFilters = () => {
    onFiltersChange({
      dateRange: { from: null, to: null },
      fileTypes: [],
      sources: [],
      status: [],
      sizeRange: { min: 0, max: 1000 },
      searchTerm: "",
    })
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.dateRange.from || filters.dateRange.to) count++
    if (filters.fileTypes.length > 0) count++
    if (filters.sources.length > 0) count++
    if (filters.status.length > 0) count++
    if (filters.sizeRange.min > 0 || filters.sizeRange.max < 1000) count++
    if (filters.searchTerm) count++
    return count
  }

  const activeFiltersCount = getActiveFiltersCount()

  return (
    <div className="flex items-center gap-3">
      {/* Search Input */}
      <div className="relative">
        <Input
          placeholder="Search files..."
          value={filters.searchTerm}
          onChange={(e) => updateFilters({ searchTerm: e.target.value })}
          className="w-64"
        />
        {filters.searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            onClick={() => updateFilters({ searchTerm: "" })}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Advanced Filters Popover */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="relative bg-transparent">
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs bg-orange-600">{activeFiltersCount}</Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96 p-0" align="end">
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Advanced Filters</h4>
              <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                Clear All
              </Button>
            </div>

            <Separator />

            {/* Date Range */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Date Range</Label>
              <div className="grid grid-cols-2 gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start text-left font-normal bg-transparent">
                      <Calendar className="mr-2 h-4 w-4" />
                      {filters.dateRange.from ? format(filters.dateRange.from, "MMM dd") : "From"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={filters.dateRange.from || undefined}
                      onSelect={(date) =>
                        updateFilters({
                          dateRange: { ...filters.dateRange, from: date || null },
                        })
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start text-left font-normal bg-transparent">
                      <Calendar className="mr-2 h-4 w-4" />
                      {filters.dateRange.to ? format(filters.dateRange.to, "MMM dd") : "To"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={filters.dateRange.to || undefined}
                      onSelect={(date) =>
                        updateFilters({
                          dateRange: { ...filters.dateRange, to: date || null },
                        })
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* File Types */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">File Types</Label>
              <div className="grid grid-cols-2 gap-2">
                {fileTypeOptions.map((type) => (
                  <Button
                    key={type.value}
                    variant={filters.fileTypes.includes(type.value) ? "default" : "outline"}
                    size="sm"
                    className="justify-start"
                    onClick={() => toggleArrayFilter(filters.fileTypes, type.value, "fileTypes")}
                  >
                    {type.icon}
                    <span className="ml-2">{type.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Sources (only show if enabled) */}
            {showSources && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Sources</Label>
                <div className="grid grid-cols-1 gap-2">
                  {sourceOptions.map((source) => (
                    <Button
                      key={source.value}
                      variant={filters.sources.includes(source.value) ? "default" : "outline"}
                      size="sm"
                      className="justify-start"
                      onClick={() => toggleArrayFilter(filters.sources, source.value, "sources")}
                    >
                      {source.icon}
                      <span className="ml-2">{source.label}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Status */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Status</Label>
              <div className="grid grid-cols-2 gap-2">
                {statusOptions.map((status) => (
                  <Button
                    key={status.value}
                    variant={filters.status.includes(status.value) ? "default" : "outline"}
                    size="sm"
                    className="justify-start"
                    onClick={() => toggleArrayFilter(filters.status, status.value, "status")}
                  >
                    <span>{status.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* File Size Range */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">File Size Range</Label>
              <div className="px-2">
                <Slider
                  value={[filters.sizeRange.min, filters.sizeRange.max]}
                  onValueChange={([min, max]) =>
                    updateFilters({
                      sizeRange: { min, max },
                    })
                  }
                  max={1000}
                  step={10}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{formatFileSize(filters.sizeRange.min * 1024 * 1024)}</span>
                  <span>{formatFileSize(filters.sizeRange.max * 1024 * 1024)}</span>
                </div>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {filters.fileTypes.map((type) => (
            <Badge key={type} variant="secondary" className="gap-1">
              {type.toUpperCase()}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => toggleArrayFilter(filters.fileTypes, type, "fileTypes")}
              />
            </Badge>
          ))}
          {filters.sources.map((source) => (
            <Badge key={source} variant="secondary" className="gap-1">
              {sourceOptions.find((s) => s.value === source)?.label}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => toggleArrayFilter(filters.sources, source, "sources")}
              />
            </Badge>
          ))}
          {filters.status.map((status) => (
            <Badge key={status} variant="secondary" className="gap-1">
              {status}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => toggleArrayFilter(filters.status, status, "status")}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}

// Helper function to apply filters to file data
export function applyDataFilters<
  T extends {
    name: string
    type: string
    status: string
    size: string
    uploadDate: Date
    source?: string
  },
>(files: T[], filters: DataFilters): T[] {
  return files.filter((file) => {
    // Search term
    if (filters.searchTerm && !file.name.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
      return false
    }

    // Date range
    if (filters.dateRange.from && file.uploadDate < filters.dateRange.from) {
      return false
    }
    if (filters.dateRange.to && file.uploadDate > filters.dateRange.to) {
      return false
    }

    // File types
    if (filters.fileTypes.length > 0 && !filters.fileTypes.includes(file.type.toLowerCase())) {
      return false
    }

    // Sources (only if file has source property)
    if (filters.sources.length > 0 && file.source && !filters.sources.includes(file.source)) {
      return false
    }

    // Status
    if (filters.status.length > 0 && !filters.status.includes(file.status.toLowerCase())) {
      return false
    }

    // File size
    const fileSizeBytes = parseFileSize(file.size)
    const minBytes = filters.sizeRange.min * 1024 * 1024
    const maxBytes = filters.sizeRange.max * 1024 * 1024
    if (fileSizeBytes < minBytes || fileSizeBytes > maxBytes) {
      return false
    }

    return true
  })
}
