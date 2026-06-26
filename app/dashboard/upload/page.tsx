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
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Upload Leads Data</h1>
        <p className="text-zinc-500 mt-1">Upload a spreadsheet export to populate your contacts table.</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 shadow-sm"
      >
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${file
              ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/10"
              : "border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600"
            }`}
        >
          {file ? (
            <div className="flex flex-col items-center">
              <div className="h-16 w-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-4">
                <File className="h-8 w-8" />
              </div>
              <p className="text-lg font-medium text-zinc-900 dark:text-white">{file.name}</p>
              <p className="text-sm text-zinc-500 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
              <button
                onClick={() => setFile(null)}
                className="mt-4 text-sm text-red-500 hover:text-red-700 transition"
              >
                Remove file
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="h-16 w-16 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 rounded-full flex items-center justify-center mb-4">
                <UploadCloud className="h-8 w-8" />
              </div>
              <p className="text-lg font-medium text-zinc-900 dark:text-white">
                Drag & drop your file here
              </p>
              <p className="text-sm text-zinc-500 mt-1 mb-6">Supports .xlsx, .csv</p>

              <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg hover:opacity-90 transition font-medium text-sm">
                Browse Files
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
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className={`mt-6 p-4 rounded-lg flex items-center ${result.success
                ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
              }`}
          >
            {result.success && <CheckCircle className="h-5 w-5 mr-2" />}
            {result.message}
          </motion.div>
        )}

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="flex items-center px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm text-sm"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              "Upload and Process"
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
