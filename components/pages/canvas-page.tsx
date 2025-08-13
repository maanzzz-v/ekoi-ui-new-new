"use client"

import React, { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Bot, Database, Zap, Settings, Plus, X, Trash2, Link, Cloud, HardDrive, Folder, File, FileText, Image, Video, Music, Archive, Search, CheckCircle2, AlertTriangle, Filter, Shuffle, BarChart3, FileSpreadsheet, Calculator, Target, ClipboardList, Send, BookOpen, PieChart, TrendingUp, FileBarChart, Mail, MessageSquare, Bell, Workflow, GitBranch } from 'lucide-react'
import { cn } from "@/lib/utils"

interface BlockType {
  id: string
  type: "agent" | "data" | "function" | "task"
  name: string
  x: number
  y: number
  inputs: number
  outputs: number
  selected?: boolean
  config?: any
  selectedFiles?: string[]
  provider?: string
  functionType?: string
  taskType?: string
}

interface Connection {
  id: string
  from: { blockId: string; outputIndex: number; x: number; y: number }
  to: { blockId: string; inputIndex: number; x: number; y: number }
}

interface ConnectionState {
  isConnecting: boolean
  startBlock?: string
  startIndex?: number
  startType?: 'input' | 'output'
  startPosition?: { x: number; y: number }
  currentPosition?: { x: number; y: number }
}

// Provider Icons
const ProviderIcons = {
  gcp: () => (
    <svg viewBox="0 0 24 24" className="h-5 w-5">
      <path fill="currentColor" d="M12.51 4.31L8.77 8.05c-.29.29-.29.77 0 1.06l.71.71c.29.29.77.29 1.06 0l3.74-3.74c.29-.29.77-.29 1.06 0l3.74 3.74c.29.29.77.29 1.06 0l.71-.71c.29-.29.29-.77 0-1.06l-4.25-4.25c-.59-.58-1.54-.58-2.13 0zm-.02 5.38L8.75 13.43c-.29.29-.29.77 0 1.06l3.74 3.74c.59.58 1.54.58 2.13 0l3.74-3.74c.29-.29.29-.77 0-1.06l-3.74-3.74c-.29-.29-.77-.29-1.06 0z"/>
    </svg>
  ),
  aws: () => (
    <svg viewBox="0 0 24 24" className="h-5 w-5">
      <path fill="currentColor" d="M6.76 10.95c0-.54.06-1.01.17-1.41.12-.4.29-.75.52-1.06.23-.31.52-.58.86-.8.34-.23.74-.41 1.2-.56v-.21c0-.86-.45-1.29-1.36-1.29-.41 0-.82.08-1.24.25-.41.16-.81.37-1.18.61l-.49-.79c.43-.29.91-.52 1.44-.69.53-.17 1.07-.25 1.61-.25 1.29 0 1.94.69 1.94 2.06v4.27h-.89l-.12-.69h-.03c-.31.26-.65.45-1.03.58-.38.13-.78.19-1.2.19-.84 0-1.2-.54-1.2-1.61zm2.26 1.09c.38 0 .73-.06 1.05-.18.32-.12.59-.31.8-.56v-1.91c-.38.13-.73.3-1.05.51-.32.21-.48.51-.48.89 0 .52.23.78.68.78z"/>
      <path fill="currentColor" d="M13.59 12.49c-.41 0-.78-.07-1.11-.21-.33-.14-.61-.33-.85-.57-.23-.24-.41-.53-.53-.86-.12-.33-.18-.69-.18-1.08 0-.39.06-.75.18-1.08.12-.33.29-.62.53-.86.23-.24.52-.43.85-.57.33-.14.7-.21 1.11-.21.82 0 1.47.28 1.95.85.48.57.72 1.34.72 2.31v.34h-4.35c.03.61.21 1.08.54 1.41.33.33.78.49 1.35.49.35 0 .68-.05.98-.15.3-.1.57-.24.8-.42l.34.69c-.26.21-.57.38-.93.51-.36.13-.75.19-1.17.19z"/>
    </svg>
  ),
  azure: () => (
    <svg viewBox="0 0 24 24" className="h-5 w-5">
      <path fill="currentColor" d="M5.483 17.333L12 19.5l6.517-2.167L12 4.5 5.483 17.333zM12 6.75l4.65 9.6L12 17.625l-4.65-1.275L12 6.75z"/>
    </svg>
  ),
  local: HardDrive
}

const paletteItems = {
  agents: [
    { id: "agent-1", name: "Data Analyzer", inputs: 2, outputs: 4, icon: BarChart3, 
      downstreamTasks: ["analysis_report", "data_insights", "visualization", "summary"] },
    { id: "agent-2", name: "Report Generator", inputs: 2, outputs: 3, icon: FileBarChart, 
      downstreamTasks: ["pdf_report", "email_notification", "dashboard_update"] },
    { id: "agent-3", name: "ML Classifier", inputs: 2, outputs: 3, icon: Target, 
      downstreamTasks: ["prediction_results", "model_metrics", "feature_importance"] },
    { id: "agent-4", name: "Content Writer", inputs: 1, outputs: 2, icon: BookOpen, 
      downstreamTasks: ["article_draft", "seo_metadata"] },
    { id: "agent-5", name: "Quality Assessor", inputs: 2, outputs: 3, icon: CheckCircle2, 
      downstreamTasks: ["quality_score", "improvement_suggestions", "approval_status"] },
    { id: "agent-hira", name: "HIRA (Hiring Agent)", inputs: 2, outputs: 4, icon: Bot,
      downstreamTasks: ["analyze_resumes", "shortlist_candidates", "finalize_candidates", "generate_hiring_report"] },
  ],
  data: [
    { id: "data-1", name: "Local Storage", inputs: 0, outputs: 1, icon: HardDrive, provider: "local" },
    { id: "data-2", name: "Google Cloud", inputs: 0, outputs: 1, icon: () => ProviderIcons.gcp(), provider: "gcp" },
    { id: "data-3", name: "Azure Blob", inputs: 0, outputs: 1, icon: () => ProviderIcons.azure(), provider: "azure" },
    { id: "data-4", name: "AWS S3", inputs: 0, outputs: 1, icon: () => ProviderIcons.aws(), provider: "aws" },
  ],
  functions: [
    { id: "func-1", name: "Transform", inputs: 1, outputs: 1, icon: Shuffle, functionType: "transform" },
    { id: "func-2", name: "Filter", inputs: 1, outputs: 1, icon: Filter, functionType: "filter" },
    { id: "func-3", name: "Aggregate", inputs: 1, outputs: 1, icon: Calculator, functionType: "aggregate" },
    { id: "func-4", name: "Sort", inputs: 1, outputs: 1, icon: TrendingUp, functionType: "sort" },
    { id: "func-5", name: "Join", inputs: 2, outputs: 1, icon: GitBranch, functionType: "join" },
    { id: "func-6", name: "Split", inputs: 1, outputs: 2, icon: Workflow, functionType: "split" },
    { id: "func-dedup", name: "Remove Duplicates", inputs: 1, outputs: 1, icon: Filter, functionType: "deduplicate" },
  ],
  tasks: [
    { id: "task-1", name: "Send Email", inputs: 1, outputs: 0, icon: Mail, taskType: "notification" },
    { id: "task-2", name: "Create Report", inputs: 1, outputs: 1, icon: ClipboardList, taskType: "document" },
    { id: "task-3", name: "Update Database", inputs: 1, outputs: 0, icon: Database, taskType: "storage" },
    { id: "task-4", name: "Send Notification", inputs: 1, outputs: 0, icon: Bell, taskType: "notification" },
    { id: "task-5", name: "Generate Chart", inputs: 1, outputs: 1, icon: PieChart, taskType: "visualization" },
    { id: "task-6", name: "Post Message", inputs: 1, outputs: 0, icon: MessageSquare, taskType: "communication" },
  ]
}

