"use client"

import { useMarketplace, Toast } from "@/context/MarketplaceContext"
import { X, CheckCircle, AlertCircle, Info } from "lucide-react"

const icons = {
  success: <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />,
  error: <AlertCircle className="h-4 w-4 text-rose-500 flex-shrink-0" />,
  info: <Info className="h-4 w-4 text-blue-500 flex-shrink-0" />,
}

export function ToastContainer() {
  const { toasts, dismissToast } = useMarketplace()
  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="flex items-center gap-3 border border-slate-200 bg-white px-4 py-3 rounded-sm shadow-sm animate-in slide-in-from-right"
        >
          {icons[toast.type]}
          <p className="text-sm text-slate-800 flex-1">{toast.message}</p>
          <button onClick={() => dismissToast(toast.id)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  )
}
