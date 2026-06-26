"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Mail, MessageCircle, Activity } from "lucide-react";
import { format, subDays, parseISO } from "date-fns";

function StatCard({ title, value, icon: Icon, delay }: { title: string, value: number | string, icon: any, delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-zinc-500 dark:text-zinc-400 font-medium text-sm">{title}</h3>
        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="text-3xl font-bold text-zinc-900 dark:text-white">
        {value}
      </div>
    </motion.div>
  );
}

export default function DashboardOverview() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch("/api/overview")
      .then(res => res.json())
      .then(setStats)
      .catch(console.error);
  }, []);

  if (!stats) {
    return <div className="p-8 text-zinc-500">Loading overview...</div>;
  }

  const responseRate = stats.totalContacts > 0 ? ((stats.totalResponded / stats.totalContacts) * 100).toFixed(1) : "0.0";

  // Chart Logic
  const last7Days = Array.from({ length: 7 }).map((_, i) => format(subDays(new Date(), 6 - i), 'yyyy-MM-dd'));
  const chartData = last7Days.map(date => {
    const found = stats.emailStats.find((s: any) => s._id === date);
    return { date, count: found ? found.count : 0 };
  });

  const maxCount = Math.max(...chartData.map(d => d.count), 10);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Dashboard Overview</h1>
        <p className="text-zinc-500 mt-1">Analytics and performance at a glance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Leads" value={stats.totalContacts} icon={Users} delay={0.1} />
        <StatCard title="Emails Sent" value={stats.totalEmailsSent} icon={Mail} delay={0.2} />
        <StatCard title="Responded Leads" value={stats.totalResponded} icon={MessageCircle} delay={0.3} />
        <StatCard title="Response Rate" value={`${responseRate}%`} icon={Activity} delay={0.4} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm"
      >
        <h3 className="text-zinc-900 dark:text-white font-semibold mb-6">Emails Sent (Last 7 Days)</h3>
        <div className="h-64 flex items-end justify-between gap-2">
          {chartData.map((d, i) => {
            const heightPercentage = (d.count / maxCount) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                <div className="w-full relative group flex justify-center">
                  <div className="absolute -top-8 bg-zinc-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    {d.count} Emails
                  </div>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${heightPercentage}%` }}
                    transition={{ duration: 0.5, delay: 0.6 + i * 0.1 }}
                    className="w-full max-w-16 bg-blue-500 rounded-t-sm"
                  />
                </div>
                <div className="text-xs text-zinc-500 mt-2 truncate w-full text-center">
                  {format(parseISO(d.date), "MMM d")}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
