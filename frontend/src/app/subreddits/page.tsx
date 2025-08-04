"use client"

import { useEffect, useState } from "react"
import { apiClient, Subreddit } from "@/lib/api"
import { 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  ToggleLeft, 
  ToggleRight,
  Search,
  TrendingUp,
  Activity,
  Globe,
  Code,
  Briefcase,
  Palette,
  Zap,
  Target,
  ArrowUp,
  ArrowDown,
  GripVertical,
  Sparkles,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  Flame,
  Star
} from "lucide-react"

interface SubredditGroup {
  name: string
  icon: any
  color: string
  subreddits: Subreddit[]
}

export default function SubredditsPage() {
  const [subreddits, setSubreddits] = useState<Subreddit[]>([])
  const [loading, setLoading] = useState(true)
  const [newSubreddit, setNewSubreddit] = useState("")
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingValue, setEditingValue] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [draggedId, setDraggedId] = useState<number | null>(null)
  const [recentlyAdded, setRecentlyAdded] = useState<number | null>(null)

  // Popular subreddit suggestions
  const suggestions = [
    "forhire", "freelancing", "workonline", "jobs", "careeradvice",
    "entrepreneur", "smallbusiness", "startups", "webdev", "programming",
    "design", "marketing", "ai", "machinelearning", "datascience",
    "reactjs", "vuejs", "angular", "node", "python", "django"
  ]

  useEffect(() => {
    fetchSubreddits()
  }, [])

  const fetchSubreddits = async () => {
    try {
      const data = await apiClient.getSubreddits()
      setSubreddits(data)
    } catch (error) {
      console.error("Error fetching subreddits:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddSubreddit = async () => {
    if (!newSubreddit.trim()) return

    try {
      await apiClient.createSubreddit(newSubreddit.trim().replace(/^r\//, ""))
      setNewSubreddit("")
      setRecentlyAdded(Date.now())
      fetchSubreddits()
    } catch (error) {
      console.error("Error adding subreddit:", error)
    }
  }

  const handleUpdateSubreddit = async (id: number) => {
    if (!editingValue.trim()) return

    try {
      await apiClient.updateSubreddit(id, { name: editingValue.trim().replace(/^r\//, "") })
      setEditingId(null)
      setEditingValue("")
      fetchSubreddits()
    } catch (error) {
      console.error("Error updating subreddit:", error)
    }
  }

  const handleDeleteSubreddit = async (id: number) => {
    if (!confirm("Are you sure you want to delete this subreddit?")) return

    try {
      await apiClient.deleteSubreddit(id)
      fetchSubreddits()
    } catch (error) {
      console.error("Error deleting subreddit:", error)
    }
  }

  const handleToggleActive = async (subreddit: Subreddit) => {
    try {
      await apiClient.updateSubreddit(subreddit.id, { is_active: !subreddit.is_active })
      fetchSubreddits()
    } catch (error) {
      console.error("Error toggling subreddit:", error)
    }
  }

  const getSubredditIcon = (name: string) => {
    const techKeywords = ['webdev', 'programming', 'reactjs', 'vuejs', 'angular', 'node', 'python', 'django']
    const businessKeywords = ['forhire', 'freelancing', 'jobs', 'careeradvice', 'entrepreneur', 'smallbusiness', 'startups']
    const designKeywords = ['design', 'ui', 'ux', 'graphicdesign']
    const aiKeywords = ['ai', 'machinelearning', 'datascience', 'artificial']
    
    if (techKeywords.some(keyword => name.toLowerCase().includes(keyword))) return Code
    if (businessKeywords.some(keyword => name.toLowerCase().includes(keyword))) return Briefcase
    if (designKeywords.some(keyword => name.toLowerCase().includes(keyword))) return Palette
    if (aiKeywords.some(keyword => name.toLowerCase().includes(keyword))) return Sparkles
    return Globe
  }

  const getSubredditColor = (name: string) => {
    const techKeywords = ['webdev', 'programming', 'reactjs', 'vuejs', 'angular', 'node', 'python', 'django']
    const businessKeywords = ['forhire', 'freelancing', 'jobs', 'careeradvice', 'entrepreneur', 'smallbusiness', 'startups']
    const designKeywords = ['design', 'ui', 'ux', 'graphicdesign']
    const aiKeywords = ['ai', 'machinelearning', 'datascience', 'artificial']
    
    if (techKeywords.some(keyword => name.toLowerCase().includes(keyword))) return 'from-blue-500 to-cyan-500'
    if (businessKeywords.some(keyword => name.toLowerCase().includes(keyword))) return 'from-green-500 to-emerald-500'
    if (designKeywords.some(keyword => name.toLowerCase().includes(keyword))) return 'from-purple-500 to-pink-500'
    if (aiKeywords.some(keyword => name.toLowerCase().includes(keyword))) return 'from-orange-500 to-red-500'
    return 'from-gray-500 to-gray-600'
  }

  const getActivityLevel = (subreddit: Subreddit) => {
    // Simulate activity level based on subreddit name and active status
    const activityLevels = ['Low', 'Medium', 'High']
    const randomIndex = Math.floor(Math.random() * 3)
    return activityLevels[randomIndex]
  }

  const getLeadCount = (subreddit: Subreddit) => {
    // Simulate lead count
    return Math.floor(Math.random() * 50) + 1
  }

  const getMetrics = (subreddit: Subreddit) => {
    const activityLevel = getActivityLevel(subreddit)
    const leadCount = getLeadCount(subreddit)
    const isHighActivity = activityLevel === 'High'
    const isRecent = new Date(subreddit.created_at).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000

    return {
      activityLevel,
      leadCount,
      isHighActivity,
      isRecent
    }
  }

  const groupSubreddits = (subreddits: Subreddit[]): SubredditGroup[] => {
    const groups: SubredditGroup[] = [
      { name: 'Tech & Development', icon: Code, color: 'from-blue-500 to-cyan-500', subreddits: [] },
      { name: 'Business & Freelance', icon: Briefcase, color: 'from-green-500 to-emerald-500', subreddits: [] },
      { name: 'Design & Creative', icon: Palette, color: 'from-purple-500 to-pink-500', subreddits: [] },
      { name: 'AI & Data Science', icon: Sparkles, color: 'from-orange-500 to-red-500', subreddits: [] },
      { name: 'Other', icon: Globe, color: 'from-gray-500 to-gray-600', subreddits: [] }
    ]

    subreddits.forEach(subreddit => {
      const name = subreddit.name.toLowerCase()
      if (['webdev', 'programming', 'reactjs', 'vuejs', 'angular', 'node', 'python', 'django'].some(keyword => name.includes(keyword))) {
        groups[0].subreddits.push(subreddit)
      } else if (['forhire', 'freelancing', 'jobs', 'careeradvice', 'entrepreneur', 'smallbusiness', 'startups'].some(keyword => name.includes(keyword))) {
        groups[1].subreddits.push(subreddit)
      } else if (['design', 'ui', 'ux', 'graphicdesign'].some(keyword => name.includes(keyword))) {
        groups[2].subreddits.push(subreddit)
      } else if (['ai', 'machinelearning', 'datascience', 'artificial'].some(keyword => name.includes(keyword))) {
        groups[3].subreddits.push(subreddit)
      } else {
        groups[4].subreddits.push(subreddit)
      }
    })

    return groups.filter(group => group.subreddits.length > 0)
  }

  const filteredSubreddits = subreddits.filter(subreddit =>
    subreddit.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const subredditGroups = groupSubreddits(filteredSubreddits)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Loading subreddits...</div>
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
            Subreddits
          </h1>
          <p className="text-gray-600 mt-1">Discover and manage your Reddit communities</p>
        </div>
        <div className="glass-card rounded-xl p-3">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-700">
              {subreddits.filter(s => s.is_active).length} active
            </span>
          </div>
        </div>
      </div>

      {/* Floating Input Bar */}
      <div className="sticky top-0 z-10 glass-card rounded-2xl p-4 shadow-lg border border-white/20">
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={newSubreddit}
              onChange={(e) => {
                setNewSubreddit(e.target.value)
                setShowSuggestions(e.target.value.length > 0)
              }}
              placeholder="Add new subreddit (e.g., r/forhire)..."
              className="w-full pl-10 pr-4 py-3 bg-white/50 rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
              onKeyPress={(e) => e.key === "Enter" && handleAddSubreddit()}
            />
            
            {/* Auto-suggestions */}
            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 mt-2 glass-card rounded-xl border border-white/20 shadow-lg z-20">
                {suggestions
                  .filter(suggestion => 
                    suggestion.toLowerCase().includes(newSubreddit.toLowerCase()) &&
                    !subreddits.some(s => s.name === suggestion)
                  )
                  .slice(0, 5)
                  .map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => {
                        setNewSubreddit(suggestion)
                        setShowSuggestions(false)
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-white/50 transition-colors duration-200 flex items-center space-x-2"
                    >
                      <Globe className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-700">r/{suggestion}</span>
                    </button>
                  ))}
              </div>
            )}
          </div>
          <button
            onClick={handleAddSubreddit}
            disabled={!newSubreddit.trim()}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all duration-300 hover:scale-105 shadow-lg"
          >
            <Plus className="h-5 w-5" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Subreddit Groups */}
      {subredditGroups.length === 0 ? (
        <div className="text-center py-12">
          <div className="relative">
            {/* Animated illustration */}
            <div className="w-32 h-32 mx-auto mb-6 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse"></div>
              <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                <Globe className="h-12 w-12 text-blue-600 animate-bounce" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-green-400 to-blue-500 rounded-full animate-ping"></div>
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No subreddits found</h3>
          <p className="text-gray-600 mb-4">Start by adding your first subreddit to discover leads</p>
          <div className="glass-card rounded-xl p-4 max-w-md mx-auto">
            <h4 className="font-medium text-gray-900 mb-2">💡 Pro Tips:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Focus on job/freelance subreddits like r/forhire</li>
              <li>• Include industry-specific communities</li>
              <li>• Monitor business and startup subreddits</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {subredditGroups.map((group) => (
            <div key={group.name} className="glass-card rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className={`w-10 h-10 bg-gradient-to-r ${group.color} rounded-xl flex items-center justify-center`}>
                  <group.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
                  <p className="text-sm text-gray-600">{group.subreddits.length} subreddits</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.subreddits.map((subreddit) => {
                  const metrics = getMetrics(subreddit)
                  const Icon = getSubredditIcon(subreddit.name)
                  const colorClass = getSubredditColor(subreddit.name)
                  
                  return (
                    <div
                      key={subreddit.id}
                      className={`relative group glass-card rounded-xl p-4 border-2 transition-all duration-300 hover-lift ${
                        metrics.isHighActivity 
                          ? 'border-green-200 hover:border-green-300' 
                          : 'border-gray-200 hover:border-gray-300'
                      } ${
                        recentlyAdded === subreddit.id ? 'animate-pulse-glow' : ''
                      }`}
                    >
                      {/* Drag handle */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <GripVertical className="h-4 w-4 text-gray-400" />
                      </div>

                      {/* Header */}
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`w-8 h-8 bg-gradient-to-r ${colorClass} rounded-lg flex items-center justify-center`}>
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900">r/{subreddit.name}</span>
                            {metrics.isRecent && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">New</span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <div className={`flex items-center space-x-1 text-xs ${
                              metrics.activityLevel === 'High' ? 'text-green-600' :
                              metrics.activityLevel === 'Medium' ? 'text-yellow-600' : 'text-gray-500'
                            }`}>
                              <Activity className="h-3 w-3" />
                              <span>{metrics.activityLevel} Activity</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Metrics */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Leads this week</span>
                          <span className="text-sm font-semibold text-gray-900">🔥 {metrics.leadCount}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Status</span>
                          <div className="flex items-center space-x-1">
                            {subreddit.is_active ? (
                              <>
                                <CheckCircle className="h-3 w-3 text-green-500" />
                                <span className="text-xs text-green-600">Active</span>
                              </>
                            ) : (
                              <>
                                <AlertCircle className="h-3 w-3 text-gray-400" />
                                <span className="text-xs text-gray-500">Inactive</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Toggle Switch */}
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => handleToggleActive(subreddit)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
                            subreddit.is_active 
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                              : 'bg-gray-200'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                            subreddit.is_active ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>

                        {/* Actions */}
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => {
                              setEditingId(subreddit.id)
                              setEditingValue(subreddit.name)
                            }}
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteSubreddit(subreddit.id)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Edit mode */}
                      {editingId === subreddit.id && (
                        <div className="mt-3 p-3 bg-white/50 rounded-lg border border-blue-200">
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={editingValue}
                              onChange={(e) => setEditingValue(e.target.value)}
                              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              onKeyPress={(e) => e.key === "Enter" && handleUpdateSubreddit(subreddit.id)}
                            />
                            <button
                              onClick={() => handleUpdateSubreddit(subreddit.id)}
                              className="px-3 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setEditingId(null)
                                setEditingValue("")
                              }}
                              className="px-3 py-2 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Add Popular Subreddits */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <Star className="h-5 w-5 text-yellow-500" />
          <span>Popular Subreddits</span>
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {suggestions.slice(0, 12).map((name) => (
            <button
              key={name}
              onClick={() => setNewSubreddit(name)}
              className="p-3 text-center glass-card rounded-xl hover-lift transition-all duration-300 border border-white/20"
            >
              <div className="font-medium text-gray-900 text-sm">r/{name}</div>
              <div className="text-xs text-gray-500 mt-1">Click to add</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
} 