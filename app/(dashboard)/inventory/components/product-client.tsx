"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/app/(dashboard)/employees/components/data-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

import { columns, ProductWithRelations } from "./columns"; // Ensure correct import
import { ProductForm } from "./product-form";
import { Category, Vendor } from "@/lib/generated/prisma";

interface ProductClientProps {
  data: ProductWithRelations[];
  categories: Category[];
  vendors: Vendor[];
}

export const ProductClient: React.FC<ProductClientProps> = ({
  data,
  categories,
  vendors,
}) => {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // THIS IS THE FIX: Explicitly type the useState hook.
  const [editingProduct, setEditingProduct] = useState<ProductWithRelations | null>(null);

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<ProductWithRelations | null>(null);
  const [loading, setLoading] = useState(false);

  const handleOpenModal = (product: ProductWithRelations | null) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };
  
  const onDeleteConfirm = (product: ProductWithRelations) => {
    setDeletingProduct(product);
    setIsAlertOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingProduct) return;
    try {
      setLoading(true);
      await axios.delete(`/api/products/${deletingProduct.id}`);
      router.refresh();
      toast.success("Product deleted.");
    } catch (error) {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
      setIsAlertOpen(false);
    }
  };

  return (
    <>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Edit product" : "Add new product"}</DialogTitle>
          </DialogHeader>
          <ProductForm
            initialData={editingProduct}
            categories={categories}
            vendors={vendors}
            onCancel={() => setIsModalOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product "{deletingProduct?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={loading}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex items-center justify-between">
        <Heading
          title={`Products (${data.length})`}
          description="Manage products, stock, and prices"
        />
        <Button onClick={() => handleOpenModal(null)}>
          <Plus className="mr-2 h-4 w-4" />
          Add New
        </Button>
      </div>
      <Separator />
      <DataTable columns={columns(handleOpenModal, onDeleteConfirm)} data={data} />
    </>
  );
};