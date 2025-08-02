"use client"

import { useEffect, useState } from "react"
import { apiClient, LeadSummary } from "@/lib/api"
import { formatDate, getPriorityColor } from "@/lib/utils"
import { ExternalLink, MessageSquare, TrendingUp, Clock } from "lucide-react"

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
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Live Leads</h1>
        <div className="text-sm text-gray-500">
          {leads.length} high-priority opportunities
        </div>
      </div>

      {leads.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No leads found</h3>
          <p className="text-gray-600">High-priority opportunities will appear here.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {leads.map((lead) => (
            <div key={lead.post.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(
                        lead.classification.priority
                      )}`}
                    >
                      {lead.classification.priority.toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-500">
                      r/{lead.post.subreddit}
                    </span>
                    <span className="text-sm text-gray-500">
                      by u/{lead.post.author}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {lead.post.title}
                  </h3>

                  {lead.post.body && (
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {lead.post.body}
                    </p>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Summary</h4>
                      <p className="text-sm text-gray-600">{lead.classification.summary}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Services Needed</h4>
                      <p className="text-sm text-gray-600">{lead.classification.services_needed}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{formatDate(lead.post.created_utc)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageSquare className="h-4 w-4" />
                      <span>{lead.post.num_comments} comments</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="h-4 w-4" />
                      <span>{lead.post.score} points</span>
                    </div>
                  </div>
                </div>

                <div className="ml-6 flex flex-col items-end space-y-3">
                  <a
                    href={lead.post.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
                  >
                    <span>View on Reddit</span>
                    <ExternalLink className="h-4 w-4" />
                  </a>

                  {lead.classification.budget_mentioned && (
                    <div className="text-sm">
                      <span className="text-gray-500">Budget: </span>
                      <span className="font-medium text-green-600">
                        {lead.classification.budget_amount}
                      </span>
                    </div>
                  )}

                  <div className="text-sm">
                    <span className="text-gray-500">Engagement: </span>
                    <span className="font-medium text-blue-600">
                      {lead.engagement_score} points
                    </span>
                  </div>
                </div>
              </div>

              {/* Replies Section */}
              {lead.replies.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Our Replies</h4>
                  <div className="space-y-3">
                    {lead.replies.map((reply) => (
                      <div key={reply.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(
                              reply.status
                            )}`}
                          >
                            {reply.status.toUpperCase()}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(reply.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{reply.content}</p>
                        {reply.upvotes > 0 && (
                          <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500">
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
          ))}
        </div>
      )}
    </div>
  )
} 