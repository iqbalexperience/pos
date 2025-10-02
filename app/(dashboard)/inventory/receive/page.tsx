"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import axios from "axios";
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Heading } from "@/components/ui/heading";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Product } from "@/lib/generated/prisma";

export default function ReceiveStockPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, control, setValue, formState: { errors } } = useForm();

  useEffect(() => {
    // Fetch products to populate the combobox
    const fetchProducts = async () => {
      const { data } = await axios.get('/api/products');
      setProducts(data);
    };
    fetchProducts();
  }, []);

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      await axios.post('/api/inventory/receive', {
        ...data,
        quantityReceived: parseInt(data.quantityReceived, 10),
      });
      toast.success("Stock received successfully!");
      router.push('/inventory');
    } catch (error) {
      toast.error("Failed to receive stock.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <Heading title="Receive Stock" description="Add new inventory lots and track expiration dates." />
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
          <div>
            <label>Product</label>
            <Controller
              name="productId"
              control={control}
              rules={{ required: "Product is required" }}
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" className="w-full justify-between">
                      {field.value ? products.find((p) => p.id === field.value)?.name : "Select a product..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command><CommandInput placeholder="Search product..." /><CommandEmpty>No product found.</CommandEmpty><CommandGroup>
                      {products.map((product) => (
                        <CommandItem key={product.id} value={product.id} onSelect={(currentValue) => { field.onChange(currentValue); }}>
                          <Check className={cn("mr-2 h-4 w-4", field.value === product.id ? "opacity-100" : "opacity-0")} />
                          {product.name}
                        </CommandItem>
                      ))}
                    </CommandGroup></Command>
                  </PopoverContent>
                </Popover>
              )}
            />
            {errors.productId && <p className="text-sm text-destructive mt-1">{(errors.productId as any).message}</p>}
          </div>

          <div>
            <label>Quantity Received</label>
            <Input type="number" {...register("quantityReceived", { required: "Quantity is required", min: 1 })} placeholder="e.g., 24" />
            {errors.quantityReceived && <p className="text-sm text-destructive mt-1">{(errors.quantityReceived as any).message}</p>}
          </div>

          <div>
            <label>Expiration Date (Optional)</label>
            <Controller
              name="expirationDate"
              control={control}
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent>
                </Popover>
              )}
            />
          </div>
          
          <Button type="submit" disabled={loading}>Receive Stock</Button>
        </form>
      </div>
    </div>
  );
}