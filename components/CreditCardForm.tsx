"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@stackframe/stack";
import { toast } from "sonner";

export default function CreditCardForm() {
  const user = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [cardData, setCardData] = useState({
    cardNumber: "",
    cardholderName: "",
    expiryDate: "",
    cvv: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCardData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      toast.error("You must be logged in to save credit card information");
      return;
    }

    if (!cardData.cardNumber || !cardData.cardholderName || !cardData.expiryDate || !cardData.cvv) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/creditcard/store", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cardData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to store credit card");
      }

      toast.success("Credit card information saved securely");

      // Clear the form
      setCardData({
        cardNumber: "",
        cardholderName: "",
        expiryDate: "",
        cvv: "",
      });
    } catch (error) {
      console.error("Error storing credit card:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save credit card");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFetch = async () => {
    if (!user?.id) {
      toast.error("You must be logged in to retrieve credit card information");
      return;
    }

    setIsFetching(true);
    try {
      const response = await fetch("/api/creditcard/retrieve");

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to retrieve credit card");
      }

      const data = await response.json();

      if (data.creditCard) {
        setCardData(data.creditCard);
        toast.success("Credit card information retrieved");
      } else {
        toast.info("No credit card information found");
      }
    } catch (error) {
      console.error("Error retrieving credit card:", error);
      toast.error(error instanceof Error ? error.message : "Failed to retrieve credit card");
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Payment Settings</h1>
        <p className="text-muted-foreground">
          Securely store your credit card information using Stack Auth Data Vault
        </p>
      </div>

      <div className="card-minimal rounded-lg p-6 animate-scale-in stagger-1">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="cardNumber">Card Number</Label>
            <Input
              id="cardNumber"
              name="cardNumber"
              type="text"
              placeholder="1234 5678 9012 3456"
              value={cardData.cardNumber}
              onChange={handleInputChange}
              maxLength={19}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cardholderName">Cardholder Name</Label>
            <Input
              id="cardholderName"
              name="cardholderName"
              type="text"
              placeholder="John Doe"
              value={cardData.cardholderName}
              onChange={handleInputChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input
                id="expiryDate"
                name="expiryDate"
                type="text"
                placeholder="MM/YY"
                value={cardData.expiryDate}
                onChange={handleInputChange}
                maxLength={5}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cvv">CVV</Label>
              <Input
                id="cvv"
                name="cvv"
                type="text"
                placeholder="123"
                value={cardData.cvv}
                onChange={handleInputChange}
                maxLength={4}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "Saving..." : "Save Card"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleFetch}
              disabled={isFetching}
              className="flex-1"
            >
              {isFetching ? "Loading..." : "Load Saved Card"}
            </Button>
          </div>
        </form>

        <div className="mt-6 pt-6 border-t border-border">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-primary mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Secure Encryption</p>
              <p>
                Your credit card information is encrypted using Stack Auth's Data Vault with
                envelope encryption and rotating master keys. Even Stack Auth cannot access
                your data without the secret key.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
