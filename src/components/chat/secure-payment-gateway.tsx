
import React, { useState } from "react";
import { CreditCard, Shield, Lock, Zap, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";

interface PaymentPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
  popular?: boolean;
}

const paymentPlans: PaymentPlan[] = [
  {
    id: "basic",
    name: "Basic AI Chat",
    price: 9.99,
    features: ["Basic AI responses", "Standard security", "Email support"]
  },
  {
    id: "premium",
    name: "Premium AI Chat",
    price: 19.99,
    features: ["Advanced AI models", "Enhanced security", "Priority support", "Custom AI training"],
    popular: true
  },
  {
    id: "enterprise",
    name: "Enterprise AI Chat",
    price: 49.99,
    features: ["All AI models", "Military-grade security", "24/7 support", "Custom integrations", "White-label options"]
  }
];

interface SecurePaymentGatewayProps {
  onClose?: () => void;
}

export function SecurePaymentGateway({ onClose }: SecurePaymentGatewayProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>("premium");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "crypto" | "bank">("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const { toast } = useToast();

  const handlePayment = async () => {
    setIsProcessing(true);
    
    // Simulate secure payment processing
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      setPaymentComplete(true);
      
      toast({
        title: "Payment Successful!",
        description: "Your FitFusion AI Chat upgrade has been activated.",
      });
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "Please check your payment details and try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (paymentComplete) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="mb-4"
          >
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
          </motion.div>
          <h3 className="text-xl font-semibold mb-2">Payment Successful!</h3>
          <p className="text-muted-foreground mb-4">
            Your FitFusion AI Chat has been upgraded successfully.
          </p>
          <Button onClick={onClose} className="w-full">
            Start Using Premium Features
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Security Header */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
        <CardHeader>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="h-6 w-6 text-green-500" />
            <Lock className="h-6 w-6 text-blue-500" />
            <Zap className="h-6 w-6 text-yellow-500" />
          </div>
          <CardTitle className="text-center">Secure Payment Gateway</CardTitle>
          <p className="text-center text-sm text-muted-foreground">
            Military-grade encryption • PCI DSS Compliant • 99.9% Uptime
          </p>
          <div className="flex justify-center gap-2 mt-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Shield className="h-3 w-3 mr-1" />
              SSL Secured
            </Badge>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <Lock className="h-3 w-3 mr-1" />
              End-to-End Encrypted
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Payment Plans */}
        <Card>
          <CardHeader>
            <CardTitle>Choose Your Plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {paymentPlans.map((plan) => (
              <div
                key={plan.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedPlan === plan.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 hover:border-gray-300'
                } ${plan.popular ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{plan.name}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">${plan.price}</span>
                    {plan.popular && (
                      <Badge className="bg-blue-500 text-white">Popular</Badge>
                    )}
                  </div>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Payment Details */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Payment Method Selection */}
            <div>
              <Label className="text-sm font-medium">Payment Method</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {[
                  { id: "card", label: "Card", icon: CreditCard },
                  { id: "crypto", label: "Crypto", icon: Zap },
                  { id: "bank", label: "Bank", icon: Shield }
                ].map((method) => (
                  <Button
                    key={method.id}
                    variant={paymentMethod === method.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPaymentMethod(method.id as any)}
                    className="flex items-center gap-1"
                  >
                    <method.icon className="h-3 w-3" />
                    {method.label}
                  </Button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Card Payment Form */}
            {paymentMethod === "card" && (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input
                      id="expiry"
                      placeholder="MM/YY"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="name">Cardholder Name</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    className="mt-1"
                  />
                </div>
              </div>
            )}

            {/* Crypto Payment */}
            {paymentMethod === "crypto" && (
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Zap className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                <p className="text-sm text-muted-foreground">
                  Cryptocurrency payment coming soon!
                </p>
              </div>
            )}

            {/* Bank Transfer */}
            {paymentMethod === "bank" && (
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Shield className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <p className="text-sm text-muted-foreground">
                  Bank transfer option coming soon!
                </p>
              </div>
            )}

            <Separator />

            {/* Security Notice */}
            <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Shield className="h-4 w-4 text-green-500 mt-0.5" />
              <div className="text-xs text-green-700 dark:text-green-300">
                <p className="font-medium">Your payment is protected by:</p>
                <ul className="mt-1 space-y-0.5">
                  <li>• 256-bit SSL encryption</li>
                  <li>• PCI DSS compliance</li>
                  <li>• Fraud protection</li>
                  <li>• 30-day money-back guarantee</li>
                </ul>
              </div>
            </div>

            <Button
              onClick={handlePayment}
              disabled={isProcessing || paymentMethod !== "card"}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              {isProcessing ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="mr-2"
                  >
                    <Zap className="h-4 w-4" />
                  </motion.div>
                  Processing Payment...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Pay ${paymentPlans.find(p => p.id === selectedPlan)?.price} Securely
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
