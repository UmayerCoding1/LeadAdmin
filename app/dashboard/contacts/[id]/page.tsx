"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { ArrowLeft, Save, History, Mail, CheckCircle, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default function ContactDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [contact, setContact] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "history" | "email">("details");
  
  const { register, handleSubmit, reset } = useForm();
  
  // Single email states
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [emailSending, setEmailSending] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cRes, hRes] = await Promise.all([
        fetch(`/api/contacts/${id}`),
        fetch(`/api/contacts/${id}/history`)
      ]);
      const [cData, hData] = await Promise.all([cRes.json(), hRes.json()]);
      setContact(cData);
      setHistory(hData);
      reset(cData);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: any) => {
    setSaving(true);
    try {
      await fetch(`/api/contacts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      fetchData();
    } finally {
      setSaving(false);
    }
  };

  const toggleResponded = async () => {
    const newStatus = contact.responseStatus === "responded" ? "none" : "responded";
    await fetch(`/api/contacts/${id}/mark-responded`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchData();
  };

  const sendSingleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailSending(true);
    try {
      const res = await fetch('/api/email/send-single', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactId: id, subject: emailSubject, body: emailBody })
      });
      if (res.ok) {
        setEmailSubject("");
        setEmailBody("");
        fetchData();
      } else {
        alert("Failed to send email");
      }
    } finally {
      setEmailSending(false);
    }
  };

  if (loading) return <div className="p-8 text-zinc-500">Loading lead details...</div>;
  if (!contact) return <div className="p-8 text-zinc-500">Lead not found.</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <Link href="/dashboard/contacts" className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition">
        <ArrowLeft className="h-4 w-4 mr-1"/> Back to Contacts
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">{contact.name || "Unnamed Contact"}</h1>
          <p className="text-zinc-500">{contact.emailFromWebsite || "No email"} • {contact.phoneStandardFormat || "No phone"}</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleResponded}
            className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center transition ${contact.responseStatus === 'responded' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'}`}
          >
            {contact.responseStatus === 'responded' ? <CheckCircle className="h-4 w-4 mr-2" /> : <ShieldAlert className="h-4 w-4 mr-2" />}
            {contact.responseStatus === 'responded' ? "Responded" : "Mark Responded"}
          </button>
        </div>
      </div>

      <div className="flex border-b border-zinc-200 dark:border-zinc-800">
        {[
          { id: "details", label: "Details", icon: Save },
          { id: "history", label: "History", icon: History },
          { id: "email", label: "Send Email", icon: Mail },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center px-6 py-3 text-sm font-medium border-b-2 transition ${activeTab === tab.id ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
          >
            <tab.icon className="h-4 w-4 mr-2" /> {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 block overflow-hidden shadow-sm">
        {activeTab === "details" && (
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Business Name</label>
                  <input {...register("name")} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Email</label>
                  <input {...register("emailFromWebsite")} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Phone</label>
                  <input {...register("phoneStandardFormat")} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Website</label>
                  <input {...register("website")} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
                <div>
                 <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Address</label>
                  <input {...register("fullAddress")} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
             </div>
             
             <div className="flex justify-end pt-4 border-t border-zinc-200 dark:border-zinc-800">
               <button type="submit" disabled={saving} className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-2 rounded-lg text-sm font-medium shadow-sm hover:opacity-90 transition">
                 {saving ? "Saving..." : "Save Changes"}
               </button>
             </div>
          </form>
        )}

        {activeTab === "history" && (
          <div className="p-6">
            {history.length === 0 ? (
              <p className="text-zinc-500">No edit history found.</p>
            ) : (
              <div className="space-y-4">
                {history.map((h, i) => (
                  <div key={i} className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-950/50 text-sm">
                    <p className="font-semibold text-zinc-900 dark:text-white mb-2">{format(new Date(h.changedAt), "MMM d, yyyy 'at' h:mm a")}</p>
                    <pre className="text-xs text-zinc-500 whitespace-pre-wrap overflow-x-auto">{JSON.stringify(h.snapshot, null, 2)}</pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "email" && (
          <form onSubmit={sendSingleEmail} className="p-6 space-y-4">
             <div>
               <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Subject</label>
               <input value={emailSubject} onChange={e=>setEmailSubject(e.target.value)} required className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
             </div>
             <div>
               <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Message Body</label>
               <textarea value={emailBody} onChange={e=>setEmailBody(e.target.value)} required rows={8} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"></textarea>
             </div>
             <div className="flex justify-end pt-2">
                 <button type="submit" disabled={emailSending} className="bg-blue-600 hover:bg-blue-700 flex items-center text-white px-6 py-2 rounded-lg text-sm font-medium shadow-sm transition disabled:opacity-50">
                   <Mail className="h-4 w-4 mr-2"/> {emailSending ? "Sending..." : "Send Email"}
                 </button>
             </div>
          </form>
        )}
      </div>
    </div>
  );
}
