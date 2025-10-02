"use client";
import { Category, Product, Vendor } from "@/lib/generated/prisma";
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ProductWithRelations } from "./columns";


interface ProductFormProps {
  initialData: ProductWithRelations | null; // Use the correct type
  categories: Category[];
  vendors: Vendor[];
  onCancel: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  categories,
  vendors,
  onCancel,
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const title = initialData ? "Edit product" : "Add new product";
  const toastMessage = initialData ? "Product updated." : "Product created.";
  const actionLabel = initialData ? "Save changes" : "Create";

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ProductWithRelations>({
    defaultValues: initialData || {
      name: "",
      sku: "",
      barcode: "",
      price: 0,
      cost: 0,
      stockQuantity: 0,
      unit: "each",
      isWeighed: false,
      isAgeRestricted: false,
      categoryId: "",
      vendorId: null,
    },
  });

  const onSubmit = async (data: ProductWithRelations) => {
    try {
      setLoading(true);

      // THIS IS THE KEY FIX:
      // We destructure the nested 'category' and 'vendor' objects out of the form data.
      // 'productData' will now only contain fields that are part of the Product model.
      const { category, vendor, ...productData } = data;

      // We then parse the numeric fields to ensure they are numbers, not strings.
      const submissionData = {
        ...productData,
        price: parseFloat(String(productData.price)),
        cost: parseFloat(String(productData.cost)),
        stockQuantity: parseInt(String(productData.stockQuantity), 10),
      };

      if (initialData) {
        await axios.patch(`/api/products/${initialData.id}`, submissionData);
      } else {
        await axios.post("/api/products", submissionData);
      }
      
      router.refresh();
      toast.success(toastMessage);
      onCancel();
    } catch (error:any) {
      toast.error(error.response?.data || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input {...register("name", { required: true })} placeholder="Product Name" disabled={loading} />
        <Input {...register("sku", { required: true })} placeholder="SKU" disabled={loading} />
      </div>
       {/* ADD THIS NEW INPUT FIELD */}
       <Input {...register("barcode")} placeholder="Barcode (UPC, EAN, etc.)" disabled={loading} />

      <div className="grid grid-cols-3 gap-4">
        <Input {...register("price", { required: true, valueAsNumber: true })} type="number" step="0.01" placeholder="Price" disabled={loading} />
        <Input {...register("cost", { required: true, valueAsNumber: true })} type="number" step="0.01" placeholder="Cost" disabled={loading} />
        <Input {...register("stockQuantity", { required: true, valueAsNumber: true })} type="number" placeholder="Stock" disabled={loading} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Controller
          name="categoryId"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <Select disabled={loading} onValueChange={field.onChange} value={field.value}>
              <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        <Controller
          name="vendorId"
          control={control}
          render={({ field }) => (
            <Select disabled={loading} onValueChange={field.onChange} value={field.value ?? undefined}>
              <SelectTrigger><SelectValue placeholder="Select a vendor (optional)" /></SelectTrigger>
              <SelectContent>
                {vendors.map((vendor) => (
                  <SelectItem key={vendor.id} value={vendor.id}>{vendor.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Controller name="isWeighed" control={control} render={({ field }) => (
            <Switch id="isWeighed" checked={field.value} onCheckedChange={field.onChange} disabled={loading} />
          )} />
          <Label htmlFor="isWeighed">Sold by Weight</Label>
        </div>
        <div className="flex items-center space-x-2">
           <Controller name="isAgeRestricted" control={control} render={({ field }) => (
            <Switch id="isAgeRestricted" checked={field.value} onCheckedChange={field.onChange} disabled={loading} />
          )} />
          <Label htmlFor="isAgeRestricted">Age Restricted</Label>
        </div>
      </div>
      <div className="pt-6 space-x-2 flex items-center justify-end w-full">
        <Button disabled={loading} variant="outline" onClick={onCancel} type="button">Cancel</Button>
        <Button disabled={loading} type="submit">{actionLabel}</Button>
      </div>
    </form>
  );
};