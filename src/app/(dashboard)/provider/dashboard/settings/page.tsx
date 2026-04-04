"use client"

import { Button } from "@/components/ui/button"
import { useSession, signOut } from "next-auth/react"
import { Shield, Bell, Globe } from "lucide-react"
import { useMarketplace } from "@/context/MarketplaceContext"
import { useState, useEffect } from "react"
import { prisma } from "@/lib/db" // Wait, server action is better
import { updateProfile } from "@/lib/actions"

export default function SettingsPage() {
  const { data: session } = useSession()
  const { showToast } = useMarketplace()
  
  const [form, setForm] = useState({ name: "", title: "", bio: "" })
  const [saving, setSaving] = useState(false)

  // Initialize from session
  useEffect(() => {
    if (session?.user) {
      setForm({
        name: session.user.name || "",
        // @ts-ignore (Assuming custom fields in user)
        title: session.user.title || "Senior Developer",
        // @ts-ignore
        bio: session.user.bio || "Crafting marketplaces."
      })
    }
  }, [session])

  const handleSave = async () => {
    if (!session?.user?.id) return
    setSaving(true)
    try {
      // @ts-ignore
      await updateProfile(session.user.id, form)
      showToast("Profile saved!")
    } catch (e) {
      showToast("Sync failed", "error")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8 max-w-3xl animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your account profile across all devices.</p>
      </div>

      <div className="border border-slate-200 bg-white rounded-sm p-6 space-y-6">
        <h2 className="text-base font-semibold text-slate-900 border-b border-slate-200 pb-2">Profile Information</h2>
        
        <div className="grid gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Display Name</label>
            <input type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full border border-slate-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 max-w-md" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Professional Title</label>
            <input type="text" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} className="w-full border border-slate-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 max-w-md" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Bio</label>
            <textarea rows={3} value={form.bio} onChange={(e) => setForm({...form, bio: e.target.value})} className="w-full border border-slate-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 max-w-md resize-none" />
          </div>
        </div>
      </div>

      <div className="flex justify-end pb-8">
        <Button onClick={handleSave} disabled={saving}>{saving ? "Syncing..." : "Save Changes"}</Button>
      </div>
    </div>
  )
}
