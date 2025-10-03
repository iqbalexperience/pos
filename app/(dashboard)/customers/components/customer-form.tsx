"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import axios from "axios";
import { Customer } from "@/lib/generated/prisma";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// 1. Add 'onSuccess' to the props interface
interface CustomerFormProps {
  initialData: Customer | null;
  onCancel: () => void;
  onSuccess: () => void;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({ initialData, onCancel, onSuccess }) => {
  const router = useRouter(); // Although not used for success, can be kept for other purposes
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit } = useForm<Customer>({
    defaultValues: initialData || { firstName: "", lastName: "", phone: "", email: "" },
  });

  const onSubmit = async (data: Customer) => {
    setLoading(true);
    try {
      if (initialData) {
        await axios.patch(`/api/customers/${initialData.id}`, data);
        toast.success("Customer updated.");
      } else {
        await axios.post("/api/customers", data);
        toast.success("Customer created.");
      }
      // 2. Call the onSuccess callback passed from the parent
      onSuccess();
    } catch (error) {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
      <div className="grid grid-cols-2 gap-4">
        <Input {...register("firstName", { required: true })} placeholder="First Name" />
        <Input {...register("lastName", { required: true })} placeholder="Last Name" />
      </div>
      <Input {...register("phone")} placeholder="Phone Number (Optional)" />
      <Input type="email" {...register("email")} placeholder="Email (Optional)" />
      <div className="pt-6 space-x-2 flex items-center justify-end w-full">
        <Button disabled={loading} variant="outline" onClick={onCancel} type="button">Cancel</Button>
        <Button disabled={loading} type="submit">{initialData ? "Save Changes" : "Create"}</Button>
      </div>
    </form>
  );
};