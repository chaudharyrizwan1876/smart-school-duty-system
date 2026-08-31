"use client";

import { useEffect, useState } from "react";
import ConfirmDialog from "@/components/ConfirmDialog";

interface Teacher {
  _id: string;
  name: string;
  phone: string;
  subject: string;
  active: boolean;
}

const emptyForm = { name: "", phone: "", subject: "", active: true };

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState<any>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Teacher | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/teachers");
      setTeachers(await res.json());
    } catch {
      setError("Failed to load teachers");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const url = editingId ? `/api/teachers/${editingId}` : "/api/teachers";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Failed to save teacher");
      }
      setForm(emptyForm);
      setEditingId(null);
      await load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function startEdit(t: Teacher) {
    setEditingId(t._id);
    setForm({ name: t.name, phone: t.phone, subject: t.subject, active: t.active });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    await fetch(`/api/teachers/${deleteTarget._id}`, { method: "DELETE" });
    setDeleteTarget(null);
    await load();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Teachers</h1>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Manage the teacher directory used for duty assignments.</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 grid grid-cols-1 sm:grid-cols-4 gap-3"
      >
        <input
          className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500"
          placeholder="Phone e.g. 923001234567"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          required
        />
        <input
          className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500"
          placeholder="Subject"
          value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
        />
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg flex-1 disabled:opacity-50 text-sm font-medium transition"
          >
            {saving ? "Saving..." : editingId ? "Update" : "Add Teacher"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {error && <p className="text-rose-600 dark:text-rose-400 text-sm">{error}</p>}

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        {loading ? (
          <p className="p-6 text-slate-400 dark:text-slate-500 text-sm">Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 text-xs uppercase tracking-wide">
                  <th className="py-3 px-5 font-medium">Name</th>
                  <th className="py-3 px-5 font-medium">Phone</th>
                  <th className="py-3 px-5 font-medium">Subject</th>
                  <th className="py-3 px-5 font-medium">Active</th>
                  <th className="py-3 px-5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((t) => (
                  <tr key={t._id} className="border-b border-slate-50 dark:border-slate-800/60 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-5 font-medium text-slate-700 dark:text-slate-200">{t.name}</td>
                    <td className="py-3 px-5 text-slate-500 dark:text-slate-400">{t.phone}</td>
                    <td className="py-3 px-5 text-slate-500 dark:text-slate-400">{t.subject || "—"}</td>
                    <td className="py-3 px-5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          t.active
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                            : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                        }`}
                      >
                        {t.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-right space-x-3">
                      <button onClick={() => startEdit(t)} className="text-brand-600 dark:text-brand-400 hover:underline font-medium">
                        Edit
                      </button>
                      <button onClick={() => setDeleteTarget(t)} className="text-rose-600 dark:text-rose-400 hover:underline font-medium">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {teachers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 px-4 text-slate-400 dark:text-slate-500 text-center text-sm">
                      No teachers yet. Add your first teacher above.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete teacher?"
        description={deleteTarget ? `"${deleteTarget.name}" will be permanently removed from the directory.` : undefined}
        confirmLabel="Delete"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
