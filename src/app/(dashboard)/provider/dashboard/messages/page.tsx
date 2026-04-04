"use client"

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMarketplace } from "@/context/MarketplaceContext";
import { useState, useRef, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { getConversations, sendMessage } from "@/lib/actions";

export default function MessagesPage() {
  const { data: session } = useSession();
  const { showToast, activeConversationId, setActiveConversation } = useMarketplace();
  
  const [data, setData] = useState<{ sent: any[], received: any[] } | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Sync with DB
  const sync = useCallback(async () => {
    if (!session?.user?.id) return;
    try {
      // @ts-ignore
      const res = await getConversations(session.user.id, session.user.email);
      setData(res);
      
      // Auto-select conversation if none active
      if (!activeConversationId && (res.received.length > 0 || res.sent.length > 0)) {
        const firstChat = res.received[0]?.senderId || res.sent[0]?.receiverId;
        if (firstChat) setActiveConversation(firstChat);
      }
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id, activeConversationId, setActiveConversation]);

  useEffect(() => { sync(); }, [sync]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [data]);

  const allMessages = data ? [...data.sent, ...data.received]
    .filter(m => !activeConversationId || m.senderId === activeConversationId || m.receiverId === activeConversationId)
    .sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) : [];

  const handleSend = async () => {
    if (!input.trim() || !session?.user?.id) return;
    try {
      await sendMessage({
        // @ts-ignore
        senderId: session.user.id,
        receiverId: activeConversationId, // Simplified for MVP
        conversationId: activeConversationId,
        content: input.trim(),
      });
      setInput("");
      showToast("Message sent!");
      sync();
    } catch (e) {
      showToast("Send failed", "error");
    }
  };

  if (loading && !data) return <div className="p-8 text-slate-400 text-sm">Syncing your messages...</div>;

  return (
    <div className="space-y-6 max-w-5xl animate-in fade-in duration-500">
      <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Messages (Synced)</h1>
              <p className="text-sm text-slate-500 mt-1">Chat history synced with: {session?.user?.email}</p>
      </div>

      <div className="border border-slate-200 bg-white rounded-sm overflow-hidden flex flex-col md:flex-row min-h-[560px]">
        {/* Simplified Inbox */}
        <div className="w-full md:w-1/3 border-r border-slate-200 flex flex-col">
          <div className="p-3 border-b border-slate-200 bg-slate-50 text-xs text-slate-400">Inbox</div>
          <div className="flex-1 overflow-y-auto">
             {/* List of Unique Conversations */}
             {Array.from(new Set([
                ...(data?.received.map(m => m.senderId) || []),
                ...(data?.sent.map(m => m.receiverId) || [])
             ])).map(otherId => {
                const otherUser = data?.received.find(m => m.senderId === otherId)?.sender || 
                                data?.sent.find(m => m.receiverId === otherId)?.receiver;
                return (
                  <div 
                    key={otherId} 
                    onClick={() => setActiveConversation(otherId)}
                    className={`p-4 cursor-pointer border-b border-slate-100 transition-colors ${activeConversationId === otherId ? "bg-slate-50 border-r-2 border-r-slate-900" : "hover:bg-slate-50/50"}`}
                  >
                    <p className="font-bold text-sm">{otherUser?.name || "User"}</p>
                    <p className="text-xs text-slate-500 truncate mt-1">{otherUser?.title || "Marketplace Contact"}</p>
                  </div>
                )
             })}
          </div>
        </div>

        {/* Message Content */}
        <div className="w-full md:w-2/3 flex flex-col bg-white">
          <div className="flex-1 p-6 overflow-y-auto bg-slate-50/50 space-y-4">
            {allMessages.map((msg) => (
              <div key={msg.id} className={`flex items-start gap-3 ${msg.senderId === session?.user?.id ? "flex-row-reverse" : ""}`}>
                <div className="h-7 w-7 rounded-sm bg-slate-200 flex items-center justify-center text-[10px] font-semibold text-slate-600 flex-shrink-0">
                  {msg.senderId === session?.user?.id ? "You" : "User"}
                </div>
                <div className={`border p-3 rounded-sm max-w-md ${msg.senderId === session?.user?.id ? "bg-slate-900 text-slate-100 border-slate-800" : "bg-white border-slate-200"}`}>
                  <p className="text-sm">{msg.content}</p>
                  <div className={`text-[10px] mt-2 text-right text-slate-400`}>{new Date(msg.createdAt).toLocaleTimeString()}</div>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
            {allMessages.length === 0 && (
                <div className="text-center py-20 text-slate-400 text-sm">No messages yet. Send a sync test below!</div>
            )}
          </div>
          <div className="p-4 border-t border-slate-200 bg-white">
            <div className="flex gap-2">
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} placeholder="Type a message to sync everywhere..." className="flex-1 border border-slate-100 bg-slate-50 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-900" />
              <Button onClick={handleSend} disabled={!input.trim()}>Send</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
