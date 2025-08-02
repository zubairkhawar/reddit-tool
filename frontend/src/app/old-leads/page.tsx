'use client'

import { useState, useEffect } from 'react'
import { apiClient, RedditPost } from '@/lib/api'
import { Monitor, TrendingUp, MessageSquare, Eye, EyeOff } from 'lucide-react'

export default function OldLeadsPage() {
  const [oldLeads, setOldLeads] = useState<RedditPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOldLeads()
  }, [])

  const loadOldLeads = async () => {
    try {
      setLoading(true)
      const data = await apiClient.getOldLeads()
      setOldLeads(data)
    } catch (error) {
      console.error('Error loading old leads:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleMonitoring = async (postId: number, enabled: boolean) => {
    try {
      if (enabled) {
        await apiClient.enableMonitoring(postId)
      } else {
        await apiClient.disableMonitoring(postId)
      }
      loadOldLeads() // Reload data
    } catch (error) {
      console.error('Error toggling monitoring:', error)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Old Leads Monitoring</h1>
        <div className="flex items-center space-x-2">
          <Monitor className="w-5 h-5 text-blue-500" />
          <span className="text-sm text-gray-500">
            {oldLeads.filter(lead => lead.monitoring_enabled).length} being monitored
          </span>
        </div>
      </div>

      <div className="grid gap-6">
        {oldLeads.map((lead) => (
          <div
            key={lead.id}
            className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-lg font-semibold">{lead.title}</h3>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {lead.subreddit}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-4">{lead.content.substring(0, 200)}...</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold">{lead.score}</div>
                    <div className="text-xs text-gray-500">Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold">{lead.comment_count}</div>
                    <div className="text-xs text-gray-500">Comments</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold">
                      {lead.engagement_increased ? (
                        <TrendingUp className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">Engagement</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold">{lead.new_comments_since_last_check}</div>
                    <div className="text-xs text-gray-500">New Comments</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Author: {lead.author}</span>
                  <span>Created: {new Date(lead.created_at).toLocaleDateString()}</span>
                </div>

                {lead.last_monitored_at && (
                  <div className="mt-2 text-xs text-gray-400">
                    Last monitored: {new Date(lead.last_monitored_at).toLocaleString()}
                  </div>
                )}
              </div>

              <div className="flex flex-col space-y-2 ml-4">
                <button
                  onClick={() => toggleMonitoring(lead.id, !lead.monitoring_enabled)}
                  className={`flex items-center space-x-1 px-3 py-1 rounded text-xs font-medium ${
                    lead.monitoring_enabled
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {lead.monitoring_enabled ? (
                    <>
                      <Eye className="w-3 h-3" />
                      <span>Monitoring</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3 h-3" />
                      <span>Paused</span>
                    </>
                  )}
                </button>

                <a
                  href={lead.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 px-3 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200"
                >
                  <MessageSquare className="w-3 h-3" />
                  <span>View Post</span>
                </a>
              </div>
            </div>

            {lead.follow_up_sent && (
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <MessageSquare className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">Follow-up Sent</span>
                </div>
                <p className="text-sm text-yellow-700">{lead.follow_up_content}</p>
                <div className="text-xs text-yellow-600 mt-1">
                  Sent: {new Date(lead.follow_up_sent_at!).toLocaleString()}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {oldLeads.length === 0 && (
        <div className="text-center py-12">
          <Monitor className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Old Leads</h3>
          <p className="text-gray-500">
            Posts will appear here once they've been processed and are being monitored for new activity.
          </p>
        </div>
      )}
    </div>
  )
} 