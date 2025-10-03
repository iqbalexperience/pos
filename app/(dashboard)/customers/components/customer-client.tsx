"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import axios from "axios";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DataTable } from "@/app/(dashboard)/employees/components/data-table";
import { CustomerForm } from "./customer-form";
import { columns, CustomerColumn } from "./columns";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Customer } from "@/lib/generated/prisma";

interface CustomerClientProps {
  data: CustomerColumn[];
}

export const CustomerClient: React.FC<CustomerClientProps> = ({ data }) => {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [deletingCustomer, setDeletingCustomer] = useState<CustomerColumn | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch all customers once to get full data for editing
  useEffect(() => {
    const fetchCustomers = async () => {
      const response = await fetch('/api/customers');
      const customers: Customer[] = await response.json();
      setAllCustomers(customers);
    }
    fetchCustomers();
  }, [data]); // Refetch if data changes

  const onEdit = (customer: CustomerColumn) => {
    const fullCustomer = allCustomers.find(c => c.id === customer.id);
    if (fullCustomer) {
      setEditingCustomer(fullCustomer);
      setIsModalOpen(true);
    }
  };

  const onDeleteConfirm = (customer: CustomerColumn) => {
    setDeletingCustomer(customer);
    setIsAlertOpen(true);
  };
  
  const handleDelete = async () => {
    if (!deletingCustomer) return;
    setLoading(true);
    try {
      await axios.delete(`/api/customers/${deletingCustomer.id}`);
      router.refresh();
      toast.success("Customer deleted.");
    } catch (error) {
      toast.error("Failed to delete customer.");
    } finally {
      setLoading(false);
      setIsAlertOpen(false);
    }
  };

  const onFormSuccess = () => {
    router.refresh();
    setIsModalOpen(false);
  }

  return (
    <>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingCustomer ? "Edit Customer" : "Add New Customer"}</DialogTitle></DialogHeader>
          <CustomerForm initialData={editingCustomer} onCancel={() => setIsModalOpen(false)} onSuccess={onFormSuccess} />
        </DialogContent>
      </Dialog>
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><DialogTitle>Are you sure?</DialogTitle><AlertDialogDescription>This will permanently delete the customer {deletingCustomer?.name}.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDelete} disabled={loading}>Continue</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <div className="flex items-center justify-between">
        <Heading title={`Customers (${data.length})`} description="Manage customer profiles and loyalty" />
        <Button onClick={() => { setEditingCustomer(null); setIsModalOpen(true); }}><Plus className="mr-2 h-4 w-4" /> Add New</Button>
      </div>
      <Separator />
      {/* The ugly .map() is replaced with a clean function call */}
      <DataTable columns={columns(onEdit, onDeleteConfirm)} data={data} />
    </>
  );
};