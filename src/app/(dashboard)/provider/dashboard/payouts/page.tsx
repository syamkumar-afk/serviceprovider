"use client"

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, ArrowUpRight, X } from "lucide-react";
import { useMarketplace } from "@/context/MarketplaceContext";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getProviderDashboardData, withdrawFunds } from "@/lib/actions";

export default function PayoutsPage() {
  const { data: session } = useSession();
  const { showToast } = useMarketplace();
  
  const [data, setData] = useState<{ earnings: any[] } | null>(null);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [loading, setLoading] = useState(true);

  const sync = async () => {
    if (!session?.user?.id) return;
    try {
      // @ts-ignore
      const res = await getProviderDashboardData(session.user.id);
      setData(res);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { sync(); }, [session?.user?.id]);

  const transactions = data?.earnings || [];
  const availableBalance = 1450; // In a real app, calculate this server-side from your earnings (MVP hardcoded for now)

  const handleWithdraw = async () => {
    if (!session?.user?.id) return;
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) return;
    try {
      // @ts-ignore
      await withdrawFunds(session.user.id, amount);
      setShowWithdrawModal(false);
      setWithdrawAmount("");
      showToast("Withdrawal synced!");
      sync();
    } catch (e) {
      showToast("Withdrawal failed", "error");
    }
  };

  if (loading && !data) return <div className="p-8 text-slate-400 text-sm">Syncing your earnings...</div>;

  return (
    <div className="space-y-6 max-w-5xl animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Payouts</h1>
        <p className="text-sm text-slate-500 mt-1">Synced financial dashboard for: {session?.user?.email}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="border border-slate-200 bg-white p-6 rounded-sm">
          <p className="text-sm font-medium text-slate-500">Balance</p>
          <div className="mt-2"><span className="text-3xl font-semibold tracking-tight text-slate-900">${availableBalance.toLocaleString()}</span></div>
          <Button className="mt-4 w-full" onClick={() => setShowWithdrawModal(true)}>Withdraw via Stripe</Button>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold tracking-tight mb-4">Transaction History</h2>
        <div className="border border-slate-200 bg-white rounded-sm overflow-hidden">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-900">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs">{new Date(tx.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">{tx.description}</td>
                  <td className={`px-4 py-3 font-mono text-right ${tx.amount > 0 ? "text-emerald-600" : "text-slate-900"}`}>
                    {tx.amount > 0 ? `+$${tx.amount.toFixed(2)}` : `-$${Math.abs(tx.amount).toFixed(2)}`}
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr><td colSpan={3} className="px-4 py-8 text-center text-slate-400 text-sm">No transactions yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setShowWithdrawModal(false)}>
          <div className="bg-white border border-slate-200 rounded-sm w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4">Withdraw to Bank</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Amount (USD)</label>
              <input type="number" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} className="w-full border border-slate-200 px-3 py-2 text-sm focus:ring-1 focus:ring-slate-900" placeholder="0.00" />
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowWithdrawModal(false)}>Cancel</Button>
              <Button onClick={handleWithdraw}>Initiate Payout</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
