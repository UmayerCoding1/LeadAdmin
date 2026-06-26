"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, Upload, LogOut, Mail } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const menu = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Contacts", href: "/dashboard/contacts", icon: Users },
    { name: "Templates", href: "/dashboard/templates", icon: Mail },
    { name: "Upload Data", href: "/dashboard/upload", icon: Upload },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 hidden md:flex flex-col bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl border-r border-zinc-200/50 dark:border-zinc-800/50 z-30 transition-all duration-300">
        <div className="h-20 flex items-center px-8">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <LayoutDashboard className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white leading-none">
                LeadAdmin
              </h1>
              <span className="text-[10px] uppercase tracking-widest font-bold text-indigo-500/80">Pro Version</span>
            </div>
          </Link>
        </div>

        <div className="flex-1 px-4 py-8 space-y-8 overflow-y-auto">
          <div>
            <h2 className="px-4 text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-4">
              Main Menu
            </h2>
            <nav className="space-y-1.5">
              {menu.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group ${isActive
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-200"
                      }`}
                  >
                    <item.icon className={`h-5 w-5 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="p-6 mt-auto">
          <div className="p-4 rounded-2xl bg-zinc-100/50 dark:bg-zinc-800/30 border border-zinc-200/50 dark:border-zinc-700/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm shadow-inner">
                JD
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">Umayer Hossain</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">Administrator</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center w-full gap-2 px-4 py-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-all duration-200 border border-zinc-200 dark:border-zinc-700 shadow-sm"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {/* Header/Top Bar */}
        <header className="h-20 flex items-center justify-between px-8 bg-white/30 dark:bg-zinc-950/30 backdrop-blur-md border-b border-zinc-200/50 dark:border-zinc-800/50 shrink-0 z-20">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Dashboard <span className="mx-2">/</span> <span className="text-zinc-900 dark:text-white font-bold capitalise">{pathname.split('/').pop() || 'overview'}</span>
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shadow-sm cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
