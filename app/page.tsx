"use client";

import { useEffect, useState } from "react";

interface DashboardData {
  whatsapp: { status: string; qr: string | null };
  stats: { totalTeachers: number; dutiesThisMonth: number; notificationsSentToday: number };
  todaysDuties: any[];
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const res = await fetch("/api/dashboard");
      const json = await res.json();
      setData(json);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center py-24 text-slate-400 dark:text-slate-500">
        <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
        Loading dashboard...
      </div>
    );
  if (!data) return <p className="text-rose-500">Failed to load dashboard.</p>;

  const statusConfig: Record<string, { color: string; dot: string; label: string }> = {
    connected: {
      color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
      dot: "bg-emerald-500",
      label: "Connected",
    },
    qr: {
      color: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
      dot: "bg-amber-500",
      label: "Scan QR in server terminal",
    },
    initializing: {
      color: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
      dot: "bg-slate-400 animate-pulse",
      label: "Initializing...",
    },
    disconnected: {
      color: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
      dot: "bg-rose-500",
      label: "Disconnected",
    },
  };
  const status = statusConfig[data.whatsapp.status] || statusConfig.disconnected;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Dashboard</h1>
        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${status.color}`}>
          <span className={`w-2 h-2 rounded-full ${status.dot}`} />
          WhatsApp: {status.label}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Teachers" value={data.stats.totalTeachers} icon="users" />
        <StatCard label="Duties This Month" value={data.stats.dutiesThisMonth} icon="calendar" />
        <StatCard label="Notifications Sent Today" value={data.stats.notificationsSentToday} icon="bell" />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-5">
        <h2 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-100">Today's Duties</h2>
        {data.todaysDuties.length === 0 ? (
          <p className="text-slate-400 dark:text-slate-500 text-sm py-6 text-center">No duties assigned for today.</p>
        ) : (
          <div className="overflow-x-auto -mx-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 text-xs uppercase tracking-wide">
                  <th className="py-2 px-5 font-medium">Duty</th>
                  <th className="py-2 px-5 font-medium">Location</th>
                  <th className="py-2 px-5 font-medium">Start Time</th>
                  <th className="py-2 px-5 font-medium">Teachers</th>
                  <th className="py-2 px-5 font-medium">Notified</th>
                </tr>
              </thead>
              <tbody>
                {data.todaysDuties.map((d) => (
                  <tr key={d._id} className="border-b border-slate-50 dark:border-slate-800/60 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-5 font-medium text-slate-700 dark:text-slate-200">{d.dutyType?.name}</td>
                    <td className="py-3 px-5 text-slate-500 dark:text-slate-400">{d.dutyType?.location}</td>
                    <td className="py-3 px-5 text-slate-500 dark:text-slate-400">{d.dutyType?.startTime}</td>
                    <td className="py-3 px-5 text-slate-500 dark:text-slate-400">
                      {d.teachers?.map((t: any) => t.name).join(", ")}
                    </td>
                    <td className="py-3 px-5">
                      {d.notificationSent ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                          </svg>
                          Sent
                        </span>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500">Pending</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: "users" | "calendar" | "bell" }) {
  const icons: Record<string, JSX.Element> = {
    users: (
      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
    ),
    calendar: (
      <path
        fillRule="evenodd"
        d="M6 3.75A.75.75 0 016.75 3h.5a.75.75 0 01.75.75V4.5h8V3.75a.75.75 0 01.75-.75h.5a.75.75 0 01.75.75V4.5h1.25c.966 0 1.75.784 1.75 1.75v12A1.75 1.75 0 0119.25 20H4.75A1.75 1.75 0 013 18.25v-12c0-.966.784-1.75 1.75-1.75H6V3.75zM4.5 9v9.25c0 .138.112.25.25.25h14.5a.25.25 0 00.25-.25V9h-15z"
        clipRule="evenodd"
      />
    ),
    bell: (
      <path
        fillRule="evenodd"
        d="M5.85 3.5a.75.75 0 00-1.117-1 9.719 9.719 0 00-2.348 4.876.75.75 0 001.479.248A8.219 8.219 0 015.85 3.5zM19.267 2.5a.75.75 0 10-1.118 1 8.22 8.22 0 011.987 4.124.75.75 0 001.48-.248A9.72 9.72 0 0019.267 2.5z M12 2.25A6.75 6.75 0 005.25 9v.75a8.217 8.217 0 01-2.119 5.52.75.75 0 00.298 1.206c1.544.57 3.16.99 4.831 1.243a3.75 3.75 0 107.48 0 24.583 24.583 0 004.83-1.244.75.75 0 00.298-1.205 8.217 8.217 0 01-2.118-5.52V9A6.75 6.75 0 0012 2.25zM9.75 18c0-.034 0-.067.002-.1a25.05 25.05 0 004.496 0l.002.1a2.25 2.25 0 11-4.5 0z"
        clipRule="evenodd"
      />
    ),
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 flex items-start justify-between">
      <div>
        <p className="text-slate-400 dark:text-slate-500 text-sm font-medium">{label}</p>
        <p className="text-3xl font-bold text-slate-800 dark:text-slate-100 mt-1">{value}</p>
      </div>
      <div className="p-2.5 rounded-lg bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400">
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          {icons[icon]}
        </svg>
      </div>
    </div>
  );
}
