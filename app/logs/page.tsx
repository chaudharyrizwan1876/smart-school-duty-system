"use client";

import { useEffect, useState } from "react";

interface LogEntry {
  _id: string;
  date: string;
  teacher: { name: string } | null;
  dutyType: { name: string } | null;
  sentAt: string;
  status: "sent" | "failed";
  error?: string;
}

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/logs")
      .then((r) => r.json())
      .then(setLogs)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Notifications Log</h1>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">History of every WhatsApp reminder sent out.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        {loading ? (
          <p className="p-6 text-slate-400 dark:text-slate-500 text-sm">Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 text-xs uppercase tracking-wide">
                  <th className="py-3 px-5 font-medium">Date</th>
                  <th className="py-3 px-5 font-medium">Teacher</th>
                  <th className="py-3 px-5 font-medium">Duty</th>
                  <th className="py-3 px-5 font-medium">Sent At</th>
                  <th className="py-3 px-5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l._id} className="border-b border-slate-50 dark:border-slate-800/60 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-5 text-slate-500 dark:text-slate-400">{new Date(l.date).toLocaleDateString()}</td>
                    <td className="py-3 px-5 font-medium text-slate-700 dark:text-slate-200">{l.teacher?.name || "—"}</td>
                    <td className="py-3 px-5 text-slate-500 dark:text-slate-400">{l.dutyType?.name || "—"}</td>
                    <td className="py-3 px-5 text-slate-500 dark:text-slate-400">{new Date(l.sentAt).toLocaleString()}</td>
                    <td className="py-3 px-5">
                      {l.status === "sent" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                          Sent
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 cursor-help"
                          title={l.error}
                        >
                          Failed
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 px-4 text-slate-400 dark:text-slate-500 text-center text-sm">
                      No notifications sent yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
