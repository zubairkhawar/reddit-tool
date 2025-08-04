"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
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
  RotateCcw,
  User,
  MessageCircle as ChatBubbleLeftRight,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Minimize2,
  Maximize2,
  PanelLeftClose,
  PanelLeftOpen,
  FolderOpen
} from "lucide-react"

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Leads', href: '/leads', icon: User },
  { name: 'Replies', href: '/replies', icon: ChatBubbleLeftRight },
  { name: 'Groups', href: '/groups', icon: FolderOpen },
  { name: 'Templates', href: '/templates', icon: FileText },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
  { name: 'AI Learning', href: '/ai-learning', icon: Brain, isAI: true },
  { name: 'Old Leads', href: '/old-leads', icon: Monitor },
  { name: 'Follow-ups', href: '/follow-ups', icon: RotateCcw },
]

// Custom RedditLead.AI Logo Component
const RedditLeadLogo = ({ isCollapsed }: { isCollapsed: boolean }) => {
  return (
    <div className="flex items-center">
      {/* Base Shield Shape */}
      <div className="relative w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg">
        {/* Reddit Snoo Antenna (Circuit/Waveform) */}
        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-4 h-3">
          <div className="w-full h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-t-full relative">
            {/* Circuit lines */}
            <div className="absolute top-1 left-1 w-1 h-1 bg-white rounded-full"></div>
            <div className="absolute top-1 right-1 w-1 h-1 bg-white rounded-full"></div>
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-0.5 h-1 bg-white rounded-full"></div>
          </div>
        </div>
        
        {/* Neural Network Eyes */}
        <div className="absolute top-3 left-2 w-1 h-1 bg-white rounded-full"></div>
        <div className="absolute top-3 right-2 w-1 h-1 bg-white rounded-full"></div>
        
        {/* Neural Network Connection Line */}
        <div className="absolute top-3.5 left-1/2 transform -translate-x-1/2 w-2 h-0.5 bg-gradient-to-r from-blue-300 to-purple-300 rounded-full"></div>
        
        {/* Gear/Automation Element */}
        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3">
          <div className="w-full h-full border border-white/50 rounded-full relative">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0.5 h-1 bg-white rounded-full"></div>
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0.5 h-1 bg-white rounded-full"></div>
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-0.5 bg-white rounded-full"></div>
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-0.5 bg-white rounded-full"></div>
          </div>
        </div>
        
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-lg animate-pulse"></div>
      </div>
      
      {/* Text Label */}
      {!isCollapsed && (
        <div className="ml-3">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            RedditLead.AI
          </h1>
        </div>
      )}
    </div>
  )
}

// Animated Toggle Button Component
const AnimatedToggleButton = ({ isCollapsed, onClick }: { isCollapsed: boolean; onClick: () => void }) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isClicked, setIsClicked] = useState(false)

  const handleClick = () => {
    setIsClicked(true)
    onClick()
    setTimeout(() => setIsClicked(false), 300)
  }

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "relative w-8 h-8 glass-card rounded-lg border border-white/20 transition-all duration-300 hover:scale-110 group",
        isClicked && "animate-pulse-glow"
      )}
      title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
    >
      {/* Background Glow */}
      <div className={cn(
        "absolute inset-0 rounded-lg transition-all duration-300",
        isHovered ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20" : "bg-white/10"
      )} />
      
      {/* Icon Container */}
      <div className="relative flex items-center justify-center w-full h-full">
        {/* Collapsed State Icon */}
        <div className={cn(
          "absolute transition-all duration-300 ease-in-out",
          isCollapsed ? "opacity-100 scale-100" : "opacity-0 scale-0"
        )}>
          <PanelLeftOpen className="h-4 w-4 text-blue-500" />
        </div>
        
        {/* Expanded State Icon */}
        <div className={cn(
          "absolute transition-all duration-300 ease-in-out",
          !isCollapsed ? "opacity-100 scale-100" : "opacity-0 scale-0"
        )}>
          <PanelLeftClose className="h-4 w-4 text-blue-500" />
        </div>
        
        {/* Hover Animation Icon */}
        <div className={cn(
          "absolute transition-all duration-300 ease-in-out",
          isHovered && !isCollapsed ? "opacity-100 scale-100" : "opacity-0 scale-0"
        )}>
          <PanelLeftOpen className="h-4 w-4 text-purple-500" />
        </div>
        
        <div className={cn(
          "absolute transition-all duration-300 ease-in-out",
          isHovered && isCollapsed ? "opacity-100 scale-100" : "opacity-0 scale-0"
        )}>
          <PanelLeftClose className="h-4 w-4 text-purple-500" />
        </div>
      </div>
      
      {/* Click Animation Dot */}
      <div className={cn(
        "absolute inset-0 flex items-center justify-center transition-all duration-300",
        isClicked ? "opacity-100 scale-100" : "opacity-0 scale-0"
      )}>
        <div className="w-1 h-1 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-ping"></div>
      </div>
      
      {/* Neon Border Effect */}
      <div className={cn(
        "absolute inset-0 rounded-lg border-2 transition-all duration-300",
        isHovered ? "border-blue-400/50 shadow-lg shadow-blue-400/25" : "border-transparent"
      )} />
    </button>
  )
}

export default function Sidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  return (
    <div className="relative">
      {/* Main Sidebar */}
      <div 
        className={cn(
          "flex h-full flex-col glass rounded-r-2xl border-r border-white/20 transition-all duration-500 ease-in-out",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-white/10">
          {!isCollapsed ? (
            <RedditLeadLogo isCollapsed={isCollapsed} />
          ) : (
            <div className="flex items-center justify-center w-full">
              <AnimatedToggleButton isCollapsed={isCollapsed} onClick={toggleSidebar} />
            </div>
          )}
          
          {/* Animated Toggle Button - Only show when expanded */}
          {!isCollapsed && (
            <AnimatedToggleButton isCollapsed={isCollapsed} onClick={toggleSidebar} />
          )}
      </div>
      
        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
              <div key={item.name} className="relative group">
            <Link
              href={item.href}
                  onMouseEnter={() => setHoveredItem(item.name)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={cn(
                    "group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-300 relative overflow-hidden",
                isActive
                      ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-600 border-l-4 border-blue-500 shadow-lg"
                      : "text-gray-600 hover:text-gray-900 hover:bg-white/50 border-l-4 border-transparent",
                    item.isAI && "ai-glow"
                  )}
            >
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-purple-500 rounded-r-full animate-pulse"></div>
                  )}
                  
                  {/* Icon */}
                  <div className={cn(
                    "flex-shrink-0 transition-all duration-300",
                    isCollapsed ? "mx-auto" : "mr-3",
                    isActive ? "text-blue-600" : "text-gray-500 group-hover:text-gray-700",
                    item.isAI && "animate-pulse-glow"
                  )}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  
                  {/* Text Label */}
                  {!isCollapsed && (
                    <span className="font-medium truncate">{item.name}</span>
                  )}
                  
                  {/* AI Indicator */}
                  {!isCollapsed && item.isAI && (
                    <div className="ml-auto">
                      <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-blue-500 rounded-full animate-pulse"></div>
                    </div>
                  )}
            </Link>
                
                {/* Hover Tooltip for collapsed mode */}
                {isCollapsed && hoveredItem === item.name && (
                  <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-3 py-2 glass-card rounded-lg border border-white/20 shadow-lg z-50 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{item.name}</div>
                    {item.isAI && (
                      <div className="text-xs text-blue-600 mt-1">AI Powered</div>
                    )}
                  </div>
                )}
              </div>
          )
        })}
      </nav>
      </div>
    </div>
  )
} 