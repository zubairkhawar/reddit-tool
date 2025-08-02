"use client"

import { useState, useEffect } from 'react'
import { apiClient, SystemConfig } from '@/lib/api'
import { Settings, Eye, EyeOff, MessageCircle, Bell, Shield } from 'lucide-react'

export default function SettingsPage() {
  const [systemConfig, setSystemConfig] = useState<SystemConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [showKeys, setShowKeys] = useState(false)
  const [whatsappEnabled, setWhatsappEnabled] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const config = await apiClient.getAllSystemConfig()
      setSystemConfig(config)
      
      // Check WhatsApp status
      const whatsappConfig = config.find(c => c.key === 'whatsapp_bot_enabled')
      setWhatsappEnabled(whatsappConfig?.value === 'true')
    } catch (error) {
      console.error('Error loading settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleWhatsApp = async (enabled: boolean) => {
    try {
      if (enabled) {
        await apiClient.enableWhatsApp()
      } else {
        await apiClient.disableWhatsApp()
      }
      setWhatsappEnabled(enabled)
    } catch (error) {
      console.error('Error toggling WhatsApp:', error)
    }
  }

  const testWhatsApp = async () => {
    try {
      await apiClient.testWhatsApp()
      alert('WhatsApp test message sent!')
    } catch (error) {
      console.error('Error testing WhatsApp:', error)
      alert('Failed to send WhatsApp test message')
    }
  }

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
      <div className="flex items-center space-x-2 mb-6">
        <Settings className="w-6 h-6" />
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      {/* AI Configuration */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
          <Shield className="w-5 h-5 text-blue-500" />
          <span>AI Configuration</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {systemConfig
            .filter(config => config.key.startsWith('ai_'))
            .map((config) => (
              <div key={config.key} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {config.key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </label>
                <input
                  type="text"
                  value={config.value}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
                <p className="text-xs text-gray-500">{config.description}</p>
              </div>
            ))}
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
          <Bell className="w-5 h-5 text-green-500" />
          <span>Notification Settings</span>
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Telegram Notifications</h3>
              <p className="text-sm text-gray-500">Receive alerts via Telegram bot</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {systemConfig.find(c => c.key === 'telegram_bot_enabled')?.value === 'true' ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">WhatsApp Notifications</h3>
              <p className="text-sm text-gray-500">Receive alerts via WhatsApp Business API</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => toggleWhatsApp(!whatsappEnabled)}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  whatsappEnabled
                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {whatsappEnabled ? 'Enabled' : 'Disabled'}
              </button>
              {whatsappEnabled && (
                <button
                  onClick={testWhatsApp}
                  className="px-3 py-1 rounded text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200"
                >
                  Test
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp Configuration */}
      {whatsappEnabled && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
            <MessageCircle className="w-5 h-5 text-green-500" />
            <span>WhatsApp Configuration</span>
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                WhatsApp Access Token
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type={showKeys ? 'text' : 'password'}
                  value="••••••••••••••••••••••••••••••••"
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
                <button
                  onClick={() => setShowKeys(!showKeys)}
                  className="p-2 text-gray-500 hover:text-gray-700"
                >
                  {showKeys ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number ID
              </label>
              <input
                type="text"
                value="••••••••••••••••••••••••••••••••"
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Destination Phone Number
              </label>
              <input
                type="text"
                value="••••••••••••••••••••••••••••••••"
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              />
            </div>
          </div>
        </div>
      )}

      {/* API Keys */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">API Keys</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              OpenAI API Key
            </label>
            <div className="flex items-center space-x-2">
              <input
                type={showKeys ? 'text' : 'password'}
                value="••••••••••••••••••••••••••••••••"
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              />
              <button
                onClick={() => setShowKeys(!showKeys)}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                {showKeys ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reddit Client ID
            </label>
            <input
              type={showKeys ? 'text' : 'password'}
              value="••••••••••••••••••••••••••••••••"
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reddit Client Secret
            </label>
            <input
              type={showKeys ? 'text' : 'password'}
              value="••••••••••••••••••••••••••••••••"
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
            />
          </div>
        </div>
      </div>
    </div>
  )
} 