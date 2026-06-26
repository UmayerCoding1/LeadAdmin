"use client";

import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import { motion } from "framer-motion";
import { ChevronRight, Filter, MoreHorizontal, Mail } from "lucide-react";
import { useRouter } from "next/navigation";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pageCount: number;
  onPaginationChange: (page: number) => void;
  pageIndex: number;
  onBulkSend?: (selectedRows: TData[]) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pageCount,
  onPaginationChange,
  pageIndex,
  onBulkSend,
}: DataTableProps<TData, TValue>) {
  const router = useRouter();

  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      rowSelection,
    },
    manualPagination: true,
    pageCount,
  });

  return (
    <div className="space-y-6">
      {Object.keys(rowSelection).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="bg-indigo-600 dark:bg-indigo-600 p-4 rounded-2xl flex items-center justify-between shadow-xl shadow-indigo-500/20 text-white"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Mail className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold">
              {Object.keys(rowSelection).length} Selected Leads
            </span>
          </div>
          <button 
            onClick={() => onBulkSend?.(table.getSelectedRowModel().rows.map(r => r.original))}
            className="bg-white text-indigo-600 hover:bg-zinc-100 px-6 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 shadow-lg"
          >
            Send Bulk Email
          </button>
        </motion.div>
      )}

      <div className="rounded-[2rem] border border-zinc-200/50 dark:border-zinc-800/50 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-zinc-200/50 dark:border-zinc-800/50">
                  {headerGroup.headers.map((header) => {
                    return (
                      <th
                        key={header.id}
                        className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 whitespace-nowrap"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </th>
                    );
                  })}
                  <th className="px-6 py-5"></th>
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-zinc-200/30 dark:divide-zinc-800/30">
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="group hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 transition-all duration-200"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-4 text-zinc-700 dark:text-zinc-300">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => router.push(`/dashboard/contacts/${(row.original as any)._id}`)}
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-zinc-400 group-hover:text-indigo-600 group-hover:bg-indigo-500/10 transition-all duration-200"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length + 1}
                    className="h-32 text-center text-zinc-500 font-medium"
                  >
                    <div className="flex flex-col items-center gap-2">
                       <Filter className="h-8 w-8 opacity-20" />
                       No leads found matching your criteria.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {pageCount > 1 && (
        <div className="flex items-center justify-between px-2">
          <div className="text-sm font-medium text-zinc-500">
            Showing <span className="text-zinc-900 dark:text-white">{pageIndex}</span> of <span className="text-zinc-900 dark:text-white">{pageCount}</span> pages
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPaginationChange(pageIndex - 1)}
              disabled={pageIndex <= 1}
              className="p-3 border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl text-sm font-bold disabled:opacity-30 hover:bg-white dark:hover:bg-zinc-900 transition-all active:scale-95 shadow-sm"
            >
              <ChevronRight className="h-4 w-4 rotate-180" />
            </button>
            <button
              onClick={() => onPaginationChange(pageIndex + 1)}
              disabled={pageIndex >= pageCount}
              className="p-3 border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl text-sm font-bold disabled:opacity-30 hover:bg-white dark:hover:bg-zinc-900 transition-all active:scale-95 shadow-sm"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
