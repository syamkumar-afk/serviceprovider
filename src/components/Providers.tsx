"use client"

import { SessionProvider } from "next-auth/react"
import { MarketplaceProvider } from "@/context/MarketplaceContext"
import { ToastContainer } from "@/components/ui/toast"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <MarketplaceProvider>
        {children}
        <ToastContainer />
      </MarketplaceProvider>
    </SessionProvider>
  )
}
