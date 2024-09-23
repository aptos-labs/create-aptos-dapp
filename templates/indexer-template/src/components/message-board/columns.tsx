"use client";

import { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { DataTableRowActions } from "@/components/message-board/data-table-row-actions";
import { Message } from "@/lib/type/message";

export const columns: ColumnDef<Message>[] = [
  {
    accessorKey: "content",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Message Content" />
    ),
    cell: ({ row }) => (
      <div className="w-[80px]">{row.getValue("content")}</div>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "creation_timestamp",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Creation Timestamp" />
    ),
    cell: ({ row }) => (
      <div className="w-[160px]">
        {new Date(
          (row.getValue("creation_timestamp") as number) * 1000
        ).toLocaleString()}
      </div>
    ),
    enableSorting: true,
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
