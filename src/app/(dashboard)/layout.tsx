"use client"

import { User, LayoutDashboard, Settings, CreditCard, Inbox, LogOut } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/provider/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/provider/dashboard/messages", label: "Messages", icon: Inbox },
  { href: "/provider/dashboard/payouts", label: "Payouts", icon: CreditCard },
  { href: "/provider/dashboard/settings", label: "Settings", icon: Settings },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 flex h-14 items-center border-b border-slate-200 bg-white px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold text-slate-900 hover:text-slate-700 transition-colors">
          <div className="h-4 w-4 bg-slate-900 rounded-sm" />
          Marketplace
        </Link>
        <span className="ml-2 text-xs text-slate-400 border-l border-slate-200 pl-2">Provider Portal</span>

        <div className="ml-auto flex items-center space-x-4">
          {session?.user && (
            <>
              <span className="text-sm text-slate-600 hidden sm:inline">
                {session.user.name || session.user.email}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </>
          )}
          <div className="h-8 w-8 rounded-sm bg-slate-200 flex items-center justify-center overflow-hidden">
            {session?.user?.image ? (
              <img src={session.user.image} alt="" className="h-full w-full object-cover" />
            ) : (
              <User className="h-4 w-4 text-slate-600" />
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 mx-auto w-full max-w-6xl">
        {/* Sidebar */}
        <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-sm px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <item.icon className={cn("h-4 w-4", isActive ? "text-slate-700" : "text-slate-400")} />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
