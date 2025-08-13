"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { FileText, Folder, HardDrive, Cloud, Database } from "lucide-react"

interface DataStorageConnectorDialogProps {
  isOpen: boolean
  onClose: () => void
  onConnect: (sourceType: string, files: string[], position: { x: number; y: number }) => void
  dropPosition: { x: number; y: number } | null
}

interface FileItem {
  id: string
  name: string
  type: "file" | "folder"
  path: string
  size?: string
  children?: FileItem[]
}

const mockFileSystem: FileItem[] = [
  {
    id: "1",
    name: "Documents",
    type: "folder",
    path: "/Documents",
    children: [
      { id: "1-1", name: "report_2023.pdf", type: "file", path: "/Documents/report_2023.pdf", size: "2.1MB" },
      { id: "1-2", name: "meeting_notes.docx", type: "file", path: "/Documents/meeting_notes.docx", size: "0.5MB" },
    ],
  },
  {
    id: "2",
    name: "Data",
    type: "folder",
    path: "/Data",
    children: [
      { id: "2-1", name: "sales_data.csv", type: "file", path: "/Data/sales_data.csv", size: "10.3MB" },
      { id: "2-2", name: "customer_info.json", type: "file", path: "/Data/customer_info.json", size: "5.8MB" },
      {
        id: "2-3",
        name: "Archive",
        type: "folder",
        path: "/Data/Archive",
        children: [
          { id: "2-3-1", name: "old_logs.zip", type: "file", path: "/Data/Archive/old_logs.zip", size: "50MB" },
        ],
      },
    ],
  },
  { id: "3", name: "image_assets.zip", type: "file", path: "/image_assets.zip", size: "120MB" },
]

const mockCloudFiles: { [key: string]: FileItem[] } = {
  aws: [
    { id: "aws1", name: "s3_bucket_data.csv", type: "file", path: "s3://my-bucket/s3_bucket_data.csv", size: "15MB" },
    { id: "aws2", name: "user_profiles.json", type: "file", path: "s3://my-bucket/user_profiles.json", size: "8MB" },
  ],
  azure: [
    {
      id: "azure1",
      name: "blob_storage_logs.txt",
      type: "file",
      path: "azure://my-blob/blob_storage_logs.txt",
      size: "2MB",
    },
    {
      id: "azure2",
      name: "financial_reports",
      type: "folder",
      path: "azure://my-blob/financial_reports",
      children: [
        {
          id: "azure2-1",
          name: "q1_2023.xlsx",
          type: "file",
          path: "azure://my-blob/financial_reports/q1_2023.xlsx",
          size: "3MB",
        },
      ],
    },
  ],
  gcp: [
    {
      id: "gcp1",
      name: "gcs_dataset.parquet",
      type: "file",
      path: "gs://my-gcs-bucket/gcs_dataset.parquet",
      size: "20MB",
    },
  ],
  database: [
    { id: "db1", name: "users_table", type: "file", path: "db://mydb/users_table", size: "N/A (Table)" },
    { id: "db2", name: "products_view", type: "file", path: "db://mydb/products_view", size: "N/A (View)" },
  ],
}

export function DataStorageConnectorDialog({
  isOpen,
  onClose,
  onConnect,
  dropPosition,
}: DataStorageConnectorDialogProps) {
  const [sourceType, setSourceType] = useState<string>("")
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [currentPath, setCurrentPath] = useState<string>("/") // For local/cloud file browsing

  const getIcon = (type: "file" | "folder") => {
    return type === "folder" ? (
      <Folder className="h-5 w-5 text-gray-500" />
    ) : (
      <FileText className="h-5 w-5 text-gray-500" />
    )
  }

  const renderFileTree = (items: FileItem[]) => {
    return items.map((item) => (
      <div key={item.id} className="flex items-center gap-2 py-1">
        <Checkbox
          id={`file-${item.id}`}
          checked={selectedFiles.includes(item.path)}
          onCheckedChange={(checked) => {
            setSelectedFiles((prev) => (checked ? [...prev, item.path] : prev.filter((path) => path !== item.path)))
          }}
        />
        <Label htmlFor={`file-${item.id}`} className="flex items-center gap-2 cursor-pointer text-base">
          {getIcon(item.type)}
          {item.name} {item.size && <span className="text-gray-500 text-sm">({item.size})</span>}
        </Label>
        {item.type === "folder" && item.children && (
          <div className="ml-6 border-l pl-2">{renderFileTree(item.children)}</div>
        )}
      </div>
    ))
  }

  const handleConnectClick = () => {
    if (dropPosition) {
      onConnect(sourceType, selectedFiles, dropPosition)
    }
    onClose()
  }

  const getCurrentFiles = () => {
    if (sourceType === "local") {
      return mockFileSystem
    } else if (sourceType === "aws" || sourceType === "azure" || sourceType === "gcp" || sourceType === "database") {
      return mockCloudFiles[sourceType] || []
    }
    return []
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose()
          setSourceType("")
          setSelectedFiles([])
          setCurrentPath("/")
        }
      }}
    >
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Connect Data Source</DialogTitle>
          <DialogDescription>Select a data source type and choose files to connect.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="source-type" className="text-right text-lg">
              Source Type
            </Label>
            <Select value={sourceType} onValueChange={setSourceType}>
              <SelectTrigger className="col-span-3 h-12 text-lg">
                <SelectValue placeholder="Select a data source type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="local" className="text-lg">
                  <div className="flex items-center gap-2">
                    <HardDrive className="h-5 w-5" /> Local Storage
                  </div>
                </SelectItem>
                <SelectItem value="aws" className="text-lg">
                  <div className="flex items-center gap-2">
                    <Cloud className="h-5 w-5 text-orange-500" /> AWS S3
                  </div>
                </SelectItem>
                <SelectItem value="azure" className="text-lg">
                  <div className="flex items-center gap-2">
                    <Cloud className="h-5 w-5 text-blue-500" /> Azure Blob Storage
                  </div>
                </SelectItem>
                <SelectItem value="gcp" className="text-lg">
                  <div className="flex items-center gap-2">
                    <Cloud className="h-5 w-5 text-green-500" /> Google Cloud Storage
                  </div>
                </SelectItem>
                <SelectItem value="database" className="text-lg">
                  <div className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-purple-500" /> Database
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {sourceType && (
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right text-lg pt-2">Files</Label>
              <div className="col-span-3 border rounded-md p-4 h-64">
                <ScrollArea className="h-full">
                  {getCurrentFiles().length === 0 ? (
                    <p className="text-gray-500 text-center py-10">No files available for this source type.</p>
                  ) : (
                    renderFileTree(getCurrentFiles())
                  )}
                </ScrollArea>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="text-lg px-6 py-3 bg-transparent">
            Cancel
          </Button>
          <Button
            onClick={handleConnectClick}
            disabled={!sourceType || selectedFiles.length === 0}
            className="bg-orange-600 hover:bg-orange-700 text-lg px-6 py-3"
          >
            Connect
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
