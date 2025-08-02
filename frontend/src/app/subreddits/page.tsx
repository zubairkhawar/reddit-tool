"use client"

import { useEffect, useState } from "react"
import { apiClient, Subreddit } from "@/lib/api"
import { Plus, Edit, Trash2, Users, ToggleLeft, ToggleRight } from "lucide-react"

export default function SubredditsPage() {
  const [subreddits, setSubreddits] = useState<Subreddit[]>([])
  const [loading, setLoading] = useState(true)
  const [newSubreddit, setNewSubreddit] = useState("")
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingValue, setEditingValue] = useState("")

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
        <h1 className="text-2xl font-bold text-gray-900">Subreddits</h1>
        <div className="text-sm text-gray-500">
          {subreddits.filter(s => s.is_active).length} active subreddits
        </div>
      </div>

      {/* Add New Subreddit */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Subreddit</h2>
        <div className="flex space-x-3">
          <input
            type="text"
            value={newSubreddit}
            onChange={(e) => setNewSubreddit(e.target.value)}
            placeholder="Enter subreddit name (e.g., forhire, freelancing)..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => e.key === "Enter" && handleAddSubreddit()}
          />
          <button
            onClick={handleAddSubreddit}
            disabled={!newSubreddit.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Subreddits List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Manage Subreddits</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {subreddits.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No subreddits found</h3>
              <p className="text-gray-600">Add your first subreddit to start monitoring posts.</p>
            </div>
          ) : (
            subreddits.map((subreddit) => (
              <div key={subreddit.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleToggleActive(subreddit)}
                      className={`p-1 rounded-full ${
                        subreddit.is_active ? "text-green-600" : "text-gray-400"
                      }`}
                    >
                      {subreddit.is_active ? (
                        <ToggleRight className="h-5 w-5" />
                      ) : (
                        <ToggleLeft className="h-5 w-5" />
                      )}
                    </button>
                    
                    {editingId === subreddit.id ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          onKeyPress={(e) => e.key === "Enter" && handleUpdateSubreddit(subreddit.id)}
                        />
                        <button
                          onClick={() => handleUpdateSubreddit(subreddit.id)}
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
                        subreddit.is_active ? "text-gray-900" : "text-gray-500"
                      }`}>
                        r/{subreddit.name}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">
                      {new Date(subreddit.created_at).toLocaleDateString()}
                    </span>
                    
                    {editingId !== subreddit.id && (
                      <>
                        <button
                          onClick={() => {
                            setEditingId(subreddit.id)
                            setEditingValue(subreddit.name)
                          }}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSubreddit(subreddit.id)}
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

      {/* Popular Subreddits */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Popular Subreddits</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            "forhire",
            "freelancing",
            "workonline",
            "jobs",
            "careeradvice",
            "entrepreneur",
            "smallbusiness",
            "startups",
            "webdev",
            "programming",
            "design",
            "marketing",
          ].map((name) => (
            <button
              key={name}
              onClick={() => setNewSubreddit(name)}
              className="p-3 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <div className="font-medium text-gray-900">r/{name}</div>
              <div className="text-xs text-gray-500 mt-1">Click to add</div>
            </button>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Tips for choosing subreddits:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Focus on job/freelance subreddits like r/forhire, r/freelancing</li>
          <li>• Include industry-specific subreddits (r/webdev, r/design)</li>
          <li>• Consider business subreddits (r/entrepreneur, r/smallbusiness)</li>
          <li>• Monitor local subreddits for location-based opportunities</li>
        </ul>
      </div>
    </div>
  )
} 