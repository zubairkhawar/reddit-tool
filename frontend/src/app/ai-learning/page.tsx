'use client'

import { useState, useEffect } from 'react'
import { apiClient, AILearningData, AIPromptTemplate, AIPerformanceMetrics } from '@/lib/api'
import { 
  Brain, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  MessageSquare,
  Zap,
  Target,
  BarChart3,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  Activity,
  Clock,
  Star,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Play,
  Pause,
  Settings,
  Lightbulb,
  Cpu,
  Network,
  Gauge,
  LineChart,
  PieChart,
  Brain as BrainIcon,
  Zap as ZapIcon,
  Target as TargetIcon
} from 'lucide-react'

interface PerformanceGaugeProps {
  value: number
  label: string
  color: string
  trend?: 'up' | 'down' | 'stable'
}

const PerformanceGauge = ({ value, label, color, trend }: PerformanceGaugeProps) => {
  const circumference = 2 * Math.PI * 45
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (value / 100) * circumference

  return (
    <div className="relative">
      <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          className="text-gray-200"
        />
        {/* Progress circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className={`${color} transition-all duration-1000 ease-out`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-2xl font-bold text-gray-900">{value}%</div>
        <div className="text-xs text-gray-600">{label}</div>
        {trend && (
          <div className="flex items-center space-x-1 mt-1">
            {trend === 'up' ? (
              <ArrowUp className="h-3 w-3 text-green-500" />
            ) : trend === 'down' ? (
              <ArrowDown className="h-3 w-3 text-red-500" />
            ) : (
              <div className="h-3 w-3" />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function AILearningPage() {
  const [learningData, setLearningData] = useState<AILearningData[]>([])
  const [templates, setTemplates] = useState<AIPromptTemplate[]>([])
  const [metrics, setMetrics] = useState<AIPerformanceMetrics[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFeedbackType, setSelectedFeedbackType] = useState<string>('all')
  const [isLearning, setIsLearning] = useState(false)
  const [learningProgress, setLearningProgress] = useState(0)
  const [showNeuralNetwork, setShowNeuralNetwork] = useState(true)

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

  const getTemplateStatus = (template: AIPromptTemplate) => {
    if (template.success_rate >= 80) return { status: 'High Engagement', color: 'bg-green-100 text-green-800' }
    if (template.success_rate >= 60) return { status: 'Good Performance', color: 'bg-blue-100 text-blue-800' }
    if (template.success_rate >= 40) return { status: 'Needs Tuning', color: 'bg-yellow-100 text-yellow-800' }
    return { status: 'Poor Performance', color: 'bg-red-100 text-red-800' }
  }

  const handleVote = async (itemId: number, vote: 'up' | 'down') => {
    // Simulate voting feedback
    console.log(`Voted ${vote} on item ${itemId}`)
    // In real implementation, this would send feedback to the AI system
  }

  const startLearning = () => {
    setIsLearning(true)
    setLearningProgress(0)
    const interval = setInterval(() => {
      setLearningProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsLearning(false)
          return 100
        }
        return prev + 10
      })
    }, 500)
  }

  const filteredLearningData = learningData.filter(
    item => selectedFeedbackType === 'all' || item.feedback_type === selectedFeedbackType
  )

  const avgSuccessRate = templates.length > 0 
    ? (templates.reduce((sum, t) => sum + t.success_rate, 0) / templates.length)
    : 0

  const positiveFeedback = learningData.filter(item => item.feedback_type === 'success').length
  const negativeFeedback = learningData.filter(item => item.feedback_type === 'failure').length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Loading AI learning data...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI Learning & Performance
          </h1>
          <p className="text-gray-600 mt-1">Monitor and optimize your AI assistant's performance</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={startLearning}
            disabled={isLearning}
            className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 flex items-center space-x-2 transition-all duration-300"
          >
            {isLearning ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            <span>{isLearning ? 'Learning...' : 'Optimize Now'}</span>
          </button>
        </div>
      </div>

      {/* Neural Network Background */}
      {showNeuralNetwork && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-32 w-24 h-24 bg-gradient-to-r from-green-400/20 to-blue-400/20 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute bottom-32 left-1/3 w-20 h-20 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full animate-pulse delay-2000"></div>
        </div>
      )}

      {/* Performance Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Success Rate Gauge */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Success Rate</h3>
            <Gauge className="h-5 w-5 text-blue-500" />
          </div>
          <div className="flex justify-center">
            <PerformanceGauge 
              value={avgSuccessRate} 
              label="Avg Success Rate" 
              color="text-blue-500"
              trend="up"
            />
          </div>
        </div>

        {/* Feedback Samples */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Feedback Samples</h3>
            <MessageSquare className="h-5 w-5 text-purple-500" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ThumbsUp className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-600">Positive</span>
              </div>
              <span className="text-lg font-semibold text-green-600">👍 {positiveFeedback}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ThumbsDown className="h-4 w-4 text-red-500" />
                <span className="text-sm text-gray-600">Negative</span>
              </div>
              <span className="text-lg font-semibold text-red-600">👎 {negativeFeedback}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-gray-600">Total</span>
              </div>
              <span className="text-lg font-semibold text-blue-600">{learningData.length}</span>
            </div>
          </div>
        </div>

        {/* Learning Progress */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Learning Progress</h3>
            <Brain className="h-5 w-5 text-orange-500" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active Templates</span>
              <span className="text-lg font-semibold text-blue-600">
                {templates.filter(t => t.is_active).length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Learning Status</span>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isLearning ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
                <span className="text-sm font-medium">
                  {isLearning ? 'Learning...' : 'Idle'}
                </span>
              </div>
            </div>
            {isLearning && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${learningProgress}%` }}
                ></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Prompt Templates */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">AI Prompt Templates</h2>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
              <Zap className="h-4 w-4 inline mr-1" />
              Optimize All
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => {
            const status = getTemplateStatus(template)
            return (
              <div key={template.id} className="glass-card rounded-xl p-4 border border-white/20 hover-lift transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <BrainIcon className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{template.name}</h3>
                      <p className="text-xs text-gray-500">v{template.version}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                    {status.status}
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Success Rate</span>
                    <span className="font-semibold text-gray-900">{template.success_rate.toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Usage Count</span>
                    <span className="font-semibold text-gray-900">{template.usage_count}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Type</span>
                    <span className="font-semibold text-gray-900">{template.template_type.replace('_', ' ')}</span>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg text-sm font-mono mb-3 max-h-20 overflow-hidden">
                  {template.prompt_template.substring(0, 100)}...
                </div>
                
                <div className="flex items-center justify-between">
                  <button className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors">
                    <TargetIcon className="h-3 w-3 inline mr-1" />
                    Tune
                  </button>
                  <span className="text-xs text-gray-500">
                    {new Date(template.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Interactive Feedback Loop */}
      <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Learning Feedback</h2>
          <select
            value={selectedFeedbackType}
            onChange={(e) => setSelectedFeedbackType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Feedback</option>
            <option value="success">Success</option>
            <option value="failure">Failure</option>
            <option value="improvement">Improvement</option>
          </select>
      </div>

        <div className="space-y-4">
          {filteredLearningData.map((item) => (
            <div key={item.id} className="glass-card rounded-xl p-4 border border-white/20 hover-lift transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {getFeedbackIcon(item.feedback_type)}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getFeedbackColor(item.feedback_type)}`}>
                    {item.feedback_type}
                  </span>
                <span className="text-sm text-gray-500">
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
              </div>
              
                {/* Voting buttons */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleVote(item.id, 'up')}
                    className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                  >
                    <ThumbsUp className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleVote(item.id, 'down')}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <ThumbsDown className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <h3 className="font-semibold mb-2 text-gray-900">{item.post_title}</h3>
              <p className="text-sm text-gray-600 mb-3">{item.post_content.substring(0, 200)}...</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
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
                <div className="mb-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-1">User Feedback</h4>
                  <p className="text-sm bg-blue-50 p-2 rounded">{item.user_feedback}</p>
                </div>
              )}
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Subreddit: {item.subreddit}</span>
                <span>Engagement: {item.engagement_score}</span>
                <span>Success: {item.success_score}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Metrics Chart */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Performance Metrics (Last 30 Days)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric) => (
            <div key={metric.id} className="glass-card rounded-xl p-4 border border-white/20">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">{metric.template_type.replace('_', ' ')}</h3>
                <span className="text-sm text-gray-500">{metric.date}</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Requests</span>
                  <span className="font-semibold text-gray-900">{metric.total_requests}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Successful</span>
                  <span className="font-semibold text-green-600">{metric.successful_requests}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Failed</span>
                  <span className="font-semibold text-red-600">{metric.failed_requests}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Success Rate</span>
                  <span className="font-semibold text-blue-600">
                    {metric.success_rate.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 