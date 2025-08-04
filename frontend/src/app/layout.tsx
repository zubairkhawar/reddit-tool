import type { Metadata } from "next"
import "./globals.css"
import Sidebar from "@/components/sidebar"
import AIAssistant from "@/components/ai-assistant"
import { ToasterProvider } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: "RedditLead.AI - Your AI Reddit Lead Hunter",
  description: "Automated Reddit lead generation and response system",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <ToasterProvider>
          <div className="flex h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-green-400/20 to-blue-400/20 rounded-full blur-3xl"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl"></div>
            </div>
            
            <Sidebar />
            <main className="flex-1 overflow-auto relative z-10">
              {children}
            </main>
            <AIAssistant />
          </div>
        </ToasterProvider>
      </body>
    </html>
  )
}
