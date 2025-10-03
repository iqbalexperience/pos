"use client";

import { ColumnDef } from "@tanstack/react-table";

export type PromotionColumn = {
  id: string;
  description: string;
  discount: string;
  productCount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
};

export const columns: ColumnDef<PromotionColumn>[] = [
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "discount",
    header: "Discount",
  },
  {
    accessorKey: "productCount",
    header: "Applies To (# Products)",
  },
  {
    accessorKey: "startDate",
    header: "Start Date",
  },
  {
    accessorKey: "endDate",
    header: "End Date",
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => (row.original.isActive ? "Active" : "Inactive"),
  },
];