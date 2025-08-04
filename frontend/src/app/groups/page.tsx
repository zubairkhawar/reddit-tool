"use client"

import { useEffect, useState } from "react"
import { apiClient, Group, GroupWithData, Keyword, Subreddit } from "@/lib/api"
import { 
  Plus, 
  Edit, 
  Trash2, 
  ChevronDown,
  ChevronRight,
  Search,
  ToggleLeft, 
  ToggleRight,
  Target,
  Sparkles,
  Bot,
  Code,
  Briefcase,
  Brain,
  Globe,
  Hash,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Settings,
  Users,
  FolderPlus,
  Palette
} from "lucide-react"

interface NewGroupData {
  name: string
  description: string
  color: string
  icon: string
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<GroupWithData[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedGroups, setExpandedGroups] = useState<number[]>([])
  const [editingGroup, setEditingGroup] = useState<number | null>(null)
  const [editingKeyword, setEditingKeyword] = useState<number | null>(null)
  const [editingSubreddit, setEditingSubreddit] = useState<number | null>(null)
  const [newKeyword, setNewKeyword] = useState("")
  const [newSubreddit, setNewSubreddit] = useState("")
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null)
  const [showNewGroupModal, setShowNewGroupModal] = useState(false)
  const [newGroupData, setNewGroupData] = useState<NewGroupData>({
    name: "",
    description: "",
    color: "blue",
    icon: "target"
  })

  const colorOptions = [
    { value: 'blue', label: 'Blue', class: 'from-blue-500 to-cyan-500' },
    { value: 'purple', label: 'Purple', class: 'from-purple-500 to-pink-500' },
    { value: 'green', label: 'Green', class: 'from-green-500 to-emerald-500' },
    { value: 'orange', label: 'Orange', class: 'from-orange-500 to-red-500' },
    { value: 'pink', label: 'Pink', class: 'from-pink-500 to-rose-500' },
    { value: 'indigo', label: 'Indigo', class: 'from-indigo-500 to-purple-500' },
    { value: 'teal', label: 'Teal', class: 'from-teal-500 to-cyan-500' },
    { value: 'yellow', label: 'Yellow', class: 'from-yellow-500 to-orange-500' }
  ]

  const iconOptions = [
    { value: 'target', label: 'Target', icon: Target },
    { value: 'bot', label: 'Bot', icon: Bot },
    { value: 'code', label: 'Code', icon: Code },
    { value: 'briefcase', label: 'Briefcase', icon: Briefcase },
    { value: 'brain', label: 'Brain', icon: Brain },
    { value: 'globe', label: 'Globe', icon: Globe },
    { value: 'hash', label: 'Hash', icon: Hash },
    { value: 'sparkles', label: 'Sparkles', icon: Sparkles },
    { value: 'users', label: 'Users', icon: Users },
    { value: 'settings', label: 'Settings', icon: Settings }
  ]

  useEffect(() => {
    fetchGroups()
  }, [])

  const fetchGroups = async () => {
    try {
      const groupsData = await apiClient.getGroupsWithData()
      setGroups(groupsData)
    } catch (error) {
      console.error("Error fetching groups:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateGroup = async () => {
    if (!newGroupData.name.trim() || !newGroupData.description.trim()) return

    try {
      const newGroup = await apiClient.createGroup(newGroupData)
      setShowNewGroupModal(false)
      setNewGroupData({ name: "", description: "", color: "blue", icon: "target" })
      
      // Optimistic update - add new group to state immediately
      setGroups(prev => [...prev, { ...newGroup, keywords: [], subreddits: [] }])
    } catch (error) {
      console.error("Error creating group:", error)
    }
  }

  const handleDeleteGroup = async (groupId: number) => {
    const group = groups.find(g => g.id === groupId)
    if (!group) return

    const confirmMessage = `Are you sure you want to delete "${group.name}"? This will also delete all ${group.keywords.length} keywords and ${group.subreddits.length} subreddits in this group.`
    
    if (!confirm(confirmMessage)) return

    try {
      // Optimistic update - remove group from state immediately
      setGroups(prev => prev.filter(g => g.id !== groupId))
      await apiClient.deleteGroup(groupId)
    } catch (error) {
      console.error("Error deleting group:", error)
      // Revert on error
      setGroups(prev => [...prev, group])
    }
  }

  const toggleGroup = (groupId: number) => {
    setExpandedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    )
  }

  const handleAddKeyword = async (groupId: number) => {
    if (!newKeyword.trim()) return

    const group = groups.find(g => g.id === groupId)
    if (!group) return

    // Check if group is already at or over the limit
    if (group.keywords.length >= 20) {
      alert("Maximum 20 keywords allowed per group. Please delete some keywords first.")
      return
    }

    const tempId = Date.now()
    const tempKeyword: Keyword = {
      id: tempId,
      keyword: newKeyword.trim(),
      is_active: true,
      group_id: groupId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    try {
      // Optimistic update - add keyword to state immediately
      setGroups(prev => prev.map(g => 
        g.id === groupId 
          ? { ...g, keywords: [...g.keywords, tempKeyword] }
          : g
      ))
      setNewKeyword("")
      
      const createdKeyword = await apiClient.createKeyword(newKeyword.trim(), groupId)
      
      // Update with real data from server
      setGroups(prev => prev.map(g => 
        g.id === groupId 
          ? { ...g, keywords: g.keywords.map(k => k.id === tempId ? createdKeyword : k) }
          : g
      ))
    } catch (error) {
      console.error("Error adding keyword:", error)
      // Revert on error
      setGroups(prev => prev.map(g => 
        g.id === groupId 
          ? { ...g, keywords: g.keywords.filter(k => k.id !== tempId) }
          : g
      ))
    }
  }

  const handleAddSubreddit = async (groupId: number) => {
    if (!newSubreddit.trim()) return

    const group = groups.find(g => g.id === groupId)
    if (!group) return

    // Check if group is already at or over the limit
    if (group.subreddits.length >= 10) {
      alert("Maximum 10 subreddits allowed per group. Please delete some subreddits first.")
      return
    }

    const tempId = Date.now()
    const tempSubreddit: Subreddit = {
      id: tempId,
      name: newSubreddit.trim().replace(/^r\//, ""),
      is_active: true,
      group_id: groupId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    try {
      // Optimistic update - add subreddit to state immediately
      setGroups(prev => prev.map(g => 
        g.id === groupId 
          ? { ...g, subreddits: [...g.subreddits, tempSubreddit] }
          : g
      ))
      setNewSubreddit("")
      
      const createdSubreddit = await apiClient.createSubreddit(newSubreddit.trim().replace(/^r\//, ""), groupId)
      
      // Update with real data from server
      setGroups(prev => prev.map(g => 
        g.id === groupId 
          ? { ...g, subreddits: g.subreddits.map(s => s.id === tempId ? createdSubreddit : s) }
          : g
      ))
    } catch (error) {
      console.error("Error adding subreddit:", error)
      // Revert on error
      setGroups(prev => prev.map(g => 
        g.id === groupId 
          ? { ...g, subreddits: g.subreddits.filter(s => s.id !== tempId) }
          : g
      ))
    }
  }

  const handleUpdateKeyword = async (id: number, keyword: string) => {
    if (!keyword.trim()) return

    const originalGroups = [...groups]
    
    try {
      // Optimistic update
      setGroups(prev => prev.map(g => ({
        ...g,
        keywords: g.keywords.map(k => k.id === id ? { ...k, keyword } : k)
      })))
      setEditingKeyword(null)
      
      await apiClient.updateKeyword(id, { keyword: keyword.trim() })
    } catch (error) {
      console.error("Error updating keyword:", error)
      // Revert on error
      setGroups(originalGroups)
    }
  }

  const handleUpdateSubreddit = async (id: number, name: string) => {
    if (!name.trim()) return

    const originalGroups = [...groups]
    
    try {
      // Optimistic update
      setGroups(prev => prev.map(g => ({
        ...g,
        subreddits: g.subreddits.map(s => s.id === id ? { ...s, name } : s)
      })))
      setEditingSubreddit(null)
      
      await apiClient.updateSubreddit(id, { name: name.trim().replace(/^r\//, "") })
    } catch (error) {
      console.error("Error updating subreddit:", error)
      // Revert on error
      setGroups(originalGroups)
    }
  }

  const handleDeleteKeyword = async (id: number) => {
    if (!confirm("Are you sure you want to delete this keyword?")) return

    const originalGroups = [...groups]
    
    try {
      // Optimistic update
      setGroups(prev => prev.map(g => ({
        ...g,
        keywords: g.keywords.filter(k => k.id !== id)
      })))
      
      await apiClient.deleteKeyword(id)
    } catch (error) {
      console.error("Error deleting keyword:", error)
      // Revert on error
      setGroups(originalGroups)
    }
  }

  const handleDeleteSubreddit = async (id: number) => {
    if (!confirm("Are you sure you want to delete this subreddit?")) return

    const originalGroups = [...groups]
    
    try {
      // Optimistic update
      setGroups(prev => prev.map(g => ({
        ...g,
        subreddits: g.subreddits.filter(s => s.id !== id)
      })))
      
      await apiClient.deleteSubreddit(id)
    } catch (error) {
      console.error("Error deleting subreddit:", error)
      // Revert on error
      setGroups(originalGroups)
    }
  }

  const handleToggleKeyword = async (keyword: Keyword) => {
    const originalGroups = [...groups]
    
    try {
      // Optimistic update
      setGroups(prev => prev.map(g => ({
        ...g,
        keywords: g.keywords.map(k => k.id === keyword.id ? { ...k, is_active: !k.is_active } : k)
      })))
      
      await apiClient.updateKeyword(keyword.id, { is_active: !keyword.is_active })
    } catch (error) {
      console.error("Error toggling keyword:", error)
      // Revert on error
      setGroups(originalGroups)
    }
  }

  const handleToggleSubreddit = async (subreddit: Subreddit) => {
    const originalGroups = [...groups]
    
    try {
      // Optimistic update
      setGroups(prev => prev.map(g => ({
        ...g,
        subreddits: g.subreddits.map(s => s.id === subreddit.id ? { ...s, is_active: !s.is_active } : s)
      })))
      
      await apiClient.updateSubreddit(subreddit.id, { is_active: !subreddit.is_active })
    } catch (error) {
      console.error("Error toggling subreddit:", error)
      // Revert on error
      setGroups(originalGroups)
    }
  }

  const getGroupIcon = (iconName: string) => {
    const icons: { [key: string]: any } = {
      'bot': Bot,
      'code': Code,
      'briefcase': Briefcase,
      'brain': Brain,
      'target': Target,
      'globe': Globe,
      'hash': Hash,
      'sparkles': Sparkles,
      'users': Users,
      'settings': Settings,
      'default': Target
    }
    return icons[iconName] || icons['default']
  }

  const getGroupColor = (color: string) => {
    const colors: { [key: string]: string } = {
      'purple': 'from-purple-500 to-pink-500',
      'blue': 'from-blue-500 to-cyan-500',
      'green': 'from-green-500 to-emerald-500',
      'orange': 'from-orange-500 to-red-500',
      'pink': 'from-pink-500 to-rose-500',
      'indigo': 'from-indigo-500 to-purple-500',
      'teal': 'from-teal-500 to-cyan-500',
      'yellow': 'from-yellow-500 to-orange-500',
      'default': 'from-gray-500 to-gray-600'
    }
    return colors[color] || colors['default']
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center animate-spin mb-4">
            <Target className="h-8 w-8 text-white" />
          </div>
          <p className="text-gray-600 font-medium">Loading groups...</p>
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
            Groups
          </h1>
          <p className="text-gray-600 mt-1">Manage keywords and subreddits by category</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => {
              setShowNewGroupModal(true)
            }}
            className="px-4 py-2 rounded-xl flex items-center space-x-2 hover-lift bg-gradient-to-r from-blue-600 to-purple-600 text-white border-2 border-blue-500/20 font-semibold shadow-lg"
          >
            <FolderPlus className="h-4 w-4 text-white" />
            <span className="text-sm font-semibold text-white">New Group</span>
          </button>
          <div className="glass-card px-4 py-2 rounded-xl">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">
                {groups.length} groups, {groups.reduce((sum, g) => sum + g.keywords.length, 0)} keywords, {groups.reduce((sum, g) => sum + g.subreddits.length, 0)} subreddits
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Limits: 20 keywords, 10 subreddits per group
            </div>
          </div>
        </div>
      </div>

      {/* Groups */}
      <div className="space-y-4">
        {groups.map((group) => {
          const IconComponent = getGroupIcon(group.icon)
          const isExpanded = expandedGroups.includes(group.id)
          
          return (
            <div key={group.id} className="glass-card rounded-2xl overflow-hidden">
              {/* Group Header */}
              <div 
                className="p-6 cursor-pointer hover-lift"
                onClick={() => toggleGroup(group.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 bg-gradient-to-r ${getGroupColor(group.color)} rounded-xl`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{group.name}</h3>
                      <p className="text-gray-600 text-sm">{group.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Keywords</div>
                      <div className={`text-lg font-semibold ${
                        group.keywords.length >= 20 ? 'text-red-600' : 
                        group.keywords.length >= 15 ? 'text-orange-600' : 'text-gray-900'
                      }`}
                      title={`${group.keywords.length}/20 keywords${group.keywords.length >= 20 ? ' - Limit reached!' : ''}`}>
                        {group.keywords.length}/20
                        {group.keywords.length >= 20 && <span className="ml-1 text-xs">⚠️</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Subreddits</div>
                      <div className={`text-lg font-semibold ${
                        group.subreddits.length >= 10 ? 'text-red-600' : 
                        group.subreddits.length >= 8 ? 'text-orange-600' : 'text-gray-900'
                      }`}
                      title={`${group.subreddits.length}/10 subreddits${group.subreddits.length >= 10 ? ' - Limit reached!' : ''}`}>
                        {group.subreddits.length}/10
                        {group.subreddits.length >= 10 && <span className="ml-1 text-xs">⚠️</span>}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteGroup(group.id)
                        }}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Group"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      {isExpanded ? (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="border-t border-white/20 p-6 space-y-6">
                  {/* Keywords Section */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                        <Hash className="h-5 w-5" />
                        <span>Keywords ({group.keywords.filter(k => k.is_active).length} active)</span>
                        <span className="text-xs text-gray-500">({group.keywords.length}/20)</span>
                      </h4>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={newKeyword}
                          onChange={(e) => setNewKeyword(e.target.value)}
                          placeholder={group.keywords.length >= 20 ? "Limit reached - delete some keywords first" : "Add keyword..."}
                          disabled={group.keywords.length >= 20}
                          className="px-3 py-1 bg-white/50 rounded-lg border border-white/20 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          onKeyPress={(e) => e.key === "Enter" && handleAddKeyword(group.id)}
                        />
                        <button
                          onClick={() => handleAddKeyword(group.id)}
                          disabled={!newKeyword.trim() || group.keywords.length >= 20}
                          className={`px-3 py-1 rounded-lg text-sm transition-all ${
                            group.keywords.length >= 20 
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                              : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover-lift'
                          }`}
                          title={group.keywords.length >= 20 ? "Maximum 20 keywords reached - delete some first" : "Add keyword"}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {group.keywords.map((keyword) => (
                        <div key={keyword.id} className="bg-white/50 rounded-lg p-3 flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleToggleKeyword(keyword)}
                              className={`p-1 rounded ${keyword.is_active ? 'text-green-600' : 'text-gray-400'}`}
                            >
                              {keyword.is_active ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                            </button>
                            {editingKeyword === keyword.id ? (
                              <input
                                type="text"
                                defaultValue={keyword.keyword}
                                onBlur={(e) => handleUpdateKeyword(keyword.id, e.target.value)}
                                onKeyPress={(e) => e.key === "Enter" && handleUpdateKeyword(keyword.id, e.currentTarget.value)}
                                className="flex-1 px-2 py-1 bg-white rounded border text-sm"
                                autoFocus
                              />
                            ) : (
                              <span className="text-sm font-medium">{keyword.keyword}</span>
                            )}
                          </div>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => setEditingKeyword(keyword.id)}
                              className="p-1 text-gray-500 hover:text-blue-600"
                            >
                              <Edit className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteKeyword(keyword.id)}
                              className="p-1 text-gray-500 hover:text-red-600"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Subreddits Section */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                        <Globe className="h-5 w-5" />
                        <span>Subreddits ({group.subreddits.filter(s => s.is_active).length} active)</span>
                        <span className="text-xs text-gray-500">({group.subreddits.length}/10)</span>
                      </h4>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={newSubreddit}
                          onChange={(e) => setNewSubreddit(e.target.value)}
                          placeholder={group.subreddits.length >= 10 ? "Limit reached - delete some subreddits first" : "Add subreddit..."}
                          disabled={group.subreddits.length >= 10}
                          className="px-3 py-1 bg-white/50 rounded-lg border border-white/20 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          onKeyPress={(e) => e.key === "Enter" && handleAddSubreddit(group.id)}
                        />
                        <button
                          onClick={() => handleAddSubreddit(group.id)}
                          disabled={!newSubreddit.trim() || group.subreddits.length >= 10}
                          className={`px-3 py-1 rounded-lg text-sm transition-all ${
                            group.subreddits.length >= 10 
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                              : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover-lift'
                          }`}
                          title={group.subreddits.length >= 10 ? "Maximum 10 subreddits reached - delete some first" : "Add subreddit"}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {group.subreddits.map((subreddit) => (
                        <div key={subreddit.id} className="bg-white/50 rounded-lg p-3 flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleToggleSubreddit(subreddit)}
                              className={`p-1 rounded ${subreddit.is_active ? 'text-green-600' : 'text-gray-400'}`}
                            >
                              {subreddit.is_active ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                            </button>
                            {editingSubreddit === subreddit.id ? (
                              <input
                                type="text"
                                defaultValue={subreddit.name}
                                onBlur={(e) => handleUpdateSubreddit(subreddit.id, e.target.value)}
                                onKeyPress={(e) => e.key === "Enter" && handleUpdateSubreddit(subreddit.id, e.currentTarget.value)}
                                className="flex-1 px-2 py-1 bg-white rounded border text-sm"
                                autoFocus
                              />
                            ) : (
                              <span className="text-sm font-medium">r/{subreddit.name}</span>
                            )}
                          </div>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => setEditingSubreddit(subreddit.id)}
                              className="p-1 text-gray-500 hover:text-blue-600"
                            >
                              <Edit className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteSubreddit(subreddit.id)}
                              className="p-1 text-gray-500 hover:text-red-600"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* New Group Modal */}
      {showNewGroupModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-card rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-semibold mb-4">Create New Group</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
                <input
                  type="text"
                  value={newGroupData.name}
                  onChange={(e) => setNewGroupData({...newGroupData, name: e.target.value})}
                  className="w-full px-3 py-2 bg-white/50 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter group name..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newGroupData.description}
                  onChange={(e) => setNewGroupData({...newGroupData, description: e.target.value})}
                  className="w-full px-3 py-2 bg-white/50 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter group description..."
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                <div className="grid grid-cols-4 gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setNewGroupData({...newGroupData, color: color.value})}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        newGroupData.color === color.value 
                          ? 'border-blue-500 scale-105' 
                          : 'border-transparent hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-full h-6 bg-gradient-to-r ${color.class} rounded`}></div>
                      <div className="text-xs mt-1">{color.label}</div>
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                <div className="grid grid-cols-5 gap-2">
                  {iconOptions.map((icon) => {
                    const IconComponent = icon.icon
                    return (
                      <button
                        key={icon.value}
                        onClick={() => setNewGroupData({...newGroupData, icon: icon.value})}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          newGroupData.icon === icon.value 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-transparent hover:border-gray-300'
                        }`}
                      >
                        <IconComponent className="h-6 w-6 mx-auto text-gray-600" />
                        <div className="text-xs mt-1">{icon.label}</div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowNewGroupModal(false)}
                className="flex-1 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGroup}
                disabled={!newGroupData.name.trim() || !newGroupData.description.trim()}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover-lift disabled:opacity-50"
              >
                Create Group
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 