"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  BarChart3,
  MessageSquare,
  Settings,
  TrendingUp,
  Users,
  Bell,
  Search,
  Target,
  FileText,
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/", icon: BarChart3 },
  { name: "Live Leads", href: "/leads", icon: Target },
  { name: "Posts", href: "/posts", icon: FileText },
  { name: "Replies", href: "/replies", icon: MessageSquare },
  { name: "Keywords", href: "/keywords", icon: Search },
  { name: "Subreddits", href: "/subreddits", icon: Users },
  { name: "Notifications", href: "/notifications", icon: Bell },
  { name: "Analytics", href: "/analytics", icon: TrendingUp },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200">
      <div className="flex h-16 items-center px-6 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">RL</span>
          </div>
          <span className="text-lg font-semibold text-gray-900">RedditLead.AI</span>
        </div>
      </div>
      
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5 flex-shrink-0",
                  isActive ? "text-blue-700" : "text-gray-400 group-hover:text-gray-500"
                )}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          )
        })}
      </nav>
      
      <div className="border-t border-gray-200 p-4">
        <div className="text-xs text-gray-500">
          <div className="font-medium">Status: Active</div>
          <div className="mt-1">Monitoring 15 subreddits</div>
          <div className="mt-1">20 keywords tracked</div>
        </div>
      </div>
    </div>
  )
} 