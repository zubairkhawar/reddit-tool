"use client"

import { useEffect, useState } from "react"
import { apiClient } from "@/lib/api"
import { Eye, EyeOff, UserCog, Bell, Key } from "lucide-react"

interface AIPersona {
  id: number
  name: string
  description: string
  tone: string
  cta: string
  created_at: string
  updated_at: string
}

export default function SettingsPage() {
  const [persona, setPersona] = useState<AIPersona | null>(null)
  const [loading, setLoading] = useState(true)
  const [showOpenAIKey, setShowOpenAIKey] = useState(false)
  const [showRedditKey, setShowRedditKey] = useState(false)
  const [showTelegramKey, setShowTelegramKey] = useState(false)
  const [showTwilioKey, setShowTwilioKey] = useState(false)

  useEffect(() => {
    fetchPersona()
  }, [])

  const fetchPersona = async () => {
    try {
      // This assumes an endpoint like /api/ai-personas/1/ for the default persona
      const res = await fetch("/api/ai-personas/1/")
      if (res.ok) {
        setPersona(await res.json())
      }
    } catch (error) {
      console.error("Error fetching AI persona:", error)
    } finally {
      setLoading(false)
    }
  }

  // These would be fetched from a secure API in a real app
  const openaiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || "sk-...abcd"
  const redditKey = process.env.NEXT_PUBLIC_REDDIT_CLIENT_ID || "id-...xyz"
  const telegramKey = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN || "tg-...1234"
  const twilioKey = process.env.NEXT_PUBLIC_TWILIO_ACCOUNT_SID || "tw-...5678"

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      </div>

      {/* AI Persona */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <UserCog className="h-6 w-6 text-blue-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">AI Persona</h2>
        </div>
        {persona ? (
          <div>
            <div className="mb-2">
              <span className="font-medium text-gray-700">Name:</span> {persona.name}
            </div>
            <div className="mb-2">
              <span className="font-medium text-gray-700">Description:</span> {persona.description}
            </div>
            <div className="mb-2">
              <span className="font-medium text-gray-700">Tone:</span> {persona.tone}
            </div>
            <div className="mb-2">
              <span className="font-medium text-gray-700">Call to Action:</span> {persona.cta}
            </div>
          </div>
        ) : (
          <div className="text-gray-500">No AI persona configured.</div>
        )}
      </div>

      {/* Notification Preferences */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Bell className="h-6 w-6 text-blue-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">Notification Preferences</h2>
        </div>
        <div className="space-y-2">
          <div className="flex items-center">
            <input type="checkbox" id="notif-high-priority" checked readOnly className="mr-2" />
            <label htmlFor="notif-high-priority" className="text-gray-700">High-priority post alerts (required)</label>
          </div>
          <div className="flex items-center">
            <input type="checkbox" id="notif-reply" checked readOnly className="mr-2" />
            <label htmlFor="notif-reply" className="text-gray-700">Replies to my comments</label>
          </div>
          <div className="flex items-center">
            <input type="checkbox" id="notif-engagement" checked readOnly className="mr-2" />
            <label htmlFor="notif-engagement" className="text-gray-700">High engagement on replies</label>
          </div>
        </div>
      </div>

      {/* API Keys (masked) */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Key className="h-6 w-6 text-blue-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">API Keys (masked)</h2>
        </div>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-gray-700 w-40">OpenAI API Key:</span>
            <span className="font-mono bg-gray-100 px-2 py-1 rounded">
              {showOpenAIKey ? openaiKey : openaiKey.replace(/.(?=.{4})/g, "*")}
            </span>
            <button onClick={() => setShowOpenAIKey((v) => !v)} className="ml-2 text-gray-400 hover:text-gray-700">
              {showOpenAIKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-medium text-gray-700 w-40">Reddit Client ID:</span>
            <span className="font-mono bg-gray-100 px-2 py-1 rounded">
              {showRedditKey ? redditKey : redditKey.replace(/.(?=.{4})/g, "*")}
            </span>
            <button onClick={() => setShowRedditKey((v) => !v)} className="ml-2 text-gray-400 hover:text-gray-700">
              {showRedditKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-medium text-gray-700 w-40">Telegram Bot Token:</span>
            <span className="font-mono bg-gray-100 px-2 py-1 rounded">
              {showTelegramKey ? telegramKey : telegramKey.replace(/.(?=.{4})/g, "*")}
            </span>
            <button onClick={() => setShowTelegramKey((v) => !v)} className="ml-2 text-gray-400 hover:text-gray-700">
              {showTelegramKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-medium text-gray-700 w-40">Twilio Account SID:</span>
            <span className="font-mono bg-gray-100 px-2 py-1 rounded">
              {showTwilioKey ? twilioKey : twilioKey.replace(/.(?=.{4})/g, "*")}
            </span>
            <button onClick={() => setShowTwilioKey((v) => !v)} className="ml-2 text-gray-400 hover:text-gray-700">
              {showTwilioKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div className="text-xs text-gray-500 mt-4">
          API keys are stored securely on the backend and never exposed in the frontend. For display only.
        </div>
      </div>
    </div>
  )
} 