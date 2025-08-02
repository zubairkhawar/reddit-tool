"use client"

import { useEffect, useState } from "react"
import { apiClient, DashboardStats } from "@/lib/api"
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, BarChart, Bar, Legend } from "recharts"
import { TrendingUp, MessageSquare, Target, Activity } from "lucide-react"

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"]

export default function AnalyticsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await apiClient.getDashboardStats()
        setStats(data)
      } catch (error) {
        console.error("Error fetching analytics stats:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  // Example weekly data (replace with real API data if available)
  const weeklyData = [
    { day: "Mon", posts: 45, opportunities: 12, replies: 8 },
    { day: "Tue", posts: 52, opportunities: 15, replies: 10 },
    { day: "Wed", posts: 38, opportunities: 9, replies: 6 },
    { day: "Thu", posts: 61, opportunities: 18, replies: 12 },
    { day: "Fri", posts: 48, opportunities: 14, replies: 9 },
    { day: "Sat", posts: 35, opportunities: 8, replies: 5 },
    { day: "Sun", posts: 42, opportunities: 11, replies: 7 },
  ]

  const engagementData = [
    { name: "Replies", value: stats?.replies_posted || 0 },
    { name: "Opportunities", value: stats?.opportunities_found || 0 },
    { name: "Posts", value: stats?.total_posts || 0 },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Error loading analytics</h2>
          <p className="text-gray-600">Please check your connection and try again.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Engagement Pie Chart */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Engagement Breakdown</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={engagementData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
              outerRadius={100}
              fill="#3B82F6"
              dataKey="value"
            >
              {engagementData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Weekly Activity Line Chart */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Weekly Activity</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="posts" stroke="#3B82F6" strokeWidth={2} />
            <Line type="monotone" dataKey="opportunities" stroke="#10B981" strokeWidth={2} />
            <Line type="monotone" dataKey="replies" stroke="#8B5CF6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top Subreddits Bar Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Subreddits</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stats.top_subreddits}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="subreddit" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#3B82F6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
} 