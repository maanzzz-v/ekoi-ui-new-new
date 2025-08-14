'use client'

import { useAuth } from './auth-context'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated && pathname !== '/login') {
        router.push('/login')
      } else if (isAuthenticated && pathname === '/login') {
        router.push('/')
      }
    }
  }, [isAuthenticated, isLoading, pathname, router])

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  // If on login page, always show children
  if (pathname === '/login') {
    return <>{children}</>
  }

  // If not authenticated and not on login page, don't render anything
  // (useEffect will redirect to login)
  if (!isAuthenticated) {
    return null
  }

  // If authenticated, show children
  return <>{children}</>
}
