"use client"

import { createContext, useContext, useState } from "react"

interface Toast {
  id: string
  title: string
  description?: string
  type?: "success" | "error" | "info"
}

interface ToasterContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, "id">) => void
  removeToast: (id: string) => void
}

const ToasterContext = createContext<ToasterContextType | undefined>(undefined)

export function ToasterProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = (toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts((prev) => [...prev, { ...toast, id }])
    setTimeout(() => removeToast(id), 5000)
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  return (
    <ToasterContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`rounded-lg p-4 shadow-lg ${
              toast.type === "error"
                ? "bg-red-500 text-white"
                : toast.type === "success"
                ? "bg-green-500 text-white"
                : "bg-blue-500 text-white"
            }`}
          >
            <div className="font-medium">{toast.title}</div>
            {toast.description && (
              <div className="text-sm opacity-90">{toast.description}</div>
            )}
          </div>
        ))}
      </div>
    </ToasterContext.Provider>
  )
}

export function useToaster() {
  const context = useContext(ToasterContext)
  if (!context) {
    throw new Error("useToaster must be used within a ToasterProvider")
  }
  return context
}

export function Toaster() {
  return null // This is handled by the provider
} 