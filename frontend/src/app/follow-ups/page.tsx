'use client'

import { useState, useEffect } from 'react'
import { apiClient, RedditPost } from '@/lib/api'
import { MessageCircle, Send, TrendingUp, Clock, CheckCircle } from 'lucide-react'

export default function FollowUpsPage() {
  const [followUpCandidates, setFollowUpCandidates] = useState<RedditPost[]>([])
  const [loading, setLoading] = useState(true)
  const [sendingFollowUp, setSendingFollowUp] = useState<number | null>(null)

  useEffect(() => {
    loadFollowUpCandidates()
  }, [])

  const loadFollowUpCandidates = async () => {
    try {
      setLoading(true)
      const data = await apiClient.getFollowUpCandidates()
      setFollowUpCandidates(data)
    } catch (error) {
      console.error('Error loading follow-up candidates:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendFollowUp = async (postId: number, content: string) => {
    try {
      setSendingFollowUp(postId)
      await apiClient.sendFollowUp(postId, content)
      loadFollowUpCandidates() // Reload data
    } catch (error) {
      console.error('Error sending follow-up:', error)
    } finally {
      setSendingFollowUp(null)
    }
  }

  const getFollowUpReason = (post: RedditPost) => {
    if (post.engagement_increased && post.score > 10) {
      return 'High engagement increase'
    }
    if (post.new_comments_since_last_check > 0) {
      return 'New comments detected'
    }
    return 'Manual follow-up'
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
        <h1 className="text-2xl font-bold">Follow-up Automation</h1>
        <div className="flex items-center space-x-2">
          <MessageCircle className="w-5 h-5 text-blue-500" />
          <span className="text-sm text-gray-500">
            {followUpCandidates.length} candidates for follow-up
          </span>
        </div>
      </div>

      <div className="grid gap-6">
        {followUpCandidates.map((post) => (
          <div
            key={post.id}
            className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-lg font-semibold">{post.title}</h3>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    {post.subreddit}
                  </span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {getFollowUpReason(post)}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-4">{post.content.substring(0, 200)}...</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold">{post.score}</div>
                    <div className="text-xs text-gray-500">Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold">{post.comment_count}</div>
                    <div className="text-xs text-gray-500">Comments</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold">
                      {post.engagement_increased ? (
                        <TrendingUp className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">Engagement</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold">{post.new_comments_since_last_check}</div>
                    <div className="text-xs text-gray-500">New Comments</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Author: {post.author}</span>
                  <span>Created: {new Date(post.created_at).toLocaleDateString()}</span>
                </div>

                {post.follow_up_sent && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">Follow-up Sent</span>
                    </div>
                    <p className="text-sm text-green-700">{post.follow_up_content}</p>
                    <div className="text-xs text-green-600 mt-1">
                      Sent: {new Date(post.follow_up_sent_at!).toLocaleString()}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col space-y-2 ml-4">
                {!post.follow_up_sent && (
                  <FollowUpForm
                    postId={post.id}
                    onSend={sendFollowUp}
                    isSending={sendingFollowUp === post.id}
                  />
                )}

                <a
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 px-3 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200"
                >
                  <MessageCircle className="w-3 h-3" />
                  <span>View Post</span>
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {followUpCandidates.length === 0 && (
        <div className="text-center py-12">
          <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Follow-up Candidates</h3>
          <p className="text-gray-500">
            Posts will appear here when they meet the criteria for follow-up replies.
          </p>
        </div>
      )}
    </div>
  )
}

function FollowUpForm({ 
  postId, 
  onSend, 
  isSending 
}: { 
  postId: number
  onSend: (postId: number, content: string) => Promise<void>
  isSending: boolean 
}) {
  const [content, setContent] = useState('')
  const [showForm, setShowForm] = useState(false)

  const handleSend = async () => {
    if (content.trim()) {
      await onSend(postId, content)
      setContent('')
      setShowForm(false)
    }
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="flex items-center space-x-1 px-3 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
      >
        <Send className="w-3 h-3" />
        <span>Send Follow-up</span>
      </button>
    )
  }

  return (
    <div className="space-y-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Enter follow-up message..."
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs resize-none"
        rows={3}
      />
      <div className="flex space-x-2">
        <button
          onClick={handleSend}
          disabled={isSending || !content.trim()}
          className="flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200 disabled:opacity-50"
        >
          {isSending ? (
            <Clock className="w-3 h-3 animate-spin" />
          ) : (
            <Send className="w-3 h-3" />
          )}
          <span>{isSending ? 'Sending...' : 'Send'}</span>
        </button>
        <button
          onClick={() => setShowForm(false)}
          className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
        >
          Cancel
        </button>
      </div>
    </div>
  )
} 