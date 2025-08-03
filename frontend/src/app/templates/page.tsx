"use client"

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'
import { ReplyTemplate } from '@/lib/api'

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<ReplyTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getReplyTemplates()
      setTemplates(Array.isArray(response) ? response : [])
    } catch (err) {
      setError('Failed to fetch templates')
      console.error('Error fetching templates:', err)
    } finally {
      setLoading(false)
    }
  }

  const getTemplateTypeColor = (type: string) => {
    const colors = {
      'web_development': 'bg-blue-100 text-blue-800',
      'ai_automation': 'bg-purple-100 text-purple-800',
      'mobile_app': 'bg-green-100 text-green-800',
      'data_analysis': 'bg-orange-100 text-orange-800',
      'general': 'bg-gray-100 text-gray-800'
    }
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getTemplateTypeLabel = (type: string) => {
    const labels = {
      'web_development': 'Web Development',
      'ai_automation': 'AI/Automation',
      'mobile_app': 'Mobile App',
      'data_analysis': 'Data Analysis',
      'general': 'General'
    }
    return labels[type as keyof typeof labels] || type
  }

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Reply Templates</h1>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Reply Templates</h1>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Reply Templates</h1>
        <div className="text-sm text-gray-500">
          {templates.length} templates available
        </div>
      </div>

      <div className="grid gap-4">
        {templates.map((template) => (
          <div
            key={template.id}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {template.name}
                </h3>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTemplateTypeColor(template.template_type)}`}>
                    {getTemplateTypeLabel(template.template_type)}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    template.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {template.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                Created: {new Date(template.created_at).toLocaleDateString()}
              </div>
            </div>

            <div className="bg-gray-50 rounded-md p-4">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {template.content}
              </p>
            </div>

            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Last updated: {new Date(template.updated_at).toLocaleDateString()}
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors">
                  Edit
                </button>
                <button className={`px-3 py-1 text-sm rounded transition-colors ${
                  template.is_active
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}>
                  {template.is_active ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {templates.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-500">Templates will appear here once they're added to the system.</p>
        </div>
      )}
    </div>
  )
} 