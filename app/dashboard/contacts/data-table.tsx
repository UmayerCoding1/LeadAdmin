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
    <div className="space-y-4">
      {Object.keys(rowSelection).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 p-3 rounded-lg flex items-center justify-between"
        >
          <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">
            {Object.keys(rowSelection).length} row(s) selected
          </span>
          <button 
            onClick={() => onBulkSend?.(table.getSelectedRowModel().rows.map(r => r.original))}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md text-sm font-medium flex items-center transition"
          >
            <Mail className="h-4 w-4 mr-2" />
            Bulk Send Email
          </button>
        </motion.div>
      )}

      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-zinc-50 dark:bg-zinc-950/50 text-zinc-500 dark:text-zinc-400 font-medium border-b border-zinc-200 dark:border-zinc-800">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <th
                        key={header.id}
                        className="px-4 py-3 whitespace-nowrap"
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
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => router.push(`/dashboard/contacts/${(row.original as any)._id}`)}
                        className="p-1 text-zinc-400 hover:text-blue-600 transition"
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
                    className="h-24 text-center text-zinc-500"
                  >
                    No results.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {pageCount > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-zinc-500">
            Page {pageIndex} of {pageCount}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => onPaginationChange(pageIndex - 1)}
              disabled={pageIndex <= 1}
              className="px-3 py-1 border border-zinc-200 dark:border-zinc-800 rounded-md text-sm font-medium disabled:opacity-50 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
            >
              Previous
            </button>
            <button
              onClick={() => onPaginationChange(pageIndex + 1)}
              disabled={pageIndex >= pageCount}
              className="px-3 py-1 border border-zinc-200 dark:border-zinc-800 rounded-md text-sm font-medium disabled:opacity-50 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
