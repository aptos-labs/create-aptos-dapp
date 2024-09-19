"use client";

import { ColumnDef } from "@tanstack/react-table";
import { truncateAddress } from "@aptos-labs/wallet-adapter-react";

import { DataTableColumnHeader } from "@/components/message-board/data-table-column-header";
import { DataTableRowActions } from "@/components/message-board/data-table-row-actions";
import { MessageBoardColumns } from "@/lib/type/message";

export const columns: ColumnDef<MessageBoardColumns>[] = [
  {
    accessorKey: "message_obj_addr",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Message Object Address" />
    ),
    cell: ({ row }) => (
      <div className="w-[80px]">
        {truncateAddress(row.getValue("message_obj_addr"))}
      </div>
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
