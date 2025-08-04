"use client"

import { useState } from "react"
import { 
  Brain, 
  Sparkles, 
  MessageSquare, 
  Target, 
  TrendingUp, 
  X,
  Lightbulb,
  Zap,
  CheckCircle,
  ArrowRight
} from "lucide-react"

const tips = [
  {
    icon: Target,
    title: "Keyword Optimization",
    description: "Add industry-specific keywords to find more targeted leads",
    color: "from-blue-500 to-purple-500"
  },
  {
    icon: TrendingUp,
    title: "Engagement Tracking",
    description: "Monitor reply performance to improve your response strategy",
    color: "from-green-500 to-blue-500"
  },
  {
    icon: MessageSquare,
    title: "Smart Replies",
    description: "Use AI-generated responses for faster lead engagement",
    color: "from-purple-500 to-pink-500"
  },
  {
    icon: Zap,
    title: "Priority Alerts",
    description: "Get notified instantly when high-value opportunities are found",
    color: "from-orange-500 to-red-500"
  }
]

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentTip, setCurrentTip] = useState(0)

  const nextTip = () => {
    setCurrentTip((prev) => (prev + 1) % tips.length)
  }

  return (
    <>
      {/* Floating AI Avatar */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center shadow-lg hover-lift ai-glow"
        >
          <Brain className="h-8 w-8 text-white" />
        </button>
      </div>

      {/* AI Assistant Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-6">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="glass-card rounded-2xl p-6 w-96 max-h-[80vh] overflow-hidden relative">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">AI Assistant</h3>
                  <p className="text-sm text-gray-600">Your Reddit lead expert</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/50 rounded-xl transition-colors"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            {/* Status */}
            <div className="mb-6 p-4 bg-gradient-to-r from-green-100 to-blue-100 rounded-xl">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700">AI Status: Active</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Scanning 24/7 for high-priority opportunities
              </p>
            </div>

            {/* Tips Section */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
                <Lightbulb className="h-4 w-4 mr-2 text-yellow-600" />
                Pro Tips
              </h4>
              
              <div className="space-y-3">
                {tips.map((tip, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-xl transition-all duration-300 cursor-pointer hover-lift ${
                      index === currentTip ? 'bg-white/80 shadow-lg' : 'bg-white/50'
                    }`}
                    onClick={() => setCurrentTip(index)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 bg-gradient-to-r ${tip.color} rounded-lg text-white`}>
                        <tip.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <h5 className="text-sm font-semibold text-gray-900 mb-1">
                          {tip.title}
                        </h5>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          {tip.description}
                        </p>
                      </div>
                      {index === currentTip && (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="flex space-x-1">
                  {tips.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentTip ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <button
                  onClick={nextTip}
                  className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <span>Next tip</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h4>
              <button className="w-full p-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 hover-lift">
                <div className="flex items-center justify-center space-x-2">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-sm font-medium">Generate Smart Reply</span>
                </div>
              </button>
              <button className="w-full p-3 bg-white/50 border border-gray-200 text-gray-700 rounded-xl hover:bg-white/80 transition-all duration-300 hover-lift">
                <div className="flex items-center justify-center space-x-2">
                  <Target className="h-4 w-4" />
                  <span className="text-sm font-medium">Optimize Keywords</span>
                </div>
              </button>
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-white/20">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>AI Confidence: 94%</span>
                <span>v2.1.0</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 