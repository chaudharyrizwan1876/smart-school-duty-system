"use client";

import { useEffect, useMemo, useState } from "react";

interface Teacher {
  _id: string;
  name: string;
}
interface DutyType {
  _id: string;
  name: string;
  location: string;
  startTime: string;
}
interface Assignment {
  _id: string;
  date: string;
  dutyType: DutyType;
  teachers: Teacher[];
  notificationSent: boolean;
}

const COLORS = [
  "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400",
  "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  "bg-pink-50 text-pink-700 dark:bg-pink-500/10 dark:text-pink-400",
  "bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400",
  "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
];

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

export default function SchedulePage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [teacherFilter, setTeacherFilter] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/assignments?month=${month}&year=${year}`)
      .then((r) => r.json())
      .then(setAssignments)
      .finally(() => setLoading(false));
  }, [month, year]);

  const dutyTypeColor = useMemo(() => {
    const map: Record<string, string> = {};
    let i = 0;
    for (const a of assignments) {
      const id = a.dutyType?._id;
      if (id && !map[id]) {
        map[id] = COLORS[i % COLORS.length];
        i++;
      }
    }
    return map;
  }, [assignments]);

  const filtered = useMemo(() => {
    if (!teacherFilter.trim()) return assignments;
    const q = teacherFilter.toLowerCase();
    return assignments.filter((a) => a.teachers.some((t) => t.name.toLowerCase().includes(q)));
  }, [assignments, teacherFilter]);

  const byDay = useMemo(() => {
    const map: Record<string, Assignment[]> = {};
    for (const a of filtered) {
      const key = a.date.slice(0, 10);
      if (!map[key]) map[key] = [];
      map[key].push(a);
    }
    return map;
  }, [filtered]);

  const numDays = daysInMonth(year, month);
  const days = Array.from({ length: numDays }, (_, i) => i + 1);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Schedule</h1>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Read-only overview of the month's duty roster.</p>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          <select
            className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {new Date(2000, m - 1, 1).toLocaleString("default", { month: "long" })}
              </option>
            ))}
          </select>
          <select
            className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {[year - 1, year, year + 1].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <input
            className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg px-3 py-1.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            placeholder="Filter by teacher name"
            value={teacherFilter}
            onChange={(e) => setTeacherFilter(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <p className="text-slate-400 dark:text-slate-500 text-sm">Loading...</p>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
          {days.map((day) => {
            const date = new Date(year, month - 1, day);
            const key = date.toISOString().slice(0, 10);
            const dayAssignments = byDay[key] || [];
            if (teacherFilter.trim() && dayAssignments.length === 0) return null;
            const isToday = new Date().toISOString().slice(0, 10) === key;
            return (
              <div key={day} className={`p-3.5 flex flex-col sm:flex-row sm:items-start gap-2 ${isToday ? "bg-brand-50/50 dark:bg-brand-500/5" : ""}`}>
                <div className="w-32 shrink-0">
                  <p className={`font-medium ${isToday ? "text-brand-700 dark:text-brand-400" : "text-slate-700 dark:text-slate-200"}`}>
                    {date.toLocaleDateString("default", { weekday: "short", day: "numeric" })}
                  </p>
                </div>
                <div className="flex-1 flex flex-wrap gap-2">
                  {dayAssignments.map((a) => (
                    <span key={a._id} className={`rounded-full px-3 py-1 text-xs ${dutyTypeColor[a.dutyType?._id] || "bg-slate-100 dark:bg-slate-800"}`}>
                      <strong className="font-semibold">{a.dutyType?.name}</strong> @ {a.dutyType?.startTime} ({a.dutyType?.location}) —{" "}
                      {a.teachers.map((t) => t.name).join(", ")}
                    </span>
                  ))}
                  {dayAssignments.length === 0 && !teacherFilter.trim() && (
                    <span className="text-slate-300 dark:text-slate-600 text-xs italic">No duties</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
