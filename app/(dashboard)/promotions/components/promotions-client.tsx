"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DataTable } from "@/app/(dashboard)/employees/components/data-table";
import { PromotionForm } from "./promotion-form";
import { columns } from "./columns"; // This import should now work
import { Product } from "@/lib/generated/prisma";

interface PromotionsClientProps {
  data: any[]; // Formatted data
  allProducts: Product[];
}

export const PromotionsClient: React.FC<PromotionsClientProps> = ({ data, allProducts }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Create New Promotion</DialogTitle></DialogHeader>
          <PromotionForm allProducts={allProducts} onCancel={() => setIsModalOpen(false)} />
        </DialogContent>
      </Dialog>
      <div className="flex items-center justify-between">
        <Heading title={`Promotions (${data.length})`} description="Manage discounts and special offers" />
        <Button onClick={() => setIsModalOpen(true)}><Plus className="mr-2 h-4 w-4" /> Add New</Button>
      </div>
      <Separator />
      <DataTable columns={columns} data={data} />
    </>
  );
};