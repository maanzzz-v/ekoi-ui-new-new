"use client"

import type React from "react"
import { useState, useRef, useCallback } from "react"
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Edge,
  type Node,
  Panel,
  useReactFlow,
  ReactFlowProvider,
} from "reactflow"
import "reactflow/dist/style.css"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Trash2, Plus, FileText, Database, Cloud, HardDrive, XCircle } from "lucide-react"
import { DataStorageConnectorDialog } from "@/components/data-storage-connector-dialog"
import type { Project } from "@/lib/types"

interface CanvasPageProps {
  project: Project | null
  onBack: () => void
}

// Define custom node types
const initialNodes: Node[] = []
const initialEdges: Edge[] = []

const nodeTypes = {
  agent: (props: any) => (
    <Card className="w-60 h-40 shadow-lg border-2 border-green-500 bg-green-50">
      <CardHeader className="p-3 pb-2">
        <CardTitle className="text-lg font-semibold text-green-800">{props.data.label}</CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0 text-sm text-green-700">
        <p className="truncate">{props.data.description}</p>
        <div className="absolute -bottom-2 -left-2 w-4 h-4 rounded-full bg-green-600 border-2 border-white" />
        <div className="absolute -bottom-2 -right-2 w-4 h-4 rounded-full bg-green-600 border-2 border-white" />
      </CardContent>
    </Card>
  ),
  function: (props: any) => (
    <Card className="w-60 h-40 shadow-lg border-2 border-orange-500 bg-orange-50">
      <CardHeader className="p-3 pb-2">
        <CardTitle className="text-lg font-semibold text-orange-800">{props.data.label}</CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0 text-sm text-orange-700">
        <p className="truncate">{props.data.description}</p>
        <div className="absolute -bottom-2 -left-2 w-4 h-4 rounded-full bg-orange-600 border-2 border-white" />
        <div className="absolute -bottom-2 -right-2 w-4 h-4 rounded-full bg-orange-600 border-2 border-white" />
      </CardContent>
    </Card>
  ),
  dataSource: (props: any) => (
    <Card className="w-60 h-40 shadow-lg border-2 border-purple-500 bg-purple-50">
      <CardHeader className="p-3 pb-2">
        <CardTitle className="text-lg font-semibold text-purple-800">{props.data.label}</CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0 text-sm text-purple-700">
        <div className="flex items-center gap-2 mb-1">
          {props.data.sourceType === "local" && <HardDrive className="h-4 w-4" />}
          {props.data.sourceType === "aws" && <Cloud className="h-4 w-4 text-orange-500" />}
          {props.data.sourceType === "azure" && <Cloud className="h-4 w-4 text-blue-500" />}
          {props.data.sourceType === "gcp" && <Cloud className="h-4 w-4 text-green-500" />}
          {props.data.sourceType === "database" && <Database className="h-4 w-4 text-purple-500" />}
          <span className="font-medium">{props.data.sourceType.toUpperCase()}</span>
        </div>
        <p className="truncate">{props.data.files.join(", ")}</p>
        <div className="absolute -bottom-2 -left-2 w-4 h-4 rounded-full bg-purple-600 border-2 border-white" />
        <div className="absolute -bottom-2 -right-2 w-4 h-4 rounded-full bg-purple-600 border-2 border-white" />
      </CardContent>
    </Card>
  ),
}

const agentBlocks = [
  { id: "chat", label: "Chat Agent", description: "Engages in conversational AI.", type: "agent" },
  { id: "analysis", label: "Analysis Agent", description: "Performs data analysis.", type: "agent" },
  { id: "classification", label: "Classification Agent", description: "Categorizes data.", type: "agent" },
  { id: "summarization", label: "Summarization Agent", description: "Generates text summaries.", type: "agent" },
  { id: "translation", label: "Translation Agent", description: "Translates languages.", type: "agent" },
  { id: "sentiment", label: "Sentiment Agent", description: "Analyzes text sentiment.", type: "agent" },
]

