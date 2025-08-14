"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Bot, FolderOpen, Database, HelpCircle, User, Home, X, Zap, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth/auth-context"

interface SidebarProps {
  isMobileOpen?: boolean
  onMobileToggle?: () => void
}

const navigationItems = [
  { id: "/", icon: Home, label: "Home" },
  { id: "/agents", icon: Bot, label: "Agents" },
  { id: "/projects", icon: FolderOpen, label: "Projects" },
  { id: "/data-sourcing", icon: Database, label: "Data Source" },
  { id: "/demo", icon: Zap, label: "Backend Demo" },
]

export function Sidebar({ isMobileOpen = false, onMobileToggle }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { logout } = useAuth()

  const handleNavigate = (path: string) => {
    router.push(path)
    if (onMobileToggle) {
      onMobileToggle()
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/"
    return pathname.startsWith(path)
  }

  return (
    <>
      <div
        className={cn(
          "fixed left-0 z-50 transition-all duration-300 ease-in-out flex flex-col shadow-xl",
          // Position in middle 90% of screen height
          "top-[5%] h-[90%] rounded-r-2xl",
          // Desktop: always visible, hover to expand
          "hidden lg:flex",
          isExpanded ? "w-64 xl:w-72" : "w-18 xl:w-20",
          // Mobile: slide in from left when open
          "lg:translate-x-0",
          isMobileOpen ? "flex translate-x-0 w-72 top-0 h-full rounded-none" : "-translate-x-full w-72",
        )}
        style={{
          backgroundColor: "#022326",
          color: "#ffffff",
          /* Enhanced shadow and backdrop for professional appearance */
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)",
        }}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        {/* Mobile close button */}
        {isMobileOpen && (
          <div className="lg:hidden flex justify-end p-6">
            <button
              onClick={onMobileToggle}
              className="text-white hover:text-primary transition-colors p-2 rounded-lg hover:bg-white/10"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        )}

        <div className="flex-1 py-8 px-4">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.id)

            return (
              <Button
                key={item.id}
                variant="ghost"
                className={cn(
                  "w-full justify-start mb-4 transition-all duration-200 group",
                  "px-4 py-4 h-auto text-lg font-medium rounded-xl",
                  /* Enhanced hover and active states with professional styling */
                  "hover:bg-white/10 hover:text-white hover:shadow-lg hover:scale-105",
                  active && "bg-primary text-white shadow-lg scale-105 border border-white/20",
                  // Desktop: compact when collapsed
                  !isExpanded && "lg:px-4 lg:justify-center",
                  // Mobile: always expanded
                  "sm:justify-start sm:px-5",
                )}
                style={{
                  color: active ? "#ffffff" : "#ffffff",
                  backgroundColor: active ? "#F16323" : "transparent",
                }}
                onClick={() => handleNavigate(item.id)}
              >
                <Icon
                  className={cn(
                    "h-6 w-6 flex-shrink-0 transition-transform duration-200",
                    (isExpanded || isMobileOpen) && "mr-4",
                    "group-hover:scale-110",
                  )}
                />
                {(isExpanded || isMobileOpen) && (
                  <span className="truncate text-lg font-medium animate-slide-in">{item.label}</span>
                )}
              </Button>
            )
          })}
        </div>

        <div className="border-t border-white/20 p-4 bg-black/10">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start mb-3 transition-all duration-200 group",
              "px-4 py-4 h-auto text-lg font-medium rounded-xl",
              "hover:bg-white/10 hover:text-white hover:shadow-lg hover:scale-105",
              !isExpanded && "lg:px-4 lg:justify-center",
              "sm:justify-start sm:px-5",
            )}
            style={{ color: "#ffffff" }}
          >
            <HelpCircle
              className={cn(
                "h-6 w-6 flex-shrink-0 transition-transform duration-200",
                (isExpanded || isMobileOpen) && "mr-4",
                "group-hover:scale-110",
              )}
            />
            {(isExpanded || isMobileOpen) && <span className="text-lg animate-slide-in">Help</span>}
          </Button>

          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start transition-all duration-200 group",
              "px-4 py-4 h-auto text-lg font-medium rounded-xl",
              "hover:bg-white/10 hover:text-white hover:shadow-lg hover:scale-105",
              !isExpanded && "lg:px-4 lg:justify-center",
              "sm:justify-start sm:px-5",
            )}
            style={{ color: "#ffffff" }}
          >
            <User
              className={cn(
                "h-6 w-6 flex-shrink-0 transition-transform duration-200",
                (isExpanded || isMobileOpen) && "mr-4",
                "group-hover:scale-110",
              )}
            />
            {(isExpanded || isMobileOpen) && <span className="text-lg animate-slide-in">Profile</span>}
          </Button>

          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start transition-all duration-200 group",
              "px-4 py-4 h-auto text-lg font-medium rounded-xl",
              "hover:bg-red-500/20 hover:text-red-400 hover:shadow-lg hover:scale-105",
              !isExpanded && "lg:px-4 lg:justify-center",
              "sm:justify-start sm:px-5",
            )}
            style={{ color: "#ffffff" }}
            onClick={handleLogout}
          >
            <LogOut
              className={cn(
                "h-6 w-6 flex-shrink-0 transition-transform duration-200",
                (isExpanded || isMobileOpen) && "mr-4",
                "group-hover:scale-110",
              )}
            />
            {(isExpanded || isMobileOpen) && <span className="text-lg animate-slide-in">Logout</span>}
          </Button>
        </div>
      </div>
    </>
  )
}
