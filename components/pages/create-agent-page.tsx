"use client"

import { useState, useRef } from "react"
import { Plus, Minus, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Parameter {
  id: string
  name: string
  value: string
  weight: number
  color: string
}

const parameterColors = [
  "bg-blue-100 border-blue-200",
  "bg-orange-100 border-orange-200", 
  "bg-purple-100 border-purple-200",
  "bg-green-100 border-green-200",
  "bg-yellow-100 border-yellow-200",
  "bg-pink-100 border-pink-200",
  "bg-indigo-100 border-indigo-200",
  "bg-teal-100 border-teal-200",
  "bg-red-100 border-red-200"
]

const modelOptions = ["GPT-4 Turbo", "GPT-3.5 Turbo", "Claude 3 Opus", "Claude 3 Sonnet", "Gemini Pro"]

export function CreateAgentPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [avatarImage, setAvatarImage] = useState<string | null>(null)
  const [agentName, setAgentName] = useState("")
  const [agentRole, setAgentRole] = useState("")
  const [description, setDescription] = useState("")
  const [selectedModel, setSelectedModel] = useState("")
  const [parameters, setParameters] = useState<Parameter[]>([])

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatarImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const updateParameterWeight = (id: string, increment: boolean) => {
    setParameters(prev => prev.map(param => {
      if (param.id === id) {
        const newWeight = increment ? param.weight + 5 : param.weight - 5
        return { ...param, weight: Math.max(0, Math.min(100, newWeight)) }
      }
      return param
    }))
  }

  const updateParameterValue = (id: string, value: string) => {
    setParameters(prev => prev.map(param => 
      param.id === id ? { ...param, value } : param
    ))
  }

  const updateParameterName = (id: string, name: string) => {
    setParameters(prev => prev.map(param => 
      param.id === id ? { ...param, name } : param
    ))
  }

  const addParameter = () => {
    const newParam: Parameter = {
      id: Date.now().toString(),
      name: "",
      value: "",
      weight: 10,
      color: parameterColors[parameters.length % parameterColors.length]
    }
    setParameters(prev => [...prev, newParam])
  }

  const removeParameter = (id: string) => {
    setParameters(prev => prev.filter(param => param.id !== id))
  }

  const totalWeight = parameters.reduce((sum, param) => sum + param.weight, 0)

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Header - Fixed */}
      <div className="bg-white border-b shadow-sm flex-shrink-0">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Home</span>
              <span>›</span>
              <span>Agent</span>
              <span>›</span>
              <span className="text-gray-900 font-medium">Create New Agent</span>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="lg" className="px-8">
                Cancel
              </Button>
              <Button size="lg" className="px-8 bg-orange-600 hover:bg-orange-700">
                Save Agent
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Flexible */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full p-8">
          <div className="h-full grid grid-cols-5 gap-8">
            
            {/* Left Column - Basic Info (2 columns width) */}
            <div className="col-span-2 flex flex-col gap-6 h-full">
              
              {/* Avatar Upload */}
              <Card className="flex-shrink-0">
                <CardContent className="p-8 text-center">
                  <div 
                    className="w-40 h-40 mx-auto mb-6 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={triggerFileInput}
                  >
                    {avatarImage ? (
                      <img 
                        src={avatarImage} 
                        alt="Avatar" 
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <Upload className="w-12 h-12 text-gray-400" />
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                  <p className="text-gray-600 font-medium text-lg cursor-pointer" onClick={triggerFileInput}>
                    Upload Avatar
                  </p>
                </CardContent>
              </Card>

              {/* Basic Information */}
              <Card className="flex-1">
                <CardContent className="p-8 h-full flex flex-col">
                  <h3 className="text-2xl font-bold text-gray-900 mb-8">Basic Information</h3>
                  <div className="space-y-8 flex-1">
                    <div>
                      <label className="block text-lg font-semibold text-gray-700 mb-3">Agent Name</label>
                      <Input
                        placeholder="Enter agent name"
                        value={agentName}
                        onChange={(e) => setAgentName(e.target.value)}
                        className="text-lg h-14"
                      />
                    </div>
                    <div>
                      <label className="block text-lg font-semibold text-gray-700 mb-3">Role/Function</label>
                      <Input
                        placeholder="e.g., HR Assistant, Data Analyst, Customer Support"
                        value={agentRole}
                        onChange={(e) => setAgentRole(e.target.value)}
                        className="text-lg h-14"
                      />
                    </div>
                    <div>
                      <label className="block text-lg font-semibold text-gray-700 mb-3">AI Model</label>
                      <Select value={selectedModel} onValueChange={setSelectedModel}>
                        <SelectTrigger className="text-lg h-14">
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
                    </div>
                    <div className="flex-1">
                      <label className="block text-lg font-semibold text-gray-700 mb-3">Agent Description</label>
                      <Textarea
                        placeholder="Describe what this agent does, its capabilities, and how it helps users. Be detailed about its purpose and functionality..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="text-base resize-none h-full min-h-[200px]"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Section - Parameters (3 columns width) */}
            <div className="col-span-3 flex flex-col h-full">
              
              {/* Parameters Header */}
              <div className="flex items-center justify-between mb-8 flex-shrink-0">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Parameters Configuration</h2>
                  <div className="flex items-center gap-4">
                    <span className="text-lg text-gray-600">
                      Total Weight: <span className="font-semibold">{totalWeight}%</span>
                    </span>
                    {totalWeight !== 100 && (
                      <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                        Should equal 100%
                      </span>
                    )}
                  </div>
                </div>
                <Button onClick={addParameter} size="lg" className="bg-orange-600 hover:bg-orange-700">
                  <Plus className="h-5 w-5 mr-2" />
                  Add Parameter
                </Button>
              </div>

              {/* Parameters Content */}
              <div className="flex-1 overflow-auto">
                {parameters.length === 0 ? (
                  <Card className="h-full">
                    <CardContent className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-orange-50 flex items-center justify-center">
                          <Plus className="w-12 h-12 text-orange-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">No parameters configured</h3>
                        <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
                          Parameters help define your agent's behavior and decision-making criteria. Add your first parameter to get started.
                        </p>
                        <Button onClick={addParameter} size="lg" className="bg-orange-600 hover:bg-orange-700">
                          <Plus className="h-5 w-5 mr-2" />
                          Add First Parameter
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-3 gap-6 pb-6">
                    {parameters.map((parameter, index) => (
                      <Card key={parameter.id} className={`${parameter.color} border-2 hover:shadow-lg transition-shadow`}>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                              <span className="text-lg font-bold text-gray-600 bg-white px-3 py-1 rounded-full">
                                {index + 1}
                              </span>
                              <span className="text-xl font-bold text-gray-900">Parameter</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeParameter(parameter.id)}
                              className="h-8 w-8 p-0 text-gray-500 hover:text-red-600 hover:bg-red-50"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">Parameter Name</label>
                              <Input
                                placeholder="e.g., Experience Level, Skills Required"
                                value={parameter.name}
                                onChange={(e) => updateParameterName(parameter.id, e.target.value)}
                                className="bg-white text-base h-12"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">Expected Value</label>
                              <Input 
                                placeholder="Enter the expected or desired value"
                                value={parameter.value}
                                onChange={(e) => updateParameterValue(parameter.id, e.target.value)}
                                className="bg-white text-base h-12"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-3">Weight (%)</label>
                              <div className="flex items-center justify-center gap-4">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-10 h-10 p-0 rounded-full bg-white hover:bg-gray-50"
                                  onClick={() => updateParameterWeight(parameter.id, false)}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <span className="text-2xl font-bold min-w-[4rem] text-center text-gray-900">
                                  {parameter.weight}%
                                </span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-10 h-10 p-0 rounded-full bg-white hover:bg-gray-50"
                                  onClick={() => updateParameterWeight(parameter.id, true)}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
