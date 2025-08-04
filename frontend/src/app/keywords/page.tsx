"use client"

import { useEffect, useState } from "react"
import { apiClient, Keyword } from "@/lib/api"
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  ToggleLeft, 
  ToggleRight,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
  Bot,
  DollarSign,
  Clock,
  GripVertical,
  AlertTriangle,
  CheckCircle,
  XCircle
} from "lucide-react"

interface KeywordGroup {
  id: string
  name: string
  icon: any
  color: string
  keywords: Keyword[]
  isExpanded: boolean
}

export default function KeywordsPage() {
  const [keywords, setKeywords] = useState<Keyword[]>([])
  const [loading, setLoading] = useState(true)
  const [newKeyword, setNewKeyword] = useState("")
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingValue, setEditingValue] = useState("")
  const [recentlyAdded, setRecentlyAdded] = useState<number[]>([])
  const [draggedId, setDraggedId] = useState<number | null>(null)

  useEffect(() => {
    fetchKeywords()
  }, [])

  const fetchKeywords = async () => {
    try {
      const data = await apiClient.getKeywords()
      setKeywords(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching keywords:", error)
      setKeywords([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddKeyword = async () => {
    if (!newKeyword.trim()) return

    try {
      await apiClient.createKeyword(newKeyword.trim())
      const newId = Date.now() // Simulate new ID
      setRecentlyAdded([...recentlyAdded, newId])
      setTimeout(() => {
        setRecentlyAdded(prev => prev.filter(id => id !== newId))
      }, 3000)
      setNewKeyword("")
      fetchKeywords()
    } catch (error) {
      console.error("Error adding keyword:", error)
    }
  }

  const handleUpdateKeyword = async (id: number) => {
    if (!editingValue.trim()) return

    try {
      await apiClient.updateKeyword(id, { keyword: editingValue.trim() })
      setEditingId(null)
      setEditingValue("")
      fetchKeywords()
    } catch (error) {
      console.error("Error updating keyword:", error)
    }
  }

  const handleDeleteKeyword = async (id: number) => {
    if (!confirm("Are you sure you want to delete this keyword?")) return

    try {
      await apiClient.deleteKeyword(id)
      fetchKeywords()
    } catch (error) {
      console.error("Error deleting keyword:", error)
    }
  }

  const handleToggleActive = async (keyword: Keyword) => {
    try {
      await apiClient.updateKeyword(keyword.id, { is_active: !keyword.is_active })
      fetchKeywords()
    } catch (error) {
      console.error("Error toggling keyword:", error)
    }
  }

  const getKeywordIcon = (keyword: string) => {
    const lower = keyword.toLowerCase()
    if (lower.includes('ai') || lower.includes('bot')) return Bot
    if (lower.includes('budget') || lower.includes('pay') || lower.includes('rate')) return DollarSign
    if (lower.includes('urgent') || lower.includes('asap')) return AlertTriangle
    if (lower.includes('development') || lower.includes('design')) return Target
    return Search
  }

  const getKeywordColor = (keyword: string) => {
    const lower = keyword.toLowerCase()
    if (lower.includes('ai') || lower.includes('bot')) return "from-purple-500 to-pink-500"
    if (lower.includes('budget') || lower.includes('pay') || lower.includes('rate')) return "from-green-500 to-blue-500"
    if (lower.includes('urgent') || lower.includes('asap')) return "from-red-500 to-orange-500"
    if (lower.includes('development') || lower.includes('design')) return "from-blue-500 to-purple-500"
    return "from-gray-500 to-gray-600"
  }

  const getUsageMetrics = (keyword: Keyword) => {
    // Simulate usage metrics
    const baseUsage = Math.floor(Math.random() * 20) + 5
    const weeklyGrowth = Math.floor(Math.random() * 10) + 1
    return {
      weekly: baseUsage,
      growth: weeklyGrowth,
      leads: Math.floor(baseUsage * 0.3),
      engagement: Math.floor(Math.random() * 50) + 20
    }
  }

  const keywordGroups: KeywordGroup[] = [
    {
      id: 'ai',
      name: 'AI & Automation',
      icon: Bot,
      color: 'from-purple-500 to-pink-500',
      keywords: keywords.filter(k => k.keyword.toLowerCase().includes('ai') || k.keyword.toLowerCase().includes('bot')),
      isExpanded: true
    },
    {
      id: 'budget',
      name: 'Budget & Pricing',
      icon: DollarSign,
      color: 'from-green-500 to-blue-500',
      keywords: keywords.filter(k => k.keyword.toLowerCase().includes('budget') || k.keyword.toLowerCase().includes('pay')),
      isExpanded: true
    },
    {
      id: 'urgent',
      name: 'Urgent Requests',
      icon: AlertTriangle,
      color: 'from-red-500 to-orange-500',
      keywords: keywords.filter(k => k.keyword.toLowerCase().includes('urgent') || k.keyword.toLowerCase().includes('asap')),
      isExpanded: true
    },
    {
      id: 'services',
      name: 'Services',
      icon: Target,
      color: 'from-blue-500 to-purple-500',
      keywords: keywords.filter(k => !k.keyword.toLowerCase().includes('ai') && !k.keyword.toLowerCase().includes('budget') && !k.keyword.toLowerCase().includes('urgent')),
      isExpanded: true
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center animate-spin mb-4">
            <Search className="h-8 w-8 text-white" />
          </div>
          <p className="text-gray-600 font-medium">Loading keywords...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Keywords
          </h1>
          <p className="text-gray-600 mt-1">Monitor Reddit for high-priority opportunities</p>
        </div>
        <div className="glass-card px-4 py-2 rounded-xl">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">
          {keywords.filter(k => k.is_active).length} active keywords
            </span>
          </div>
        </div>
      </div>

      {/* Sticky Add Keyword Bar */}
      <div className="sticky top-0 z-10 glass-card rounded-2xl p-4 mb-6">
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
          <input
            type="text"
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
              placeholder="Add a new keyword to monitor..."
              className="w-full px-4 py-3 bg-white/50 rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyPress={(e) => e.key === "Enter" && handleAddKeyword()}
          />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          <button
            onClick={handleAddKeyword}
            disabled={!newKeyword.trim()}
            className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 hover-lift disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
          >
            <Plus className="h-5 w-5 group-hover:scale-110 transition-transform" />
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </button>
        </div>
      </div>

      {/* Keywords Groups */}
      <div className="space-y-6">
        {keywordGroups.map((group) => (
          <div key={group.id} className="glass-card rounded-2xl overflow-hidden">
            <div 
              className="p-4 cursor-pointer hover:bg-white/20 transition-colors"
              onClick={() => group.isExpanded = !group.isExpanded}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 bg-gradient-to-r ${group.color} rounded-lg text-white`}>
                    <group.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
                    <p className="text-sm text-gray-600">{group.keywords.length} keywords</p>
                  </div>
                </div>
                {group.isExpanded ? (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-500" />
                )}
        </div>
            </div>

            {group.isExpanded && (
              <div className="p-4 space-y-3">
                {group.keywords.length === 0 ? (
                  <div className="text-center py-8">
                    <group.icon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No {group.name.toLowerCase()} keywords yet</p>
            </div>
          ) : (
                  group.keywords.map((keyword, index) => {
                    const metrics = getUsageMetrics(keyword)
                    const Icon = getKeywordIcon(keyword.keyword)
                    const isRecentlyAdded = recentlyAdded.includes(keyword.id)
                    
                    return (
                      <div
                        key={keyword.id}
                        className={`p-4 bg-white/50 rounded-xl hover-lift transition-all duration-300 ${
                          isRecentlyAdded ? 'animate-pulse-glow' : ''
                        }`}
                        draggable
                        onDragStart={() => setDraggedId(keyword.id)}
                        onDragEnd={() => setDraggedId(null)}
                      >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg">
                              <GripVertical className="h-4 w-4 text-gray-500" />
                            </div>
                            
                            <div className={`p-2 bg-gradient-to-r ${getKeywordColor(keyword.keyword)} rounded-lg text-white`}>
                              <Icon className="h-4 w-4" />
                            </div>

                            <div className="flex-1">
                    {editingId === keyword.id ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                                    className="px-3 py-1 bg-white rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          onKeyPress={(e) => e.key === "Enter" && handleUpdateKeyword(keyword.id)}
                        />
                        <button
                          onClick={() => handleUpdateKeyword(keyword.id)}
                                    className="text-sm text-green-600 hover:text-green-700 font-medium"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null)
                            setEditingValue("")
                          }}
                                    className="text-sm text-gray-600 hover:text-gray-700"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                                <div>
                                  <h4 className="font-medium text-gray-900">{keyword.keyword}</h4>
                                  <div className="flex items-center space-x-4 mt-1">
                                    <div className="flex items-center space-x-1 text-xs text-gray-600">
                                      <TrendingUp className="h-3 w-3" />
                                      <span>{metrics.weekly} leads/week</span>
                                    </div>
                                    <div className="flex items-center space-x-1 text-xs text-gray-600">
                                      <Zap className="h-3 w-3" />
                                      <span>{metrics.engagement}% engagement</span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                  </div>

                  <div className="flex items-center space-x-2">
                            {/* Toggle Switch */}
                            <button
                              onClick={() => handleToggleActive(keyword)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                keyword.is_active 
                                  ? 'bg-gradient-to-r from-green-500 to-blue-500' 
                                  : 'bg-gray-200'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  keyword.is_active ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>

                            {/* Status Indicator */}
                            <div className="flex items-center space-x-1">
                              {keyword.is_active ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <XCircle className="h-4 w-4 text-gray-400" />
                              )}
                            </div>
                    
                            {/* Action Buttons */}
                    {editingId !== keyword.id && (
                              <div className="flex items-center space-x-1">
                        <button
                          onClick={() => {
                            setEditingId(keyword.id)
                            setEditingValue(keyword.keyword)
                          }}
                                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteKeyword(keyword.id)}
                                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                              </div>
                    )}
                  </div>
                </div>
                      </div>
                    )
                  })
                )}
              </div>
          )}
        </div>
        ))}
      </div>

      {/* Tips Section */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Pro Tips for Effective Keywords</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Use specific terms like "AI automation" instead of just "AI"</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Include budget indicators like "budget", "pay", "rate"</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Add urgency words like "urgent", "ASAP", "needed"</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Include service types like "development", "design", "consulting"</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 