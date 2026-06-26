"use client";

import { useEffect, useState } from "react";
import { DataTable } from "./data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Search, Loader2, X, Mail, Users, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ContactsPage() {
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Bulk Send Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<any[]>([]);
  const [bulkSubject, setBulkSubject] = useState("");
  const [bulkBody, setBulkBody] = useState("");
  const [bulkSending, setBulkSending] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);

  const fetchContacts = async (p: number, s: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/contacts?page=${p}&limit=20&search=${s}`);
      const json = await res.json();
      if (json.contacts) {
        setData(json.contacts);
        setTotal(json.total);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    const res = await fetch("/api/templates");
    const json = await res.json();
    setTemplates(json.templates || []);
  };

  useEffect(() => {
    fetchContacts(page, search);
    fetchTemplates();
  }, [page, search]);

  const handleTemplateChange = (templateId: string) => {
    if (!templateId) {
      setBulkSubject("");
      setBulkBody("");
      return;
    }
    const template = templates.find(t => t._id === templateId);
    if (template) {
      setBulkSubject(template.subject);
      setBulkBody(template.body);
    }
  };

  const handleBulkSend = async () => {
    setBulkSending(true);
    try {
      const res = await fetch("/api/email/send-bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactIds: selectedContacts.map(c => c._id),
          subject: bulkSubject,
          body: bulkBody
        })
      });
      const data = await res.json();
      if (data.success) {
        alert(`Successfully sent ${data.sent} emails! Failed: ${data.failed}`);
        setModalOpen(false);
        setBulkSubject("");
        setBulkBody("");
        fetchContacts(page, search);
      } else {
        alert("Bulk send failed.");
      }
    } finally {
      setBulkSending(false);
    }
  };

  const columns: ColumnDef<any>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <input
          type="checkbox"
          className="rounded border-zinc-300"
          checked={table.getIsAllPageRowsSelected()}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          className="rounded border-zinc-300"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          disabled={row.original.responseStatus === "responded"}
        />
      ),
    },
    {
      accessorKey: "name",
      header: "Business Name",
      cell: ({ row }) => <div className="font-medium">{row.getValue("name") || "N/A"}</div>,
    },
    {
      accessorKey: "emailFromWebsite",
      header: "Email",
      cell: ({ row }) => {
        const contact = row.original;
        const email = contact.extraFields.Email_From_WEBSITE || contact.emailFromWebsite || contact.email || contact.extraFields?.email;
        return email ? (
          <a href={`mailto:${email}`} className="text-blue-500 hover:underline">
            {email}
          </a>
        ) : (
          <span className="text-zinc-400">N/A</span>
        );
      },
    },
    {
      accessorKey: "phoneStandardFormat",
      header: "Phone",
      cell: ({ row }) => {
        const contact = row.original;
        const phone =
          contact.phoneStandardFormat ||
          contact.phone1 ||
          contact.phoneFromWebsite ||
          contact.extraFields?.Phone_1 ||
          contact.extraFields?.Phone_From_WEBSITE ||
          contact.extraFields?.phone_1 ||
          contact.extraFields?.phone_from_website;
        return phone || <span className="text-zinc-400">N/A</span>;
      },
    },
    {
      accessorKey: "firstCategory",
      header: "Category",
      cell: ({ row }) => {
        const contact = row.original;
        const category =
          contact.firstCategory ||
          contact.extraFields?.First_category ||
          contact.extraFields?.first_category;
        return category || <span className="text-zinc-400">N/A</span>;
      },
    },
    {
      accessorKey: "responseStatus",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("responseStatus");
        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${status === "responded"
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
              : "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400"
              }`}
          >
            {status === "responded" ? "Responded" : "No reply"}
          </span>
        );
      },
    },
    {
      accessorKey: "emailSendCount",
      header: "Emails Sent",
      cell: ({ row }) => (
        <div className="text-center">{row.getValue("emailSendCount")}</div>
      ),
    },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col gap-8 mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white mb-2">
              Contacts <span className="text-indigo-500">Database</span>
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 max-w-xl text-lg">
              Manage and engage with your leads using our advanced filtering and bulk messaging tools.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Search leads..."
                className="pl-12 pr-6 py-3.5 border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 w-full sm:w-80 transition-all duration-300 shadow-sm"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <button className="p-3.5 rounded-2xl bg-white/50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800/50 text-zinc-500 hover:text-indigo-500 transition-all shadow-sm">
              <Mail className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Leads', value: total, icon: Users, color: 'indigo' },
            { label: 'Emails Sent', value: data.reduce((acc, curr) => acc + (curr.emailSendCount || 0), 0), icon: Mail, color: 'blue' },
            { label: 'Responded', value: data.filter(d => d.responseStatus === 'responded').length, icon: ChevronRight, color: 'emerald' },
            { label: 'New Leads', value: '24', icon: Loader2, color: 'amber' },
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-6 rounded-3xl bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm hover:shadow-md transition-all duration-300 group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl bg-${stat.color}-500/10 text-${stat.color}-500 group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">+12%</span>
              </div>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">{stat.label}</p>
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-white tabular-nums">{stat.value}</h3>
            </motion.div>
          ))}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data}
        pageCount={Math.ceil(total / 20)}
        pageIndex={page}
        onPaginationChange={setPage}
        onBulkSend={(rows) => {
          setSelectedContacts(rows);
          setModalOpen(true);
        }}
      />

      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-zinc-900 rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden border border-zinc-200/50 dark:border-zinc-800/50"
            >
              <div className="flex items-center justify-between p-8 border-b border-zinc-200/50 dark:border-zinc-800/50">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                      <Mail className="h-6 w-6" />
                   </div>
                   <div>
                     <h3 className="font-bold text-xl text-zinc-900 dark:text-white">Bulk Dispatch</h3>
                     <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Blast messaging via templates</p>
                   </div>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  disabled={bulkSending}
                >
                  <X className="h-6 w-6 text-zinc-400" />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 text-sm font-bold border border-indigo-200/30">
                  Targeting <span className="underline decoration-2">{selectedContacts.length}</span> verified leads.
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-2">Select Template (Optional)</label>
                  <select
                    onChange={(e) => handleTemplateChange(e.target.value)}
                    className="w-full px-6 py-4 border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl bg-zinc-50 dark:bg-zinc-950/50 text-sm focus:ring-2 focus:ring-indigo-500/30 outline-none transition-all"
                  >
                    <option value="">Custom Message (No Template)</option>
                    {templates.map(t => (
                      <option key={t._id} value={t._id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-2">Subject Line</label>
                  <input
                    value={bulkSubject}
                    onChange={(e) => setBulkSubject(e.target.value)}
                    className="w-full px-6 py-4 border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl bg-white dark:bg-zinc-950/50 text-sm focus:ring-2 focus:ring-indigo-500/30 outline-none transition-all shadow-sm"
                    disabled={bulkSending}
                    placeholder="Enter email subject"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-2">Message Body</label>
                  <textarea
                    value={bulkBody}
                    onChange={(e) => setBulkBody(e.target.value)}
                    rows={6}
                    className="w-full px-6 py-4 border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl bg-white dark:bg-zinc-950/50 text-sm focus:ring-2 focus:ring-indigo-500/30 outline-none transition-all shadow-sm"
                    disabled={bulkSending}
                    placeholder="Compose your message here..."
                  />
                </div>
              </div>

              <div className="flex items-center justify-end p-8 border-t border-zinc-200/50 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-950/50 gap-4">
                <button
                  onClick={() => setModalOpen(false)}
                  disabled={bulkSending}
                  className="px-6 py-3 text-zinc-500 font-bold text-xs uppercase tracking-widest hover:text-zinc-900 dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkSend}
                  disabled={bulkSending || !bulkSubject || !bulkBody}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 flex items-center rounded-2xl text-sm font-bold transition-all active:scale-95 shadow-xl shadow-indigo-500/20 disabled:opacity-50"
                >
                   {bulkSending ? (
                     <><Loader2 className="animate-spin h-5 w-5 mr-3" /> Sending...</>
                   ) : (
                     "Authorize Blast"
                   )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
