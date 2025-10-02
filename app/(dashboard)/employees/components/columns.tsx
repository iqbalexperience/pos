"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Employee, Role } from "@/lib/generated/prisma";
import { CellAction } from "./cell-action";

// Update FormattedEmployee to include Role
export type FormattedEmployee = Employee & {
  role: Role;
};


export const columns = (onEdit: (employee: FormattedEmployee) => void): ColumnDef<FormattedEmployee>[] => [
  // ... (other columns are the same)
  {
    accessorKey: "firstName",
    header: "Name",
    cell: ({ row }) => `${row.original.firstName} ${row.original.lastName ?? ''}`
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => row.original.role.name,
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => row.original.isActive ? <Badge variant="outline">Active</Badge> : <Badge variant="destructive">Inactive</Badge>,
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} onEdit={onEdit} />,
  },
];