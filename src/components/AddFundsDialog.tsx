
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { loadStripe } from "@stripe/stripe-js";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

// Replace with your own publishable key
const stripePromise = loadStripe('pk_test_TYooMQauvdEDq54NiTphI7jx');

const PRESET_AMOUNTS = [10, 50, 100, 500];

interface AddFundsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddFundsDialog = ({ open, onOpenChange }: AddFundsDialogProps) => {
  const { addToBalance } = useAuth();
  const [amount, setAmount] = useState<number>(PRESET_AMOUNTS[0]);
  const [isCustomAmount, setIsCustomAmount] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setAmount(isNaN(value) ? 0 : value);
  };

  const handleSelectAmount = (value: number) => {
    setAmount(value);
    setIsCustomAmount(false);
  };

  const handleSubmit = async () => {
    if (amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsLoading(true);
    try {
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      // In a real application, you would:
      // 1. Call your backend to create a Stripe Checkout Session
      // 2. Redirect to Stripe Checkout
      // 3. Handle the success/cancel redirects
      // 
      // For this demo, we'll simulate the payment:
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Add the amount to user's balance
      addToBalance(amount);
      
      toast.success(`Successfully added $${amount.toFixed(2)} to your balance!`);
      onOpenChange(false);
    } catch (error) {
      toast.error("Payment failed. Please try again.");
      console.error('Payment error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Funds to Your Account</DialogTitle>
          <DialogDescription>
            Select an amount to add to your trading balance or enter a custom amount.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-2">
            {PRESET_AMOUNTS.map((preset) => (
              <Button
                key={preset}
                type="button"
                variant={amount === preset && !isCustomAmount ? "default" : "outline"}
                onClick={() => handleSelectAmount(preset)}
                className="text-lg"
              >
                ${preset}
              </Button>
            ))}
          </div>
          
          <div className="flex items-center gap-2 mt-2">
            <Button
              type="button"
              variant={isCustomAmount ? "default" : "outline"}
              onClick={() => setIsCustomAmount(true)}
              className="flex-shrink-0"
            >
              Custom
            </Button>
            
            {isCustomAmount && (
              <div className="flex-1">
                <Label htmlFor="custom-amount" className="sr-only">
                  Custom Amount
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
                  <Input
                    id="custom-amount"
                    type="number"
                    min="1"
                    step="0.01"
                    className="pl-7"
                    value={amount || ''}
                    onChange={handleCustomAmountChange}
                    autoFocus
                  />
                </div>
              </div>
            )}
          </div>
          
          <div className="bg-muted p-3 rounded-md mt-2">
            <p className="text-sm text-muted-foreground">
              You will be adding <span className="font-semibold">${amount.toFixed(2)}</span> to your account balance.
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || amount <= 0}>
            {isLoading ? "Processing..." : "Confirm Payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddFundsDialog;
