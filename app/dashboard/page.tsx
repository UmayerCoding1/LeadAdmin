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
    <div className="p-8 max-w-7xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white mb-2">
            System <span className="text-indigo-500">Analytics</span>
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-lg">Real-time performance tracking and lead engagement metrics.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
           <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
           <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest">Live Updates</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Total Leads", value: stats.totalContacts, icon: Users, color: 'indigo' },
          { title: "Emails Sent", value: stats.totalEmailsSent, icon: Mail, color: 'blue' },
          { title: "Responded Leads", value: stats.totalResponded, icon: MessageCircle, color: 'emerald' },
          { title: "Response Rate", value: `${responseRate}%`, icon: Activity, color: 'violet' },
        ].map((stat, idx) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-8 rounded-[2.5rem] bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group overflow-hidden relative"
          >
            <div className={`absolute -right-4 -top-4 w-24 h-24 bg-${stat.color}-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500`} />
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div className={`p-4 rounded-2xl bg-${stat.color}-500/10 text-${stat.color}-500 group-hover:rotate-6 transition-transform duration-300 shadow-inner`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">+4.5%</div>
            </div>
            <div className="relative z-10">
              <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wide">{stat.title}</p>
              <h3 className="text-4xl font-extrabold text-zinc-900 dark:text-white tabular-nums tracking-tighter">
                {stat.value}
              </h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-800/50 rounded-[3rem] p-10 shadow-sm"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-4">
             <div>
               <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-1">Lead Outreach Velocity</h3>
               <p className="text-sm font-medium text-zinc-500">Distribution of emails sent across the last semantic cycle.</p>
             </div>
             <div className="flex gap-2">
                <div className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-300 cursor-pointer hover:bg-zinc-200 transition-colors">Daily</div>
                <div className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold cursor-pointer shadow-lg shadow-indigo-500/20">Weekly</div>
             </div>
          </div>
          
          <div className="h-72 flex items-end justify-between gap-4">
            {chartData.map((d, i) => {
              const heightPercentage = (d.count / maxCount) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group">
                  <div className="w-full relative flex justify-center h-full items-end">
                    <div className="absolute bottom-full mb-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[10px] font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none transform translate-y-2 group-hover:translate-y-0 shadow-xl">
                      {d.count} SUCCESSFUL
                    </div>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(heightPercentage, 5)}%` }}
                      transition={{ duration: 0.8, ease: "circOut", delay: 0.6 + i * 0.05 }}
                      className="w-full max-w-20 bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-2xl group-hover:to-indigo-300 transition-all duration-300 shadow-lg shadow-indigo-500/10"
                    />
                  </div>
                  <div className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 mt-6 uppercase tracking-widest font-mono">
                    {format(parseISO(d.date), "EEE d")}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
