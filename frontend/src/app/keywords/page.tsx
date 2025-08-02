"use client"

import { useEffect, useState } from "react"
import { apiClient, Keyword } from "@/lib/api"
import { Plus, Edit, Trash2, Search, ToggleLeft, ToggleRight } from "lucide-react"

export default function KeywordsPage() {
  const [keywords, setKeywords] = useState<Keyword[]>([])
  const [loading, setLoading] = useState(true)
  const [newKeyword, setNewKeyword] = useState("")
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingValue, setEditingValue] = useState("")

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
        <h1 className="text-2xl font-bold text-gray-900">Keywords</h1>
        <div className="text-sm text-gray-500">
          {keywords.filter(k => k.is_active).length} active keywords
        </div>
      </div>

      {/* Add New Keyword */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Keyword</h2>
        <div className="flex space-x-3">
          <input
            type="text"
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            placeholder="Enter keyword to monitor..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => e.key === "Enter" && handleAddKeyword()}
          />
          <button
            onClick={handleAddKeyword}
            disabled={!newKeyword.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Keywords List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Manage Keywords</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {keywords.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No keywords found</h3>
              <p className="text-gray-600">Add your first keyword to start monitoring Reddit posts.</p>
            </div>
          ) : (
            keywords.map((keyword) => (
              <div key={keyword.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleToggleActive(keyword)}
                      className={`p-1 rounded-full ${
                        keyword.is_active ? "text-green-600" : "text-gray-400"
                      }`}
                    >
                      {keyword.is_active ? (
                        <ToggleRight className="h-5 w-5" />
                      ) : (
                        <ToggleLeft className="h-5 w-5" />
                      )}
                    </button>
                    
                    {editingId === keyword.id ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          onKeyPress={(e) => e.key === "Enter" && handleUpdateKeyword(keyword.id)}
                        />
                        <button
                          onClick={() => handleUpdateKeyword(keyword.id)}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null)
                            setEditingValue("")
                          }}
                          className="text-sm text-gray-600 hover:text-gray-800"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <span className={`text-sm font-medium ${
                        keyword.is_active ? "text-gray-900" : "text-gray-500"
                      }`}>
                        {keyword.keyword}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">
                      {new Date(keyword.created_at).toLocaleDateString()}
                    </span>
                    
                    {editingId !== keyword.id && (
                      <>
                        <button
                          onClick={() => {
                            setEditingId(keyword.id)
                            setEditingValue(keyword.keyword)
                          }}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteKeyword(keyword.id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Tips for effective keywords:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Use specific terms like "AI automation" instead of just "AI"</li>
          <li>• Include budget indicators like "budget", "pay", "rate"</li>
          <li>• Add urgency words like "urgent", "ASAP", "needed"</li>
          <li>• Include service types like "development", "design", "consulting"</li>
        </ul>
      </div>
    </div>
  )
} 