"use client";

import { useEffect, useState } from "react";
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
interface Recurring {
  _id: string;
  dayOfWeek: number;
  dutyType: DutyType;
  teachers: Teacher[];
  active: boolean;
}

const DAYS = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
  { value: 0, label: "Sunday" },
];

export default function RecurringPage() {
  const [recurring, setRecurring] = useState<Recurring[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [dutyTypes, setDutyTypes] = useState<DutyType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Recurring | null>(null);

  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [dutyType, setDutyType] = useState("");
  const [selectedTeachers, setSelectedTeachers] = useState<string[]>([]);

  async function loadAll() {
    setLoading(true);
    try {
      const [rRes, tRes, dRes] = await Promise.all([
        fetch("/api/recurring"),
        fetch("/api/teachers"),
        fetch("/api/duty-types"),
      ]);
      setRecurring(await rRes.json());
      setTeachers(await tRes.json());
      setDutyTypes(await dRes.json());
    } catch {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  function toggleTeacher(id: string) {
    setSelectedTeachers((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!dutyType || selectedTeachers.length === 0) {
      setError("Select a duty type and at least one teacher");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/recurring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dayOfWeek, dutyType, teachers: selectedTeachers }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Failed to save recurring duty");
      }
      setDutyType("");
      setSelectedTeachers([]);
      await loadAll();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(r: Recurring) {
    await fetch(`/api/recurring/${r._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dayOfWeek: r.dayOfWeek,
        dutyType: r.dutyType._id,
        teachers: r.teachers.map((t) => t._id),
        active: !r.active,
      }),
    });
    await loadAll();
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    await fetch(`/api/recurring/${deleteTarget._id}`, { method: "DELETE" });
    setDeleteTarget(null);
    await loadAll();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Recurring Duties</h1>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
          Set a duty once for a weekday — it repeats automatically, every week, forever. No need to re-assign it every month.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 space-y-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-sm text-slate-500 dark:text-slate-400">Day of Week</label>
            <select
              className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(Number(e.target.value))}
            >
              {DAYS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-slate-500 dark:text-slate-400">Duty Type</label>
            <select
              className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              value={dutyType}
              onChange={(e) => setDutyType(e.target.value)}
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
            <div className="border border-slate-200 dark:border-slate-700 rounded-lg max-h-32 overflow-y-auto mt-1">
              {teachers.map((t) => (
                <label
                  key={t._id}
                  className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm text-slate-700 dark:text-slate-200 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    className="rounded accent-brand-600"
                    checked={selectedTeachers.includes(t._id)}
                    onChange={() => toggleTeacher(t._id)}
                  />
                  {t.name}
                </label>
              ))}
              {teachers.length === 0 && <p className="text-slate-400 text-sm p-3">No teachers found.</p>}
            </div>
          </div>
        </div>

        {error && <p className="text-rose-600 dark:text-rose-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 text-sm font-medium transition"
        >
          {saving ? "Saving..." : "Add Recurring Duty"}
        </button>
      </form>

      {loading ? (
        <p className="text-slate-400 dark:text-slate-500 text-sm">Loading...</p>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
          {DAYS.map((day) => {
            const dayRules = recurring.filter((r) => r.dayOfWeek === day.value);
            return (
              <div key={day.value} className="p-3.5 flex flex-col sm:flex-row sm:items-start gap-2">
                <div className="w-32 shrink-0">
                  <p className="font-medium text-slate-700 dark:text-slate-200">{day.label}</p>
                </div>
                <div className="flex-1 flex flex-wrap gap-2">
                  {dayRules.map((r) => (
                    <span
                      key={r._id}
                      className={`rounded-full pl-3 pr-1.5 py-1 text-xs flex items-center gap-1.5 ${
                        r.active
                          ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                          : "bg-slate-50 dark:bg-slate-800/40 text-slate-400 dark:text-slate-500 line-through"
                      }`}
                    >
                      <strong className="font-semibold">{r.dutyType?.name}</strong>
                      <span className="text-slate-400 dark:text-slate-500">@ {r.dutyType?.startTime}</span>
                      <span className="text-slate-400 dark:text-slate-500">·</span>
                      {r.teachers.map((t) => t.name).join(", ")}
                      <button
                        onClick={() => toggleActive(r)}
                        className="ml-1 text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 hover:bg-brand-600 hover:text-white transition"
                        title={r.active ? "Pause" : "Resume"}
                      >
                        {r.active ? "Pause" : "Resume"}
                      </button>
                      <button
                        onClick={() => setDeleteTarget(r)}
                        className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-rose-500 hover:text-white text-slate-500 dark:text-slate-400 flex items-center justify-center transition"
                        title="Remove"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {dayRules.length === 0 && (
                    <span className="text-slate-300 dark:text-slate-600 text-xs italic">No recurring duty</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Remove this recurring duty?"
        description={
          deleteTarget
            ? `${deleteTarget.dutyType?.name} on ${DAYS.find((d) => d.value === deleteTarget.dayOfWeek)?.label} will stop repeating. Already-created assignments for past/today dates are not removed.`
            : undefined
        }
        confirmLabel="Remove"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
