"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format, differenceInDays } from "date-fns";
import { Badge } from "@/components/ui/badge";

export type ExpirationReportColumn = {
  id: string;
  productName: string;
  sku: string;
  quantityRemaining: number;
  expirationDate: Date | null;
};

export const columns: ColumnDef<ExpirationReportColumn>[] = [
  {
    accessorKey: "productName",
    header: "Product Name",
  },
  {
    accessorKey: "sku",
    header: "SKU",
  },
  {
    accessorKey: "quantityRemaining",
    header: "Quantity Remaining",
  },
  {
    accessorKey: "expirationDate",
    header: "Expires On",
    cell: ({ row }) => {
      const date = row.original.expirationDate;
      if (!date) return "N/A";

      const formattedDate = format(date, "MMMM d, yyyy");
      const daysUntilExpiration = differenceInDays(date, new Date());

      return (
        <div className="flex items-center space-x-2">
          <span>{formattedDate}</span>
          {daysUntilExpiration <= 7 && (
            <Badge variant="destructive">Expires Soon!</Badge>
          )}
        </div>
      );
    },
  },
];