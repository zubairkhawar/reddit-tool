"use client"

import { useEffect, useState } from "react"
import { apiClient, Notification } from "@/lib/api"
import { formatDate } from "@/lib/utils"
import { 
  Bell, 
  Check, 
  Eye, 
  AlertCircle, 
  Info, 
  ExternalLink,
  AlertTriangle,
  MessageSquare,
  TrendingUp,
  Sparkles,
  Zap,
  Clock,
  Calendar,
  Settings,
  Play,
  Pause,
  X,
  CheckCircle,
  XCircle,
  Star
} from "lucide-react"

interface NotificationType {
  id: string
  name: string
  description: string
  icon: any
  color: string
  bgColor: string
  isEnabled: boolean
  previewMessage: string
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("all")
  const [previewMode, setPreviewMode] = useState(false)
  const [notificationTypes, setNotificationTypes] = useState<NotificationType[]>([
    {
      id: 'high_priority',
      name: 'High Priority',
      description: 'Urgent opportunities detected',
      icon: AlertTriangle,
      color: 'from-red-500 to-orange-500',
      bgColor: 'bg-gradient-to-r from-red-500 to-orange-500',
      isEnabled: true,
      previewMessage: '🔥 High Priority Lead Found - New opportunity in r/entrepreneur with $5K budget mentioned'
    },
    {
      id: 'reply_posted',
      name: 'Reply Posted',
      description: 'AI replies successfully posted',
      icon: MessageSquare,
      color: 'from-green-500 to-blue-500',
      bgColor: 'bg-gradient-to-r from-green-500 to-blue-500',
      isEnabled: true,
      previewMessage: '✅ AI Reply Posted - Your smart reply was successfully posted to Reddit'
    },
    {
      id: 'engagement',
      name: 'Engagement',
      description: 'High engagement on replies',
      icon: TrendingUp,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-gradient-to-r from-purple-500 to-pink-500',
      isEnabled: true,
      previewMessage: '📈 High Engagement Alert - Your reply received 15 upvotes and 3 comments'
    }
  ])

  useEffect(() => {
    fetchNotifications()
  }, [filter])

