"use client";

import { ColumnDef } from "@tanstack/react-table";
import { truncateAddress } from "@aptos-labs/wallet-adapter-react";

import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { Message } from "@/lib/type/message";
import { NETWORK } from "@/constants";

export const columns: ColumnDef<Message>[] = [
  {
    accessorKey: "user_addr",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="User Address" />
    ),
    cell: ({ row }) => (
      <div className="w-[80px]">
        <a
          href={`https://explorer.aptoslabs.com/account/${row.getValue(
            "user_addr"
          )}?network=${NETWORK}`}
          target="_blank"
          rel="noreferrer"
          className="text-blue-600 dark:text-blue-300"
        >
          {truncateAddress(row.getValue("user_addr"))}
        </a>
      </div>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "created_messages",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Message Created" />
    ),
    cell: ({ row }) => (
      <div className="w-[160px]">{row.getValue("created_messages")}</div>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "updated_messages",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Message Updated" />
    ),
    cell: ({ row }) => (
      <div className="w-[160px]">{row.getValue("updated_messages")}</div>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "total_points",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total Points" />
    ),
    cell: ({ row }) => (
      <div className="w-[160px]">{row.getValue("total_points")}</div>
    ),
    enableSorting: true,
  },
];
