import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useSettings } from "@/contexts/settings-context";
import { useToast } from "@/components/ui/use-toast";

interface SubscriptionPlanCardProps {
  type: "Free" | "Basic" | "Super" | "Advance";
  price: string;
  currency?: string;
  features: string[];
  popular?: boolean;
  onSelectPlan: () => void;
}

export function SubscriptionPlanCard({
  type,
  price,
  currency = "INR",
  features,
  popular,
  onSelectPlan,
}: SubscriptionPlanCardProps) {
  const { subscriptionPlan } = useSettings();
  const { toast } = useToast();
  const isCurrentPlan = subscriptionPlan === type;

  const getBgClass = () => {
    if (isCurrentPlan) return "bg-primary/10 border-primary";
    if (popular) return "bg-muted/50";
    return "";
  };

  const handleSelectPlan = () => {
    if (isCurrentPlan) {
      toast({
        title: "Current Plan",
        description: `You are already subscribed to the ${type} plan.`,
      });
      return;
    }

    onSelectPlan();
  };

  return (
    <Card className={`relative overflow-hidden border-2 ${getBgClass()}`}>
      {popular && (
        <Badge className="absolute top-0 right-0 translate-x-[20%] -translate-y-[50%] px-3 py-1 bg-primary text-white">
          Popular
        </Badge>
      )}

      {isCurrentPlan && (
        <div className="absolute top-2 right-2">
          <CheckCircle2 className="h-5 w-5 text-primary" />
        </div>
      )}

      <CardHeader>
        <CardTitle className="text-xl">{type}</CardTitle>
        <div className="flex items-baseline text-muted-foreground">
          <span className="text-3xl font-bold text-foreground">
            {currency} {price}
          </span>
          {type !== "Free" && <span className="ml-1">/month</span>}
        </div>
        <CardDescription>
          {type === "Free" && "Limited features to get started"}
          {type === "Basic" && "Essential features for regular users"}
          {type === "Super" && "Enhanced features for fitness enthusiasts"}
          {type === "Advance" && "Complete premium experience"}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <Check className="h-4 w-4 mr-2 mt-1 text-primary" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        <Button
          onClick={handleSelectPlan}
          variant={isCurrentPlan ? "outline" : popular ? "default" : "outline"}
          className="w-full"
        >
          {isCurrentPlan ? "Current Plan" : "Select Plan"}
        </Button>
      </CardFooter>
    </Card>
  );
}
