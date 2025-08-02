'use client'

import { useState, useEffect } from 'react'
import { apiClient, AILearningData, AIPromptTemplate, AIPerformanceMetrics } from '@/lib/api'
import { Brain, TrendingUp, AlertCircle, CheckCircle, MessageSquare } from 'lucide-react'

export default function AILearningPage() {
  const [learningData, setLearningData] = useState<AILearningData[]>([])
  const [templates, setTemplates] = useState<AIPromptTemplate[]>([])
  const [metrics, setMetrics] = useState<AIPerformanceMetrics[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFeedbackType, setSelectedFeedbackType] = useState<string>('all')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [data, temps, mets] = await Promise.all([
        apiClient.getAILearningData(),
        apiClient.getAIPromptTemplates(),
        apiClient.getAIPerformanceMetrics(30)
      ])
      setLearningData(Array.isArray(data) ? data : [])
      setTemplates(Array.isArray(temps) ? temps : [])
      setMetrics(Array.isArray(mets) ? mets : [])
    } catch (error) {
      console.error('Error loading AI learning data:', error)
      setLearningData([])
      setTemplates([])
      setMetrics([])
    } finally {
      setLoading(false)
    }
  }

  const getFeedbackIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'failure':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      case 'improvement':
        return <MessageSquare className="w-5 h-5 text-blue-500" />
      default:
        return <Brain className="w-5 h-5 text-gray-500" />
    }
  }

  const getFeedbackColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-100 text-green-800'
      case 'failure':
        return 'bg-red-100 text-red-800'
      case 'improvement':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredLearningData = learningData.filter(
    item => selectedFeedbackType === 'all' || item.feedback_type === selectedFeedbackType
  )

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
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
        <h1 className="text-2xl font-bold">AI Learning & Performance</h1>
        <div className="flex space-x-2">
          <select
            value={selectedFeedbackType}
            onChange={(e) => setSelectedFeedbackType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Feedback</option>
            <option value="success">Success</option>
            <option value="failure">Failure</option>
            <option value="improvement">Improvement</option>
          </select>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-3">
            <Brain className="w-8 h-8 text-blue-500" />
            <div>
              <h3 className="text-lg font-semibold">Active Templates</h3>
              <p className="text-2xl font-bold text-blue-600">
                {templates.filter(t => t.is_active).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-8 h-8 text-green-500" />
            <div>
              <h3 className="text-lg font-semibold">Avg Success Rate</h3>
              <p className="text-2xl font-bold text-green-600">
                {templates.length > 0 
                  ? (templates.reduce((sum, t) => sum + t.success_rate, 0) / templates.length).toFixed(1)
                  : '0'
                }%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-3">
            <MessageSquare className="w-8 h-8 text-purple-500" />
            <div>
              <h3 className="text-lg font-semibold">Feedback Samples</h3>
              <p className="text-2xl font-bold text-purple-600">{learningData.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Learning Data */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Learning Feedback</h2>
        <div className="space-y-4">
          {filteredLearningData.map((item) => (
            <div key={item.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {getFeedbackIcon(item.feedback_type)}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getFeedbackColor(item.feedback_type)}`}>
                    {item.feedback_type}
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
              </div>
              
              <h3 className="font-semibold mb-2">{item.post_title}</h3>
              <p className="text-sm text-gray-600 mb-3">{item.post_content.substring(0, 200)}...</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Original Reply</h4>
                  <p className="text-sm bg-gray-50 p-2 rounded">{item.original_reply}</p>
                </div>
                {item.improved_reply && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Improved Reply</h4>
                    <p className="text-sm bg-green-50 p-2 rounded">{item.improved_reply}</p>
                  </div>
                )}
              </div>
              
              {item.user_feedback && (
                <div className="mt-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-1">User Feedback</h4>
                  <p className="text-sm bg-blue-50 p-2 rounded">{item.user_feedback}</p>
                </div>
              )}
              
              <div className="flex items-center justify-between mt-3 text-sm text-gray-500">
                <span>Subreddit: {item.subreddit}</span>
                <span>Engagement: {item.engagement_score}</span>
                <span>Success: {item.success_score}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Templates */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">AI Prompt Templates</h2>
        <div className="space-y-4">
          {templates.map((template) => (
            <div key={template.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    template.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {template.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <span className="text-sm text-gray-500">v{template.version}</span>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(template.updated_at).toLocaleDateString()}
                </span>
              </div>
              
              <h3 className="font-semibold mb-2">{template.name}</h3>
              <p className="text-sm text-gray-600 mb-2">Type: {template.template_type.replace('_', ' ')}</p>
              
              <div className="bg-gray-50 p-3 rounded text-sm font-mono mb-3">
                {template.prompt_template.substring(0, 200)}...
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Success Rate: {template.success_rate.toFixed(1)}%</span>
                <span>Usage: {template.usage_count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Performance Metrics (Last 30 Days)</h2>
        <div className="space-y-4">
          {metrics.map((metric) => (
            <div key={metric.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{metric.template_type.replace('_', ' ')}</h3>
                <span className="text-sm text-gray-500">{metric.date}</span>
              </div>
              
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-lg font-semibold">{metric.total_requests}</div>
                  <div className="text-xs text-gray-500">Total Requests</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-green-600">{metric.successful_requests}</div>
                  <div className="text-xs text-gray-500">Successful</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-red-600">{metric.failed_requests}</div>
                  <div className="text-xs text-gray-500">Failed</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-blue-600">
                    {metric.success_rate.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500">Success Rate</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 