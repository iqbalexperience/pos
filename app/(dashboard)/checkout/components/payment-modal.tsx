"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle } from "lucide-react";

type PaymentStep = "selection" | "cash" | "card_processing" | "complete";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  onSubmit: (tenderType: "CASH" | "CARD", amountTendered?: number) => Promise<boolean>;
  onSuccess: (changeOrRefundAmount: number) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, total, onSubmit, onSuccess }) => {
  const [step, setStep] = useState<PaymentStep>("selection");
  const [amountTendered, setAmountTendered] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const isRefund = total < 0;
  const displayTotal = Math.abs(total);
  const changeDue = parseFloat(amountTendered) - total;

  useEffect(() => {
    if (isOpen) {
      setStep("selection");
      setAmountTendered("");
      setIsLoading(false);
    }
  }, [isOpen]);

  const handleCashSubmit = async () => {
    setIsLoading(true);
    const success = await onSubmit("CASH", parseFloat(amountTendered));
    if (success) {
      setStep("complete");
      onSuccess(isRefund ? displayTotal : changeDue);
    } else {
      setStep("selection");
    }
    setIsLoading(false);
  };

  const handleCardSubmit = async () => {
    setStep("card_processing");
    setIsLoading(true);
    setTimeout(async () => {
      const success = await onSubmit("CARD");
      if (success) {
        setStep("complete");
        onSuccess(isRefund ? displayTotal : 0);
      } else {
        setStep("selection");
      }
      setIsLoading(false);
    }, 2000);
  };

  const renderContent = () => {
    switch (step) {
      case "cash":
        return (
          <>
            <DialogHeader><DialogTitle>Cash Payment</DialogTitle></DialogHeader>
            <div className="text-center my-4"><p className="text-muted-foreground">Total Due</p><p className="text-4xl font-bold">${total.toFixed(2)}</p></div>
            <div className="space-y-2"><Label htmlFor="amount-tendered">Amount Tendered</Label><Input id="amount-tendered" type="number" value={amountTendered} onChange={(e) => setAmountTendered(e.target.value)} placeholder="e.g., 20.00" className="text-lg h-12" /></div>
            {changeDue >= 0 && (<p className="text-lg mt-4">Change Due: <span className="font-bold">${changeDue.toFixed(2)}</span></p>)}
            <DialogFooter className="mt-4"><Button variant="outline" onClick={() => setStep("selection")}>Back</Button><Button onClick={handleCashSubmit} disabled={isLoading || changeDue < 0}>{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Finalize Sale</Button></DialogFooter>
          </>
        );
      case "card_processing":
        return (
          <div className="flex flex-col items-center justify-center h-48"><Loader2 className="h-12 w-12 animate-spin text-primary mb-4" /><p className="text-lg">{isRefund ? 'Processing Refund...' : 'Processing card...'}</p><p className="text-muted-foreground">Please follow terminal instructions.</p></div>
        );
      case "complete":
        return (
          <div className="flex flex-col items-center justify-center h-48 text-center"><CheckCircle className="h-16 w-16 text-green-500 mb-4" /><h2 className="text-2xl font-bold">{isRefund ? 'Refund Complete' : 'Sale Complete'}</h2>{isRefund ? (<p className="text-xl mt-2">Amount Refunded: <span className="font-bold">${displayTotal.toFixed(2)}</span></p>) : (changeDue > 0 && (<p className="text-xl mt-2">Change Due: <span className="font-bold">${changeDue.toFixed(2)}</span></p>))}<Button className="mt-6" onClick={onClose}>New Sale</Button></div>
        );
      case "selection":
      default:
        return (
          <>
            <DialogHeader><DialogTitle>{isRefund ? 'Select Refund Method' : 'Select Payment Method'}</DialogTitle></DialogHeader>
            <div className="text-center my-4"><p className="text-muted-foreground">{isRefund ? 'Total Refund Due' : 'Total Due'}</p><p className="text-4xl font-bold">${displayTotal.toFixed(2)}</p></div>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <Button onClick={() => isRefund ? handleCashSubmit() : setStep("cash")} className="h-24 text-lg">{isRefund ? 'Refund to Cash' : 'Cash'}</Button>
              <Button onClick={handleCardSubmit} className="h-24 text-lg">{isRefund ? 'Refund to Card' : 'Card'}</Button>
            </div>
          </>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>{renderContent()}</DialogContent>
    </Dialog>
  );
};