"use client"

import React, { createContext, useContext, useState, useCallback } from "react"

// --- Types ---
export interface Toast {
  id: string
  message: string
  type: "success" | "error" | "info"
}

interface MarketplaceContextType {
  toasts: Toast[]
  showToast: (message: string, type?: Toast["type"]) => void
  dismissToast: (id: string) => void
  activeConversationId: string
  setActiveConversation: (id: string) => void
}

const MarketplaceContext = createContext<MarketplaceContextType | null>(null)

export function useMarketplace() {
  const ctx = useContext(MarketplaceContext)
  if (!ctx) throw new Error("useMarketplace must be used within MarketplaceProvider")
  return ctx
}

let idCounter = 100
function generateId() {
  return `gen_${Date.now()}_${idCounter++}`
}

export function MarketplaceProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const [activeConversationId, setActiveConversationId] = useState("")

  // --- Toast ---
  const showToast = useCallback((message: string, type: Toast["type"] = "success") => {
    const id = generateId()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500)
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const setActiveConversation = useCallback((id: string) => {
    setActiveConversationId(id)
  }, [])

  return (
    <MarketplaceContext.Provider
      value={{
        toasts, showToast, dismissToast,
        activeConversationId, setActiveConversation
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  )
}
