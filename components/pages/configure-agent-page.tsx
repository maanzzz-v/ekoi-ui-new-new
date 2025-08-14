"use client"

import { useState, useEffect } from "react"
import { Save, ChevronLeft, Settings, FileOutput, Bell, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useSearchParams } from "next/navigation"
import type { Agent } from "@/lib/types"

interface ConfigureAgentPageProps {
  agent: Agent | null
  onBack: () => void
  onSave: (updatedAgent: Agent) => void
}

interface Parameter {
  id: string
  name: string
  weight: number
  description: string
}

interface OutputConfig {
  fileType: string
  storageLocation: string
}

interface NotificationConfig {
  type: string
  settings: any
}

type TabType = "parameter" | "output" | "notification"

const modelOptions = ["GPT-4 Turbo", "GPT-3.5 Turbo", "Claude 3 Opus", "Claude 3 Sonnet", "Gemini Pro"]
const fileTypes = ["PDF", "JSON", "TextFile", "Jpeg", "CSV", "Excel"]
const storageLocations = ["Local Storage", "AWS S3", "Azure Blob", "GCP Storage"]
const notificationTypes = [
  { id: "slack", name: "Slack", icon: "🟢" },
  { id: "gmail", name: "Gmail", icon: "📧" },
  { id: "teams", name: "Microsoft Teams", icon: "💬" },
  { id: "rocket", name: "Rocket.Chat", icon: "🚀" },
  { id: "workspace", name: "Google Workspace", icon: "🏢" },
]

