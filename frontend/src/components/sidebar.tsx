"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Home,
  TrendingUp,
  MessageSquare,
  Target,
  Hash,
  Bell,
  BarChart3,
  Trophy,
  Brain,
  Monitor,
  MessageCircle,
  Settings,
  FileText,
  Globe,
  Search,
  RefreshCw,
  User,
  MessageCircle as ChatBubbleLeftRight
} from "lucide-react"

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Leads', href: '/leads', icon: User },
  { name: 'Replies', href: '/replies', icon: ChatBubbleLeftRight },
  { name: 'Keywords', href: '/keywords', icon: Search },
  { name: 'Subreddits', href: '/subreddits', icon: Globe },
  { name: 'Templates', href: '/templates', icon: FileText },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
  { name: 'AI Learning', href: '/ai-learning', icon: Brain },
  { name: 'Old Leads', href: '/old-leads', icon: Monitor },
  { name: 'Follow-ups', href: '/follow-ups', icon: RefreshCw },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-gray-900">
      <div className="flex h-16 items-center px-6">
        <h1 className="text-xl font-bold text-white">RedditLead.AI</h1>
      </div>
      
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
      
      <div className="border-t border-gray-700 p-4">
        <div className="flex items-center">
          <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
          <span className="text-sm text-gray-300">System Online</span>
        </div>
      </div>
    </div>
  )
} 