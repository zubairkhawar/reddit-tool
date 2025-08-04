'use client'

import { useState, useEffect } from 'react'
import { apiClient, Leaderboard } from '@/lib/api'
import { 
  Trophy, 
  TrendingUp, 
  Target, 
  MessageSquare, 
  Crown,
  Medal,
  Star,
  Zap,
  Flame,
  Sparkles,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  Users,
  Calendar,
  Award
} from 'lucide-react'

const rankConfigs = {
  1: { icon: Crown, color: "from-yellow-400 to-yellow-600", bgColor: "bg-gradient-to-r from-yellow-400 to-yellow-600" },
  2: { icon: Medal, color: "from-gray-400 to-gray-600", bgColor: "bg-gradient-to-r from-gray-400 to-gray-600" },
  3: { icon: Star, color: "from-orange-400 to-orange-600", bgColor: "bg-gradient-to-r from-orange-400 to-orange-600" }
}

const streakConfig = {
  high: { icon: Flame, color: "from-red-500 to-orange-500", text: "Hot Streak" },
  medium: { icon: Zap, color: "from-yellow-500 to-orange-500", text: "On Fire" },
  low: { icon: Sparkles, color: "from-blue-500 to-purple-500", text: "Rising" }
}

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

  const getStreakLevel = (engagement: number) => {
    if (engagement > 1000) return streakConfig.high
    if (engagement > 500) return streakConfig.medium
    return streakConfig.low
  }

  const getRankChange = (index: number) => {
    // Simulate rank changes
    const changes = [2, -1, 0, 1, -2, 3, -1, 0]
    return changes[index % changes.length]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center animate-spin mb-4">
            <Trophy className="h-8 w-8 text-white" />
          </div>
          <p className="text-gray-600 font-medium">Loading leaderboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Performance Leaderboard
          </h1>
          <p className="text-gray-600 mt-1">Track your top-performing metrics and achievements</p>
        </div>
        <div className="glass-card px-4 py-2 rounded-xl">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-transparent border-none outline-none text-sm font-medium text-gray-700"
          >
            <option value="all">All Metrics</option>
            <option value="keyword">Keywords</option>
            <option value="subreddit">Subreddits</option>
            <option value="reply_template">Reply Templates</option>
          </select>
        </div>
      </div>

      {/* Top Performers Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card rounded-2xl p-6 hover-lift">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-xl">
              <Crown className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Top Performer</p>
              <p className="text-xl font-bold text-gray-900">Keyword: "web development"</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-yellow-600">1,247</div>
            <div className="text-sm text-gray-600">Total Engagement</div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 hover-lift">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-r from-green-400 to-blue-500 rounded-xl">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Best Streak</p>
              <p className="text-xl font-bold text-gray-900">7 Days</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-green-600">94.2%</div>
            <div className="text-sm text-gray-600">Success Rate</div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 hover-lift">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-r from-purple-400 to-pink-500 rounded-xl">
              <Award className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">This Week</p>
              <p className="text-xl font-bold text-gray-900">+23% Growth</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-purple-600">156</div>
            <div className="text-sm text-gray-600">New Leads</div>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="space-y-4">
        {leaderboard.map((item, index) => {
          const rank = index + 1
          const rankConfig = rank <= 3 ? rankConfigs[rank as keyof typeof rankConfigs] : null
          const RankIcon = rankConfig?.icon
          const streakLevel = getStreakLevel(item.total_engagement)
          const StreakIcon = streakLevel.icon
          const rankChange = getRankChange(index)

          return (
            <div
              key={item.id}
              className="glass-card rounded-2xl p-6 hover-lift group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Rank Badge */}
                  <div className="relative">
                    {rankConfig && RankIcon ? (
                      <div className={`w-12 h-12 ${rankConfig.bgColor} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                        <RankIcon className="h-6 w-6" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-white/50 rounded-xl flex items-center justify-center border-2 border-gray-200">
                        <span className="text-lg font-bold text-gray-700">{rank}</span>
                      </div>
                    )}
                    
                    {/* Rank Change Indicator */}
                    {rankChange !== 0 && (
                      <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                        rankChange > 0 ? 'bg-green-500' : 'bg-red-500'
                      }`}>
                        {rankChange > 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                      </div>
                    )}
                  </div>

                  {/* Avatar and Info */}
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {item.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        {getMetricIcon(item.metric_type)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMetricColor(item.metric_type)}`}>
                          {item.metric_type.replace('_', ' ')}
                        </span>
                        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full bg-gradient-to-r ${streakLevel.color} text-white text-xs`}>
                          <StreakIcon className="h-3 w-3" />
                          <span>{streakLevel.text}</span>
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {item.name}
                      </h3>
                    </div>
                  </div>
                </div>
                
                {/* Stats */}
                <div className="text-right">
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {item.total_engagement.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Total Engagement</div>
                </div>
              </div>

              {/* Detailed Stats */}
              <div className="grid grid-cols-4 gap-4 mt-6">
                <div className="text-center p-3 bg-white/50 rounded-xl">
                  <div className="text-lg font-semibold text-gray-900">{item.total_posts}</div>
                  <div className="text-xs text-gray-600">Posts</div>
                </div>
                <div className="text-center p-3 bg-white/50 rounded-xl">
                  <div className="text-lg font-semibold text-gray-900">{item.total_opportunities}</div>
                  <div className="text-xs text-gray-600">Opportunities</div>
                </div>
                <div className="text-center p-3 bg-white/50 rounded-xl">
                  <div className="text-lg font-semibold text-gray-900">{item.total_replies}</div>
                  <div className="text-xs text-gray-600">Replies</div>
                </div>
                <div className="text-center p-3 bg-white/50 rounded-xl">
                  <div className="text-lg font-semibold text-green-600">
                    {item.success_rate.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-600">Success Rate</div>
                </div>
              </div>

              {/* Last Updated */}
              <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-3 w-3" />
                  <span>Last updated: {new Date(item.last_updated).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-3 w-3" />
                  <span>Active for 23 days</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {leaderboard.length === 0 && (
        <div className="text-center py-16">
          <div className="relative mb-8">
            <div className="w-32 h-32 mx-auto relative">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-full animate-pulse"></div>
              <div className="absolute inset-4 bg-gradient-to-r from-yellow-400/40 to-orange-400/40 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Trophy className="h-12 w-12 text-yellow-600 animate-float" />
              </div>
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Data Yet</h3>
          <p className="text-gray-600 mb-4">Start monitoring posts and generating replies to see performance metrics here.</p>
          <div className="glass-card inline-block px-6 py-3 rounded-xl">
            <p className="text-sm text-gray-600">
              <Sparkles className="inline h-4 w-4 mr-1 text-yellow-600" />
              Pro Tip: Engage with more leads to climb the leaderboard
            </p>
          </div>
        </div>
      )}
    </div>
  )
} 