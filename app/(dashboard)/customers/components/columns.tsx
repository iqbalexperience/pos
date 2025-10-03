"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";

export type CustomerColumn = {
  id: string;
  name: string;
  phone: string;
  email: string;
  loyaltyPoints: number;
};

// Convert the const into a function that accepts the handlers
export const columns = (
  onEdit: (customer: CustomerColumn) => void,
  onDelete: (customer: CustomerColumn) => void
): ColumnDef<CustomerColumn>[] => [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "phone", header: "Phone" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "loyaltyPoints", header: "Loyalty Points" },
  {
    id: "actions",
    // Pass the handlers directly to the CellAction component
    cell: ({ row }) => (
      <CellAction data={row.original} onEdit={onEdit} onDelete={onDelete} />
    ),
  },
];