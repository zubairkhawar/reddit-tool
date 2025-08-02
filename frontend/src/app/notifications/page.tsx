"use client"

import { useEffect, useState } from "react"
import { apiClient, Notification } from "@/lib/api"
import { formatDate } from "@/lib/utils"
import { Bell, Check, Eye, AlertCircle, Info, ExternalLink } from "lucide-react"

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("all")

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

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "high_priority":
        return <AlertCircle className="h-5 w-5 text-red-500" />
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <div className="flex items-center space-x-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Notifications</option>
            <option value="unread">Unread Only</option>
            <option value="read">Read Only</option>
          </select>
          {unreadCount > 0 && (
            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
              {unreadCount} unread
            </span>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
          <p className="text-gray-600">
            {filter === "unread" 
              ? "You're all caught up! No unread notifications."
              : filter === "read"
              ? "No read notifications to show."
              : "No notifications yet. They'll appear here when there's activity."
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`border rounded-lg p-4 ${getNotificationColor(notification.notification_type)} ${
                !notification.is_read ? "ring-2 ring-blue-200" : ""
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
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          New
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">
                        {formatDate(notification.created_at)}
                      </span>
                      
                      {!notification.is_read && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="p-1 text-gray-400 hover:text-gray-600"
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
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        View related post →
                      </a>
                    </div>
                  )}
                  
                  {notification.related_reply && (
                    <div className="mt-2">
                      <a
                        href={`/replies/${notification.related_reply}`}
                        className="text-xs text-blue-600 hover:text-blue-800"
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
      )}

      {/* Notification Types Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Types</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <div>
              <div className="text-sm font-medium text-gray-900">High Priority</div>
              <div className="text-xs text-gray-500">Urgent opportunities detected</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Check className="h-5 w-5 text-green-500" />
            <div>
              <div className="text-sm font-medium text-gray-900">Reply Posted</div>
              <div className="text-xs text-gray-500">AI replies successfully posted</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <ExternalLink className="h-5 w-5 text-blue-500" />
            <div>
              <div className="text-sm font-medium text-gray-900">Engagement</div>
              <div className="text-xs text-gray-500">High engagement on replies</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 