'use client'

import { useAuth } from '@/lib/auth/auth-context'
import { usePathname } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'

interface ConditionalLayoutProps {
  children: React.ReactNode
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const { isAuthenticated } = useAuth()
  const pathname = usePathname()

  // Don't show sidebar on login page
  if (pathname === '/login') {
    return <>{children}</>
  }

  // Show sidebar only when authenticated
  if (isAuthenticated) {
    return (
      <>
        <Sidebar />
        <main className="lg:ml-20 xl:ml-24 min-h-screen transition-all duration-300">
          <div className="section-padding animate-fade-in">{children}</div>
        </main>
      </>
    )
  }

  // Fallback for unauthenticated users (shouldn't normally reach here due to AuthGuard)
  return <>{children}</>
}
