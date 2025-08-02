"use client"

import { useEffect, useState } from "react"
import { apiClient, Reply } from "@/lib/api"
import { formatDate, getStatusColor } from "@/lib/utils"
import { Check, X, ExternalLink, MessageSquare, TrendingUp } from "lucide-react"

export default function RepliesPage() {
  const [replies, setReplies] = useState<Reply[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("")

  useEffect(() => {
    const fetchReplies = async () => {
      try {
        const params = statusFilter ? { status: statusFilter } : undefined
        const data = await apiClient.getReplies(params)
        setReplies(data.results)
      } catch (error) {
        console.error("Error fetching replies:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchReplies()
  }, [statusFilter])

  const handleApprove = async (replyId: number) => {
    try {
      await apiClient.approveReply(replyId)
      // Refresh the list
      const data = await apiClient.getReplies(statusFilter ? { status: statusFilter } : undefined)
      setReplies(data.results)
    } catch (error) {
      console.error("Error approving reply:", error)
    }
  }

  const handleReject = async (replyId: number) => {
    try {
      await apiClient.rejectReply(replyId)
      // Refresh the list
      const data = await apiClient.getReplies(statusFilter ? { status: statusFilter } : undefined)
      setReplies(data.results)
    } catch (error) {
      console.error("Error rejecting reply:", error)
    }
  }

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
        <h1 className="text-2xl font-bold text-gray-900">Replies</h1>
        <div className="flex items-center space-x-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="posted">Posted</option>
            <option value="rejected">Rejected</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {replies.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No replies found</h3>
          <p className="text-gray-600">
            {statusFilter ? `No replies with status "${statusFilter}"` : "No replies have been generated yet."}
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {replies.map((reply) => (
            <div key={reply.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        reply.status
                      )}`}
                    >
                      {reply.status.toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatDate(reply.created_at)}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {reply.post_title}
                  </h3>

                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <p className="text-gray-700">{reply.content}</p>
                  </div>

                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <MessageSquare className="h-4 w-4" />
                      <span>Reply to post</span>
                    </div>
                    {reply.upvotes > 0 && (
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="h-4 w-4" />
                        <span>{reply.upvotes} upvotes</span>
                      </div>
                    )}
                    {reply.reply_count > 0 && (
                      <div className="flex items-center space-x-1">
                        <span>{reply.reply_count} responses</span>
                      </div>
                    )}
                  </div>

                  {reply.error_message && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-700">
                        <strong>Error:</strong> {reply.error_message}
                      </p>
                    </div>
                  )}
                </div>

                <div className="ml-6 flex flex-col items-end space-y-3">
                  <a
                    href={reply.post_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
                  >
                    <span>View Post</span>
                    <ExternalLink className="h-4 w-4" />
                  </a>

                  {reply.status === "pending" && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleApprove(reply.id)}
                        className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 text-sm"
                      >
                        <Check className="h-4 w-4" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleReject(reply.id)}
                        className="flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm"
                      >
                        <X className="h-4 w-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  )}

                  {reply.status === "posted" && reply.reddit_comment_id && (
                    <a
                      href={`https://reddit.com/r/all/comments/${reply.reddit_comment_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 text-green-600 hover:text-green-800 text-sm"
                    >
                      <span>View on Reddit</span>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 