interface DataFile {
  id: string
  name: string
  type: string
  size: string
  modified: string
  path: string
  bucket?: string
  container?: string
}

const mockDataSources: {
  local: DataFile[]
  gcp: DataFile[]
  azure: DataFile[]
  aws: DataFile[]
} = {
  local: [
    { id: "1", name: "sales_data_2024.csv", type: "csv", size: "2.3 MB", modified: "2024-08-10", path: "/documents/sales_data_2024.csv" },
    { id: "2", name: "customer_profiles.json", type: "json", size: "856 KB", modified: "2024-08-09", path: "/documents/customer_profiles.json" },
    { id: "3", name: "inventory_report.xlsx", type: "xlsx", size: "1.2 MB", modified: "2024-08-08", path: "/documents/inventory_report.xlsx" },
    { id: "4", name: "user_logs.txt", type: "txt", size: "4.7 MB", modified: "2024-08-07", path: "/logs/user_logs.txt" },
    { id: "5", name: "product_images.zip", type: "zip", size: "15.2 MB", modified: "2024-08-06", path: "/assets/product_images.zip" },
    // HIRA-related data files
    { id: "hira-1", name: "job_applications_batch1.csv", type: "csv", size: "5.2 MB", modified: "2024-08-11", path: "/hr/applications/job_applications_batch1.csv" },
    { id: "hira-2", name: "candidate_resumes.zip", type: "zip", size: "25.6 MB", modified: "2024-08-10", path: "/hr/resumes/candidate_resumes.zip" },
    { id: "hira-3", name: "job_requirements.json", type: "json", size: "156 KB", modified: "2024-08-09", path: "/hr/positions/job_requirements.json" },
    { id: "hira-4", name: "screening_criteria.xlsx", type: "xlsx", size: "890 KB", modified: "2024-08-08", path: "/hr/config/screening_criteria.xlsx" },
    { id: "hira-5", name: "candidate_database.csv", type: "csv", size: "12.8 MB", modified: "2024-08-07", path: "/hr/database/candidate_database.csv" }
  ],
  gcp: [
    { id: "6", name: "analytics_data.parquet", type: "parquet", size: "8.9 MB", modified: "2024-08-10", bucket: "analytics-bucket", path: "data/analytics_data.parquet" },
    { id: "7", name: "ml_training_set.csv", type: "csv", size: "45.6 MB", modified: "2024-08-09", bucket: "ml-datasets", path: "training/ml_training_set.csv" },
    { id: "8", name: "realtime_metrics.json", type: "json", size: "123 KB", modified: "2024-08-10", bucket: "metrics-bucket", path: "live/realtime_metrics.json" },
    { id: "9", name: "backup_database.sql", type: "sql", size: "234 MB", modified: "2024-08-05", bucket: "backups", path: "db/backup_database.sql" },
    // HIRA GCP data
    { id: "gcp-hira-1", name: "resume_embeddings.parquet", type: "parquet", size: "45.3 MB", modified: "2024-08-11", bucket: "hr-ml-bucket", path: "embeddings/resume_embeddings.parquet" },
    { id: "gcp-hira-2", name: "candidate_scoring_model.pkl", type: "pkl", size: "67.2 MB", modified: "2024-08-09", bucket: "hr-ml-bucket", path: "models/candidate_scoring_model.pkl" }
  ],
  azure: [
    { id: "10", name: "quarterly_reports.xlsx", type: "xlsx", size: "3.4 MB", modified: "2024-08-10", container: "reports", path: "2024/q2/quarterly_reports.xlsx" },
    { id: "11", name: "sensor_data.csv", type: "csv", size: "67.8 MB", modified: "2024-08-09", container: "iot-data", path: "sensors/2024/sensor_data.csv" },
    { id: "12", name: "media_files.zip", type: "zip", size: "128 MB", modified: "2024-08-08", container: "media", path: "uploads/media_files.zip" },
    { id: "13", name: "config_settings.json", type: "json", size: "45 KB", modified: "2024-08-07", container: "configs", path: "app/config_settings.json" },
    // HIRA Azure data
    { id: "azure-hira-1", name: "hr_templates.docx", type: "docx", size: "2.1 MB", modified: "2024-08-10", container: "hr-templates", path: "documents/hr_templates.docx" },
    { id: "azure-hira-2", name: "interview_feedback.json", type: "json", size: "890 KB", modified: "2024-08-08", container: "hr-data", path: "feedback/interview_feedback.json" }
  ],
  aws: [
    { id: "14", name: "transaction_logs.csv", type: "csv", size: "156 MB", modified: "2024-08-10", bucket: "transaction-data", path: "logs/2024/08/transaction_logs.csv" },
    { id: "15", name: "user_behavior.json", type: "json", size: "23.7 MB", modified: "2024-08-09", bucket: "analytics", path: "behavior/user_behavior.json" },
    { id: "16", name: "model_weights.h5", type: "h5", size: "89.4 MB", modified: "2024-08-08", bucket: "ml-models", path: "trained/model_weights.h5" },
    { id: "17", name: "backup_archive.tar.gz", type: "tar.gz", size: "2.1 GB", modified: "2024-08-05", bucket: "backups", path: "daily/backup_archive.tar.gz" },
    { id: "18", name: "stream_data.parquet", type: "parquet", size: "445 MB", modified: "2024-08-10", bucket: "streaming", path: "processed/stream_data.parquet" },
    // HIRA AWS data
    { id: "aws-hira-1", name: "applicant_tracking.csv", type: "csv", size: "34.7 MB", modified: "2024-08-11", bucket: "hr-pipeline", path: "tracking/applicant_tracking.csv" },
    { id: "aws-hira-2", name: "resume_parser_output.json", type: "json", size: "18.3 MB", modified: "2024-08-10", bucket: "hr-pipeline", path: "parsed/resume_parser_output.json" },
    { id: "aws-hira-3", name: "skill_matching_results.parquet", type: "parquet", size: "12.9 MB", modified: "2024-08-09", bucket: "hr-analytics", path: "matching/skill_matching_results.parquet" }
  ]
}

