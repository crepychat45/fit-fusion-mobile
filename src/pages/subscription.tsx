import React, { useMemo, useState } from "react";
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
  ArrowLeft,
  Lock,
  Shield,
  Zap,
  Star,
  Brain,
  Sparkles,
  Trophy,
  Crown,
  Rocket,
  Gift,
  Clock,
  RefreshCw,
  BadgeCheck,
  Infinity as InfinityIcon,
  User,
  Calendar,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { PaymentMethodSelector } from "@/components/payment-method-selector";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useSubscription, PlanId, BillingCycle } from "@/hooks/use-subscription";

interface Plan {
  id: PlanId;
  name: string;
  tagline: string;
  monthly: number;
  yearly: number;
  icon: React.ElementType;
  gradient: string;
  ring: string;
  features: string[];
  highlight?: boolean;
}

const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    tagline: "Kickstart your fitness journey",
    monthly: 149,
    yearly: 1499,
    icon: Rocket,
    gradient: "from-sky-500 to-cyan-500",
    ring: "ring-sky-500/40",
    features: [
      "Full workout library",
      "Basic progress tracking",
      "Community forum access",
      "3 AI coach chats / day",
      "Ad-free experience",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Most popular — serious training",
    monthly: 299,
    yearly: 2999,
    icon: Star,
    gradient: "from-fuchsia-500 via-purple-500 to-indigo-500",
    ring: "ring-purple-500/60",
    highlight: true,
    features: [
      "Everything in Starter",
      "Unlimited AI Coach & workout builder",
      "Adaptive personalised plans",
      "Advanced analytics & PR board",
      "Smartwatch premium faces",
      "Nutrition planner & recipes",
      "Priority support",
    ],
  },
  {
    id: "elite",
    name: "Elite",
    tagline: "For athletes and pros",
    monthly: 599,
    yearly: 5999,
    icon: Trophy,
    gradient: "from-amber-500 via-orange-500 to-rose-500",
    ring: "ring-amber-500/50",
    features: [
      "Everything in Pro",
      "1-on-1 monthly coach call",
      "Custom periodised programs",
      "Advanced recovery & HRV insights",
      "Holographic Vault 50 GB",
      "Early access to new features",
    ],
  },
  {
    id: "ultimate",
    name: "Ultimate",
    tagline: "The complete FitxFusion suite",
    monthly: 999,
    yearly: 9999,
    icon: Crown,
    gradient: "from-emerald-500 via-teal-500 to-cyan-500",
    ring: "ring-emerald-500/50",
    features: [
      "Everything in Elite",
      "Family sharing (up to 5)",
      "Unlimited vault storage",
      "Dedicated success manager",
      "White-glove onboarding",
      "Lifetime price lock guarantee",
    ],
  },
];

const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

const SubscriptionPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { subscription, isPremium, subscribe, cancel, toggleAutoRenew, loading, userId } =
    useSubscription();

  const [activeTab, setActiveTab] = useState("plans");
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("yearly");
  const [selectedPlan, setSelectedPlan] = useState<PlanId | null>(null);
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [customerInfo, setCustomerInfo] = useState({ name: "", email: "" });
  const [paymentMethod, setPaymentMethod] = useState<
    "CreditCard" | "DebitCard" | "NetBanking" | "GPay" | "PhonePe" | "UPI" | "Cash"
  >("UPI");
  const [cardInfo, setCardInfo] = useState({ number: "", name: "", expiry: "", cvv: "" });
  const [upiId, setUpiId] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const currentPlanObj = useMemo(
    () => PLANS.find((p) => p.id === subscription?.plan_id) ?? null,
    [subscription],
  );
  const selected = useMemo(
    () => PLANS.find((p) => p.id === selectedPlan) ?? null,
    [selectedPlan],
  );
  const priceOf = (p: Plan) => (billingCycle === "monthly" ? p.monthly : p.yearly);

  const daysLeft = useMemo(() => {
    if (!subscription) return 0;
    return Math.max(
      0,
      Math.ceil(
        (new Date(subscription.expires_at).getTime() - Date.now()) / 86_400_000,
      ),
    );
  }, [subscription]);

  const handlePlanSelect = (id: PlanId) => {
    if (!userId) {
      toast({
        title: "Sign in required",
        description: "Please sign in to purchase FitxFusion Premium.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }
    setSelectedPlan(id);
    setCheckoutStep(1);
    setActiveTab("checkout");
  };

  const handleProceedToPayment = () => {
    if (!customerInfo.name || !customerInfo.email) {
      toast({ title: "Missing info", description: "Fill your name and email.", variant: "destructive" });
      return;
    }
    setCheckoutStep(2);
  };

  const validatePayment = () => {
    if (paymentMethod === "CreditCard" || paymentMethod === "DebitCard") {
      return (
        cardInfo.number.replace(/\s/g, "").length >= 15 &&
        cardInfo.name.trim().length > 2 &&
        /^\d{2}\/\d{2}$/.test(cardInfo.expiry) &&
        cardInfo.cvv.length >= 3
      );
    }
    if (paymentMethod === "UPI" || paymentMethod === "GPay" || paymentMethod === "PhonePe") {
      return /^[\w.\-]+@[\w.\-]+$/.test(upiId);
    }
    return true;
  };

  const handlePay = async () => {
    if (!selected) return;
    if (!validatePayment()) {
      toast({ title: "Invalid payment details", variant: "destructive" });
      return;
    }
    setIsProcessing(true);
    try {
      // Simulate gateway
      await new Promise((r) => setTimeout(r, 1800));
      await subscribe({
        plan_id: selected.id,
        plan_name: selected.name,
        billing_cycle: billingCycle,
        price_inr: priceOf(selected),
        payment_method: paymentMethod,
      });
      setCheckoutStep(3);
      toast({
        title: "🎉 Welcome to FitxFusion Premium!",
        description: `${selected.name} plan is now active.`,
      });
    } catch (e: any) {
      toast({ title: "Payment failed", description: e.message, variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const onCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, "").slice(0, 16);
    setCardInfo({ ...cardInfo, number: v.replace(/(\d{4})/g, "$1 ").trim() });
  };
  const onExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (v.length > 2) v = v.slice(0, 2) + "/" + v.slice(2);
    setCardInfo({ ...cardInfo, expiry: v });
  };

  const faqs = [
    {
      q: "How does billing in INR work?",
      a: "You're charged in Indian Rupees (INR). Yearly plans give you ~2 months free versus monthly billing.",
    },
    {
      q: "What happens when my plan expires?",
      a: "Premium features are disabled automatically the moment your billing period ends. You'll return to the free tier unless auto-renew is on.",
    },
    {
      q: "Can I cancel anytime?",
      a: "Yes. Cancel from 'My Subscription' — you keep premium access until the end of the current period, then it auto-expires.",
    },
    {
      q: "Is my payment secure?",
      a: "All transactions are processed through PCI-DSS compliant gateways with 256-bit TLS encryption. We never store your card number.",
    },
    {
      q: "Can I upgrade later?",
      a: "Absolutely. Upgrades are instant — the new plan replaces the current one and starts a fresh billing period.",
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-600 via-purple-600 to-indigo-700" />
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_20%,white,transparent_40%),radial-gradient(circle_at_80%_60%,#f0abfc,transparent_45%)]" />
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative pt-10 pb-10 px-4 text-white"
        >
          <div className="flex items-center justify-between mb-4 max-w-4xl mx-auto">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/15"
              onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/"))}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <Badge className="bg-white/15 border border-white/25 text-white backdrop-blur-md">
              <Sparkles className="h-3 w-3 mr-1" />
              FitxFusion Premium
            </Badge>
          </div>
          <div className="max-w-2xl mx-auto text-center">
            <motion.h1
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="text-4xl sm:text-5xl font-extrabold tracking-tight"
            >
              FitxFusion <span className="bg-gradient-to-r from-amber-200 to-pink-200 bg-clip-text text-transparent">Premium</span>
            </motion.h1>
            <p className="text-white/85 mt-3 text-sm sm:text-base">
              Unlock adaptive AI coaching, premium watch faces, elite analytics and more —
              built for how you train.
            </p>
            {isPremium && subscription && (
              <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 border border-white/25 backdrop-blur-md">
                <BadgeCheck className="h-4 w-4 text-emerald-300" />
                <span className="text-sm">
                  {subscription.plan_name} active · {daysLeft} day{daysLeft !== 1 && "s"} left
                </span>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <div className="px-4 py-6 max-w-5xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="plans">
              <CreditCard className="h-4 w-4 mr-2" />
              Plans
            </TabsTrigger>
            <TabsTrigger value="checkout" disabled={!selectedPlan}>
              <Lock className="h-4 w-4 mr-2" />
              Checkout
            </TabsTrigger>
            <TabsTrigger value="manage">
              <User className="h-4 w-4 mr-2" />
              My Subscription
            </TabsTrigger>
          </TabsList>

          {/* PLANS */}
          <TabsContent value="plans" className="mt-6 space-y-8">
            {/* Billing toggle */}
            <div className="flex items-center justify-center gap-3">
              <Label className={billingCycle === "monthly" ? "font-semibold" : "text-muted-foreground"}>
                Monthly
              </Label>
              <button
                onClick={() =>
                  setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")
                }
                className="relative w-14 h-7 bg-muted rounded-full p-1 transition"
              >
                <motion.div
                  className="w-5 h-5 rounded-full bg-primary"
                  animate={{ x: billingCycle === "yearly" ? 26 : 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              </button>
              <Label className={billingCycle === "yearly" ? "font-semibold" : "text-muted-foreground"}>
                Yearly
              </Label>
              <Badge className="bg-emerald-600 text-white">Save 2 months</Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {PLANS.map((plan) => {
                const Icon = plan.icon;
                const isCurrent = subscription?.plan_id === plan.id && isPremium;
                return (
                  <motion.div
                    key={plan.id}
                    whileHover={{ y: -4 }}
                    className={`relative rounded-2xl p-[1px] bg-gradient-to-br ${plan.gradient} ${
                      plan.highlight ? "shadow-2xl" : ""
                    }`}
                  >
                    <Card
                      className={`h-full rounded-2xl border-0 bg-card/95 backdrop-blur-xl ${
                        plan.highlight ? `ring-2 ${plan.ring}` : ""
                      }`}
                    >
                      {plan.highlight && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <Badge className="bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white shadow-lg">
                            <Star className="h-3 w-3 mr-1" />
                            Most Popular
                          </Badge>
                        </div>
                      )}
                      <CardHeader className="pb-3">
                        <div
                          className={`w-11 h-11 rounded-xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center mb-2 shadow-md`}
                        >
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <CardTitle className="text-xl">{plan.name}</CardTitle>
                        <CardDescription>{plan.tagline}</CardDescription>
                        <div className="pt-3">
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-extrabold">
                              {inr(priceOf(plan))}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              /{billingCycle === "monthly" ? "mo" : "yr"}
                            </span>
                          </div>
                          {billingCycle === "yearly" && (
                            <p className="text-xs text-emerald-600 mt-1">
                              ≈ {inr(Math.round(plan.yearly / 12))}/mo billed yearly
                            </p>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <ul className="space-y-2 mb-4">
                          {plan.features.map((f, i) => (
                            <li key={i} className="flex items-start text-sm">
                              <CheckCircle className="h-4 w-4 text-emerald-500 mr-2 mt-0.5 shrink-0" />
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                        <Button
                          className={`w-full bg-gradient-to-r ${plan.gradient} text-white border-0 hover:opacity-90`}
                          disabled={isCurrent}
                          onClick={() => handlePlanSelect(plan.id)}
                        >
                          {isCurrent ? "Current Plan" : "Choose " + plan.name}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Feature highlights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  What you unlock
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: Brain, label: "AI Coach", desc: "Unlimited chats & form review" },
                  { icon: Zap, label: "Adaptive Plans", desc: "Auto-adjust to your progress" },
                  { icon: Trophy, label: "PR Board", desc: "Track personal records & streaks" },
                  { icon: InfinityIcon, label: "Ad-free", desc: "Zero interruptions, forever" },
                ].map((f) => (
                  <div key={f.label} className="flex flex-col items-center text-center p-3 rounded-xl bg-muted/40">
                    <div className="p-2 rounded-full bg-primary/10 mb-2">
                      <f.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="font-medium text-sm">{f.label}</div>
                    <div className="text-xs text-muted-foreground">{f.desc}</div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* FAQs */}
            <Card>
              <CardHeader>
                <CardTitle>Frequently asked</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible>
                  {faqs.map((f, i) => (
                    <AccordionItem key={i} value={`faq-${i}`}>
                      <AccordionTrigger className="text-left text-sm">{f.q}</AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground">
                        {f.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CHECKOUT */}
          <TabsContent value="checkout" className="mt-6">
            {selected && (
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>
                      {checkoutStep === 1 && "Your details"}
                      {checkoutStep === 2 && "Payment"}
                      {checkoutStep === 3 && "Success"}
                    </CardTitle>
                    <CardDescription>
                      {checkoutStep === 1 && "We use this only for your receipt."}
                      {checkoutStep === 2 && "Secure INR payment. Cancel anytime."}
                      {checkoutStep === 3 && "Premium is now active on your account."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {checkoutStep === 1 && (
                      <>
                        <div>
                          <Label>Full Name</Label>
                          <Input
                            value={customerInfo.name}
                            onChange={(e) =>
                              setCustomerInfo({ ...customerInfo, name: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <Label>Email</Label>
                          <Input
                            type="email"
                            value={customerInfo.email}
                            onChange={(e) =>
                              setCustomerInfo({ ...customerInfo, email: e.target.value })
                            }
                          />
                        </div>
                        <Button className="w-full" onClick={handleProceedToPayment}>
                          Continue to payment
                        </Button>
                      </>
                    )}
                    {checkoutStep === 2 && (
                      <>
                        <PaymentMethodSelector
                          selectedMethod={paymentMethod}
                          onSelectMethod={(m) => setPaymentMethod(m as any)}
                        />
                        <Separator />
                        {(paymentMethod === "CreditCard" || paymentMethod === "DebitCard") && (
                          <div className="space-y-3">
                            <div>
                              <Label>Card number</Label>
                              <Input
                                placeholder="1234 5678 9012 3456"
                                value={cardInfo.number}
                                onChange={onCardNumberChange}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label>Expiry</Label>
                                <Input
                                  placeholder="MM/YY"
                                  value={cardInfo.expiry}
                                  onChange={onExpiryChange}
                                />
                              </div>
                              <div>
                                <Label>CVV</Label>
                                <Input
                                  placeholder="123"
                                  maxLength={4}
                                  value={cardInfo.cvv}
                                  onChange={(e) =>
                                    setCardInfo({
                                      ...cardInfo,
                                      cvv: e.target.value.replace(/\D/g, ""),
                                    })
                                  }
                                />
                              </div>
                            </div>
                            <div>
                              <Label>Name on card</Label>
                              <Input
                                value={cardInfo.name}
                                onChange={(e) =>
                                  setCardInfo({ ...cardInfo, name: e.target.value })
                                }
                              />
                            </div>
                          </div>
                        )}
                        {(paymentMethod === "UPI" ||
                          paymentMethod === "GPay" ||
                          paymentMethod === "PhonePe") && (
                          <div>
                            <Label>UPI ID</Label>
                            <Input
                              placeholder="yourname@upi"
                              value={upiId}
                              onChange={(e) => setUpiId(e.target.value)}
                            />
                          </div>
                        )}
                        {paymentMethod === "NetBanking" && (
                          <p className="text-sm text-muted-foreground">
                            You'll be redirected to your bank's secure login.
                          </p>
                        )}
                        {paymentMethod === "Cash" && (
                          <p className="text-sm text-muted-foreground">
                            Cash on activation — a receipt will be emailed.
                          </p>
                        )}
                        <Button
                          className="w-full bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white"
                          onClick={handlePay}
                          disabled={isProcessing}
                        >
                          {isProcessing ? (
                            <>
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1 }}
                                className="mr-2"
                              >
                                <RefreshCw className="h-4 w-4" />
                              </motion.div>
                              Processing…
                            </>
                          ) : (
                            <>
                              <Lock className="h-4 w-4 mr-2" />
                              Pay {inr(priceOf(selected))}
                            </>
                          )}
                        </Button>
                      </>
                    )}
                    {checkoutStep === 3 && (
                      <div className="text-center py-6">
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                          <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto" />
                        </motion.div>
                        <h3 className="text-xl font-semibold mt-3">You're Premium!</h3>
                        <p className="text-muted-foreground text-sm mt-1">
                          {selected.name} plan · valid till{" "}
                          {subscription
                            ? new Date(subscription.expires_at).toLocaleDateString()
                            : "—"}
                        </p>
                        <div className="flex gap-2 justify-center mt-4">
                          <Button onClick={() => setActiveTab("manage")}>Manage plan</Button>
                          <Button variant="outline" onClick={() => navigate("/")}>
                            Go to app
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Summary */}
                <Card className="h-fit sticky top-4">
                  <CardHeader>
                    <CardTitle className="text-base">Order summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Plan</span>
                      <span className="font-medium">{selected.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Billing</span>
                      <span className="capitalize">{billingCycle}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>{inr(priceOf(selected))}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>GST (incl.)</span>
                      <span>—</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>{inr(priceOf(selected))}</span>
                    </div>
                    <div className="mt-3 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs p-2 flex gap-2">
                      <Gift className="h-4 w-4 shrink-0" />
                      7-day money-back guarantee
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* MANAGE */}
          <TabsContent value="manage" className="mt-6">
            {loading ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  Loading your subscription…
                </CardContent>
              </Card>
            ) : !isPremium || !subscription ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Sparkles className="h-10 w-10 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold text-lg">No active premium plan</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Choose a plan to unlock everything FitxFusion has to offer.
                  </p>
                  <Button className="mt-4" onClick={() => setActiveTab("plans")}>
                    View plans
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <Card
                  className={`overflow-hidden border-0 bg-gradient-to-br ${
                    currentPlanObj?.gradient ?? "from-purple-500 to-indigo-500"
                  } text-white`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Badge className="bg-white/20 border-white/30 text-white mb-2">
                          <BadgeCheck className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                        <h2 className="text-2xl font-bold">
                          FitxFusion {subscription.plan_name}
                        </h2>
                        <p className="text-white/85 text-sm capitalize">
                          {subscription.billing_cycle} · {inr(subscription.price_inr)}
                        </p>
                      </div>
                      {currentPlanObj && (
                        <currentPlanObj.icon className="h-12 w-12 opacity-80" />
                      )}
                    </div>
                    <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-white/70 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Started
                        </div>
                        <div className="font-medium">
                          {new Date(subscription.started_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-white/70 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Renews / Expires
                        </div>
                        <div className="font-medium">
                          {new Date(subscription.expires_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="text-xs text-white/80 mb-1">
                        {daysLeft} day{daysLeft !== 1 && "s"} remaining
                      </div>
                      <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-white"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.max(
                                4,
                                (daysLeft /
                                  (subscription.billing_cycle === "monthly" ? 30 : 365)) *
                                  100,
                              ),
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Preferences</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">Auto-renew</div>
                        <div className="text-xs text-muted-foreground">
                          Automatically renew at the end of the billing period.
                        </div>
                      </div>
                      <Switch
                        checked={subscription.auto_renew}
                        onCheckedChange={async () => {
                          await toggleAutoRenew();
                          toast({ title: "Preference updated" });
                        }}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">Transaction ID</div>
                        <div className="text-xs text-muted-foreground">
                          {subscription.transaction_id ?? "—"}
                        </div>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => setActiveTab("plans")}>
                        Upgrade
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">Cancel subscription</div>
                      <div className="text-xs text-muted-foreground">
                        You'll keep premium until {new Date(subscription.expires_at).toLocaleDateString()}.
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={async () => {
                        await cancel();
                        toast({ title: "Subscription cancelled" });
                      }}
                    >
                      Cancel
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <MobileNav />
    </div>
  );
};

export default SubscriptionPage;
