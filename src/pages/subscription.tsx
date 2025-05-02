
import React, { useState } from "react";
import { MobileNav } from "@/components/mobile-nav";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useSettings } from "@/contexts/settings-context";
import { useToast } from "@/components/ui/use-toast";
import { SubscriptionPlanCard } from "@/components/subscription-plan-card";
import { Button } from "@/components/ui/button";
import { PaymentMethodSelector } from "@/components/payment-method-selector";
import { Separator } from "@/components/ui/separator";

type PaymentMethod = "Cash" | "GPay" | "PhonePe" | "NetBanking" | "CreditCard" | "DebitCard" | "UPI";

const Subscription = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { subscriptionPlan, setSubscriptionPlan, paymentMethod, setPaymentMethod } = useSettings();
  
  const [selectedPlan, setSelectedPlan] = useState<"Free" | "Basic" | "Super" | "Advance">(subscriptionPlan);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>(paymentMethod);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  
  const handlePlanSelect = (plan: "Free" | "Basic" | "Super" | "Advance") => {
    setSelectedPlan(plan);
    
    if (plan === "Free") {
      setSubscriptionPlan(plan);
      toast({
        title: "Plan Updated",
        description: "You have switched to the Free plan.",
      });
    } else {
      setCheckoutOpen(true);
    }
  };
  
  const handlePaymentSubmit = () => {
    setProcessingPayment(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setProcessingPayment(false);
      setCheckoutOpen(false);
      
      setSubscriptionPlan(selectedPlan);
      setPaymentMethod(selectedPaymentMethod);
      
      toast({
        title: "Payment Successful",
        description: `You have successfully subscribed to the ${selectedPlan} plan!`,
      });
    }, 2000);
  };
  
  const getPricingPlans = () => [
    {
      type: "Free",
      price: "0",
      features: [
        "Basic workout tracking",
        "Limited workout library",
        "Progress charts (basic)",
        "Profile customization",
      ],
    },
    {
      type: "Basic",
      price: "500",
      features: [
        "Everything in Free",
        "Full workout library access",
        "Custom workout creation",
        "Detailed progress analytics",
        "Meal plan suggestions",
        "Priority support",
      ],
      popular: false,
    },
    {
      type: "Super",
      price: "1000",
      features: [
        "Everything in Basic",
        "Advanced analytics",
        "Personalized workout plans",
        "AI workout recommendations",
        "Wearable device integration",
        "Nutrition tracking",
        "Voice guidance during workouts",
      ],
      popular: true,
    },
    {
      type: "Advance",
      price: "1700",
      features: [
        "Everything in Super",
        "Personal coach consultation",
        "Premium content library",
        "Community challenges",
        "Unlimited data export",
        "Advanced developer features",
        "Early access to new features",
        "Customizable app experience",
      ],
    },
  ];
  
  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Header */}
      <div className="fitness-gradient pt-12 pb-6 px-4">
        <div className="flex items-center">
          <button 
            onClick={() => navigate(-1)} 
            className="text-white p-2 rounded-full hover:bg-white/10"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold text-white ml-2">Subscription Plans</h1>
        </div>
      </div>
      
      <div className="px-4 py-6 max-w-3xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Choose Your Plan</h2>
          <p className="text-muted-foreground">
            Upgrade your fitness experience with our premium features
          </p>
        </div>
        
        <Tabs defaultValue="monthly" className="mb-8">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="yearly">Yearly (20% off)</TabsTrigger>
          </TabsList>
          
          <TabsContent value="monthly" className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              {getPricingPlans().map((plan) => (
                <SubscriptionPlanCard
                  key={plan.type}
                  type={plan.type as "Free" | "Basic" | "Super" | "Advance"}
                  price={plan.price}
                  features={plan.features}
                  popular={plan.popular}
                  onSelectPlan={() => handlePlanSelect(plan.type as "Free" | "Basic" | "Super" | "Advance")}
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="yearly" className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              {getPricingPlans().map((plan) => {
                // Apply 20% discount for yearly plans, except for Free plan
                const yearlyPrice = plan.type === "Free" ? "0" : 
                  (parseInt(plan.price) * 12 * 0.8).toFixed(0);
                
                return (
                  <SubscriptionPlanCard
                    key={plan.type}
                    type={plan.type as "Free" | "Basic" | "Super" | "Advance"}
                    price={yearlyPrice}
                    currency="INR"
                    features={[...plan.features, "20% discount on annual billing"]}
                    popular={plan.popular}
                    onSelectPlan={() => handlePlanSelect(plan.type as "Free" | "Basic" | "Super" | "Advance")}
                  />
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="bg-muted/30 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-2">Current Subscription</h3>
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">{subscriptionPlan} Plan</p>
              <p className="text-sm text-muted-foreground">
                {subscriptionPlan === "Free" ? "Limited features" : "Renews monthly"}
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate('/settings')}
            >
              Manage
            </Button>
          </div>
        </div>
      </div>
      
      {/* Payment Dialog */}
      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Complete Your Subscription</DialogTitle>
            <DialogDescription>
              Subscribe to the {selectedPlan} plan to unlock premium features.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Payment Summary</h3>
              <div className="bg-muted p-3 rounded-md">
                <div className="flex justify-between">
                  <span>{selectedPlan} Plan (Monthly)</span>
                  <span className="font-medium">
                    INR {selectedPlan === "Basic" ? "500" : selectedPlan === "Super" ? "1000" : "1700"}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground mt-1">
                  <span>Tax</span>
                  <span>Included</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>
                    INR {selectedPlan === "Basic" ? "500" : selectedPlan === "Super" ? "1000" : "1700"}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Payment Method</h3>
              <PaymentMethodSelector
                selectedMethod={selectedPaymentMethod}
                onSelectMethod={setSelectedPaymentMethod}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCheckoutOpen(false)}
              disabled={processingPayment}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePaymentSubmit}
              disabled={processingPayment}
            >
              {processingPayment ? "Processing..." : "Complete Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <MobileNav />
    </div>
  );
};

export default Subscription;
