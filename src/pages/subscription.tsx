import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MobileNav } from "@/components/mobile-nav";
import { useToast } from "@/components/ui/use-toast";
import {
  CheckCircle,
  CreditCard,
  Calendar,
  User,
  ChevronRight,
  ArrowLeft,
  Lock,
  Shield,
  Zap,
  Trophy,
  Users,
  BookOpen,
  Video,
  Brain,
  Star,
  FileQuestion,
  FileText,
  Wallet,
  ArrowRight,
  CreditCard as CreditCardIcon,
  BadgeCheck,
  ChevronDown,
  AlertCircle,
  Clock,
  Gift,
  RefreshCw,
  Settings,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { PaymentMethodSelector } from "@/components/payment-method-selector";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const SubscriptionPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("plans");
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly",
  );
  const [checkoutStep, setCheckoutStep] = useState<number>(1);
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<
    | "CreditCard"
    | "DebitCard"
    | "NetBanking"
    | "GPay"
    | "PhonePe"
    | "UPI"
    | "Cash"
  >("CreditCard");
  const [cardInfo, setCardInfo] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [expiryDate, setExpiryDate] = useState<string | null>(null);

  // Check for existing subscription
  useEffect(() => {
    // Check local storage for subscription status
    const savedProfile = localStorage.getItem("fitfusion-profile");
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        setIsSubscribed(!!parsed.isPro);
        setCurrentPlan(parsed.subscriptionTier || null);

        // Set fake expiry date for demo purposes
        if (parsed.isPro) {
          const today = new Date();
          today.setMonth(today.getMonth() + 1);
          setExpiryDate(today.toLocaleDateString());
        }
      } catch (error) {
        console.error("Error checking subscription status:", error);
      }
    }
  }, []);

  const plans = [
    {
      id: "basic",
      name: "Basic",
      price: billingCycle === "monthly" ? 8.99 : 89.99,
      description: "Essential features for casual fitness enthusiasts",
      features: [
        "Standard workout library",
        "Basic progress tracking",
        "Community forum access",
        "Ad-supported experience",
      ],
      recommended: false,
      color: "bg-blue-500",
    },
    {
      id: "pro",
      name: "Pro",
      price: billingCycle === "monthly" ? 14.99 : 149.99,
      description: "Advanced features for dedicated fitness enthusiasts",
      features: [
        "Premium workout library",
        "Advanced progress analytics",
        "Personalized training plans",
        "Ad-free experience",
        "Priority support",
      ],
      recommended: true,
      color: "bg-gradient-to-r from-purple-600 to-pink-600",
    },
    {
      id: "elite",
      name: "Elite",
      price: billingCycle === "monthly" ? 29.99 : 299.99,
      description: "Ultimate package for fitness professionals and athletes",
      features: [
        "Complete workout library",
        "AI-powered training assistant",
        "1-on-1 coach consultations",
        "Custom workout creation tools",
        "Nutrition planning tools",
        "Exclusive content access",
        "Premium support with dedicated team",
      ],
      recommended: false,
      color: "bg-gradient-to-r from-amber-500 to-orange-500",
    },
  ];

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    setCheckoutStep(1);
    setActiveTab("checkout");
  };

  const handleProceedToPayment = () => {
    if (!customerInfo.name || !customerInfo.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    setCheckoutStep(2);
  };

  const handlePaymentInfoSubmit = () => {
    const validateCard = () => {
      if (paymentMethod === "CreditCard" || paymentMethod === "DebitCard") {
        return (
          cardInfo.number.length >= 15 &&
          cardInfo.name.length > 3 &&
          cardInfo.expiry.length === 5 &&
          cardInfo.cvv.length >= 3
        );
      }
      return true;
    };

    if (!validateCard()) {
      toast({
        title: "Invalid Card Information",
        description: "Please check your card details and try again.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);

      // Update subscription status in local storage
      const savedProfile = localStorage.getItem("fitfusion-profile");
      if (savedProfile) {
        try {
          const parsed = JSON.parse(savedProfile);
          parsed.isPro = true;
          parsed.subscriptionTier =
            selectedPlan === "basic"
              ? "Basic"
              : selectedPlan === "pro"
                ? "Pro"
                : "Elite";
          localStorage.setItem("fitfusion-profile", JSON.stringify(parsed));
        } catch (error) {
          console.error("Error updating profile:", error);
        }
      }

      setIsSubscribed(true);
      setCurrentPlan(
        selectedPlan === "basic"
          ? "Basic"
          : selectedPlan === "pro"
            ? "Pro"
            : "Elite",
      );

      // Set expiry date for demo
      const today = new Date();
      today.setMonth(today.getMonth() + 1);
      setExpiryDate(today.toLocaleDateString());

      setCheckoutStep(3);

      toast({
        title: "✅ Payment Successful",
        description: `You've successfully subscribed to the ${selectedPlan === "basic" ? "Basic" : selectedPlan === "pro" ? "Pro" : "Elite"} plan.`,
      });
    }, 3000);
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^\d]/g, "");
    if (value.length > 16) value = value.slice(0, 16);

    // Add spaces after every 4 digits
    const formatted = value.replace(/(\d{4})/g, "$1 ").trim();

    setCardInfo({ ...cardInfo, number: formatted });
  };

  const handleCardExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^\d]/g, "");
    if (value.length > 4) value = value.slice(0, 4);

    // Add slash between month and year
    if (value.length > 2) {
      value = value.slice(0, 2) + "/" + value.slice(2);
    }

    setCardInfo({ ...cardInfo, expiry: value });
  };

  const handleCancelSubscription = () => {
    // Simulate cancellation
    const savedProfile = localStorage.getItem("fitfusion-profile");
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        parsed.isPro = false;
        parsed.subscriptionTier = null;
        localStorage.setItem("fitfusion-profile", JSON.stringify(parsed));
      } catch (error) {
        console.error("Error updating profile:", error);
      }
    }

    setIsSubscribed(false);
    setCurrentPlan(null);
    setExpiryDate(null);

    toast({
      title: "Subscription Cancelled",
      description: "Your subscription has been cancelled successfully.",
    });
  };

  const faqs = [
    {
      question: "How do I cancel my subscription?",
      answer:
        "You can cancel your subscription at any time from your account settings. Your benefits will continue until the end of your current billing cycle.",
    },
    {
      question: "Will I get charged after the trial period?",
      answer:
        "Yes, if you don't cancel before the trial ends, you'll be charged for the plan you selected during sign-up.",
    },
    {
      question: "Can I switch between plans?",
      answer:
        "Absolutely! You can upgrade or downgrade your plan at any time. If you upgrade, the change happens immediately. If you downgrade, the change will be applied at the end of your current billing cycle.",
    },
    {
      question: "Are there any hidden fees?",
      answer:
        "No, the price you see is the price you pay. No hidden fees, no surprise charges.",
    },
    {
      question: "Is my payment information secure?",
      answer:
        "Yes, we use industry-standard encryption to protect your payment information. We never store your full credit card details on our servers.",
    },
  ];

  const getSavingsText = () => {
    if (billingCycle === "yearly") {
      if (selectedPlan === "basic") return "Save $17.89";
      if (selectedPlan === "pro") return "Save $29.89";
      if (selectedPlan === "elite") return "Save $59.89";
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Enhanced Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500" />
        <div className="absolute inset-0 bg-black/20" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative pt-12 pb-8 px-4 text-white"
        >
          <div className="flex items-center gap-2 mb-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>

            <Badge
              variant="secondary"
              className="bg-white/20 text-white border-white/30"
            >
              v5.0.4
            </Badge>
          </div>

          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl font-bold">FitFusion Premium</h1>
            <p className="text-white/80 mt-2">
              Upgrade your fitness journey with premium features and
              personalized training
            </p>
          </div>
        </motion.div>
      </div>

      <div className="px-4 py-6 max-w-4xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="plans" disabled={checkoutStep === 3}>
              <CreditCard className="h-4 w-4 mr-2" />
              Plans
            </TabsTrigger>
            <TabsTrigger
              value="checkout"
              disabled={!selectedPlan || isSubscribed}
            >
              <Lock className="h-4 w-4 mr-2" />
              Checkout
            </TabsTrigger>
            <TabsTrigger value="manage">
              <User className="h-4 w-4 mr-2" />
              My Subscription
            </TabsTrigger>
          </TabsList>

          <TabsContent value="plans" className="mt-4">
            {/* Subscription Plans */}
            <div className="space-y-6">
              <div className="text-center">
                <div className="flex items-center justify-center mb-8">
                  <Label className="mr-2">Monthly</Label>
                  <div
                    className="w-16 h-8 bg-muted rounded-full p-1 cursor-pointer"
                    onClick={() =>
                      setBillingCycle(
                        billingCycle === "monthly" ? "yearly" : "monthly",
                      )
                    }
                  >
                    <motion.div
                      className="w-6 h-6 bg-primary rounded-full"
                      animate={{ x: billingCycle === "yearly" ? 24 : 0 }}
                    />
                  </div>
                  <div className="flex items-center ml-2">
                    <Label>Yearly</Label>
                    <Badge className="ml-1 bg-green-600">Save 17%</Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {plans.map((plan) => (
                    <motion.div
                      key={plan.id}
                      whileHover={{ scale: 1.02 }}
                      className={`relative ${plan.recommended ? "mt-0 md:-mt-4" : ""}`}
                    >
                      {plan.recommended && (
                        <div className="absolute -top-4 inset-x-0 flex justify-center">
                          <Badge className="bg-primary px-3 py-1">
                            <Star className="h-4 w-4 mr-1" />
                            Most Popular
                          </Badge>
                        </div>
                      )}

                      <Card
                        className={`overflow-hidden ${plan.recommended ? "border-primary shadow-lg" : ""}`}
                      >
                        <div className={`h-2 ${plan.color}`}></div>
                        <CardHeader>
                          <CardTitle>{plan.name}</CardTitle>
                          <CardDescription>{plan.description}</CardDescription>
                          <div className="mt-2">
                            <span className="text-3xl font-bold">
                              ${plan.price}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              /{billingCycle === "monthly" ? "month" : "year"}
                            </span>

                            {billingCycle === "yearly" && (
                              <Badge
                                variant="outline"
                                className="ml-2 text-green-600"
                              >
                                Save 17%
                              </Badge>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <ul className="space-y-2">
                              {plan.features.map((feature, index) => (
                                <li key={index} className="flex items-start">
                                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                                  <span className="text-sm">{feature}</span>
                                </li>
                              ))}
                            </ul>

                            <Button
                              className={`w-full ${plan.recommended ? "bg-primary" : ""}`}
                              onClick={() => handlePlanSelect(plan.id)}
                            >
                              Select Plan
                              <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>

              <Card className="mt-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Premium Features
                  </CardTitle>
                  <CardDescription>
                    Boost your fitness journey with these premium features
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex flex-col items-center text-center p-4">
                      <div className="bg-primary/10 p-3 rounded-full mb-3">
                        <Brain className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-medium mb-1">AI Personal Trainer</h3>
                      <p className="text-sm text-muted-foreground">
                        Get AI-powered workout recommendations tailored to your
                        goals
                      </p>
                    </div>

                    <div className="flex flex-col items-center text-center p-4">
                      <div className="bg-primary/10 p-3 rounded-full mb-3">
                        <Video className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-medium mb-1">
                        Premium Workout Videos
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Access our library of high-quality workout videos with
                        professional trainers
                      </p>
                    </div>

                    <div className="flex flex-col items-center text-center p-4">
                      <div className="bg-primary/10 p-3 rounded-full mb-3">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-medium mb-1">Coach Consultations</h3>
                      <p className="text-sm text-muted-foreground">
                        Get personalized advice from certified fitness coaches
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="mt-8">
                <h3 className="text-lg font-medium mb-4">
                  Frequently Asked Questions
                </h3>
                <Accordion type="single" collapsible>
                  {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`faq-${index}`}>
                      <AccordionTrigger>{faq.question}</AccordionTrigger>
                      <AccordionContent>{faq.answer}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>

              <div className="text-center mt-8 pt-6 border-t">
                <p className="text-sm text-muted-foreground mb-2">
                  Need more information about our plans?
                </p>
                <Button variant="outline" onClick={() => navigate("/help")}>
                  <FileQuestion className="h-4 w-4 mr-2" />
                  Contact Support
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="checkout" className="mt-4">
            <AnimatePresence mode="wait">
              {checkoutStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold">
                        Customer Information
                      </h2>
                      <Badge variant="outline">Step 1 of 2</Badge>
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Order Summary</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">
                              {plans.find((p) => p.id === selectedPlan)?.name}{" "}
                              Plan ({billingCycle})
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {
                                plans.find((p) => p.id === selectedPlan)
                                  ?.description
                              }
                            </p>
                          </div>
                          <p className="font-bold">
                            ${plans.find((p) => p.id === selectedPlan)?.price}
                          </p>
                        </div>

                        <Separator />

                        <div className="flex justify-between items-center font-medium">
                          <p>Total</p>
                          <div className="text-right">
                            <p className="font-bold">
                              ${plans.find((p) => p.id === selectedPlan)?.price}
                            </p>
                            {getSavingsText() && (
                              <p className="text-xs text-green-600 font-normal">
                                {getSavingsText()} with yearly billing
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Personal Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                              id="name"
                              value={customerInfo.name}
                              onChange={(e) =>
                                setCustomerInfo({
                                  ...customerInfo,
                                  name: e.target.value,
                                })
                              }
                              placeholder="John Doe"
                              className="mt-1"
                            />
                          </div>

                          <div>
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                              id="email"
                              type="email"
                              value={customerInfo.email}
                              onChange={(e) =>
                                setCustomerInfo({
                                  ...customerInfo,
                                  email: e.target.value,
                                })
                              }
                              placeholder="john.doe@example.com"
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="flex justify-between">
                      <Button
                        variant="outline"
                        onClick={() => setActiveTab("plans")}
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Plans
                      </Button>
                      <Button onClick={handleProceedToPayment}>
                        Continue to Payment
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {checkoutStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold">
                        Payment Information
                      </h2>
                      <Badge variant="outline">Step 2 of 2</Badge>
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Wallet className="h-5 w-5" />
                          Select Payment Method
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <PaymentMethodSelector
                          selectedMethod={paymentMethod}
                          onSelectMethod={(method) => setPaymentMethod(method)}
                        />
                      </CardContent>
                    </Card>

                    {(paymentMethod === "CreditCard" ||
                      paymentMethod === "DebitCard") && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <CreditCardIcon className="h-5 w-5" />
                            Card Details
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <Label htmlFor="cardNumber">Card Number</Label>
                            <Input
                              id="cardNumber"
                              value={cardInfo.number}
                              onChange={handleCardNumberChange}
                              placeholder="1234 5678 9012 3456"
                              className="mt-1"
                            />
                          </div>

                          <div>
                            <Label htmlFor="cardName">Name on Card</Label>
                            <Input
                              id="cardName"
                              value={cardInfo.name}
                              onChange={(e) =>
                                setCardInfo({
                                  ...cardInfo,
                                  name: e.target.value,
                                })
                              }
                              placeholder="John Doe"
                              className="mt-1"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="expiry">Expiry Date</Label>
                              <Input
                                id="expiry"
                                value={cardInfo.expiry}
                                onChange={handleCardExpiryChange}
                                placeholder="MM/YY"
                                className="mt-1"
                              />
                            </div>

                            <div>
                              <Label htmlFor="cvv">CVV</Label>
                              <Input
                                id="cvv"
                                type="password"
                                maxLength={4}
                                value={cardInfo.cvv}
                                onChange={(e) =>
                                  setCardInfo({
                                    ...cardInfo,
                                    cvv: e.target.value,
                                  })
                                }
                                placeholder="123"
                                className="mt-1"
                              />
                            </div>
                          </div>

                          <div className="flex items-center text-sm text-muted-foreground">
                            <Lock className="h-4 w-4 mr-2 text-green-600" />
                            <span>
                              Your payment information is encrypted and secure
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {paymentMethod === "NetBanking" && (
                      <Card>
                        <CardContent className="pt-6">
                          <p className="text-center mb-4">
                            Select your bank to proceed with Net Banking
                          </p>
                          <RadioGroup defaultValue="hdfc">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="hdfc" id="hdfc" />
                                <Label htmlFor="hdfc">HDFC Bank</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="sbi" id="sbi" />
                                <Label htmlFor="sbi">State Bank of India</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="icici" id="icici" />
                                <Label htmlFor="icici">ICICI Bank</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="axis" id="axis" />
                                <Label htmlFor="axis">Axis Bank</Label>
                              </div>
                            </div>
                          </RadioGroup>
                        </CardContent>
                      </Card>
                    )}

                    {(paymentMethod === "GPay" ||
                      paymentMethod === "PhonePe" ||
                      paymentMethod === "UPI") && (
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <p className="mb-4">
                              Enter your UPI ID to proceed with payment
                            </p>
                            <Input
                              placeholder={
                                paymentMethod === "GPay"
                                  ? "name@okaxis"
                                  : "name@upi"
                              }
                              className="max-w-xs mx-auto"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Order Summary</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">
                              {plans.find((p) => p.id === selectedPlan)?.name}{" "}
                              Plan ({billingCycle})
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {billingCycle === "monthly"
                                ? "Billed monthly"
                                : "Billed annually"}
                            </p>
                          </div>
                          <p className="font-bold">
                            ${plans.find((p) => p.id === selectedPlan)?.price}
                          </p>
                        </div>

                        <Separator />

                        <div className="flex justify-between items-center font-medium">
                          <p>Total Due Today</p>
                          <p className="font-bold">
                            ${plans.find((p) => p.id === selectedPlan)?.price}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="text-sm text-muted-foreground">
                      <p className="mb-2">
                        By completing this purchase you agree to our:
                      </p>
                      <div className="flex gap-4">
                        <Button
                          variant="link"
                          className="h-auto p-0"
                          onClick={() => navigate("/terms")}
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Terms of Service
                        </Button>
                        <Button
                          variant="link"
                          className="h-auto p-0"
                          onClick={() => navigate("/privacy")}
                        >
                          <Shield className="h-4 w-4 mr-1" />
                          Privacy Policy
                        </Button>
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <Button
                        variant="outline"
                        onClick={() => setCheckoutStep(1)}
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                      </Button>
                      <Button
                        onClick={handlePaymentInfoSubmit}
                        disabled={isProcessing}
                        className="min-w-[120px]"
                      >
                        {isProcessing ? (
                          <>
                            <motion.span
                              animate={{ rotate: 360 }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                ease: "linear",
                              }}
                              className="inline-block mr-2"
                            >
                              <RefreshCw className="h-4 w-4" />
                            </motion.span>
                            Processing...
                          </>
                        ) : (
                          <>
                            Complete Payment
                            <Lock className="h-4 w-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {checkoutStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
                    <CardContent className="pt-6 text-center">
                      <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                      </div>
                      <h2 className="text-2xl font-bold mb-2">
                        Payment Successful!
                      </h2>
                      <p className="text-muted-foreground mb-6">
                        Thank you for subscribing to FitFusion {currentPlan}!
                      </p>

                      <div className="flex flex-col gap-4">
                        <Button onClick={() => navigate("/profile")}>
                          Go to Your Profile
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setActiveTab("manage")}
                        >
                          Manage Your Subscription
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="manage" className="mt-4">
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Subscription Management</h2>

              {isSubscribed ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BadgeCheck className="h-5 w-5 text-green-600" />
                      Active Subscription
                    </CardTitle>
                    <CardDescription>
                      Manage your current subscription plan
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-3 rounded-lg ${
                            currentPlan === "Basic"
                              ? "bg-blue-100 text-blue-700"
                              : currentPlan === "Pro"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          <Trophy className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-medium text-lg">
                            {currentPlan} Plan
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Active until {expiryDate}
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-green-600">Active</Badge>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm">
                          Next billing date: {expiryDate}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <CreditCardIcon className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm">Payment method: •••• 4567</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button
                        variant="outline"
                        onClick={() => navigate("/settings")}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Manage Payment Methods
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => navigate("/settings")}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Billing History
                      </Button>

                      <Button onClick={() => setActiveTab("plans")}>
                        <Gift className="h-4 w-4 mr-2" />
                        Upgrade Plan
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleCancelSubscription}
                      >
                        Cancel Subscription
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-amber-500" />
                      No Active Subscription
                    </CardTitle>
                    <CardDescription>
                      You don't have an active subscription
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                      Upgrade to FitFusion Premium to access exclusive features
                      and personalized training.
                    </p>
                    <Button onClick={() => setActiveTab("plans")}>
                      <Zap className="h-4 w-4 mr-2" />
                      View Plans
                    </Button>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileQuestion className="h-5 w-5" />
                    Need Help?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    If you have any questions about your subscription or
                    billing, our support team is here to help.
                  </p>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => navigate("/help")}>
                      <User className="h-4 w-4 mr-2" />
                      Contact Support
                    </Button>
                    <Button variant="outline" onClick={() => navigate("/help")}>
                      <BookOpen className="h-4 w-4 mr-2" />
                      View FAQs
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <MobileNav />
    </div>
  );
};

export default SubscriptionPage;
