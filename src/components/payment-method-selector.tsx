import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import { useSettings } from "@/contexts/settings-context";

type PaymentMethod =
  | "Cash"
  | "GPay"
  | "PhonePe"
  | "NetBanking"
  | "CreditCard"
  | "DebitCard"
  | "UPI";

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod;
  onSelectMethod: (method: PaymentMethod) => void;
}

export function PaymentMethodSelector({
  selectedMethod,
  onSelectMethod,
}: PaymentMethodSelectorProps) {
  const paymentMethods = [
    { id: "CreditCard", name: "Credit Card", icon: "💳" },
    { id: "DebitCard", name: "Debit Card", icon: "💳" },
    { id: "NetBanking", name: "Net Banking", icon: "🏦" },
    { id: "GPay", name: "Google Pay", icon: "G" },
    { id: "PhonePe", name: "PhonePe", icon: "P" },
    { id: "UPI", name: "UPI", icon: "₹" },
    { id: "Cash", name: "Cash", icon: "💵" },
  ];

  return (
    <RadioGroup
      value={selectedMethod}
      onValueChange={(value) => onSelectMethod(value as PaymentMethod)}
    >
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {paymentMethods.map((method) => (
          <div key={method.id}>
            <RadioGroupItem
              value={method.id as PaymentMethod}
              id={method.id}
              className="peer sr-only"
            />
            <Label
              htmlFor={method.id}
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted mb-2">
                {method.icon}
              </div>
              <div className="text-sm font-medium leading-none">
                {method.name}
              </div>
            </Label>
          </div>
        ))}
      </div>
    </RadioGroup>
  );
}
