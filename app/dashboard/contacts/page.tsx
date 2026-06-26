"use client";

import { useEffect, useState } from "react";
import { DataTable } from "./data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Search, Loader2, X, Mail } from "lucide-react";
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

  const fetchContacts = async (p: number, s: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/contacts?page=${p}&limit=20&search=${s}`);
      const json = await res.json();
      if (json.contacts) {
        setData(json.contacts);
        setTotal(json.total);
        console.log(json)
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts(page, search);
  }, [page, search]);

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
        const email = row.getValue("emailFromWebsite") as string;
        return email ? <a href={`mailto:${email}`} className="text-blue-500 hover:underline">{email}</a> : <span className="text-zinc-400">N/A</span>;
      },
    },
    {
      accessorKey: "phoneStandardFormat",
      header: "Phone",
    },
    {
      accessorKey: "firstCategory",
      header: "Category",
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Contacts Database</h1>
          <p className="text-zinc-500 mt-1">Manage and view all your imported leads.</p>
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-zinc-400" />
          </div>
          <input
            type="text"
            placeholder="Search leads..."
            className="pl-10 pr-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64 transition"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden border border-zinc-200 dark:border-zinc-800"
            >
              <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
                <h3 className="font-semibold text-lg text-zinc-900 dark:text-white flex items-center">
                  <Mail className="h-5 w-5 mr-2 text-blue-500" />
                  Bulk Send via Email
                </h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition"
                  disabled={bulkSending}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 p-3 rounded-lg text-sm mb-4">
                  You are about to send to <strong>{selectedContacts.length}</strong> contacts.
                  Note: Contacts already marked as "Responded" were excluded.
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Subject</label>
                  <input
                    value={bulkSubject}
                    onChange={(e) => setBulkSubject(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-zinc-950 text-sm"
                    disabled={bulkSending}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Message Body</label>
                  <textarea
                    value={bulkBody}
                    onChange={(e) => setBulkBody(e.target.value)}
                    rows={6}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-zinc-950 text-sm"
                    disabled={bulkSending}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
                <button
                  onClick={() => setModalOpen(false)}
                  disabled={bulkSending}
                  className="px-4 py-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition text-sm font-medium mr-2"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkSend}
                  disabled={bulkSending || !bulkSubject || !bulkBody}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 flex items-center rounded-lg text-sm font-medium transition disabled:opacity-50"
                >
                  {bulkSending ? <><Loader2 className="animate-spin h-4 w-4 mr-2" /> Sending Batch...</> : "Confirm Send Batch"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
