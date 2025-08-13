"use client"

import { useState, useEffect } from "react"
import { Save, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Agent } from "@/lib/types"

interface ConfigureAgentPageProps {
  agent: Agent | null
  onBack: () => void
  onSave: (updatedAgent: Agent) => void
}

interface Parameter {
  id: string
  name: string
  value: string
  weight: number
  description: string
}

const modelOptions = ["GPT-4 Turbo", "GPT-3.5 Turbo", "Claude 3 Opus", "Claude 3 Sonnet", "Gemini Pro"]

export function ConfigureAgentPage({ agent, onBack, onSave }: ConfigureAgentPageProps) {
  const [agentName, setAgentName] = useState(agent?.name || "")
  const [agentRole, setAgentRole] = useState(agent?.role || "")
  const [description, setDescription] = useState(agent?.description || "")
  const [selectedModel, setSelectedModel] = useState("GPT-4 Turbo")
  const [parameters, setParameters] = useState<Parameter[]>([
    {
      id: "1",
      name: "Parameter",
      value: "AI Engineer",
      weight: 30,
      description: "Position the applicant has worked in",
    },
    { id: "2", name: "Parameter", value: "15 LPA", weight: 20, description: "Maximum CTC for the role" },
    { id: "3", name: "Parameter", value: "Bangalore - On site only", weight: 30, description: "Job Location" },
    { id: "4", name: "Parameter", value: "AI in Biomedical", weight: 20, description: "Projects done by Applicant" },
    {
      id: "5",
      name: "Parameter",
      value: "AI Engineer",
      weight: 0,
      description: "Position the applicant has worked in",
    },
    {
      id: "6",
      name: "Parameter",
      value: "AI Engineer",
      weight: 0,
      description: "Position the applicant has worked in",
    },
    {
      id: "7",
      name: "Parameter",
      value: "AI Engineer",
      weight: 0,
      description: "Position the applicant has worked in",
    },
    {
      id: "8",
      name: "Parameter",
      value: "AI Engineer",
      weight: 0,
      description: "Position the applicant has worked in",
    },
  ])
  const [newParameterName, setNewParameterName] = useState("")

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
      value: "",
      weight: 0,
      description: "New parameter description",
    }

    setParameters((prev) => [...prev, newParam])
    setNewParameterName("")
  }

  const removeParameter = (id: string) => {
    setParameters((prev) => prev.filter((param) => param.id !== id))
  }

  const handleSave = () => {
    if (isFormValid && agent) {
      const updatedAgent: Agent = {
        ...agent,
        name: agentName,
        role: agentRole,
        description: description,
      }
      onSave(updatedAgent)
    }
  }

  const getParameterColor = (index: number) => {
    const colors = [
      "bg-blue-100 border-blue-200",
      "bg-orange-100 border-orange-200",
      "bg-purple-100 border-purple-200",
      "bg-green-100 border-green-200",
      "bg-cyan-100 border-cyan-200",
      "bg-yellow-100 border-yellow-200",
      "bg-blue-100 border-blue-200",
      "bg-gray-100 border-gray-200",
    ]
    return colors[index % colors.length]
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
        {/* Agent Info Card */}
        <Card className="mb-4 border-2 border-blue-200 flex-shrink-0">
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
              <Button className="bg-orange-500 hover:bg-orange-600 text-white px-6">Choose the model</Button>
            </div>
          </CardContent>
        </Card>

        {/* Parameters Section */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
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
        </div>

        {/* Parameters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 flex-1 auto-rows-start content-start">
          {parameters.map((parameter, index) => (
            <div key={parameter.id} className="space-y-3">
              <Card className={`${getParameterColor(index)} border-2`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{index + 1}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeParameter(parameter.id)}
                      className="h-6 w-6 p-0 hover:bg-red-100"
                    >
                      ×
                    </Button>
                  </div>
                  <h4 className="font-semibold text-lg mb-2">{parameter.name}</h4>
                  <p className="text-sm text-gray-600">{parameter.description}</p>
                </CardContent>
              </Card>

              <Input
                value={parameter.value}
                onChange={(e) => updateParameterValue(parameter.id, e.target.value)}
                placeholder="Parameter value"
                className="bg-white border border-gray-300"
              />

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 border border-gray-300 rounded-full"
                  onClick={() => updateParameterWeight(parameter.id, Math.max(0, parameter.weight - 5))}
                >
                  -
                </Button>
                <div className="flex-1 text-center">
                  <span className="font-medium">{parameter.weight}%</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 border border-gray-300 rounded-full"
                  onClick={() => updateParameterWeight(parameter.id, Math.min(100, parameter.weight + 5))}
                >
                  +
                </Button>
              </div>
            </div>
          ))}
        </div>

        {!isValidWeight && (
          <Alert className="mb-4 border-yellow-200 bg-yellow-50 flex-shrink-0">
            <AlertDescription className="text-yellow-800">
              Total weight must equal 100%. Current: {totalWeight}%
            </AlertDescription>
          </Alert>
        )}

        <div className="flex justify-center mt-auto pt-4 flex-shrink-0">
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
    </div>
  )
}
