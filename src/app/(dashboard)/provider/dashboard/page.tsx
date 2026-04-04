"use client";

import { useMarketplace } from "@/context/MarketplaceContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Check, XCircle, Trash2, ArrowUpRight, TrendingUp, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { 
  getProviderDashboardData, 
  createService, 
  deleteService, 
  updateBookingStatus 
} from "@/lib/actions";
import { useRouter } from "next/navigation";

export default function ProviderDashboard() {
  const { data: session } = useSession();
  const { showToast } = useMarketplace();
  const router = useRouter();
  
  const [data, setData] = useState<{ services: any[], bookings: any[], earnings: any[] } | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form, setForm] = useState({ title: "", price: "", category: "Development", description: "" });
  const [loading, setLoading] = useState(true);

  // Sync with DB on load and active refresh
  const syncData = async () => {
    if (!session?.user?.id) return;
    setLoading(true);
    try {
      // @ts-ignore (NextAuth custom ID)
      const res = await getProviderDashboardData(session.user.id);
      setData(res);
    } catch (e) {
      console.error(e);
      showToast("Error syncing", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    syncData();
  }, [session?.user?.id]);

  // --- Handlers (Calling Server Actions) ---
  const handleCreate = async () => {
    if (!session?.user?.id) return;
    try {
      // @ts-ignore
      await createService({ ...form, price: parseFloat(form.price), providerId: session.user.id });
      setShowCreateModal(false);
      setForm({ title: "", price: "", category: "Development", description: "" });
      showToast("Service created!");
      syncData(); // Instant sync
    } catch (e) {
      showToast("Create failed", "error");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteService(id);
      showToast("Service removed from database");
      syncData();
    } catch (e) {
      showToast("Delete failed", "error");
    }
  };

  const handleStatus = async (id: string, status: string) => {
    try {
      await updateBookingStatus(id, status);
      showToast(`Booking ${status.toLowerCase()}ed`);
      syncData();
    } catch (e) {
      showToast("Status update failed", "error");
    }
  };

  if (loading && !data) return <div className="p-8 text-slate-400 text-sm">Syncing your dashboard...</div>;

  const services = data?.services || [];
  const bookings = data?.bookings || [];

  return (
    <div className="space-y-6 max-w-5xl animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Overview</h1>
          <p className="text-sm text-slate-500 mt-1">Synced with your account: {session?.user?.email}</p>
        </div>
        <Button className="gap-2" onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4" />
          Create Service
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="border border-slate-200 bg-white p-6 rounded-sm">
          <p className="text-sm font-medium text-slate-500">Status</p>
          <div className="mt-2 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-lg font-semibold tracking-tight text-slate-900">Live Sync</span>
          </div>
        </div>
        <div className="border border-slate-200 bg-white p-6 rounded-sm">
          <p className="text-sm font-medium text-slate-500">Active Services</p>
          <div className="mt-2"><span className="text-3xl font-semibold tracking-tight text-slate-900">{services.length}</span></div>
        </div>
        <div className="border border-slate-200 bg-white p-6 rounded-sm">
          <p className="text-sm font-medium text-slate-500">Pending Bookings</p>
          <div className="mt-2"><span className="text-3xl font-semibold tracking-tight text-slate-900">{bookings.filter(b => b.status === "PENDING").length}</span></div>
        </div>
      </div>

      {/* Bookings Table */}
      <div>
        <h2 className="text-lg font-semibold tracking-tight mb-4">Real-Time Bookings</h2>
        <div className="border border-slate-200 bg-white rounded-sm overflow-hidden">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-900">
              <tr>
                <th className="px-4 py-3 font-medium">Client</th>
                <th className="px-4 py-3 font-medium">Service</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {bookings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-900">{b.client?.name || "Client"}</td>
                  <td className="px-4 py-3">{b.service?.title}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={`text-[10px] py-0 ${
                      b.status === "PENDING" ? "border-amber-200 bg-amber-50 text-amber-700" :
                      b.status === "CONFIRMED" ? "border-emerald-200 bg-emerald-50 text-emerald-700" :
                      "border-slate-200 bg-slate-50 text-slate-600"
                    }`}>{b.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    {b.status === "PENDING" && (
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleStatus(b.id, "CONFIRMED")}><Check className="h-4 w-4 text-emerald-600"/></Button>
                        <Button variant="ghost" size="sm" onClick={() => handleStatus(b.id, "CANCELLED")}><XCircle className="h-4 w-4 text-rose-500"/></Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {bookings.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-400 text-sm">Waiting for your first clients via discovery...</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Services Table */}
      <div>
        <h2 className="text-lg font-semibold tracking-tight mb-4">Your Services</h2>
        <div className="border border-slate-200 bg-white rounded-sm overflow-hidden">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-900">
              <tr>
                <th className="px-4 py-3 font-medium">Service Name</th>
                <th className="px-4 py-3 font-medium text-right">Price</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {services.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-900">{s.title}</td>
                  <td className="px-4 py-3 text-right font-mono">${s.price.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(s.id)}><Trash2 className="h-4 w-4 text-rose-500"/></Button>
                  </td>
                </tr>
              ))}
              {services.length === 0 && (
                <tr><td colSpan={3} className="px-4 py-8 text-center text-slate-400 text-sm">No services yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white border border-slate-200 rounded-sm w-full max-w-lg mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-lg font-semibold text-slate-900">New Service</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Service Title *</label>
                  <input type="text" value={form.title} placeholder="e.g. Next.js Website" onChange={(e) => setForm({...form, title: e.target.value})} className="w-full border border-slate-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                  <select value={form.category} onChange={(e) => setForm({...form, category: e.target.value})} className="w-full border border-slate-200 bg-white rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-900">
                    <option value="Development">Development</option>
                    <option value="Design">Design</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Writing">Writing</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Price (USD) *</label>
                  <input type="number" value={form.price} placeholder="0.00" onChange={(e) => setForm({...form, price: e.target.value})} className="w-full border border-slate-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-900" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea rows={3} value={form.description} placeholder="Tell your clients what's included..." onChange={(e) => setForm({...form, description: e.target.value})} className="w-full border border-slate-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 resize-none" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={!form.title || !form.price}>Submit</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
