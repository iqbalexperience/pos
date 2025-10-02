"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Product, Category, Vendor } from "@/lib/generated/prisma" // Import Vendor
import { CellAction } from "./cell-action"

// 1. Rename the type to be more descriptive and add the vendor
export type ProductWithRelations = Product & {
  category: Category;
  vendor: Vendor | null; // Vendor can be optional
};

// 2. Use the new, correct type for the column definitions
export const columns = (
  onEdit: (product: ProductWithRelations) => void,
  onDelete: (product: ProductWithRelations) => void
): ColumnDef<ProductWithRelations>[] => [
  // ... The rest of the columns are unchanged
  { accessorKey: "name", header: "Name" },
  { accessorKey: "sku", header: "SKU" },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("price"))
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(price);
      return <div className="font-medium">{formatted}</div>
    }
  },
  { accessorKey: "stockQuantity", header: "Stock" },
  { 
    accessorKey: "category", 
    header: "Category",
    cell: ({ row }) => row.original.category.name,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <CellAction
        data={row.original}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    ),
  },
];