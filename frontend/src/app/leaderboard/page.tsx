'use client'

import { useState, useEffect } from 'react'
import { apiClient, Leaderboard } from '@/lib/api'
import { Trophy, TrendingUp, Target, MessageSquare } from 'lucide-react'

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<Leaderboard[]>([])
  const [selectedType, setSelectedType] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLeaderboard()
  }, [selectedType])

  const loadLeaderboard = async () => {
    try {
      setLoading(true)
      const data = await apiClient.getLeaderboard(selectedType === 'all' ? undefined : selectedType)
      setLeaderboard(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error loading leaderboard:', error)
      setLeaderboard([])
    } finally {
      setLoading(false)
    }
  }

  const getMetricIcon = (type: string) => {
    switch (type) {
      case 'keyword':
        return <Target className="w-5 h-5" />
      case 'subreddit':
        return <TrendingUp className="w-5 h-5" />
      case 'reply_template':
        return <MessageSquare className="w-5 h-5" />
      default:
        return <Trophy className="w-5 h-5" />
    }
  }

  const getMetricColor = (type: string) => {
    switch (type) {
      case 'keyword':
        return 'bg-blue-100 text-blue-800'
      case 'subreddit':
        return 'bg-green-100 text-green-800'
      case 'reply_template':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Performance Leaderboard</h1>
        <div className="flex space-x-2">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Metrics</option>
            <option value="keyword">Keywords</option>
            <option value="subreddit">Subreddits</option>
            <option value="reply_template">Reply Templates</option>
          </select>
        </div>
      </div>

      <div className="grid gap-6">
        {leaderboard.map((item, index) => (
          <div
            key={item.id}
            className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                  <span className="text-blue-600 font-bold">{index + 1}</span>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    {getMetricIcon(item.metric_type)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMetricColor(item.metric_type)}`}>
                      {item.metric_type.replace('_', ' ')}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold mt-1">{item.name}</h3>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  {item.total_engagement}
                </div>
                <div className="text-sm text-gray-500">Total Engagement</div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mt-4">
              <div className="text-center">
                <div className="text-lg font-semibold">{item.total_posts}</div>
                <div className="text-xs text-gray-500">Posts</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold">{item.total_opportunities}</div>
                <div className="text-xs text-gray-500">Opportunities</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold">{item.total_replies}</div>
                <div className="text-xs text-gray-500">Replies</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-green-600">
                  {item.success_rate.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500">Success Rate</div>
              </div>
            </div>

            <div className="mt-4 text-xs text-gray-500">
              Last updated: {new Date(item.last_updated).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      {leaderboard.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Yet</h3>
          <p className="text-gray-500">
            Start monitoring posts and generating replies to see performance metrics here.
          </p>
        </div>
      )}
    </div>
  )
} 