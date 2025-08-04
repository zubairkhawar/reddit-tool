"use client"

import { useState, useEffect } from "react"
import { 
  Bell, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  X,
  TrendingUp,
  Target,
  MessageSquare,
  Sparkles
} from "lucide-react"

interface Notification {
  id: string
  type: 'success' | 'warning' | 'info' | 'opportunity'
  title: string
  message: string
  timestamp: Date
  action?: {
    label: string
    onClick: () => void
  }
}

const notificationConfig = {
  success: {
    icon: CheckCircle,
    color: "from-green-500 to-green-600",
    bgColor: "bg-gradient-to-r from-green-500 to-green-600",
    textColor: "text-green-700"
  },
  warning: {
    icon: AlertTriangle,
    color: "from-yellow-500 to-orange-500",
    bgColor: "bg-gradient-to-r from-yellow-500 to-orange-500",
    textColor: "text-yellow-700"
  },
  info: {
    icon: Info,
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-gradient-to-r from-blue-500 to-blue-600",
    textColor: "text-blue-700"
  },
  opportunity: {
    icon: Target,
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-gradient-to-r from-purple-500 to-pink-500",
    textColor: "text-purple-700"
  }
}

export function NotificationToast({ notification, onClose }: { notification: Notification; onClose: () => void }) {
  const config = notificationConfig[notification.type]
  const Icon = config.icon

  return (
    <div className="glass-card rounded-xl p-4 mb-3 animate-slide-in-right hover-lift">
      <div className="flex items-start space-x-3">
        <div className={`p-2 ${config.bgColor} rounded-lg text-white`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-1">
                {notification.title}
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                {notification.message}
              </p>
            </div>
            <button
              onClick={onClose}
              className="ml-2 p-1 hover:bg-white/50 rounded-lg transition-colors"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          </div>
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-gray-500">
              {notification.timestamp.toLocaleTimeString()}
            </span>
            {notification.action && (
              <button
                onClick={notification.action.onClick}
                className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                {notification.action.label}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function EngagementRing({ percentage, size = 120 }: { percentage: number; size?: number }) {
  const radius = (size - 20) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative inline-block">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E5E7EB"
          strokeWidth="8"
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#gradient)"
          strokeWidth="8"
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6EE7B7" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{percentage}%</div>
          <div className="text-xs text-gray-600">Goal</div>
        </div>
      </div>
    </div>
  )
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)

  // Simulate incoming notifications
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'opportunity',
        title: '🔥 High Priority Lead Found',
        message: 'New opportunity in r/entrepreneur with $5K budget mentioned',
        timestamp: new Date(),
        action: {
          label: 'View Lead',
          onClick: () => console.log('View lead')
        }
      },
      {
        id: '2',
        type: 'success',
        title: '✅ AI Reply Posted',
        message: 'Your smart reply was successfully posted to Reddit',
        timestamp: new Date(Date.now() - 300000),
        action: {
          label: 'View Reply',
          onClick: () => console.log('View reply')
        }
      },
      {
        id: '3',
        type: 'info',
        title: '📊 Weekly Report Ready',
        message: 'Your performance analytics for this week are available',
        timestamp: new Date(Date.now() - 600000)
      }
    ]

    setNotifications(mockNotifications)
  }, [])

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 hover:bg-white/50 rounded-xl transition-colors"
      >
        <Bell className="h-6 w-6 text-gray-700" />
        {notifications.length > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-white">{notifications.length}</span>
          </div>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 glass-card rounded-2xl p-4 shadow-xl z-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/50 rounded-xl transition-colors"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* Engagement Ring */}
          <div className="mb-6 p-4 bg-white/50 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-1">Daily Goal</h4>
                <p className="text-xs text-gray-600">Reply to 10 high-priority leads</p>
              </div>
              <EngagementRing percentage={75} size={80} />
            </div>
          </div>

          {/* Notifications List */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600">No new notifications</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <NotificationToast
                  key={notification.id}
                  notification={notification}
                  onClose={() => removeNotification(notification.id)}
                />
              ))
            )}
          </div>

          {/* Quick Stats */}
          <div className="mt-4 pt-4 border-t border-white/20">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-gray-900">12</div>
                <div className="text-xs text-gray-600">Leads Today</div>
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900">8</div>
                <div className="text-xs text-gray-600">Replies Sent</div>
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900">94%</div>
                <div className="text-xs text-gray-600">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Animation classes
const styles = `
  @keyframes slide-in-right {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  .animate-slide-in-right {
    animation: slide-in-right 0.3s ease-out;
  }
`

// Add styles to document
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style')
  styleSheet.textContent = styles
  document.head.appendChild(styleSheet)
} 