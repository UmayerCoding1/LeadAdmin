"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Edit2, Save, X, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<string | null>(null); // 'new' or id
  const [formData, setFormData] = useState({ name: "", subject: "", body: "" });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/templates");
      const data = await res.json();
      setTemplates(data.templates || []);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const isNew = isEditing === "new";
    const url = isNew ? "/api/templates" : `/api/templates/${isEditing}`;
    const method = isNew ? "POST" : "PUT";

    try {
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      setIsEditing(null);
      setFormData({ name: "", subject: "", body: "" });
      fetchTemplates();
    } catch (err) {
      alert("Failed to save template");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;
    try {
      await fetch(`/api/templates/${id}`, { method: "DELETE" });
      fetchTemplates();
    } catch (err) {
      alert("Failed to delete template");
    }
  };

  const startEdit = (template: any) => {
    setIsEditing(template._id);
    setFormData({
      name: template.name,
      subject: template.subject,
      body: template.body,
    });
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white mb-2">
            Email <span className="text-indigo-500">Templates</span>
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-lg">
            Create and manage reusable messaging formats for your outreach.
          </p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing("new")}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20"
          >
            <Plus className="h-5 w-5" /> New Template
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {isEditing ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-800/50 rounded-[2.5rem] p-8 shadow-xl"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                {isEditing === "new" ? "Create Template" : "Edit Template"}
              </h3>
              <button
                onClick={() => setIsEditing(null)}
                className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 ml-2">Template Name</label>
                <input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-6 py-4 border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl bg-white/50 dark:bg-zinc-950/50 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all shadow-sm"
                  placeholder="e.g. Intro Pitch"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 ml-2">Email Subject</label>
                <input
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-6 py-4 border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl bg-white/50 dark:bg-zinc-950/50 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all shadow-sm"
                  placeholder="Subject line for the user"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 ml-2">Body Content</label>
                <textarea
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  rows={10}
                  className="w-full px-6 py-4 border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl bg-white/50 dark:bg-zinc-950/50 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all shadow-sm"
                  placeholder="Write your email body here..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setIsEditing(null)}
                  className="px-8 py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-2xl font-bold hover:bg-zinc-200 transition-all active:scale-95 text-sm uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all active:scale-95 shadow-xl shadow-indigo-500/20 text-sm uppercase tracking-widest"
                >
                  Save Template
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template, idx) => (
              <motion.div
                key={template._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group relative bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-800/50 rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => startEdit(template)}
                    className="p-2.5 rounded-xl bg-white/80 dark:bg-zinc-800/80 text-indigo-500 hover:bg-indigo-500 hover:text-white shadow-sm transition-all"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(template._id)}
                    className="p-2.5 rounded-xl bg-white/80 dark:bg-zinc-800/80 text-rose-500 hover:bg-rose-500 hover:text-white shadow-sm transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mb-6">
                  <div className="w-12 h-12 bg-indigo-500/10 text-indigo-500 rounded-2xl flex items-center justify-center mb-4">
                    <Mail className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-1">{template.name}</h3>
                  <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest truncate">
                    {template.subject}
                  </p>
                </div>
                <div className="h-24 overflow-hidden relative">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-4 leading-relaxed">
                    {template.body}
                  </p>
                  <div className="absolute bottom-0 inset-x-0 h-8 bg-gradient-to-t from-white/40 dark:from-zinc-900/40 to-transparent" />
                </div>
              </motion.div>
            ))}
            {templates.length === 0 && !loading && (
              <div className="col-span-full h-64 flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-[2.5rem]">
                <Mail className="h-12 w-12 text-zinc-300 mb-4" />
                <p className="text-zinc-500 font-bold tracking-tight">No templates found. Create your first one!</p>
              </div>
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
