import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Sidebar } from "@/components/sidebar"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Agent Management System",
  description: "Professional AI Agent Management Platform",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.className}>
      <body className="min-h-screen bg-background">
        <Sidebar />
        <main className="lg:ml-20 xl:ml-24 min-h-screen transition-all duration-300">
          <div className="section-padding animate-fade-in">{children}</div>
        </main>
      </body>
    </html>
  )
}
