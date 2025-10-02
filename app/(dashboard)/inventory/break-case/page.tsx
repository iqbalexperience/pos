"use client";

import { useState, useTransition, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { breakCase } from "@/app/actions/breakCase";

import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Product } from "@/lib/generated/prisma";

export default function BreakCasePage() {
  const [isPending, startTransition] = useTransition();
  const [caseProducts, setCaseProducts] = useState<Product[]>([]);
  const { register, handleSubmit, control, formState: { errors } } = useForm();

  // Fetch only products that are defined as cases
  useEffect(() => {
    const fetchCaseProducts = async () => {
      // In a real app, you might have an API endpoint for this.
      // For now, we fetch all and filter on the client.
      const response = await fetch('/api/products');
      const allProducts: Product[] = await response.json();
      const filtered = allProducts.filter(p => p.containsProductId && p.caseUnitCount);
      setCaseProducts(filtered);
    };
    fetchCaseProducts();
  }, []);
  
  const onSubmit = async (data: any) => {
    startTransition(async () => {
      const result = await breakCase(data.caseProductId, parseInt(data.numberOfCases, 10));
      if (result.success) {
        toast.success("Case broken successfully! Inventory has been updated.");
      } else {
        toast.error(result.error || "Failed to break case.");
      }
    });
  };

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <Heading title="Break Case" description="Convert case inventory into individual ('each') units." />
        <Separator />
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-lg mt-4">
          <div>
            <Label>Case Product</Label>
            <Controller
              name="caseProductId"
              control={control}
              rules={{ required: "You must select a case product" }}
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" className="w-full justify-between">
                      {field.value ? caseProducts.find((p) => p.id === field.value)?.name : "Select a case product..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command><CommandInput placeholder="Search case..." /><CommandEmpty>No case products found.</CommandEmpty><CommandGroup>
                      {caseProducts.map((product) => (
                        <CommandItem key={product.id} value={product.id} onSelect={(currentValue) => field.onChange(currentValue)}>
                          <Check className={cn("mr-2 h-4 w-4", field.value === product.id ? "opacity-100" : "opacity-0")} />
                          {product.name}
                        </CommandItem>
                      ))}
                    </CommandGroup></Command>
                  </PopoverContent>
                </Popover>
              )}
            />
             {errors.caseProductId && <p className="text-sm text-destructive mt-1">{(errors.caseProductId as any).message}</p>}
          </div>
          <div>
            <Label>Number of Cases to Break</Label>
            <Input type="number" {...register("numberOfCases", { required: "This field is required", valueAsNumber: true, min: 1 })} placeholder="e.g., 1" />
            {errors.numberOfCases && <p className="text-sm text-destructive mt-1">{(errors.numberOfCases as any).message}</p>}
          </div>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Processing..." : "Break Case"}
          </Button>
        </form>
      </div>
    </div>
  );
}