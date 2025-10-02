"use client";

import { useRef, useState, useTransition, useEffect } from "react";
import { useCartStore } from "@/app/store/use-cart-store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import axios from "axios";
import { findTransactionById } from "@/app/actions/findTransactionById";
import { Loader2 } from 'lucide-react';
import { PaymentModal } from "./payment-modal";
import { differenceInYears } from 'date-fns';
import { Product } from "@/lib/generated/prisma";
import { useMemo } from "react"; // Import useMemo

interface CheckoutClientProps {
  products: Product[];
}

export const CheckoutClient: React.FC<CheckoutClientProps> = ({ products }) => {
  const { items, addItem, removeItem, updateQuantity, clearCart, subtotal, totalItems, weighedItem, setWeighedItem, addWeighedItem, ageRestrictedItem, setAgeRestrictedItem, addVerifiedItem, mode, setMode, loadReturnItems } = useCartStore();

  const [barcode, setBarcode] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [returningTransactionId, setReturningTransactionId] = useState<string | null>(null);
  const [weightInput, setWeightInput] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [age, setAge] = useState<number | null>(null);
  const MIN_AGE = 18;

  const inputRef = useRef<HTMLInputElement>(null);
  const weightInputRef = useRef<HTMLInputElement>(null);

  const taxRate = 0.08;
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  const handleScan = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (barcode.trim() === "") return;

      startTransition(async () => {
        if (mode === 'sale') {
          // ... sale logic ...
        } else { // Return Mode Logic
          const result = await findTransactionById(barcode.trim());
          if (result.error) {
            toast.error(result.error);
          } else if (result.items && result.transactionId) {
            setReturningTransactionId(result.transactionId); // Store the ID
            loadReturnItems(result.items);
            toast.success(`Transaction found. Items loaded for return.`);
          }
        }
        setBarcode("");
      });
    }
  };


  const handleSubmitSale = async (tenderType: "CASH" | "CARD", amountTendered?: number): Promise<boolean> => {
    try {
      const payload = {
        cartItems: items,
        subtotal,
        tax,
        total,
        tenderType,
        amountTendered,
        originalTransactionId: returningTransactionId, // Pass the original ID for refunds
      };
      await axios.post('/api/transactions', payload);
      return true;
    } catch (error) {
      toast.error("Failed to complete transaction.");
      console.error(error);
      return false;
    }
  };

  const handleSaleSuccess = () => {
    clearCart();
    setReturningTransactionId(null); // Clear the stored ID
  };

  const handleAddWeighedItem = () => {
    const weight = parseFloat(weightInput);
    if (weighedItem && !isNaN(weight) && weight > 0) {
      addWeighedItem(weighedItem, weight);
      handleCloseWeightModal();
    } else {
      toast.error("Please enter a valid weight.");
    }
  };

  const handleCloseWeightModal = () => {
    setWeighedItem(null);
    setWeightInput("");
  };

  const handleAgeVerification = () => {
    if (age === null || age < MIN_AGE) {
      toast.error(`Customer must be at least ${MIN_AGE} years old.`);
      return;
    }
    if (ageRestrictedItem) {
      addVerifiedItem(ageRestrictedItem);
      handleCloseAgeModal();
    }
  };

  const handleCloseAgeModal = () => {
    setAgeRestrictedItem(null);
    setBirthDate("");
    setAge(null);
  };

  const toggleMode = () => {
    setMode(mode === 'sale' ? 'return' : 'sale');
    setReturningTransactionId(null); // Clear the stored ID when toggling
  };

  // Create a map for efficient quantity lookups. useMemo prevents recalculating on every render.
  const cartQuantities = useMemo(() => {
    return new Map(items.map(item => [item.product.id, item.quantity]));
  }, [items]);

  useEffect(() => {
    if (birthDate) {
      try {
        setAge(differenceInYears(new Date(), new Date(birthDate)));
      } catch (error) { setAge(null); }
    } else { setAge(null); }
  }, [birthDate]);

  useEffect(() => {
    if (weighedItem) {
      setTimeout(() => weightInputRef.current?.focus(), 100);
    }
  }, [weighedItem]);

  return (
    <>
      <PaymentModal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} total={total} onSubmit={handleSubmitSale} onSuccess={handleSaleSuccess} />
      <Dialog open={weighedItem !== null} onOpenChange={(isOpen) => !isOpen && handleCloseWeightModal()}><DialogContent><DialogHeader><DialogTitle>Enter Weight</DialogTitle><DialogDescription>Enter the weight for {weighedItem?.name} (Price: ${weighedItem?.price.toFixed(2)}/lb)</DialogDescription></DialogHeader><div className="py-4"><Label htmlFor="weight" className="text-right">Weight (lbs)</Label><Input id="weight" ref={weightInputRef} value={weightInput} onChange={(e) => setWeightInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddWeighedItem()} type="number" step="0.01" /></div><DialogFooter><Button variant="outline" onClick={handleCloseWeightModal}>Cancel</Button><Button onClick={handleAddWeighedItem}>Add to Cart</Button></DialogFooter></DialogContent></Dialog>
      <Dialog open={ageRestrictedItem !== null} onOpenChange={(isOpen) => !isOpen && handleCloseAgeModal()}><DialogContent><DialogHeader><DialogTitle className="text-destructive">Age Verification Required</DialogTitle><DialogDescription>The item "{ageRestrictedItem?.name}" is age-restricted. Please verify the customer's age.</DialogDescription></DialogHeader><div className="py-4"><Label htmlFor="birthDate">Customer's Date of Birth</Label><Input id="birthDate" type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="mt-2" />{age !== null && (<p className={`mt-2 text-lg font-bold ${age >= MIN_AGE ? 'text-green-600' : 'text-destructive'}`}>Age: {age}</p>)}</div><DialogFooter><Button variant="outline" onClick={handleCloseAgeModal}>Cancel</Button><Button onClick={handleAgeVerification} disabled={age === null || age < MIN_AGE}>Verify & Add to Cart</Button></DialogFooter></DialogContent></Dialog>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2"><Card><CardContent className="p-4"><div className="flex justify-between items-center mb-4"><h2 className="text-xl font-semibold">{mode === 'sale' ? 'Add Products' : 'Find Transaction'}</h2><div className="flex items-center space-x-2"><Label htmlFor="mode-switch" className={mode === 'sale' ? 'text-primary' : ''}>Sale</Label><Switch id="mode-switch" checked={mode === 'return'} onCheckedChange={toggleMode} /><Label htmlFor="mode-switch" className={mode === 'return' ? 'text-destructive' : ''}>Return</Label></div></div><div className="flex items-center gap-2 mb-4"><Input ref={inputRef} placeholder={mode === 'sale' ? 'Scan barcode or enter SKU...' : 'Enter Transaction ID...'} value={barcode} onChange={(e) => setBarcode(e.target.value)} onKeyDown={handleScan} disabled={isPending} className="text-lg h-12" />{isPending && <Loader2 className="h-6 w-6 animate-spin" />}</div>{mode === 'sale' && (<><h2 className="text-xl font-semibold mb-4">Or Select a Product</h2><ScrollArea className="h-[55vh]"><div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pr-4">{products.map((product) => (<Button key={product.id} variant="outline" className="h-24 flex flex-col justify-center items-center text-center p-2" onClick={() => addItem(product)}><span className="text-sm font-medium">{product.name}</span><span className="text-xs text-muted-foreground">${product.price.toFixed(2)}</span></Button>))}</div></ScrollArea></>)}</CardContent></Card></div>
        <div className="lg:col-span-1"><Card className={mode === 'return' ? 'border-destructive' : ''}>
          <CardContent className="p-4">
            {/* ... Mode Toggle and Barcode Input ... */}

            {mode === 'sale' && (
              <>
                <h2 className="text-xl font-semibold mb-4">Or Select a Product</h2>
                <ScrollArea className="h-[55vh]">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pr-4">
                    {products.map((product) => {
                      const quantityInCart = cartQuantities.get(product.id) || 0;
                      const isStockMaxed = quantityInCart >= product.stockQuantity;

                      return (
                        <Button
                          key={product.id}
                          variant="outline"
                          className="h-24 flex flex-col justify-center items-center text-center p-2 relative"
                          onClick={() => addItem(product)}
                          disabled={isStockMaxed}
                        >
                          <span className="text-sm font-medium">{product.name}</span>
                          <span className="text-xs text-muted-foreground">${product.price.toFixed(2)}</span>
                          {isStockMaxed && (
                            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                              <span className="text-destructive font-bold text-xs">MAX</span>
                            </div>
                          )}
                        </Button>
                      );
                    })}
                  </div>
                </ScrollArea>
              </>
            )}
          </CardContent>
        </Card>
        </div>
      </div>
    </>
  );
};