import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/lib/auth/auth-context"
import { AuthGuard } from "@/lib/auth/auth-guard"
import { ConditionalLayout } from "@/components/conditional-layout"

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
        <AuthProvider>
          <AuthGuard>
            <ConditionalLayout>
              {children}
            </ConditionalLayout>
          </AuthGuard>
        </AuthProvider>
      </body>
    </html>
  )
}
