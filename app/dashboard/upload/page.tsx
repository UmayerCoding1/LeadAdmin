"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { UploadCloud, File, Loader2, CheckCircle } from "lucide-react";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (
        droppedFile.name.endsWith(".xlsx") ||
        droppedFile.name.endsWith(".csv") ||
        droppedFile.name.endsWith(".xls")
      ) {
        setFile(droppedFile);
        setResult(null);
      } else {
        setResult({ success: false, message: "Only .xlsx, .xls, and .csv files are supported." });
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/sheets/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setResult({ success: true, message: `Successfully imported ${data.count} contacts!` });
        console.log(data);
        setFile(null);
      } else {
        setResult({ success: false, message: data.error || "Upload failed." });
      }
    } catch (err) {
      setResult({ success: false, message: "A network error occurred." });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white mb-2">Import <span className="text-indigo-500">Datasets</span></h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-lg">Scale your database by importing bulk leads via spreadsheet files.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-800/50 rounded-[2.5rem] p-8 shadow-sm h-full flex flex-col"
          >
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`flex-1 border-2 border-dashed rounded-[2rem] p-12 text-center transition-all duration-300 flex flex-col items-center justify-center min-h-[300px] ${file
                  ? "border-indigo-500 bg-indigo-500/5 dark:bg-indigo-500/10 shadow-inner"
                  : "border-zinc-200 dark:border-zinc-800 hover:border-indigo-400 dark:hover:border-indigo-500/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/30"
                }`}
            >
              {file ? (
                <div className="flex flex-col items-center">
                  <div className="h-20 w-20 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/10">
                    <File className="h-10 w-10" />
                  </div>
                  <p className="text-xl font-bold text-zinc-900 dark:text-white mb-1">{file.name}</p>
                  <p className="text-sm font-medium text-zinc-500">{(file.size / 1024).toFixed(1)} KB • Ready for processing</p>
                  <button
                    onClick={() => setFile(null)}
                    className="mt-6 text-sm font-bold text-red-500 hover:text-red-600 transition-colors uppercase tracking-widest"
                  >
                    Discard File
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="h-20 w-20 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <UploadCloud className="h-10 w-10" />
                  </div>
                  <p className="text-xl font-extrabold text-zinc-900 dark:text-white mb-2">
                    Select Your Asset
                  </p>
                  <p className="text-zinc-500 font-medium mb-8">
                    Drag and drop your spreadsheet here or use the selector
                  </p>

                  <label className="cursor-pointer inline-flex items-center px-8 py-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 active:scale-95 transition-all font-bold text-sm shadow-xl shadow-indigo-500/20">
                    Browse File System
                    <input
                      type="file"
                      className="hidden"
                      accept=".xlsx, .xls, .csv"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
              )}
            </div>

            {result && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`mt-6 p-6 rounded-2xl border flex items-center gap-4 ${result.success
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                    : "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400"
                  }`}
              >
                <div className={`p-2 rounded-lg ${result.success ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                   {result.success ? <CheckCircle className="h-5 w-5" /> : <File className="h-5 w-5" />}
                </div>
                <p className="font-bold text-sm tracking-tight">{result.message}</p>
              </motion.div>
            )}

            <div className="mt-8 flex justify-end">
              <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="flex items-center gap-3 px-10 py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl font-bold transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed shadow-xl shadow-zinc-900/10 dark:shadow-white/5 text-sm uppercase tracking-widest"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Initiate Import"
                )}
              </button>
            </div>
          </motion.div>
        </div>

        <div className="space-y-6">
           <div className="p-8 rounded-[2rem] bg-indigo-600 text-white shadow-xl shadow-indigo-500/20">
              <h3 className="text-xl font-bold mb-4">Supported Schemas</h3>
              <ul className="space-y-3 opacity-90 text-sm font-medium">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-white"/> Microsoft Excel (.xlsx)
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-white"/> Legacy Excel 97-03 (.xls)
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-white"/> Comma Separated Values (.csv)
                </li>
              </ul>
           </div>

           <div className="p-8 rounded-[2rem] bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-800/50">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">Pro Tips</h3>
              <p className="text-sm text-zinc-500 leading-relaxed font-medium">
                Ensure your column headers match the standard naming conventions for best results. The system will handle Bengali character encoding automatically.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
