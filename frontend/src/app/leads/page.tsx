"use client"

import { useEffect, useState } from "react"
import { apiClient, LeadSummary } from "@/lib/api"
import { formatDate, getPriorityColor } from "@/lib/utils"
import { 
  ExternalLink, 
  MessageSquare, 
  TrendingUp, 
  Clock, 
  Search,
  Zap,
  Target,
  Sparkles,
  Eye,
  MessageCircle,
  DollarSign,
  Users,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock as ClockIcon
} from "lucide-react"

const priorityConfig = {
  urgent: {
    color: "from-red-500 to-red-600",
    bgColor: "bg-gradient-to-r from-red-500 to-red-600",
    icon: AlertTriangle,
    glow: "animate-pulse-glow"
  },
  high: {
    color: "from-orange-500 to-red-500",
    bgColor: "bg-gradient-to-r from-orange-500 to-red-500",
    icon: Target,
    glow: ""
  },
  medium: {
    color: "from-yellow-500 to-orange-500",
    bgColor: "bg-gradient-to-r from-yellow-500 to-orange-500",
    icon: ClockIcon,
    glow: ""
  },
  low: {
    color: "from-green-500 to-blue-500",
    bgColor: "bg-gradient-to-r from-green-500 to-blue-500",
    icon: CheckCircle,
    glow: ""
  }
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<LeadSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const data = await apiClient.getLeads()
        setLeads(data)
      } catch (error) {
        console.error("Error fetching leads:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchLeads()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center animate-spin mb-4">
            <Search className="h-8 w-8 text-white" />
          </div>
          <p className="text-gray-600 font-medium">Scanning for leads...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Live Leads
          </h1>
          <p className="text-gray-600 mt-1">Real-time high-priority opportunities</p>
        </div>
        <div className="glass-card px-4 py-2 rounded-xl">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">{leads.length} opportunities found</span>
          </div>
        </div>
      </div>

      {leads.length === 0 ? (
        <div className="text-center py-16">
          <div className="relative mb-8">
            {/* Animated radar illustration */}
            <div className="w-32 h-32 mx-auto relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full animate-pulse"></div>
              <div className="absolute inset-4 bg-gradient-to-r from-blue-400/40 to-purple-400/40 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              <div className="absolute inset-8 bg-gradient-to-r from-blue-400/60 to-purple-400/60 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Search className="h-12 w-12 text-blue-600 animate-float" />
              </div>
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No leads found</h3>
          <p className="text-gray-600 mb-4">We're scanning Reddit for high-priority opportunities.</p>
          <div className="glass-card inline-block px-6 py-3 rounded-xl">
            <p className="text-sm text-gray-600">
              <Sparkles className="inline h-4 w-4 mr-1 text-blue-600" />
              Pro Tip: Add more keywords to uncover high-priority leads
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-6">
          {leads.map((lead) => {
            const priority = lead.classification.priority.toLowerCase()
            const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.medium
            const PriorityIcon = config.icon

            return (
              <div key={lead.post.id} className="glass-card rounded-2xl p-6 hover-lift group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 ${config.bgColor} rounded-xl text-white ${config.glow}`}>
                      <PriorityIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <span className={`px-3 py-1 text-xs font-bold rounded-full text-white ${config.bgColor} shadow-lg`}>
                      {lead.classification.priority.toUpperCase()}
                    </span>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-sm text-gray-600">r/{lead.post.subreddit}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-sm text-gray-600">u/{lead.post.author}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {lead.classification.budget_mentioned && (
                      <div className="flex items-center space-x-1 px-3 py-1 bg-green-100 rounded-full">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-700">
                          {lead.classification.budget_amount}
                    </span>
                      </div>
                    )}
                    <div className="flex items-center space-x-1 px-3 py-1 bg-blue-100 rounded-full">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-700">
                        {lead.engagement_score} pts
                    </span>
                    </div>
                  </div>
                  </div>

                <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                    {lead.post.title}
                  </h3>

                  {lead.post.content && (
                  <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                      {lead.post.content}
                    </p>
                  )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="p-4 bg-white/50 rounded-xl">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                      <Target className="h-4 w-4 mr-2 text-blue-600" />
                      Summary
                    </h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{lead.classification.summary}</p>
                    </div>
                  <div className="p-4 bg-white/50 rounded-xl">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                      <Zap className="h-4 w-4 mr-2 text-purple-600" />
                      Services Needed
                    </h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{lead.classification.services_needed}</p>
                    </div>
                  </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>{formatDate(lead.post.created_at)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MessageCircle className="h-4 w-4" />
                      <span>{lead.post.comment_count} comments</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4" />
                      <span>{lead.post.score} points</span>
                  </div>
                </div>

                  <a
                    href={lead.post.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 hover-lift"
                  >
                    <span className="text-sm font-medium">View on Reddit</span>
                    <ExternalLink className="h-4 w-4" />
                  </a>
              </div>

              {/* Replies Section */}
              {lead.replies.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-white/20">
                    <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
                      <MessageSquare className="h-4 w-4 mr-2 text-green-600" />
                      Our Replies
                    </h4>
                  <div className="space-y-3">
                    {lead.replies.map((reply) => (
                        <div key={reply.id} className="bg-white/50 rounded-xl p-4 hover-lift">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              {reply.status === 'posted' && (
                                <div className="flex items-center space-x-1 px-2 py-1 bg-green-100 rounded-full">
                                  <CheckCircle className="h-3 w-3 text-green-600" />
                                  <span className="text-xs font-medium text-green-700">Posted</span>
                                </div>
                              )}
                              {reply.status === 'pending' && (
                                <div className="flex items-center space-x-1 px-2 py-1 bg-yellow-100 rounded-full">
                                  <ClockIcon className="h-3 w-3 text-yellow-600" />
                                  <span className="text-xs font-medium text-yellow-700">Pending</span>
                                </div>
                              )}
                              {reply.status === 'failed' && (
                                <div className="flex items-center space-x-1 px-2 py-1 bg-red-100 rounded-full">
                                  <XCircle className="h-3 w-3 text-red-600" />
                                  <span className="text-xs font-medium text-red-700">Failed</span>
                                </div>
                              )}
                            </div>
                          <span className="text-xs text-gray-500">
                            {formatDate(reply.created_at)}
                          </span>
                        </div>
                          <p className="text-sm text-gray-700 leading-relaxed">{reply.display_content || reply.content}</p>
                        {reply.upvotes > 0 && (
                            <div className="flex items-center space-x-2 mt-3 text-xs text-gray-500">
                            <TrendingUp className="h-3 w-3" />
                            <span>{reply.upvotes} upvotes</span>
                            {reply.reply_count > 0 && (
                              <>
                                <span>•</span>
                                <span>{reply.reply_count} replies</span>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            )
          })}
        </div>
      )}
    </div>
  )
} 