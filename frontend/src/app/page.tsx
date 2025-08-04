"use client"

import { useEffect, useState } from "react"
import { apiClient, DashboardStats, Group } from "@/lib/api"
import { formatNumber } from "@/lib/utils"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import {
  TrendingUp,
  Target,
  MessageSquare,
  Users,
  Activity,
  Clock,
  Zap,
  Eye,
  MessageCircle,
  BarChart3,
  Sparkles,
  Globe,
  Bell,
  Play,
  Trash2,
  RefreshCw,
  ChevronDown
} from "lucide-react"

const COLORS = ["#10B981", "#F59E0B", "#EF4444", "#DC2626"]

// Safe time display component
function TimeDisplay() {
  const [time, setTime] = useState<string>("")
  
  useEffect(() => {
    setTime(new Date().toLocaleTimeString())
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString())
    }, 1000)
    return () => clearInterval(interval)
  }, [])
  
  return <span className="font-mono text-sm">{time}</span>
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [testRunning, setTestRunning] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [groups, setGroups] = useState<Group[]>([])
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null)
  const [showGroupDropdown, setShowGroupDropdown] = useState(false)

  const fetchStats = async () => {
    try {
      const data = await apiClient.getDashboardStats()
      setStats(data)
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchGroups = async () => {
    try {
      const data = await apiClient.getGroups()
      setGroups(data)
    } catch (error) {
      console.error("Error fetching groups:", error)
    }
  }

  useEffect(() => {
    fetchStats()
    fetchGroups()
  }, [])

  const runTest = async () => {
    setTestRunning(true)
    try {
      const response = await fetch('http://localhost:8000/api/dashboard/run_test/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          group_id: selectedGroupId
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        const groupInfo = data.group ? ` for ${data.group.name}` : ''
        alert(`Test completed successfully${groupInfo}! ${data.posts_saved} posts saved, ${data.posts_processed} processed, ${data.opportunities_found} opportunities found.`)
        await fetchStats() // Refresh stats
      } else {
        const errorData = await response.json()
        alert(`Test failed: ${errorData.message}`)
      }
    } catch (error) {
      console.error('Error running test:', error)
      alert('Error running test. Please try again.')
    } finally {
      setTestRunning(false)
    }
  }

  const clearPosts = async () => {
    if (!confirm('Are you sure you want to clear all scraped posts? This action cannot be undone.')) {
      return
    }
    
    setClearing(true)
    try {
      const response = await fetch('http://localhost:8000/api/dashboard/clear_posts/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        alert(`All posts cleared successfully! Deleted ${data.posts_deleted} posts, ${data.classifications_deleted} classifications, ${data.replies_deleted} replies.`)
        await fetchStats() // Refresh stats
      } else {
        const errorData = await response.json()
        alert(`Failed to clear posts: ${errorData.message}`)
      }
    } catch (error) {
      console.error('Error clearing posts:', error)
      alert('Error clearing posts. Please try again.')
    } finally {
      setClearing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center animate-spin mb-4">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Zap className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error loading dashboard</h2>
          <p className="text-gray-600">Please check your connection and try again.</p>
        </div>
      </div>
    )
  }

  const priorityData = [
    { name: "Low", value: 15, color: "#10B981" },
    { name: "Medium", value: 25, color: "#F59E0B" },
    { name: "High", value: 35, color: "#EF4444" },
    { name: "Urgent", value: 10, color: "#DC2626" },
  ]

  const weeklyData = [
    { day: "Mon", posts: 45, opportunities: 12, replies: 8 },
    { day: "Tue", posts: 52, opportunities: 15, replies: 10 },
    { day: "Wed", posts: 38, opportunities: 9, replies: 6 },
    { day: "Thu", posts: 61, opportunities: 18, replies: 12 },
    { day: "Fri", posts: 48, opportunities: 14, replies: 9 },
    { day: "Sat", posts: 35, opportunities: 8, replies: 5 },
    { day: "Sun", posts: 42, opportunities: 11, replies: 7 },
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's your Reddit lead overview.</p>
        </div>
        <div className="flex items-center space-x-4">
          {/* Control Buttons */}
          <div className="flex space-x-2">
            {/* Group Selection Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowGroupDropdown(!showGroupDropdown)}
                className="glass-card px-4 py-2 rounded-xl flex items-center space-x-2 hover-lift"
              >
                <Target className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {selectedGroupId 
                    ? groups.find(g => g.id === selectedGroupId)?.name || 'Select Group'
                    : 'All Groups'
                  }
                </span>
                <ChevronDown className="h-4 w-4" />
              </button>
              
              {showGroupDropdown && (
                <div className="absolute top-full left-0 mt-2 glass-card rounded-xl shadow-lg z-50 min-w-48">
                  <div className="p-2">
                    <button
                      onClick={() => {
                        setSelectedGroupId(null)
                        setShowGroupDropdown(false)
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/20 text-sm font-medium"
                    >
                      All Groups
                    </button>
                    {groups.map((group) => (
                      <button
                        key={group.id}
                        onClick={() => {
                          setSelectedGroupId(group.id)
                          setShowGroupDropdown(false)
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/20 text-sm"
                      >
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full bg-${group.color}-500`}></div>
                          <span>{group.name}</span>
                          <span className="text-xs text-gray-500">
                            ({group.keywords_count}k, {group.subreddits_count}s)
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <button
              onClick={runTest}
              disabled={testRunning}
              className="glass-card px-4 py-2 rounded-xl flex items-center space-x-2 hover-lift disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {testRunning ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              <span className="text-sm font-medium">
                {testRunning ? 'Running Test...' : 'Run Test'}
              </span>
            </button>
            
            <button
              onClick={clearPosts}
              disabled={clearing}
              className="glass-card px-4 py-2 rounded-xl flex items-center space-x-2 hover-lift disabled:opacity-50 disabled:cursor-not-allowed border border-red-200 hover:border-red-300"
            >
              {clearing ? (
                <RefreshCw className="h-4 w-4 animate-spin text-red-500" />
              ) : (
                <Trash2 className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm font-medium text-red-600">
                {clearing ? 'Clearing...' : 'Clear Posts'}
              </span>
            </button>
          </div>
          
          <div className="glass-card px-4 py-2 rounded-xl">
            <div className="text-sm text-gray-600">
              Last updated: <TimeDisplay />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card rounded-2xl p-6 hover-lift group">
          <div className="flex items-center justify-between">
            <div className="p-3 gradient-primary rounded-xl">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-600">Total Posts</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.total_posts)}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="gradient-primary h-2 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${Math.min((stats.total_posts / 1000) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 hover-lift group">
          <div className="flex items-center justify-between">
            <div className="p-3 gradient-secondary rounded-xl">
              <Target className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-600">Opportunities</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.opportunities_found)}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="gradient-secondary h-2 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${Math.min((stats.opportunities_found / 100) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 hover-lift group">
          <div className="flex items-center justify-between">
            <div className="p-3 gradient-accent rounded-xl">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-600">Replies Posted</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.replies_posted)}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="gradient-accent h-2 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${Math.min((stats.replies_posted / 50) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 hover-lift group">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-gradient-to-r from-green-400 to-blue-500 rounded-xl">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-600">Engagement Rate</p>
              <p className="text-2xl font-bold text-gray-900">{stats.engagement_rate}%</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${stats.engagement_rate}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Activity */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Today's Activity</h2>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">Live Updates</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center space-x-4 p-4 bg-white/50 rounded-xl hover-lift">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Eye className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Posts Scraped</p>
              <p className="text-2xl font-bold text-gray-900">{stats.today_posts}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 p-4 bg-white/50 rounded-xl hover-lift">
            <div className="p-3 bg-green-100 rounded-xl">
              <Target className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Opportunities</p>
              <p className="text-2xl font-bold text-gray-900">{stats.today_opportunities}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 p-4 bg-white/50 rounded-xl hover-lift">
            <div className="p-3 bg-purple-100 rounded-xl">
              <MessageCircle className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Replies Posted</p>
              <p className="text-2xl font-bold text-gray-900">{stats.today_replies}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Activity Chart */}
        <div className="glass-card rounded-2xl p-6 hover-lift">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Weekly Activity</h3>
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <span className="text-sm text-gray-600">Interactive</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="day" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #E5E7EB',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Line type="monotone" dataKey="posts" stroke="#3B82F6" strokeWidth={3} dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }} />
              <Line type="monotone" dataKey="opportunities" stroke="#10B981" strokeWidth={3} dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }} />
              <Line type="monotone" dataKey="replies" stroke="#8B5CF6" strokeWidth={3} dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Priority Distribution */}
        <div className="glass-card rounded-2xl p-6 hover-lift">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Priority Distribution</h3>
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-red-600" />
              <span className="text-sm text-gray-600">Real-time</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={priorityData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {priorityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #E5E7EB',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Subreddits */}
      <div className="glass-card rounded-2xl p-6 hover-lift">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Top Subreddits</h3>
          <div className="flex items-center space-x-2">
            <Globe className="h-5 w-5 text-blue-600" />
            <span className="text-sm text-gray-600">This Week</span>
          </div>
        </div>
        <div className="space-y-4">
          {stats.top_subreddits.map((subreddit, index) => (
            <div key={subreddit.subreddit} className="flex items-center justify-between p-4 bg-white/50 rounded-xl hover-lift">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center text-white font-bold text-sm">
                  {index + 1}
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-900">r/{subreddit.subreddit}</span>
                  <p className="text-xs text-gray-500">Active community</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-gray-900">{subreddit.count}</span>
                <p className="text-xs text-gray-500">posts</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Notifications */}
      <div className="glass-card rounded-2xl p-6 hover-lift">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Recent Notifications</h3>
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-blue-600" />
            <span className="text-sm text-gray-600">Live</span>
          </div>
        </div>
        <div className="space-y-3">
          {stats.recent_notifications.slice(0, 5).map((notification, index) => (
            <div key={notification.id} className="flex items-start space-x-3 p-4 bg-white/50 rounded-xl hover-lift">
              <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-2 animate-pulse"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900 font-medium">{notification.message}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {notification.created_at}
                </p>
              </div>
              {index === 0 && (
                <div className="px-2 py-1 bg-gradient-to-r from-green-400 to-blue-500 text-white text-xs rounded-full">
                  New
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

