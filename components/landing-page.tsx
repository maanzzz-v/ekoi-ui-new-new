"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Users, LayoutGrid, Database } from "lucide-react"

export function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-4xl text-center space-y-8">
        <h1 className="text-6xl font-extrabold text-gray-900 leading-tight">
          Empower Your Workflow with Intelligent Agents
        </h1>
        <p className="text-xl text-gray-700 leading-relaxed">
          Build, deploy, and manage AI agents and automate complex tasks with our intuitive visual workflow builder and
          robust data integration.
        </p>
        <div className="flex justify-center gap-6 pt-4">
          <Button
            size="lg"
            className="bg-orange-600 hover:bg-orange-700 text-xl px-10 py-6 rounded-full shadow-lg transition-all duration-300 hover:scale-105"
          >
            Get Started
            <ArrowRight className="ml-3 h-6 w-6" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-2 border-orange-600 text-orange-600 hover:bg-orange-50 hover:text-orange-700 text-xl px-10 py-6 rounded-full shadow-lg transition-all duration-300 hover:scale-105 bg-transparent"
          >
            Explore Agents
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 w-full max-w-5xl">
        <Card className="p-8 bg-white shadow-xl rounded-xl transition-transform duration-300 hover:scale-105">
          <CardHeader className="flex flex-col items-center text-center pb-6">
            <Users className="h-16 w-16 text-orange-600 mb-4" />
            <CardTitle className="text-2xl font-bold text-gray-900">Agent Management</CardTitle>
          </CardHeader>
          <CardContent className="text-lg text-gray-700">
            Create, configure, and deploy specialized AI agents tailored to your business needs.
          </CardContent>
        </Card>

        <Card className="p-8 bg-white shadow-xl rounded-xl transition-transform duration-300 hover:scale-105">
          <CardHeader className="flex flex-col items-center text-center pb-6">
            <LayoutGrid className="h-16 w-16 text-green-600 mb-4" />
            <CardTitle className="text-2xl font-bold text-gray-900">Visual Workflows</CardTitle>
          </CardHeader>
          <CardContent className="text-lg text-gray-700">
            Design complex automation workflows with a drag-and-drop interface, no coding required.
          </CardContent>
        </Card>

        <Card className="p-8 bg-white shadow-xl rounded-xl transition-transform duration-300 hover:scale-105">
          <CardHeader className="flex flex-col items-center text-center pb-6">
            <Database className="h-16 w-16 text-purple-600 mb-4" />
            <CardTitle className="text-2xl font-bold text-gray-900">Data Integration</CardTitle>
          </CardHeader>
          <CardContent className="text-lg text-gray-700">
            Seamlessly connect to various data sources including cloud storage, databases, and local files.
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
