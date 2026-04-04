"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Star, X } from "lucide-react"
import Link from "next/link"
import { signIn, useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { getServices, bookService } from "@/lib/actions"
import { useMarketplace } from "@/context/MarketplaceContext"

export default function DiscoveryPage() {
  const { data: session } = useSession()
  const { showToast } = useMarketplace()
  const [services, setServices] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [hireModal, setHireModal] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch from DB
  useEffect(() => {
    getServices().then(setServices).finally(() => setLoading(false))
  }, [])

  const filtered = services.filter((s) => 
    s.title.toLowerCase().includes(search.toLowerCase()) || 
    s.provider?.name?.toLowerCase().includes(search.toLowerCase())
  )

  const confirmHire = async () => {
    if (!session?.user?.id) {
       showToast("Please sign in to book services", "info")
       signIn()
       return
    }
    if (hireModal) {
      try {
        await bookService({
          serviceId: hireModal.id,
          // @ts-ignore
          clientId: session.user.id,
          providerId: hireModal.providerId,
          amount: hireModal.price,
        })
        setHireModal(null)
        showToast("Booking created! Head to dashboard to view.")
      } catch (e) {
        showToast("Booking failed", "error")
      }
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="border-b border-slate-200 bg-white h-14 flex items-center px-6 justify-between">
        <div className="font-semibold tracking-tight text-slate-900 flex items-center gap-2">
          <div className="h-4 w-4 bg-slate-900 rounded-sm" /> Marketplace
        </div>
        <div className="flex space-x-4">
          {!session ? (
            <Button variant="ghost" className="text-sm" onClick={() => signIn()}>Sign In</Button>
          ) : (
            <Link href="/provider/dashboard"><Button size="sm">Go to Dashboard</Button></Link>
          )}
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-6 py-12">
        <div className="mb-8"><h1 className="text-2xl font-bold tracking-tight">Available Services</h1></div>
        
        <div className="relative mb-8 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="w-full h-10 pl-9 border border-slate-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-slate-900" />
        </div>

        {loading ? (
          <div className="text-slate-400 text-sm">Loading from database...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((service) => (
              <div key={service.id} className="border border-slate-200 bg-white p-5 hover:border-slate-400 transition-all flex flex-col min-h-[160px]">
                <div className="flex flex-col gap-1 mb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-slate-900">{service.title}</h3>
                      <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{service.category}</p>
                    </div>
                    <span className="font-mono text-sm font-bold border-l border-slate-100 pl-3">${service.price}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">{service.description || "No description provided."}</p>
                  <p className="text-[10px] text-slate-400 mt-2 italic">— {service.provider?.name || "Provider"}</p>
                </div>
                <div className="mt-auto pt-4 flex justify-between items-center border-t border-slate-50">
                  <div className="flex items-center gap-1 text-slate-900"><Star className="h-3 w-3 fill-amber-400 text-amber-400"/> <span className="text-xs font-bold">{service.rating || "New"}</span></div>
                  <Button size="sm" className="h-8 text-xs" onClick={() => setHireModal(service)}>Hire Now</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Hire Modal */}
      {hireModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white border border-slate-200 rounded-sm w-full max-w-md p-6">
            <h2 className="text-lg font-bold mb-4">Confirm Booking</h2>
            <div className="border border-slate-100 p-4 mb-6 rounded-sm bg-slate-50">
              <p className="text-sm font-bold">{hireModal.title}</p>
              <p className="text-lg font-mono font-bold mt-2">${hireModal.price}</p>
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setHireModal(null)}>Cancel</Button>
              <Button onClick={confirmHire}>Submit Booking</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