const functionBlocks = [
  { id: "transform", label: "Transform Data", description: "Modifies data structure.", type: "function" },
  { id: "filter", label: "Filter Data", description: "Filters data based on criteria.", type: "function" },
  { id: "merge", label: "Merge Data", description: "Combines multiple data sets.", type: "function" },
  { id: "split", label: "Split Data", description: "Divides data into subsets.", type: "function" },
  { id: "validate", label: "Validate Data", description: "Checks data for integrity.", type: "function" },
  { id: "aggregate", label: "Aggregate Data", description: "Performs data aggregation.", type: "function" },
]

const dataBlocks = [
  { id: "local", label: "Local Storage", description: "Connects to local files.", type: "dataSource" },
  { id: "aws", label: "AWS S3", description: "Connects to AWS S3 buckets.", type: "dataSource" },
  { id: "azure", label: "Azure Blob", description: "Connects to Azure Blob Storage.", type: "dataSource" },
  { id: "gcp", label: "Google Cloud", description: "Connects to Google Cloud Storage.", type: "dataSource" },
  { id: "database", label: "Database", description: "Connects to a database.", type: "dataSource" },
]

// Inner component that uses useReactFlow hook
function CanvasContent({ project, onBack }: CanvasPageProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null)
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [isConfigPanelOpen, setIsConfigPanelOpen] = useState(false)
  const [nodeLabel, setNodeLabel] = useState("")
  const [nodeDescription, setNodeDescription] = useState("")
  const [nodeParameters, setNodeParameters] = useState<{ name: string; value: string }[]>([])
  const [isDataConnectorOpen, setIsDataConnectorOpen] = useState(false)
  const [draggedBlock, setDraggedBlock] = useState<any>(null)
  const [dataBlockDropPosition, setDataBlockDropPosition] = useState<{ x: number; y: number } | null>(null)

  // Now we can safely use useReactFlow hook
  const { screenToFlowPosition } = useReactFlow()

  const onConnect = useCallback(
    (params: Connection | Edge) =>
      setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: "#f97316" } }, eds)),
    [setEdges],
  )

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()

      if (!reactFlowInstance) return

      const type = event.dataTransfer.getData("application/reactflow")
      const label = event.dataTransfer.getData("label")
      const description = event.dataTransfer.getData("description")
      const blockId = event.dataTransfer.getData("id")

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })

      if (type === "dataSource") {
        setDraggedBlock({ id: blockId, label, description, type })
        setDataBlockDropPosition(position)
        setIsDataConnectorOpen(true)
      } else {
        const newNode = {
          id: `${type}_${Date.now()}`,
          type: type,
          position,
          data: { label, description, id: blockId },
        }
        setNodes((nds) => nds.concat(newNode))
      }
    },
    [reactFlowInstance, setNodes],
  )

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node)
    setNodeLabel(node.data.label)
    setNodeDescription(node.data.description)
    setNodeParameters(node.data.parameters || [])
    setIsConfigPanelOpen(true)
  }, [])

  const onPaneClick = useCallback(() => {
    setIsConfigPanelOpen(false)
    setSelectedNode(null)
  }, [])

  const onNodesDelete = useCallback((deletedNodes: Node[]) => {
    setIsConfigPanelOpen(false)
    setSelectedNode(null)
  }, [])

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNodeLabel(e.target.value)
    setNodes((nds) =>
      nds.map((node) =>
        node.id === selectedNode?.id ? { ...node, data: { ...node.data, label: e.target.value } } : node,
      ),
    )
  }

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNodeDescription(e.target.value)
    setNodes((nds) =>
      nds.map((node) =>
        node.id === selectedNode?.id ? { ...node, data: { ...node.data, description: e.target.value } } : node,
      ),
    )
  }

  const handleParameterChange = (index: number, field: string, value: string) => {
    const newParameters = [...nodeParameters]
    newParameters[index] = { ...newParameters[index], [field]: value }
    setNodeParameters(newParameters)
    setNodes((nds) =>
      nds.map((node) =>
        node.id === selectedNode?.id ? { ...node, data: { ...node.data, parameters: newParameters } } : node,
      ),
    )
  }

  const addParameter = () => {
    const newParameters = [...nodeParameters, { name: "", value: "" }]
    setNodeParameters(newParameters)
    setNodes((nds) =>
      nds.map((node) =>
        node.id === selectedNode?.id ? { ...node, data: { ...node.data, parameters: newParameters } } : node,
      ),
    )
  }

  const removeParameter = (index: number) => {
    const newParameters = nodeParameters.filter((_, i) => i !== index)
    setNodeParameters(newParameters)
    setNodes((nds) =>
      nds.map((node) =>
        node.id === selectedNode?.id ? { ...node, data: { ...node.data, parameters: newParameters } } : node,
      ),
    )
  }

  const handleDataConnect = useCallback(
    (sourceType: string, files: string[], position: { x: number; y: number }) => {
      const newNode = {
        id: `dataSource_${Date.now()}`,
        type: "dataSource",
        position,
        data: { label: `${sourceType} Data`, sourceType, files, description: `Files: ${files.join(", ")}` },
      }
      setNodes((nds) => nds.concat(newNode))
      setIsDataConnectorOpen(false)
      setDraggedBlock(null)
      setDataBlockDropPosition(null)
    },
    [setNodes],
  )

  const handleDataConnectorClose = useCallback(() => {
    setIsDataConnectorOpen(false)
    setDraggedBlock(null)
    setDataBlockDropPosition(null)
  }, [])

  const onDragStart = (event: React.DragEvent, block: any) => {
    event.dataTransfer.setData("application/reactflow", block.type)
    event.dataTransfer.setData("label", block.label)
    event.dataTransfer.setData("description", block.description)
    event.dataTransfer.setData("id", block.id)
    event.dataTransfer.effectAllowed = "move"
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <h1 className="text-3xl font-bold text-gray-700 mb-4">No Project Selected</h1>
        <p className="text-lg text-gray-500 mb-8">Please select a project from the Projects page to view its canvas.</p>
        <Button onClick={onBack} className="bg-orange-600 hover:bg-orange-700 text-lg px-8 py-4">
          <ArrowLeft className="h-5 w-5 mr-2" />
          Go to Projects
        </Button>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-full">
      {/* Left Sidebar for Blocks */}
      <div className="w-96 bg-gray-50 p-6 border-r overflow-y-auto">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Blocks</h2>
        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Agents</h3>
            <div className="grid grid-cols-2 gap-4">
              {agentBlocks.map((block) => (
                <Card
                  key={block.id}
                  className="p-4 text-center cursor-grab active:cursor-grabbing border-2 border-green-500 bg-green-50 hover:shadow-md transition-shadow duration-200"
                  draggable
                  onDragStart={(event) => onDragStart(event, block)}
                >
                  <CardTitle className="text-lg text-green-800">{block.label}</CardTitle>
                  <p className="text-sm text-green-700 truncate">{block.description}</p>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Functions</h3>
            <div className="grid grid-cols-2 gap-4">
              {functionBlocks.map((block) => (
                <Card
                  key={block.id}
                  className="p-4 text-center cursor-grab active:cursor-grabbing border-2 border-orange-500 bg-orange-50 hover:shadow-md transition-shadow duration-200"
                  draggable
                  onDragStart={(event) => onDragStart(event, block)}
                >
                  <CardTitle className="text-lg text-orange-800">{block.label}</CardTitle>
                  <p className="text-sm text-orange-700 truncate">{block.description}</p>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Data Sources</h3>
            <div className="grid grid-cols-2 gap-4">
              {dataBlocks.map((block) => (
                <Card
                  key={block.id}
                  className="p-4 text-center cursor-grab active:cursor-grabbing border-2 border-purple-500 bg-purple-50 hover:shadow-md transition-shadow duration-200"
                  draggable
                  onDragStart={(event) => onDragStart(event, block)}
                >
                  <CardTitle className="text-lg text-purple-800">{block.label}</CardTitle>
                  <p className="text-sm text-purple-700 truncate">{block.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 relative" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          fitView
          className="react-flow-canvas"
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          onNodesDelete={onNodesDelete}
          proOptions={{ hideAttribution: true }}
        >
          <MiniMap
            nodeColor={(n) => {
              if (n.type === "agent") return "#10B981" // green-500
              if (n.type === "function") return "#F97316" // orange-500
              if (n.type === "dataSource") return "#8B5CF6" // purple-500
              return "#ddd"
            }}
          />
          <Controls />
          <Background variant="dots" gap={12} size={1} />
          <Panel position="top-left" className="p-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="lg" onClick={onBack} className="text-lg">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Projects
              </Button>
              <h1 className="text-3xl font-bold text-gray-900">Workflow: {project.name}</h1>
            </div>
          </Panel>
        </ReactFlow>
      </div>

      {/* Configuration Panel */}
      {isConfigPanelOpen && selectedNode && (
        <Card className="w-96 bg-white p-6 border-l overflow-y-auto absolute right-0 top-0 h-full shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl">Block Configuration</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setIsConfigPanelOpen(false)}>
                <XCircle className="h-6 w-6 text-gray-500" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="node-label" className="text-lg font-medium">
                Label
              </Label>
              <Input id="node-label" value={nodeLabel} onChange={handleLabelChange} className="mt-2 h-12 text-lg" />
            </div>
            <div>
              <Label htmlFor="node-description" className="text-lg font-medium">
                Description
              </Label>
              <Textarea
                id="node-description"
                value={nodeDescription}
                onChange={handleDescriptionChange}
                rows={4}
                className="mt-2 text-lg"
              />
            </div>

            {selectedNode.type === "dataSource" && (
              <div>
                <Label className="text-lg font-medium">Source Type</Label>
                <Input
                  value={selectedNode.data.sourceType.toUpperCase()}
                  readOnly
                  className="mt-2 h-12 text-lg bg-gray-100"
                />
                <Label className="text-lg font-medium mt-4 block">Connected Files</Label>
                <div className="border rounded-md p-3 mt-2 max-h-40 overflow-y-auto bg-gray-50">
                  {selectedNode.data.files && selectedNode.data.files.length > 0 ? (
                    selectedNode.data.files.map((file: string, index: number) => (
                      <p key={index} className="text-base text-gray-700 truncate">
                        <FileText className="inline-block h-4 w-4 mr-2" /> {file.split("/").pop()}
                      </p>
                    ))
                  ) : (
                    <p className="text-base text-gray-500">No files selected.</p>
                  )}
                </div>
              </div>
            )}

            {(selectedNode.type === "agent" || selectedNode.type === "function") && (
              <>
                <Separator />
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Parameters</h3>
                <div className="space-y-4">
                  {nodeParameters.map((param, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex justify-between items-center mb-3">
                        <Label htmlFor={`param-name-${index}`} className="text-base font-medium">
                          Parameter Name
                        </Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeParameter(index)}
                          className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
                        >
                          ×
                        </Button>
                      </div>
                      <Input
                        id={`param-name-${index}`}
                        value={param.name}
                        onChange={(e) => handleParameterChange(index, "name", e.target.value)}
                        placeholder="e.g., Temperature"
                        className="mb-3 h-10 text-base"
                      />
                      <Label htmlFor={`param-value-${index}`} className="text-base font-medium">
                        Value
                      </Label>
                      <Input
                        id={`param-value-${index}`}
                        value={param.value}
                        onChange={(e) => handleParameterChange(index, "value", e.target.value)}
                        placeholder="e.g., 0.7"
                        className="h-10 text-base"
                      />
                    </Card>
                  ))}
                  <Button onClick={addParameter} variant="outline" className="w-full h-10 text-base bg-transparent">
                    <Plus className="h-4 w-4 mr-2" /> Add Parameter
                  </Button>
                </div>
              </>
            )}

            <Separator />
            <Button
              variant="destructive"
              className="w-full h-12 text-lg"
              onClick={() => {
                setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id))
                setEdges((eds) =>
                  eds.filter((edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id),
                )
                setIsConfigPanelOpen(false)
                setSelectedNode(null)
              }}
            >
              <Trash2 className="h-5 w-5 mr-2" /> Delete Block
            </Button>
          </CardContent>
        </Card>
      )}

      <DataStorageConnectorDialog
        isOpen={isDataConnectorOpen}
        onClose={handleDataConnectorClose}
        onConnect={handleDataConnect}
        dropPosition={dataBlockDropPosition}
      />
    </div>
  )
}

// Main component wrapped with ReactFlowProvider
export function CanvasPage({ project, onBack }: CanvasPageProps) {
  return (
    <ReactFlowProvider>
      <CanvasContent project={project} onBack={onBack} />
    </ReactFlowProvider>
  )
}