export function ConfigureAgentPage({ agent, onBack, onSave }: ConfigureAgentPageProps) {
  const searchParams = useSearchParams()
  const initialTab = searchParams.get('tab')
  
  // Map URL parameters to tab types
  const getTabFromParam = (param: string | null): TabType => {
    switch (param) {
      case 'output':
        return 'output'
      case 'notifications':
        return 'notification'
      default:
        return 'parameter'
    }
  }
  
  const [activeTab, setActiveTab] = useState<TabType>(getTabFromParam(initialTab))
  const [agentName, setAgentName] = useState(agent?.name || "")
  const [agentRole, setAgentRole] = useState(agent?.role || "")
  const [description, setDescription] = useState(agent?.description || "")
  const defaultModel = "GPT-4 Turbo"
  const [selectedModel, setSelectedModel] = useState(agent?.model || "GPT-4 Turbo")
  const [tempModel, setTempModel] = useState(selectedModel)


  // Parameter state
  const [parameters, setParameters] = useState<Parameter[]>(
    [
      {
        id: "1",
        name: "Experience",
        weight: 30,
        description: "Years of relevant experience in the field"
      },
      {
        id: "2",
        name: "Technical Skills",
        weight: 25,
        description: "Required technical skills match"
      },
      {
        id: "3",
        name: "Location",
        weight: 20,
        description: "Candidate location preference"
      },
      {
        id: "4",
        name: "Education",
        weight: 25,
        description: "Educational qualifications match"
      }
    ]
  )

  // Output state
  const [outputConfig, setOutputConfig] = useState<OutputConfig>({
    fileType: "",
    storageLocation: "",
  })

  // Notification state
  const [notificationConfig, setNotificationConfig] = useState<NotificationConfig[]>([])
  const [showNotificationDialog, setShowNotificationDialog] = useState(false)
  const [selectedNotificationType, setSelectedNotificationType] = useState<string>("")
  const [notificationSettings, setNotificationSettings] = useState<any>({})
  const [showModelDialog, setShowModelDialog] = useState(false)

  useEffect(() => {
    if (agent) {
      setAgentName(agent.name)
      setAgentRole(agent.role)
      setDescription(agent.description)
    }
  }, [agent])

  const totalWeight = parameters.reduce((sum, param) => sum + param.weight, 0)
  const isValidWeight = totalWeight === 100
  const isFormValid = agentName && agentRole && description && selectedModel && isValidWeight

  // Parameter functions
  const updateParameterWeight = (id: string, weight: number) => {
    setParameters((prev) => prev.map((param) => (param.id === id ? { ...param, weight } : param)))
  }

  const updateParameterValue = (id: string, value: string) => {
    setParameters((prev) => prev.map((param) => (param.id === id ? { ...param, value } : param)))
  }

  const updateParameterDescription = (id: string, description: string) => {
    setParameters((prev) => prev.map((param) => (param.id === id ? { ...param, description } : param)))
  }

  const addParameter = () => {
    const newParam: Parameter = {
      id: Date.now().toString(),
      name: "Parameter",
      weight: 0,
      description: "New parameter description",
    }
    setParameters((prev) => [...prev, newParam])
  }

  const removeParameter = (id: string) => {
    setParameters((prev) => prev.filter((param) => param.id !== id))
  }

  // Notification functions
  const handleNotificationTypeSelect = (type: string) => {
    setSelectedNotificationType(type)
    setNotificationSettings({})
    setShowNotificationDialog(true)
  }

  const handleNotificationSave = () => {
    const newConfig: NotificationConfig = {
      type: selectedNotificationType,
      settings: notificationSettings,
    }
    setNotificationConfig((prev) => [...prev, newConfig])
    setShowNotificationDialog(false)
    setSelectedNotificationType("")
    setNotificationSettings({})
  }

  const removeNotificationConfig = (index: number) => {
    setNotificationConfig((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSave = () => {
    if (isFormValid && agent) {
      const updatedAgent: Agent = {
        ...agent,
        name: agentName,
        role: agentRole,
        description: description,
        model: selectedModel,
      }
      onSave(updatedAgent)
    }
  }

  const getParameterColor = (index: number) => {
    const colors = [
      "border-blue-200 bg-blue-50/50",
      "border-emerald-200 bg-emerald-50/50",
      "border-purple-200 bg-purple-50/50",
      "border-amber-200 bg-amber-50/50"
    ]
    return colors[index % colors.length]
  }

  const renderParameterCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {parameters.map((parameter, index) => (
        <div key={parameter.id} className="relative group">
          <Card className={`
            h-[220px] 
            transition-all 
            duration-300 
            hover:shadow-lg 
            border-2
            ${getParameterColor(index)}
            hover:scale-105
          `}>
            <CardContent className="p-6 h-full flex flex-col justify-between">
              <div>
                <h4 className="text-xl font-semibold text-gray-800 mb-2">
                  {parameter.name}
                </h4>
                
                {/* Description input */}
                <Textarea
                  placeholder="Parameter description"
                  value={parameter.description}
                  onChange={(e) => updateParameterDescription(parameter.id, e.target.value)}
                  className="text-sm text-gray-600 resize-none mt-4"
                  rows={2}
                />

                {/* Circular Progress Indicator */}
                <div className="absolute top-6 right-6 w-12 h-12 rounded-full border-4 border-gray-200 flex items-center justify-center bg-white">
                  <span className="text-sm font-bold text-gray-800">
                    {parameter.weight}%
                  </span>
                </div>
              </div>

              {/* Weight Adjustment Controls */}
              <div className="flex items-center gap-3 mt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 rounded-full bg-white/80 hover:bg-white"
                  onClick={() => updateParameterWeight(parameter.id, Math.max(0, parameter.weight - 5))}
                >
                  -
                </Button>
                <div className="h-1 flex-1 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-orange-500 transition-all duration-300"
                    style={{ width: `${parameter.weight}%` }}
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 rounded-full bg-white/80 hover:bg-white"
                  onClick={() => updateParameterWeight(parameter.id, Math.min(100, parameter.weight + 5))}
                >
                  +
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  )

  const renderNotificationDialog = () => {
    const notificationType = notificationTypes.find((nt) => nt.id === selectedNotificationType)

    return (
      <Dialog open={showNotificationDialog} onOpenChange={setShowNotificationDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Configure {notificationType?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedNotificationType === "gmail" && (
              <div>
                <Label className="text-lg">Email Addresses</Label>
                <Textarea
                  placeholder="Enter email addresses (one per line)"
                  value={notificationSettings.emails || ""}
                  onChange={(e) => setNotificationSettings({ ...notificationSettings, emails: e.target.value })}
                  className="mt-2"
                />
              </div>
            )}
            {selectedNotificationType === "slack" && (
              <div>
                <Label className="text-lg">Slack Teams</Label>
                <Select onValueChange={(value) => setNotificationSettings({ ...notificationSettings, team: value })}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select team" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="team1">Development Team</SelectItem>
                    <SelectItem value="team2">HR Team</SelectItem>
                    <SelectItem value="team3">Marketing Team</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            {selectedNotificationType === "teams" && (
              <div>
                <Label className="text-lg">Teams Channel</Label>
                <Select onValueChange={(value) => setNotificationSettings({ ...notificationSettings, channel: value })}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select channel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="hr">HR Department</SelectItem>
                    <SelectItem value="dev">Development</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            {(selectedNotificationType === "rocket" || selectedNotificationType === "workspace") && (
              <div>
                <Label className="text-lg">Configuration</Label>
                <Input
                  placeholder="Enter configuration details"
                  value={notificationSettings.config || ""}
                  onChange={(e) => setNotificationSettings({ ...notificationSettings, config: e.target.value })}
                  className="mt-2"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNotificationDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleNotificationSave} className="bg-orange-500 hover:bg-orange-600">
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div>
          <h1 className="text-4xl font-semibold text-gray-900 mb-2">Agent</h1>
          <div className="flex items-center text-sm text-gray-500">
            <span className="hover:text-gray-700 cursor-pointer">Home</span>
            <ChevronLeft className="h-4 w-4 mx-1 rotate-180" />
            <span className="hover:text-gray-700 cursor-pointer">Agent</span>
            <ChevronLeft className="h-4 w-4 mx-1 rotate-180" />
            <span className="text-gray-900">{agent?.name || "Configure Agent"}</span>
          </div>
        </div>
      </header>

      <div className="p-6 h-[calc(100vh-120px)] flex flex-col">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6 flex-shrink-0">
          <button
            onClick={() => setActiveTab("parameter")}
            className={`flex items-center gap-2 px-6 py-3 text-lg font-medium border-b-2 transition-colors ${
              activeTab === "parameter"
                ? "border-orange-500 text-orange-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Settings className="h-5 w-5" />
            Parameter
          </button>
          <button
            onClick={() => setActiveTab("output")}
            className={`flex items-center gap-2 px-6 py-3 text-lg font-medium border-b-2 transition-colors ${
              activeTab === "output"
                ? "border-orange-500 text-orange-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <FileOutput className="h-5 w-5" />
            Output
          </button>
          <button
            onClick={() => setActiveTab("notification")}
            className={`flex items-center gap-2 px-6 py-3 text-lg font-medium border-b-2 transition-colors ${
              activeTab === "notification"
                ? "border-orange-500 text-orange-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Bell className="h-5 w-5" />
            Notification
          </button>
        </div>

        {/* Agent Info Card */}
        <Card className="mb-6 border-2 border-blue-200 flex-shrink-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                  <img
                    src={agent?.avatar || "/placeholder.svg"}
                    alt={agent?.name}
                    className="w-12 h-12 rounded object-cover"
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-orange-600 mb-1">{agent?.name || "HIRA"}</h2>
                  <p className="text-gray-600 mb-2">{agent?.role || "Hiring Agent"}</p>
                  <p className="text-gray-700">
                    {agent?.description ||
                      "Assists in the hiring process by shortlisting candidates, ranking resumes, and matching profiles to job descriptions."}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-sm text-gray-500 mb-1">
                  {selectedModel === defaultModel && !agent?.model
                    ? `Default: ${defaultModel}`
                    : `Selected: ${selectedModel}`}
                </span>
                <Button 
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6"
                  onClick={() => {
                    setTempModel(selectedModel) // Reset temp to current model
                    setShowModelDialog(true)
                  }}
                >
                  Choose the model
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tab Content */}
        <div className="flex-1 overflow-auto">
          {activeTab === "parameter" && (
            <div>
              {/* Parameters Section */}
              {/*<div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-semibold text-gray-900">Parameter</h3>
                  <span className="bg-gray-200 text-gray-700 text-sm px-3 py-1 rounded-full">
                    {parameters.length.toString().padStart(2, "0")}
                  </span>
                </div>
                <Button
                  onClick={addParameter}
                  className="text-orange-600 hover:text-orange-700 bg-transparent border-0 shadow-none"
                >
                  + Add Parameter
                </Button>
              </div>*/}

              {/* Parameters Grid */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/*<h3 className="text-xl font-semibold text-gray-900">Resume Shortlisting Parameters</h3>
                    {!isValidWeight && (
                      <span className="text-sm text-yellow-600 bg-yellow-100 px-3 py-1 rounded-full">
                        Total: {totalWeight}%
                      </span>
                    )}*/}
                  </div>
                </div>
                {renderParameterCards()}
              </div>

              {!isValidWeight && (
                <Alert className="mb-4 border-yellow-200 bg-yellow-50">
                  <AlertDescription className="text-yellow-800">
                    Total weight must equal 100%. Current: {totalWeight}%
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {activeTab === "output" && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <Label className="text-xl font-semibold text-gray-900 mb-4 block">Save As</Label>
                  <Select onValueChange={(value) => setOutputConfig({ ...outputConfig, fileType: value })}>
                    <SelectTrigger className="h-12 text-lg border-2 border-orange-200">
                      <SelectValue placeholder="Select file type" />
                    </SelectTrigger>
                    <SelectContent>
                      {fileTypes.map((type) => (
                        <SelectItem key={type} value={type.toLowerCase()}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xl font-semibold text-gray-900 mb-4 block">Save To</Label>
                  <Select onValueChange={(value) => setOutputConfig({ ...outputConfig, storageLocation: value })}>
                    <SelectTrigger className="h-12 text-lg border-2 border-orange-200">
                      <SelectValue placeholder="Select storage location" />
                    </SelectTrigger>
                    <SelectContent>
                      {storageLocations.map((location) => (
                        <SelectItem key={location} value={location.toLowerCase().replace(" ", "-")}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {outputConfig.fileType && outputConfig.storageLocation && (
                <Card className="border-2 border-green-200 bg-green-50">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-green-800 mb-2">Output Configuration</h3>
                    <p className="text-green-700">
                      Files will be saved as <strong>{outputConfig.fileType.toUpperCase()}</strong> to{" "}
                      <strong>
                        {outputConfig.storageLocation.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                      </strong>
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeTab === "notification" && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">Connect to</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {notificationTypes.map((type) => (
                  <Card
                    key={type.id}
                    className="border-2 border-gray-200 hover:border-orange-300 cursor-pointer transition-colors"
                    onClick={() => handleNotificationTypeSelect(type.id)}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="text-3xl mb-2">{type.icon}</div>
                      <h4 className="text-lg font-semibold">{type.name}</h4>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {notificationConfig.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900">Configured Notifications</h4>
                  {notificationConfig.map((config, index) => (
                    <Card key={index} className="border-2 border-green-200 bg-green-50">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div>
                          <h5 className="font-semibold text-green-800">
                            {notificationTypes.find((nt) => nt.id === config.type)?.name}
                          </h5>
                          <p className="text-sm text-green-700">{JSON.stringify(config.settings)}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeNotificationConfig(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-center mt-6 pt-4 flex-shrink-0">
          <Button
            onClick={handleSave}
            disabled={!isFormValid}
            className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-2"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Agent Configuration
          </Button>
        </div>
      </div>

      {renderNotificationDialog()}
      <Dialog open={showModelDialog} onOpenChange={setShowModelDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Select AI Model</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Select
              onValueChange={(value) => setTempModel(value)}
              defaultValue={tempModel}
            >
              <SelectTrigger className="h-12 text-lg border-2 border-orange-200">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                {modelOptions.map((model) => (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModelDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-orange-500 hover:bg-orange-600"
              onClick={() => {
                setSelectedModel(tempModel)
                setShowModelDialog(false)
                }
              }
            >
              Save Model
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