  const fetchNotifications = async () => {
    try {
      const params: any = {}
      if (filter === "unread") params.is_read = false
      else if (filter === "read") params.is_read = true
      
      const data = await apiClient.getNotifications(params)
      setNotifications(data.results)
    } catch (error) {
      console.error("Error fetching notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await apiClient.markNotificationAsRead(notificationId)
      fetchNotifications()
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const toggleNotificationType = (id: string) => {
    setNotificationTypes(prev => 
      prev.map(type => 
        type.id === id ? { ...type, isEnabled: !type.isEnabled } : type
      )
    )
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "high_priority":
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      case "reply_posted":
        return <Check className="h-5 w-5 text-green-500" />
      case "engagement":
        return <ExternalLink className="h-5 w-5 text-blue-500" />
      default:
        return <Info className="h-5 w-5 text-gray-500" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "high_priority":
        return "border-red-200 bg-red-50"
      case "reply_posted":
        return "border-green-200 bg-green-50"
      case "engagement":
        return "border-blue-200 bg-blue-50"
      default:
        return "border-gray-200 bg-gray-50"
    }
  }

  const groupNotificationsByDate = (notifications: Notification[]) => {
    const groups: { [key: string]: Notification[] } = {}
    
    notifications.forEach(notification => {
      const date = new Date(notification.created_at).toLocaleDateString()
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(notification)
    })
    
    return Object.entries(groups).map(([date, notifications]) => ({
      date,
      notifications,
      isToday: date === new Date().toLocaleDateString()
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center animate-spin mb-4">
            <Bell className="h-8 w-8 text-white" />
          </div>
          <p className="text-gray-600 font-medium">Loading notifications...</p>
        </div>
      </div>
    )
  }

  const unreadCount = notifications.filter(n => !n.is_read).length
  const groupedNotifications = groupNotificationsByDate(notifications)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Notifications
          </h1>
          <p className="text-gray-600 mt-1">Stay updated with your Reddit lead activity</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className={`px-4 py-2 rounded-xl transition-all duration-300 flex items-center space-x-2 ${
              previewMode 
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                : 'bg-white/50 text-gray-700 hover:bg-white/80'
            }`}
          >
            {previewMode ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            <span className="text-sm font-medium">Preview Mode</span>
          </button>
          <div className="glass-card px-4 py-2 rounded-xl">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">{unreadCount} unread</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Types */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Notification Types</h2>
          <Settings className="h-5 w-5 text-gray-500" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {notificationTypes.map((type) => {
            const Icon = type.icon
            
            return (
              <div
                key={type.id}
                className={`glass-card rounded-2xl p-4 cursor-pointer transition-all duration-300 hover-lift ${
                  type.isEnabled ? 'ring-2 ring-blue-200' : 'opacity-60'
                }`}
                onClick={() => toggleNotificationType(type.id)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 ${type.bgColor} rounded-lg text-white`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <button
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      type.isEnabled 
                        ? 'bg-gradient-to-r from-green-500 to-blue-500' 
                        : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        type.isEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{type.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{type.description}</p>
                
                {previewMode && (
                  <div className="p-3 bg-white/50 rounded-xl">
                    <div className="flex items-center space-x-2 mb-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-xs font-medium text-gray-700">Preview</span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">{type.previewMessage}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 bg-white/50 rounded-xl border border-white/20 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Notifications</option>
            <option value="unread">Unread Only</option>
            <option value="read">Read Only</option>
          </select>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Clock className="h-4 w-4" />
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="text-center py-16">
          <div className="relative mb-8">
            {/* Animated inbox illustration */}
            <div className="w-32 h-32 mx-auto relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full animate-pulse"></div>
              <div className="absolute inset-4 bg-gradient-to-r from-blue-400/40 to-purple-400/40 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              <div className="absolute inset-8 bg-gradient-to-r from-blue-400/60 to-purple-400/60 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Bell className="h-12 w-12 text-blue-600 animate-float" />
              </div>
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No notifications yet</h3>
          <p className="text-gray-600 mb-4">
            {filter === "unread" 
              ? "You're all caught up! No unread notifications."
              : filter === "read"
              ? "No read notifications to show."
              : "Monitor more keywords to get alerts!"
            }
          </p>
          {filter === "all" && (
            <div className="glass-card inline-block px-6 py-3 rounded-xl">
              <a href="/keywords" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                <Sparkles className="inline h-4 w-4 mr-1" />
                Add Keywords →
              </a>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {groupedNotifications.map((group) => (
            <div key={group.date} className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {group.isToday ? (
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  ) : (
                    <Calendar className="h-4 w-4 text-gray-500" />
                  )}
                  <h3 className="text-sm font-semibold text-gray-700">
                    {group.isToday ? 'Today' : group.date}
                  </h3>
                </div>
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="text-xs text-gray-500">{group.notifications.length} notifications</span>
              </div>
              
              <div className="space-y-3">
                {group.notifications.map((notification) => (
            <div
              key={notification.id}
                    className={`glass-card rounded-xl p-4 transition-all duration-300 hover-lift ${
                      !notification.is_read ? 'ring-2 ring-blue-200 animate-slide-in-right' : ''
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getNotificationIcon(notification.notification_type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900">
                        {notification.message}
                      </p>
                      {!notification.is_read && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                          New
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">
                              {new Date(notification.created_at).toLocaleTimeString()}
                      </span>
                      
                      {!notification.is_read && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Mark as read"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {notification.related_post && (
                    <div className="mt-2">
                      <a
                        href={`/posts/${notification.related_post}`}
                              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        View related post →
                      </a>
                    </div>
                  )}
                  
                  {notification.related_reply && (
                    <div className="mt-2">
                      <a
                        href={`/replies/${notification.related_reply}`}
                              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        View related reply →
                      </a>
                    </div>
                  )}
                </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Live Activity Feed */}
      {previewMode && (
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Live Activity Feed</h3>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Live</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-white/50 rounded-xl animate-slide-in-right">
              <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg text-white">
                <MessageSquare className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">AI Reply Posted Successfully</p>
                <p className="text-xs text-gray-600">2 minutes ago</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-white/50 rounded-xl animate-slide-in-right" style={{ animationDelay: '0.5s' }}>
              <div className="p-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg text-white">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">High Priority Lead Detected</p>
                <p className="text-xs text-gray-600">5 minutes ago</p>
          </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 