"use client";

import { useEffect, useMemo, useState } from "react";
import ConfirmDialog from "@/components/ConfirmDialog";

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

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function toDateKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function AssignPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1); // 1-12
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [dutyTypes, setDutyTypes] = useState<DutyType[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState<number | null>(null);
  const [formDutyType, setFormDutyType] = useState("");
  const [formTeachers, setFormTeachers] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Assignment | null>(null);
  const [copyConfirm, setCopyConfirm] = useState<{ weeks: number; duties: number } | null>(null);
  const [pendingBulk, setPendingBulk] = useState<any[] | null>(null);

  async function loadAll() {
    setLoading(true);
    try {
      const [tRes, dRes, aRes] = await Promise.all([
        fetch("/api/teachers"),
        fetch("/api/duty-types"),
        fetch(`/api/assignments?month=${month}&year=${year}`),
      ]);
      setTeachers(await tRes.json());
      setDutyTypes(await dRes.json());
      setAssignments(await aRes.json());
    } catch {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year]);

  const assignmentsByDay = useMemo(() => {
    const map: Record<string, Assignment[]> = {};
    for (const a of assignments) {
      const key = a.date.slice(0, 10);
      if (!map[key]) map[key] = [];
      map[key].push(a);
    }
    return map;
  }, [assignments]);

  const numDays = daysInMonth(year, month);
  const days = Array.from({ length: numDays }, (_, i) => i + 1);

  function openDay(day: number) {
    setActiveDay(day);
    setFormDutyType("");
    setFormTeachers([]);
    setError("");
  }

  function closeDay() {
    setActiveDay(null);
  }

  function toggleTeacher(id: string) {
    setFormTeachers((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function saveAssignment() {
    if (!activeDay || !formDutyType || formTeachers.length === 0) {
      setError("Select a duty type and at least one teacher");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const date = new Date(year, month - 1, activeDay);
      const res = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: date.toISOString(),
          dutyType: formDutyType,
          teachers: formTeachers,
        }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Failed to save assignment");
      }
      closeDay();
      await loadAll();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function confirmDeleteAssignment() {
    if (!deleteTarget) return;
    await fetch(`/api/assignments?id=${deleteTarget._id}`, { method: "DELETE" });
    setDeleteTarget(null);
    await loadAll();
  }

  function requestCopyWeek(startDay: number) {
    const weekAssignments = days
      .filter((d) => d >= startDay && d < startDay + 7)
      .flatMap((d) => {
        const key = toDateKey(new Date(year, month - 1, d));
        return (assignmentsByDay[key] || []).map((a) => ({ dayOffset: d - startDay, assignment: a }));
      });

    if (weekAssignments.length === 0) {
      setError("No duties in the first week to copy.");
      return;
    }

    const bulk: any[] = [];
    for (let weekStart = startDay + 7; weekStart <= numDays; weekStart += 7) {
      for (const { dayOffset, assignment } of weekAssignments) {
        const targetDay = weekStart + dayOffset;
        if (targetDay > numDays) continue;
        bulk.push({
          date: new Date(year, month - 1, targetDay).toISOString(),
          dutyType: assignment.dutyType._id,
          teachers: assignment.teachers.map((t) => t._id),
        });
      }
    }

    if (bulk.length === 0) {
      setError("Nothing to copy — this is the last week of the month.");
      return;
    }

    setPendingBulk(bulk);
    setCopyConfirm({ weeks: Math.round(bulk.length / weekAssignments.length), duties: weekAssignments.length });
  }

  async function confirmCopyWeek() {
    if (!pendingBulk) return;
    await fetch("/api/assignments/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignments: pendingBulk }),
    });
    setPendingBulk(null);
    setCopyConfirm(null);
    await loadAll();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Assign Duties</h1>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Build the monthly duty roster day by day.</p>
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
          <button
            onClick={() => requestCopyWeek(1)}
            className="border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium"
            title="Copies duties from day 1-7 to all remaining weeks of the month"
          >
            Copy Week 1 to All Weeks
          </button>
        </div>
      </div>

      {error && <p className="text-rose-600 dark:text-rose-400 text-sm">{error}</p>}

      {loading ? (
        <p className="text-slate-400 dark:text-slate-500 text-sm">Loading...</p>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
          {days.map((day) => {
            const date = new Date(year, month - 1, day);
            const key = toDateKey(date);
            const dayAssignments = assignmentsByDay[key] || [];
            const isToday = toDateKey(new Date()) === key;
            return (
              <div key={day} className={`p-3.5 flex flex-col sm:flex-row sm:items-center gap-2 ${isToday ? "bg-brand-50/50 dark:bg-brand-500/5" : ""}`}>
                <div className="w-32 shrink-0">
                  <p className={`font-medium ${isToday ? "text-brand-700 dark:text-brand-400" : "text-slate-700 dark:text-slate-200"}`}>
                    {date.toLocaleDateString("default", { weekday: "short", day: "numeric" })}
                    {isToday && <span className="ml-1.5 text-[10px] uppercase tracking-wide bg-brand-600 text-white px-1.5 py-0.5 rounded">Today</span>}
                  </p>
                </div>
                <div className="flex-1 flex flex-wrap gap-2">
                  {dayAssignments.map((a) => (
                    <span
                      key={a._id}
                      className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-full pl-3 pr-1.5 py-1 text-xs flex items-center gap-1.5"
                    >
                      <strong className="font-semibold">{a.dutyType?.name}</strong>
                      <span className="text-slate-400 dark:text-slate-500">@ {a.dutyType?.startTime}</span>
                      <span className="text-slate-400 dark:text-slate-500">·</span>
                      {a.teachers.map((t) => t.name).join(", ")}
                      <button
                        onClick={() => setDeleteTarget(a)}
                        className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-rose-500 hover:text-white text-slate-500 dark:text-slate-400 flex items-center justify-center transition"
                        title="Remove"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {dayAssignments.length === 0 && (
                    <span className="text-slate-300 dark:text-slate-600 text-xs italic">No duties assigned</span>
                  )}
                </div>
                <button
                  onClick={() => openDay(day)}
                  className="text-sm text-brand-600 dark:text-brand-400 hover:underline shrink-0 font-medium flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Duty
                </button>
              </div>
            );
          })}
        </div>
      )}

      {activeDay && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={closeDay}>
          <div
            className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 w-full max-w-md space-y-4 border border-slate-200 dark:border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
              Assign Duty —{" "}
              {new Date(year, month - 1, activeDay).toLocaleDateString("default", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </h2>

            <div>
              <label className="text-sm text-slate-500 dark:text-slate-400">Duty Type</label>
              <select
                className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                value={formDutyType}
                onChange={(e) => setFormDutyType(e.target.value)}
              >
                <option value="">Select duty type</option>
                {dutyTypes.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name} ({d.startTime}, {d.location})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-slate-500 dark:text-slate-400">Teachers</label>
              <div className="border border-slate-200 dark:border-slate-700 rounded-lg max-h-48 overflow-y-auto mt-1">
                {teachers.map((t) => (
                  <label
                    key={t._id}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-sm text-slate-700 dark:text-slate-200 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="rounded accent-brand-600"
                      checked={formTeachers.includes(t._id)}
                      onChange={() => toggleTeacher(t._id)}
                    />
                    {t.name}
                  </label>
                ))}
                {teachers.length === 0 && (
                  <p className="text-slate-400 dark:text-slate-500 text-sm p-3">No teachers found. Add teachers first.</p>
                )}
              </div>
            </div>

            {error && <p className="text-rose-600 dark:text-rose-400 text-sm">{error}</p>}

            <div className="flex gap-2 justify-end pt-1">
              <button
                onClick={closeDay}
                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={saveAssignment}
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white disabled:opacity-50 text-sm font-medium transition"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Remove this duty assignment?"
        description={
          deleteTarget
            ? `${deleteTarget.dutyType?.name} for ${deleteTarget.teachers.map((t) => t.name).join(", ")} will be removed.`
            : undefined
        }
        confirmLabel="Remove"
        danger
        onConfirm={confirmDeleteAssignment}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmDialog
        open={!!copyConfirm}
        title="Copy week 1 pattern?"
        description={
          copyConfirm ? `${copyConfirm.duties} duties will be copied to ${copyConfirm.weeks} more week(s) of the month.` : undefined
        }
        confirmLabel="Copy"
        onConfirm={confirmCopyWeek}
        onCancel={() => {
          setCopyConfirm(null);
          setPendingBulk(null);
        }}
      />
    </div>
  );
}
