"use client"

import { useState } from "react"
import { ArrowLeft, Save, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface CreateAgentPageProps {
  onBack: () => void
  onSave: () => void
}

interface Parameter {
  id: string
  name: string
  value: string
  weight: number
}

const avatarOptions = [
  { id: "1", name: "Robot Assistant", url: "/futuristic-helper-robot.png" },
  { id: "2", name: "AI Brain", url: "/human-brain.png" },
  { id: "3", name: "Digital Helper", url: "/helpful-robot-interface.png" },
  { id: "4", name: "Smart Agent", url: "/business-agent.png" },
]

const modelOptions = ["GPT-4 Turbo", "GPT-3.5 Turbo", "Claude 3 Opus", "Claude 3 Sonnet", "Gemini Pro"]

export function CreateAgentPage({ onBack, onSave }: CreateAgentPageProps) {
  const [agentName, setAgentName] = useState("")
  const [agentRole, setAgentRole] = useState("")
  const [description, setDescription] = useState("")
  const [selectedAvatar, setSelectedAvatar] = useState("")
  const [selectedModel, setSelectedModel] = useState("")
  const [parameters, setParameters] = useState<Parameter[]>([
    { id: "1", name: "Accuracy", value: "High", weight: 40 },
    { id: "2", name: "Speed", value: "Medium", weight: 30 },
    { id: "3", name: "Creativity", value: "Medium", weight: 30 },
  ])
  const [newParameterName, setNewParameterName] = useState("")

  const totalWeight = parameters.reduce((sum, param) => sum + param.weight, 0)
  const isValidWeight = totalWeight === 100
  const isFormValid = agentName && agentRole && description && selectedAvatar && selectedModel && isValidWeight

  const updateParameterWeight = (id: string, weight: number) => {
    setParameters((prev) => prev.map((param) => (param.id === id ? { ...param, weight } : param)))
  }

  const updateParameterValue = (id: string, value: string) => {
    setParameters((prev) => prev.map((param) => (param.id === id ? { ...param, value } : param)))
  }

  const addParameter = () => {
    if (!newParameterName.trim()) return

    const newParam: Parameter = {
      id: Date.now().toString(),
      name: newParameterName,
      value: "", // Default to empty string for new text input
      weight: 0,
    }

    setParameters((prev) => [...prev, newParam])
    setNewParameterName("")
  }

  const removeParameter = (id: string) => {
    setParameters((prev) => prev.filter((param) => param.id !== id))
  }

  const handleSave = () => {
    if (isFormValid) {
      onSave()
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center gap-6 mb-8">
        <Button variant="ghost" size="lg" onClick={onBack} className="text-lg">
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </Button>
        <h1 className="text-4xl font-bold text-gray-900">Create New Agent</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Panel - Basic Configuration */}
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="agent-name" className="text-lg font-medium">
                  Agent Name
                </Label>
                <Input
                  id="agent-name"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  placeholder="Enter agent name"
                  className="mt-2 h-12 text-lg"
                />
              </div>

              <div>
                <Label htmlFor="agent-role" className="text-lg font-medium">
                  Role/Function
                </Label>
                <Input
                  id="agent-role"
                  value={agentRole}
                  onChange={(e) => setAgentRole(e.target.value)}
                  placeholder="e.g., HR Assistant, Data Analyst"
                  className="mt-2 h-12 text-lg"
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-lg font-medium">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what this agent does..."
                  rows={5}
                  className="mt-2 text-lg"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Choose Avatar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                {avatarOptions.map((avatar) => (
                  <div
                    key={avatar.id}
                    className={`p-6 border-2 rounded-lg cursor-pointer transition-colors ${
                      selectedAvatar === avatar.id
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedAvatar(avatar.id)}
                  >
                    <div className="flex flex-col items-center gap-4">
                      <img
                        src={avatar.url || "/placeholder.svg"}
                        alt={avatar.name}
                        className="w-20 h-20 rounded-full bg-gray-200 object-cover"
                      />
                      <span className="text-lg font-medium text-center">{avatar.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Choose Model</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="h-12 text-lg">
                  <SelectValue placeholder="Select AI model" />
                </SelectTrigger>
                <SelectContent>
                  {modelOptions.map((model) => (
                    <SelectItem key={model} value={model} className="text-lg">
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Parameters */}
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Parameters Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              {!isValidWeight && (
                <Alert
                  className={`mb-6 ${totalWeight > 100 ? "border-red-200 bg-red-50" : "border-yellow-200 bg-yellow-50"}`}
                >
                  <AlertDescription className={`text-lg ${totalWeight > 100 ? "text-red-800" : "text-yellow-800"}`}>
                    Total weight must equal 100%. Current: {totalWeight}%
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-6">
                {parameters.map((parameter) => (
                  <Card key={parameter.id} className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="text-xl font-medium">{parameter.name}</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeParameter(parameter.id)}
                        className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
                      >
                        ×
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label className="text-lg">Value</Label>
                        <Input
                          type="text" // Changed to text input
                          value={parameter.value}
                          onChange={(e) => updateParameterValue(parameter.id, e.target.value)}
                          placeholder="Enter parameter value"
                          className="mt-2 h-12 text-lg"
                        />
                      </div>

                      <div>
                        <Label className="text-lg">Weight (%)</Label>
                        <Input
                          type="number"
                          value={parameter.weight}
                          onChange={(e) => updateParameterWeight(parameter.id, Number.parseInt(e.target.value) || 0)}
                          min={0}
                          max={100}
                          className="mt-2 h-12 text-lg"
                        />
                      </div>
                    </div>
                  </Card>
                ))}

                <div className="flex gap-3">
                  <Input
                    placeholder="Parameter name"
                    value={newParameterName}
                    onChange={(e) => setNewParameterName(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addParameter()}
                    className="h-12 text-lg"
                  />
                  <Button onClick={addParameter} disabled={!newParameterName.trim()} variant="outline" size="lg">
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={handleSave}
            disabled={!isFormValid}
            className="w-full bg-orange-600 hover:bg-orange-700 h-14 text-xl"
          >
            <Save className="h-6 w-6 mr-3" />
            Create Agent
          </Button>
        </div>
      </div>
    </div>
  )
}