// HIRA Agent Configuration Parameters (for when the agent is selected):
const hiraAgentConfiguration = [
  {
    name: "Resume Screening Criteria",
    value: "Experience, Skills, Education, Keywords",
    importance: 35
  },
  {
    name: "Scoring Algorithm",
    value: "Weighted Matching",
    importance: 30
  },
  {
    name: "Shortlist Size",
    value: "Top 10 candidates",
    importance: 20
  },
  {
    name: "Final Selection Count",
    value: "3-5 candidates",
    importance: 15
  }
]

// Remove Duplicates Function Configuration (for when the function is selected):
const removeDuplicatesConfiguration = {
  functionType: "deduplicate",
  parameters: [
    {
      name: "Duplicate Detection Field",
      value: "email",
      options: ["email", "name", "phone", "resume_hash", "application_id"]
    },
    {
      name: "Matching Threshold",
      value: "95%",
      description: "Similarity threshold for fuzzy matching (0-100%)"
    },
    {
      name: "Keep Strategy",
      value: "most_recent",
      options: ["first", "last", "most_recent", "highest_score", "manual_review"]
    },
    {
      name: "Case Sensitivity",
      value: "ignore",
      options: ["ignore", "respect", "normalize"]
    }
  ]
}

export function CanvasPage() {
  const [blocks, setBlocks] = useState<BlockType[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [selectedBlock, setSelectedBlock] = useState<BlockType | null>(null)
  const [sidebarTab, setSidebarTab] = useState<"agents" | "data" | "functions" | "tasks" | "configure">("agents")
  const [sidebarExpanded, setSidebarExpanded] = useState(false)
  const [draggedItem, setDraggedItem] = useState<any>(null)
  const [connectionState, setConnectionState] = useState<ConnectionState>({ isConnecting: false })
  const [showFileBrowser, setShowFileBrowser] = useState(false)
  const [fileSearchTerm, setFileSearchTerm] = useState("")
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const canvasRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  // Handle mouse move for connection preview
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (connectionState.isConnecting && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect()
        setConnectionState(prev => ({
          ...prev,
          currentPosition: {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
          }
        }))
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && connectionState.isConnecting) {
        setConnectionState({ isConnecting: false })
      }
    }

    if (connectionState.isConnecting) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [connectionState.isConnecting])

  const handleDragStart = (item: any, type: "agent" | "data" | "function" | "task") => {
    setDraggedItem({ ...item, type })
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (!draggedItem || !canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const newBlock: BlockType = {
      id: `${draggedItem.type}-${Date.now()}`,
      type: draggedItem.type,
      name: draggedItem.name,
      x: Math.max(0, x - 90),
      y: Math.max(0, y - 40),
      inputs: draggedItem.inputs,
      outputs: draggedItem.outputs,
      config: draggedItem.type === "data" ? { provider: draggedItem.provider, configured: false } : undefined,
      selectedFiles: [],
      provider: draggedItem.provider,
      functionType: draggedItem.functionType,
      taskType: draggedItem.taskType
    }

    setBlocks(prev => [...prev, newBlock])
    setDraggedItem(null)

    // Auto-select data source for configuration
    if (draggedItem.type === "data") {
      setSelectedBlock(newBlock)
      setSidebarTab("configure")
      setBlocks(prev => prev.map(b => ({ ...b, selected: b.id === newBlock.id })))
    }
  }, [draggedItem])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleBlockClick = (block: BlockType) => {
    if (connectionState.isConnecting) return
    
    setSelectedBlock(block)
    setSidebarTab("configure")
    setBlocks(prev => prev.map(b => ({ ...b, selected: b.id === block.id })))
  }

  const handleDeleteBlock = (blockId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
    }
    
    setBlocks(prev => prev.filter(block => block.id !== blockId))
    setConnections(prev => prev.filter(conn => 
      conn.from.blockId !== blockId && conn.to.blockId !== blockId
    ))
    
    if (selectedBlock?.id === blockId) {
      setSelectedBlock(null)
    }
  }

  const handleAddDownstreamTasks = (agentBlock: BlockType) => {
    if (agentBlock.type !== "agent") return
    
    const agentData = paletteItems.agents.find(a => a.name === agentBlock.name)
    if (!agentData?.downstreamTasks) return

    const taskSpacing = 200
    const startY = agentBlock.y + 150
    const startX = agentBlock.x + 50

    const newTasks: BlockType[] = []
    const newConnections: Connection[] = []

    agentData.downstreamTasks.forEach((taskName, index) => {
      const taskId = `task-${Date.now()}-${index}`
      const taskX = startX + (index % 2) * taskSpacing
      const taskY = startY + Math.floor(index / 2) * 120

      // Find matching task template
      const taskTemplate = paletteItems.tasks.find(t => t.name.toLowerCase().includes(taskName.split('_')[0]))
      
      const newTask: BlockType = {
        id: taskId,
        type: "task",
        name: taskName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        x: taskX,
        y: taskY,
        inputs: 1,
        outputs: taskTemplate?.outputs || 0,
        taskType: taskTemplate?.taskType || "general"
      }

      newTasks.push(newTask)

      // Create connection from agent to task
      const connection: Connection = {
        id: `conn-${Date.now()}-${index}`,
        from: {
          blockId: agentBlock.id,
          outputIndex: index,
          x: agentBlock.x + 180,
          y: agentBlock.y + 20 + (index * 15)
        },
        to: {
          blockId: taskId,
          inputIndex: 0,
          x: taskX,
          y: taskY + 20
        }
      }

      newConnections.push(connection)
    })

    setBlocks(prev => [...prev, ...newTasks])
    setConnections(prev => [...prev, ...newConnections])
  }

  const handleSaveConfiguration = () => {
    if (!selectedBlock || selectedBlock.type !== "data") return
    
    const updatedBlock = {
      ...selectedBlock,
      config: {
        ...selectedBlock.config,
        configured: true
      },
      selectedFiles: selectedFiles
    }
    
    setSelectedBlock(updatedBlock)
    setBlocks(prev => prev.map(b => 
      b.id === selectedBlock.id ? updatedBlock : b
    ))
    setShowFileBrowser(false)
    setSelectedFiles([])
  }

  const openFileBrowser = () => {
    if (selectedBlock?.selectedFiles) {
      setSelectedFiles(selectedBlock.selectedFiles)
    }
    setFileSearchTerm("")
    setShowFileBrowser(true)
  }

  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'csv':
      case 'xlsx':
      case 'xls':
        return FileText
      case 'json':
      case 'xml':
        return File
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return Image
      case 'mp4':
      case 'avi':
      case 'mov':
        return Video
      case 'mp3':
      case 'wav':
        return Music
      case 'zip':
      case 'tar.gz':
      case 'rar':
        return Archive
      default:
        return File
    }
  }

  const getAvailableFiles = () => {
    if (!selectedBlock?.config?.provider) return []
    return mockDataSources[selectedBlock.config.provider as keyof typeof mockDataSources] || []
  }

  const filteredFiles = getAvailableFiles().filter(file =>
    file.name.toLowerCase().includes(fileSearchTerm.toLowerCase()) ||
    file.type.toLowerCase().includes(fileSearchTerm.toLowerCase())
  )

  const handleFileSelection = (fileId: string, checked: boolean) => {
    if (checked) {
      setSelectedFiles(prev => [...prev, fileId])
    } else {
      setSelectedFiles(prev => prev.filter(id => id !== fileId))
    }
  }

  const getNodePosition = (block: BlockType, nodeIndex: number, isOutput: boolean) => {
    const nodeY = block.y + 20 + (nodeIndex * 15)
    const nodeX = isOutput ? block.x + 180 : block.x
    return { x: nodeX, y: nodeY }
  }

  const handleNodeClick = (blockId: string, nodeIndex: number, isOutput: boolean, e: React.MouseEvent) => {
    e.stopPropagation()
    
    const block = blocks.find(b => b.id === blockId)
    if (!block) return

    // Check if data source is configured before allowing connections
    if (block.type === "data" && isOutput && !block.config?.configured) {
      // Select the block for configuration
      setSelectedBlock(block)
      setSidebarTab("configure")
      setBlocks(prev => prev.map(b => ({ ...b, selected: b.id === blockId })))
      return
    }

    const position = getNodePosition(block, nodeIndex, isOutput)

    if (!connectionState.isConnecting) {
      // Start connection
      if (isOutput) {
        setConnectionState({
          isConnecting: true,
          startBlock: blockId,
          startIndex: nodeIndex,
          startType: 'output',
          startPosition: position,
          currentPosition: position
        })
      }
    } else {
      // Complete connection
      if (!isOutput && connectionState.startType === 'output' && connectionState.startBlock !== blockId) {
        // Check if connection already exists
        const existingConnection = connections.find(conn => 
          conn.from.blockId === connectionState.startBlock &&
          conn.from.outputIndex === connectionState.startIndex &&
          conn.to.blockId === blockId &&
          conn.to.inputIndex === nodeIndex
        )

        if (!existingConnection) {
          const newConnection: Connection = {
            id: `conn-${Date.now()}`,
            from: {
              blockId: connectionState.startBlock!,
              outputIndex: connectionState.startIndex!,
              x: connectionState.startPosition!.x,
              y: connectionState.startPosition!.y
            },
            to: {
              blockId: blockId,
              inputIndex: nodeIndex,
              x: position.x,
              y: position.y
            }
          }
          setConnections(prev => [...prev, newConnection])
        }
      }
      
      setConnectionState({ isConnecting: false })
    }
  }

  const handleDeleteConnection = (connectionId: string) => {
    setConnections(prev => prev.filter(conn => conn.id !== connectionId))
  }

  const getBlockIcon = (block: BlockType) => {
    if (block.type === "data" && block.provider) {
      const dataItem = paletteItems.data.find(item => item.provider === block.provider)
      return dataItem?.icon || Database
    }
    
    if (block.type === "agent") {
      const agentItem = paletteItems.agents.find(item => item.name === block.name)
      return agentItem?.icon || Bot
    }
    
    if (block.type === "function") {
      const funcItem = paletteItems.functions.find(item => item.functionType === block.functionType)
      return funcItem?.icon || Zap
    }
    
    if (block.type === "task") {
      const taskItem = paletteItems.tasks.find(item => item.taskType === block.taskType)
      return taskItem?.icon || Target
    }
    
    switch (block.type) {
      case "agent": return Bot
      case "data": return Database
      case "function": return Zap
      case "task": return Target
      default: return Bot
    }
  }

  const getBlockColor = (
    type: BlockType["type"],
    configured?: boolean
  ) => {
    if (type === "data" && !configured) {
      return "bg-gradient-to-br from-orange-100 to-red-100 border-orange-300 text-orange-800 shadow-lg"
    }
    
    switch (type) {
      case "agent": return "bg-gradient-to-br from-green-100 to-emerald-100 border-green-300 text-green-800 shadow-lg"
      case "data": return "bg-gradient-to-br from-blue-100 to-indigo-100 border-blue-300 text-blue-800 shadow-lg"
      case "function": return "bg-gradient-to-br from-purple-100 to-pink-100 border-purple-300 text-purple-800 shadow-lg"
      case "task": return "bg-gradient-to-br from-yellow-100 to-amber-100 border-yellow-300 text-yellow-800 shadow-lg"
      default: return "bg-gradient-to-br from-gray-100 to-gray-200 border-gray-300 text-gray-800 shadow-lg"
    }
  }

  const renderNodeConnectors = (block: BlockType) => {
    const inputNodes = Array.from({ length: block.inputs }, (_, i) => (
      <div
        key={`input-${i}`}
        className={cn(
          "absolute w-4 h-4 rounded-full border-2 border-white cursor-pointer transition-all z-20",
          connectionState.isConnecting && connectionState.startType === 'output'
            ? "bg-green-400 hover:bg-green-500 hover:scale-125"
            : "bg-gray-400 hover:bg-gray-600 hover:scale-110"
        )}
        style={{
          left: -8,
          top: 16 + (i * 15)
        }}
        onClick={(e) => handleNodeClick(block.id, i, false, e)}
        title={`Input ${i + 1}`}
      />
    ))

    const outputNodes = Array.from({ length: block.outputs }, (_, i) => (
      <div
        key={`output-${i}`}
        className={cn(
          "absolute w-4 h-4 rounded-full border-2 border-white cursor-pointer transition-all z-20",
          block.type === "data" && !block.config?.configured
            ? "bg-orange-400 hover:bg-orange-500 hover:scale-125"
            : !connectionState.isConnecting
            ? "bg-blue-400 hover:bg-blue-500 hover:scale-125"
            : "bg-gray-400 hover:bg-gray-600 hover:scale-110"
        )}
        style={{
          right: -8,
          top: 16 + (i * 15)
        }}
        onClick={(e) => handleNodeClick(block.id, i, true, e)}
        title={
          block.type === "data" && !block.config?.configured 
            ? "Configure data source first" 
            : `Output ${i + 1}`
        }
      />
    ))

    return [...inputNodes, ...outputNodes]
  }

  const renderConnections = () => {
    const allConnections = [...connections]
    
    // Add preview connection if connecting
    if (connectionState.isConnecting && connectionState.startPosition && connectionState.currentPosition) {
      allConnections.push({
        id: 'preview',
        from: {
          blockId: 'preview',
          outputIndex: 0,
          x: connectionState.startPosition.x,
          y: connectionState.startPosition.y
        },
        to: {
          blockId: 'preview',
          inputIndex: 0,
          x: connectionState.currentPosition.x,
          y: connectionState.currentPosition.y
        }
      })
    }

    return allConnections.map((connection) => {
      const isPreview = connection.id === 'preview'
      const midX = (connection.from.x + connection.to.x) / 2
      const controlPoint1X = connection.from.x + Math.abs(connection.to.x - connection.from.x) * 0.5
      const controlPoint2X = connection.to.x - Math.abs(connection.to.x - connection.from.x) * 0.5

      return (
        <g key={connection.id}>
          <path
            d={`M ${connection.from.x} ${connection.from.y} C ${controlPoint1X} ${connection.from.y}, ${controlPoint2X} ${connection.to.y}, ${connection.to.x} ${connection.to.y}`}
            stroke={isPreview ? "#94a3b8" : "#3b82f6"}
            strokeWidth={isPreview ? "2" : "3"}
            fill="none"
            strokeDasharray={isPreview ? "5,5" : "none"}
            className={isPreview ? "opacity-60" : "hover:stroke-purple-500 cursor-pointer"}
            onClick={() => !isPreview && handleDeleteConnection(connection.id)}
          />
          {!isPreview && (
            <>
              {/* Connection delete button */}
              <circle
                cx={midX}
                cy={(connection.from.y + connection.to.y) / 2}
                r="8"
                fill="#ef4444"
                className="opacity-0 hover:opacity-100 cursor-pointer transition-opacity"
                onClick={() => handleDeleteConnection(connection.id)}
              />
              <text
                x={midX}
                y={(connection.from.y + connection.to.y) / 2 + 1}
                textAnchor="middle"
                fontSize="10"
                fill="white"
                className="pointer-events-none select-none"
              >
                ×
              </text>
              {/* Arrow marker */}
              <polygon
                points={`${connection.to.x - 8},${connection.to.y - 4} ${connection.to.x - 8},${connection.to.y + 4} ${connection.to.x},${connection.to.y}`}
                fill="#3b82f6"
                className="pointer-events-none"
              />
            </>
          )}
        </g>
      )
    })
  }

  const sidebarTabs = [
    { id: "agents", icon: Bot, label: "Agents" },
    { id: "data", icon: Database, label: "Data" },
    { id: "functions", icon: Zap, label: "Functions" },
    { id: "tasks", icon: Target, label: "Tasks" },
    { id: "configure", icon: Settings, label: "Configure" },
  ]

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* File Browser Modal */}
      {showFileBrowser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-[90vw] max-w-4xl h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Database className="h-6 w-6 text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-900">
                    Select Files from {selectedBlock?.name}
                  </h2>
                </div>
                <button
                  onClick={() => {
                    setShowFileBrowser(false)
                    setSelectedFiles(selectedBlock?.selectedFiles || [])
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="p-6 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search files by name or type..."
                  value={fileSearchTerm}
                  onChange={(e) => setFileSearchTerm(e.target.value)}
                  className="pl-10 h-12 text-base"
                />
              </div>
            </div>

            {/* File List */}
            <div className="flex-1 overflow-hidden">
              <div className="h-full overflow-y-auto">
                {/* List Header */}
                <div className="sticky top-0 bg-gray-50 border-b border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      Available Files ({filteredFiles.length})
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedFiles(filteredFiles.map(f => f.id))}
                      >
                        Select All
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedFiles([])}
                      >
                        Clear All
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Files */}
                {filteredFiles.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-gray-500">
                    <File className="h-12 w-12 mb-4 text-gray-300" />
                    <p className="text-lg">No files found</p>
                    <p className="text-sm">Try adjusting your search terms</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {filteredFiles.map((file) => {
                      const FileIcon = getFileIcon(file.type)
                      const isSelected = selectedFiles.includes(file.id)
                      
                      return (
                        <div
                          key={file.id}
                          className={cn(
                            "flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer transition-colors",
                            isSelected && "bg-blue-50 border-l-4 border-blue-500"
                          )}
                          onClick={() => handleFileSelection(file.id, !isSelected)}
                        >
                          <div className="flex items-center">
                            <div className={cn(
                              "w-5 h-5 border-2 rounded flex items-center justify-center transition-colors",
                              isSelected 
                                ? "bg-blue-600 border-blue-600" 
                                : "border-gray-300 hover:border-gray-400"
                            )}>
                              {isSelected && <CheckCircle2 className="h-3 w-3 text-white" />}
                            </div>
                          </div>
                          
                          <div className="w-10 h-10 bg-white border rounded-lg flex items-center justify-center shadow-sm">
                            <FileIcon className="h-5 w-5 text-gray-600" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-base font-medium text-gray-900 truncate">
                                {file.name}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {file.type.toUpperCase()}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-500 flex items-center gap-4">
                              <span>{file.size}</span>
                              <span>Modified: {file.modified}</span>
                              <span className="font-mono text-xs">
                                {selectedBlock?.config?.provider === 'local' && file.path}
                                {selectedBlock?.config?.provider === 'gcp' && `gs://${file.bucket}/${file.path}`}
                                {selectedBlock?.config?.provider === 'azure' && `${file.container}/${file.path}`}
                                {selectedBlock?.config?.provider === 'aws' && `s3://${file.bucket}/${file.path}`}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  {selectedFiles.length} files selected
                </span>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowFileBrowser(false)
                      setSelectedFiles(selectedBlock?.selectedFiles || [])
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveConfiguration}
                    disabled={selectedFiles.length === 0}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    Save Selection ({selectedFiles.length})
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Canvas */}
      <div className="flex-1 relative overflow-hidden">
        <div
          ref={canvasRef}
          className="w-full h-full bg-white/80 backdrop-blur-sm relative"
          style={{
            backgroundImage: `
              radial-gradient(circle, #e5e7eb 1px, transparent 1px)
            `,
            backgroundSize: "20px 20px"
          }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => {
            if (connectionState.isConnecting) {
              setConnectionState({ isConnecting: false })
            }
          }}
        >
          {/* SVG for connections */}
          <svg
            ref={svgRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ zIndex: 1 }}
          >
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon
                  points="0 0, 10 3.5, 0 7"
                  fill="#3b82f6"
                />
              </marker>
            </defs>
            <g className="pointer-events-auto">
              {renderConnections()}
            </g>
          </svg>

          {/* Connection Instructions */}
          {connectionState.isConnecting && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-6 py-3 rounded-full shadow-lg z-30">
              <div className="flex items-center gap-2">
                <Link className="h-4 w-4" />
                <span>Click on an input node to complete the connection (ESC to cancel)</span>
              </div>
            </div>
          )}

          {/* Render Blocks */}
          {blocks.map((block) => {
            const Icon = getBlockIcon(block)
            const isConfigured = block.type !== "data" || (block.config?.configured && (block.selectedFiles?.length ?? 0) > 0)
            
            return (
              <div
                key={block.id}
                className={cn(
                  "absolute border-2 rounded-2xl p-4 cursor-pointer select-none min-w-[180px] transition-all duration-200 hover:scale-105 group",
                  getBlockColor(block.type, isConfigured),
                  block.selected && "ring-4 ring-blue-400 ring-opacity-50"
                )}
                style={{ left: block.x, top: block.y, zIndex: 10 }}
                onClick={() => handleBlockClick(block)}
              >
                {/* Configuration Status Badge */}
                {block.type === "data" && !isConfigured && (
                  <div className="absolute -top-1 -left-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center z-20">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                )}

                {/* Delete Button */}
                <button
                  onClick={(e) => handleDeleteBlock(block.id, e)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
                >
                  <X className="h-3 w-3" />
                </button>

                {/* Add Tasks Button for Agents */}
                {block.type === "agent" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleAddDownstreamTasks(block)
                    }}
                    className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
                    title="Add downstream tasks"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                )}

                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-white/80 rounded-lg flex items-center justify-center shadow-sm">
                    {React.createElement(Icon, { className: "h-5 w-5" })}
                  </div>
                  <div>
                    <span className="text-sm font-bold">{block.name}</span>
                    <div className="text-xs opacity-75">
                      {block.inputs}→{block.outputs}
                      {block.type === "data" && !isConfigured && (
                        <span className="ml-2 text-orange-600 font-semibold">Configure Required</span>
                      )}
                      {block.type === "data" && (block.selectedFiles?.length ?? 0) > 0 && (
                        <span className="ml-2 text-green-600 font-semibold">
                          {(block.selectedFiles?.length ?? 0)} files
                        </span>
                      )}
                      {block.type === "agent" && (
                        <span className="ml-2 text-green-600 font-semibold text-xs">
                          +Tasks
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {renderNodeConnectors(block)}
              </div>
            )
          })}

          {/* Empty State */}
          {blocks.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 5 }}>
              <div className="text-center text-gray-500 bg-white/90 backdrop-blur-sm p-12 rounded-3xl shadow-xl border border-white/20">
                <Plus className="mx-auto h-16 w-16 mb-6 text-gray-300" />
                <h3 className="text-2xl font-bold mb-4 text-gray-800">Start Building Your Workflow</h3>
                <p className="text-lg text-gray-600 mb-4">Drag blocks from the sidebar to create your workflow</p>
                <p className="text-sm text-gray-500">Data sources must be configured with files before connecting to other blocks</p>
                <p className="text-sm text-green-600 font-medium mt-2">💡 Agents can auto-generate downstream tasks</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar */}
      <div 
        className={cn(
          "bg-slate-50/95 backdrop-blur-sm border-l border-slate-200/50 transition-all duration-300 flex flex-col shadow-2xl",
          sidebarExpanded ? "w-80" : "w-20"
        )}
        onMouseEnter={() => setSidebarExpanded(true)}
        onMouseLeave={() => setSidebarExpanded(false)}
      >
        {/* Tab Navigation */}
        <div className="border-b border-slate-200/60 p-3">
          <div className="space-y-2">
            {sidebarTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSidebarTab(tab.id as any)}
                className={cn(
                  "w-full flex items-center px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                  sidebarTab === tab.id
                    ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg"
                    : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                )}
              >
                <tab.icon className="h-5 w-5" />
                {sidebarExpanded && <span className="ml-3 text-base">{tab.label}</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-3">
          {sidebarExpanded && (
            <>
              {sidebarTab === "agents" && (
                <div className="space-y-3">
                  <h3 className="font-bold text-lg text-slate-800 mb-4">AI Agents</h3>
                  {paletteItems.agents.map((item) => (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={() => handleDragStart(item, "agent")}
                      className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl cursor-move hover:from-amber-100 hover:to-orange-100 hover:border-amber-300 transition-all shadow-lg hover:shadow-xl"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                          <item.icon className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-sm font-bold text-slate-800">{item.name}</span>
                      </div>
                      <div className="text-xs text-slate-600 mb-2">
                        {item.inputs} inputs → {item.outputs} outputs
                      </div>
                      <div className="text-xs text-green-600 font-medium">
                        + {item.downstreamTasks.length} downstream tasks
                      </div>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {item.downstreamTasks.slice(0, 2).map((task, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {task.replace(/_/g, ' ')}
                          </Badge>
                        ))}
                        {item.downstreamTasks.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{item.downstreamTasks.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {sidebarTab === "data" && (
                <div className="space-y-3">
                  <h3 className="font-bold text-lg text-slate-800 mb-4">Data Sources</h3>
                  {paletteItems.data.map((item) => {
                    const Icon = item.icon
                    return (
                      <div
                        key={item.id}
                        draggable
                        onDragStart={() => handleDragStart(item, "data")}
                        className="p-4 bg-gradient-to-r from-cyan-50 to-sky-50 border-2 border-cyan-200 rounded-xl cursor-move hover:from-cyan-100 hover:to-sky-100 hover:border-cyan-300 transition-all shadow-lg hover:shadow-xl"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-sky-600 rounded-lg flex items-center justify-center">
                            {Icon && React.createElement(Icon, { className: "h-5 w-5 text-white" })}
                          </div>
                          <span className="text-sm font-bold text-slate-800">{item.name}</span>
                        </div>
                        <div className="text-xs text-slate-600">
                          {item.outputs} output
                        </div>
                        <Badge variant="outline" className="text-xs mt-1">
                          {item.provider?.toUpperCase()}
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              )}

              {sidebarTab === "functions" && (
                <div className="space-y-3">
                  <h3 className="font-bold text-lg text-slate-800 mb-4">Functions</h3>
                  {paletteItems.functions.map((item) => (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={() => handleDragStart(item, "function")}
                      className="p-4 bg-gradient-to-r from-violet-50 to-indigo-50 border-2 border-violet-200 rounded-xl cursor-move hover:from-violet-100 hover:to-indigo-100 hover:border-violet-300 transition-all shadow-lg hover:shadow-xl"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-lg flex items-center justify-center">
                          <item.icon className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-sm font-bold text-slate-800">{item.name}</span>
                      </div>
                      <div className="text-xs text-slate-600">
                        {item.inputs} input → {item.outputs} output
                      </div>
                      <Badge variant="outline" className="text-xs mt-1">
                        {item.functionType}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}

              {sidebarTab === "tasks" && (
                <div className="space-y-3">
                  <h3 className="font-bold text-lg text-slate-800 mb-4">Output Tasks</h3>
                  {paletteItems.tasks.map((item) => (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={() => handleDragStart(item, "task")}
                      className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-200 rounded-xl cursor-move hover:from-yellow-100 hover:to-amber-100 hover:border-yellow-300 transition-all shadow-lg hover:shadow-xl"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-lg flex items-center justify-center">
                          <item.icon className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-sm font-bold text-slate-800">{item.name}</span>
                      </div>
                      <div className="text-xs text-slate-600">
                        {item.inputs} input{item.outputs > 0 ? ` → ${item.outputs} output` : ' (endpoint)'}
                      </div>
                      <Badge variant="outline" className="text-xs mt-1">
                        {item.taskType}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}

              {sidebarTab === "configure" && (
                <div className="space-y-6">
                  <h3 className="font-bold text-lg text-slate-800 mb-4">Configure Block</h3>
                  {selectedBlock ? (
                    <div className="space-y-6">
                      <div className="p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200">
                        <Label className="text-sm font-bold text-slate-700">Block Name</Label>
                        <Input 
                          value={selectedBlock.name} 
                          className="mt-2 text-base h-12"
                          readOnly
                        />
                      </div>
                      <div className="p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200">
                        <Label className="text-sm font-bold text-slate-700">Type</Label>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-sm">
                            {selectedBlock.type}
                          </Badge>
                          {selectedBlock.provider && (
                            <Badge variant="outline" className="text-sm">
                              {selectedBlock.provider.toUpperCase()}
                            </Badge>
                          )}
                          {selectedBlock.functionType && (
                            <Badge variant="outline" className="text-sm">
                              {selectedBlock.functionType}
                            </Badge>
                          )}
                          {selectedBlock.taskType && (
                            <Badge variant="outline" className="text-sm">
                              {selectedBlock.taskType}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Agent Configuration with Downstream Tasks */}
                      {selectedBlock.type === "agent" && (
                        <div className="space-y-4">
                          {/* Add Downstream Tasks Button */}
                          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                            <Label className="text-sm font-bold text-slate-700 mb-3 block">
                              Agent Workflow
                            </Label>
                            <Button 
                              onClick={() => handleAddDownstreamTasks(selectedBlock)}
                              className="w-full h-12 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Add Downstream Tasks
                            </Button>
                            <p className="text-xs text-green-600 mt-2">
                              Automatically creates and connects output tasks for this agent
                            </p>
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-sm font-bold text-slate-700">Agent Parameters</Label>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-slate-500">Total Importance:</span>
                                <Badge 
                                  variant="outline"
                                  className={cn(
                                    "text-xs font-mono",
                                    (40 + 35 + 15 + 10 === 100 ? "border-emerald-500 text-emerald-700 bg-emerald-50" : "border-red-500 text-red-700 bg-red-50")
                                  )}
                                >
                                  100%
                                </Badge>
                              </div>
                            </div>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                const newParam = {
                                  id: `param_${Date.now()}`,
                                  name: "New Parameter",
                                  value: "",
                                  importance: 0
                                };
                                console.log('Adding parameter:', newParam);
                              }}
                              className="h-8 text-xs bg-amber-50 border-amber-200 hover:bg-amber-100"
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add Parameter
                            </Button>
                          </div>

                          {/* Importance Distribution Warning */}
                          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <AlertTriangle className="h-4 w-4 text-amber-600" />
                              <span className="text-xs font-medium text-amber-800">Importance Distribution</span>
                            </div>
                            <p className="text-xs text-amber-700">
                              All parameter importance values must sum to exactly 100%. Adjust percentages accordingly.
                            </p>
                          </div>

                          {/* Default Parameters */}
                          <div className="space-y-3">
                            {[
                              { name: "Analysis Depth", value: "Deep", importance: 40 },
                              { name: "Confidence Threshold", value: "85%", importance: 35 },
                              { name: "Output Format", value: "JSON", importance: 15 },
                              { name: "Processing Mode", value: "Batch", importance: 10 }
                            ].map((param, index) => (
                              <div key={index} className="p-3 bg-amber-50/50 border border-amber-200/50 rounded-lg">
                                <div className="grid grid-cols-2 gap-2 mb-2">
                                  <div>
                                    <Label className="text-xs font-medium text-slate-600">Parameter Name</Label>
                                    <Input 
                                      defaultValue={param.name} 
                                      className="mt-1 text-sm h-9 bg-white/80" 
                                      placeholder="Parameter name"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs font-medium text-slate-600">Importance (%)</Label>
                                    <div className="flex items-center gap-1 mt-1">
                                      <Input 
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.1"
                                        defaultValue={param.importance}
                                        className="h-9 text-sm bg-white/80 font-mono"
                                        placeholder="0.0"
                                        onChange={(e) => {
                                          console.log('Importance changed:', e.target.value);
                                        }}
                                      />
                                      <span className="text-xs text-slate-400 font-mono">%</span>
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <Label className="text-xs font-medium text-slate-600">Parameter Value</Label>
                                  <div className="flex gap-2 mt-1">
                                    <Input 
                                      defaultValue={param.value} 
                                      className="text-sm h-9 bg-white/80" 
                                      placeholder="Enter value"
                                    />
                                    <Button 
                                      size="sm" 
                                      variant="ghost" 
                                      className="h-9 px-2 text-red-600 hover:bg-red-50"
                                      onClick={() => {
                                        console.log('Remove parameter:', param.name);
                                      }}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                                
                                {/* Visual Importance Indicator */}
                                <div className="mt-2">
                                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                                    <span>Weight</span>
                                    <span>{param.importance}%</span>
                                  </div>
                                  <div className="w-full bg-slate-200 rounded-full h-2">
                                    <div 
                                      className={cn(
                                        "h-2 rounded-full transition-all duration-300",
                                        param.importance >= 35 ? "bg-gradient-to-r from-red-400 to-red-500" :
                                        param.importance >= 20 ? "bg-gradient-to-r from-amber-400 to-amber-500" :
                                        "bg-gradient-to-r from-green-400 to-green-500"
                                      )}
                                      style={{ width: `${param.importance}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          <Button size="sm" className="w-full h-12 text-base bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white">
                            Save Agent Configuration
                          </Button>
                        </div>
                      )}

                      {/* Data Source Configuration */}
                      {selectedBlock.type === "data" && selectedBlock.config?.provider && (
                        <div className="space-y-4">
                          <div className="p-4 bg-gradient-to-r from-cyan-50 to-sky-50 rounded-xl border border-cyan-200">
                            <Label className="text-sm font-bold text-slate-700 mb-3 block">
                              {selectedBlock.name} Configuration
                            </Label>
                            
                            {/* Connection Status */}
                            <div className="mb-4 p-3 rounded-lg border border-slate-200">
                              <div className="flex items-center gap-2 mb-2">
                                <Database className="h-4 w-4" />
                                <span className="text-sm font-medium">Connection Status</span>
                              </div>
                              <Badge variant={selectedBlock.config.configured ? "default" : "secondary"} className="mb-2">
                                {selectedBlock.config.configured ? "Connected" : "Not Connected"}
                              </Badge>
                              {!selectedBlock.config.configured && (
                                <p className="text-xs text-amber-600 mt-2">
                                  ⚠️ Select files to enable connections
                                </p>
                              )}
                            </div>

                            {/* Selected Files Display */}
                            {selectedBlock.selectedFiles && selectedBlock.selectedFiles.length > 0 && (
                              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                  <span className="text-sm font-medium text-emerald-800">
                                    Selected Files ({selectedBlock.selectedFiles.length})
                                  </span>
                                </div>
                                <div className="space-y-1 max-h-32 overflow-y-auto">
                                  {selectedBlock.selectedFiles.map(fileId => {
                                    const file = getAvailableFiles().find(f => f.id === fileId)
                                    return file ? (
                                      <div key={fileId} className="text-xs text-emerald-700 bg-white/50 px-2 py-1 rounded flex items-center gap-2">
                                        <File className="h-3 w-3" />
                                        {file.name}
                                      </div>
                                    ) : null
                                  })}
                                </div>
                              </div>
                            )}

                            {/* File Browser Button */}
                            <Button 
                              variant="outline" 
                              className="w-full h-12 mb-4 border-cyan-200 hover:bg-cyan-50"
                              onClick={openFileBrowser}
                            >
                              <Folder className="mr-2 h-4 w-4" />
                              Browse {selectedBlock.name} Files
                              {(selectedBlock.selectedFiles?.length ?? 0) > 0 && (
                                <Badge className="ml-2 bg-cyan-100 text-cyan-800">
                                  {selectedBlock.selectedFiles?.length ?? 0}
                                </Badge>
                              )}
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Function Configuration */}
                      {selectedBlock.type === "function" && (
                        <div className="space-y-4">
                          <Label className="text-sm font-bold text-slate-700">Function Parameters</Label>
                          <div className="space-y-3">
                            <div className="p-3 bg-violet-50/50 border border-violet-200/50 rounded-lg">
                              <Label className="text-xs font-medium text-slate-600">Operation Mode</Label>
                              <select className="mt-1 h-10 w-full border border-slate-300 rounded-md px-3 text-sm bg-white/80">
                                <option value="standard">Standard</option>
                                <option value="advanced">Advanced</option>
                                <option value="batch">Batch Processing</option>
                              </select>
                            </div>
                            <div className="p-3 bg-violet-50/50 border border-violet-200/50 rounded-lg">
                              <Label className="text-xs font-medium text-slate-600">Custom Logic</Label>
                              <textarea 
                                placeholder="Enter custom transformation logic..."
                                className="mt-1 min-h-[60px] w-full border border-slate-300 rounded-md px-3 py-2 text-sm resize-none bg-white/80"
                              />
                            </div>
                            {/* Function-specific parameters */}
                            {selectedBlock.functionType === "filter" && (
                              <div className="p-3 bg-violet-50/50 border border-violet-200/50 rounded-lg">
                                <Label className="text-xs font-medium text-slate-600">Filter Condition</Label>
                                <Input 
                                  placeholder="e.g., value > 100"
                                  className="mt-1 text-sm h-9 bg-white/80"
                                />
                              </div>
                            )}
                            {selectedBlock.functionType === "aggregate" && (
                              <div className="p-3 bg-violet-50/50 border border-violet-200/50 rounded-lg">
                                <Label className="text-xs font-medium text-slate-600">Aggregation Type</Label>
                                <select className="mt-1 h-9 w-full border border-slate-300 rounded-md px-3 text-sm bg-white/80">
                                  <option value="sum">Sum</option>
                                  <option value="avg">Average</option>
                                  <option value="count">Count</option>
                                  <option value="max">Maximum</option>
                                  <option value="min">Minimum</option>
                                </select>
                              </div>
                            )}
                          </div>
                          <Button size="sm" className="w-full h-12 text-base bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white">
                            Save Function Configuration
                          </Button>
                        </div>
                      )}

                      {/* Task Configuration */}
                      {selectedBlock.type === "task" && (
                        <div className="space-y-4">
                          <Label className="text-sm font-bold text-slate-700">Task Parameters</Label>
                          <div className="space-y-3">
                            {selectedBlock.taskType === "notification" && (
                              <>
                                <div className="p-3 bg-yellow-50/50 border border-yellow-200/50 rounded-lg">
                                  <Label className="text-xs font-medium text-slate-600">Recipients</Label>
                                  <Input 
                                    placeholder="email@example.com, user@domain.com"
                                    className="mt-1 text-sm h-9 bg-white/80"
                                  />
                                </div>
                                <div className="p-3 bg-yellow-50/50 border border-yellow-200/50 rounded-lg">
                                  <Label className="text-xs font-medium text-slate-600">Message Template</Label>
                                  <textarea 
                                    placeholder="Enter notification message template..."
                                    className="mt-1 min-h-[60px] w-full border border-slate-300 rounded-md px-3 py-2 text-sm resize-none bg-white/80"
                                  />
                                </div>
                              </>
                            )}
                            {selectedBlock.taskType === "document" && (
                              <>
                                <div className="p-3 bg-yellow-50/50 border border-yellow-200/50 rounded-lg">
                                  <Label className="text-xs font-medium text-slate-600">Output Format</Label>
                                  <select className="mt-1 h-9 w-full border border-slate-300 rounded-md px-3 text-sm bg-white/80">
                                    <option value="pdf">PDF</option>
                                    <option value="docx">Word Document</option>
                                    <option value="html">HTML</option>
                                    <option value="markdown">Markdown</option>
                                  </select>
                                </div>
                                <div className="p-3 bg-yellow-50/50 border border-yellow-200/50 rounded-lg">
                                  <Label className="text-xs font-medium text-slate-600">Template</Label>
                                  <select className="mt-1 h-9 w-full border border-slate-300 rounded-md px-3 text-sm bg-white/80">
                                    <option value="standard">Standard Report</option>
                                    <option value="executive">Executive Summary</option>
                                    <option value="detailed">Detailed Analysis</option>
                                    <option value="custom">Custom Template</option>
                                  </select>
                                </div>
                              </>
                            )}
                            {selectedBlock.taskType === "storage" && (
                              <div className="p-3 bg-yellow-50/50 border border-yellow-200/50 rounded-lg">
                                <Label className="text-xs font-medium text-slate-600">Database Connection</Label>
                                <Input 
                                  placeholder="Connection string or database ID"
                                  className="mt-1 text-sm h-9 bg-white/80"
                                />
                              </div>
                            )}
                            {selectedBlock.taskType === "visualization" && (
                              <div className="p-3 bg-yellow-50/50 border border-yellow-200/50 rounded-lg">
                                <Label className="text-xs font-medium text-slate-600">Chart Type</Label>
                                <select className="mt-1 h-9 w-full border border-slate-300 rounded-md px-3 text-sm bg-white/80">
                                  <option value="bar">Bar Chart</option>
                                  <option value="line">Line Chart</option>
                                  <option value="pie">Pie Chart</option>
                                  <option value="scatter">Scatter Plot</option>
                                  <option value="heatmap">Heatmap</option>
                                </select>
                              </div>
                            )}
                          </div>
                          <Button size="sm" className="w-full h-12 text-base bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white">
                            Save Task Configuration
                          </Button>
                        </div>
                      )}

                      {/* Connection Info */}
                      <div className="p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200">
                        <Label className="text-sm font-bold text-slate-700">Connections</Label>
                        <div className="mt-2 space-y-2">
                          <div className="text-xs text-slate-600">
                            Connected: {connections.filter(conn => 
                              conn.from.blockId === selectedBlock.id || conn.to.blockId === selectedBlock.id
                            ).length} connections
                          </div>
                          <div className="text-xs text-cyan-600">
                            • Blue/Orange nodes: Outputs (click to start connection)
                          </div>
                          <div className="text-xs text-slate-600">
                            • Gray nodes: Inputs (click to complete connection)
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-200">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteBlock(selectedBlock.id)}
                          className="w-full h-12 text-base bg-red-500 hover:bg-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Block
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-slate-500 py-12">
                      <Settings className="mx-auto h-12 w-12 mb-4 text-slate-300" />
                      <p className="text-base">Select a block to configure its properties</p>
                      <p className="text-sm text-slate-400 mt-2">Data sources require file selection before use</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
