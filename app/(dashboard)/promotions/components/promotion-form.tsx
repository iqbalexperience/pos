"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import axios from "axios";
import { Product } from "@/lib/generated/prisma";
import { CalendarIcon, Check, X as XIcon, ChevronsUpDown } from "lucide-react";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";

interface PromotionFormProps {
  allProducts: Product[];
  onCancel: () => void;
}

export const PromotionForm: React.FC<PromotionFormProps> = ({ allProducts, onCancel }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, control, formState: { errors } } = useForm();

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      await axios.post('/api/promotions', {
        ...data,
        type: "PERCENTAGE_OFF_PRODUCT",
        discountValue: parseFloat(data.discountValue),
      });
      toast.success("Promotion created successfully!");
      router.refresh();
      onCancel();
    } catch (error) {
      toast.error("Failed to create promotion.");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
      <Input {...register("description", { required: true })} placeholder="Promotion Description (e.g., Weekend Dairy Sale)" />
      <Input type="number" {...register("discountValue", { required: true, valueAsNumber: true, min: 1, max: 100 })} placeholder="Discount Percentage (e.g., 10 for 10%)" />
      <div className="grid grid-cols-2 gap-4">
        <Controller name="startDate" control={control} rules={{ required: true }} render={({ field }) => (
          <Popover><PopoverTrigger asChild><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{field.value ? format(field.value, "PPP") : <span>Start Date</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover>
        )} />
        <Controller name="endDate" control={control} render={({ field }) => (
          <Popover><PopoverTrigger asChild><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{field.value ? format(field.value, "PPP") : <span>End Date (Optional)</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent></Popover>
        )} />
      </div>
      <div>
        <label>Apply to Products</label>
        <Controller
            name="productIds"
            control={control}
            rules={{ required: true }}
            render={({ field }) => <MultiSelect products={allProducts} selected={field.value || []} onChange={field.onChange} />}
        />
      </div>
      <div className="pt-6 space-x-2 flex items-center justify-end w-full">
        <Button disabled={loading} variant="outline" onClick={onCancel} type="button">Cancel</Button>
        <Button disabled={loading} type="submit">Create Promotion</Button>
      </div>
    </form>
  );
};

// --- MultiSelect Component (self-contained) ---
interface MultiSelectProps {
    products: Product[];
    selected: string[];
    onChange: (selected: string[]) => void;
}
const MultiSelect: React.FC<MultiSelectProps> = ({ products, selected, onChange }) => {
    const [open, setOpen] = useState(false);
    const selectedProducts = products.filter(p => selected.includes(p.id));

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <div className="border rounded-md p-2 min-h-[40px] flex flex-wrap gap-2 cursor-pointer">
                    {selectedProducts.map(p => (
                        <Badge key={p.id} variant="secondary">
                            {p.name}
                            <button className="ml-2" onClick={(e) => { e.stopPropagation(); onChange(selected.filter(id => id !== p.id)); }}>
                                <XIcon className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))}
                    <span className="text-sm text-muted-foreground flex-1">{selected.length === 0 && 'Select products...'}</span>
                    <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                </div>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command><CommandInput placeholder="Search products..." /><CommandEmpty>No products found.</CommandEmpty><CommandGroup>
                    {products.map((product) => (
                        <CommandItem key={product.id} onSelect={() => {
                            const newSelected = selected.includes(product.id) ? selected.filter(id => id !== product.id) : [...selected, product.id];
                            onChange(newSelected);
                        }}>
                            <Check className={cn("mr-2 h-4 w-4", selected.includes(product.id) ? "opacity-100" : "opacity-0")} />
                            {product.name}
                        </CommandItem>
                    ))}
                </CommandGroup></Command>
            </PopoverContent>
        </Popover>
    );
};