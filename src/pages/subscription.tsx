import { lazy, Suspense, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, BadgeCheck, Check, CreditCard, Crown, ExternalLink, LockKeyhole, RefreshCw, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MobileNav } from "@/components/mobile-nav";
import { useSubscription, type PlanId, type BillingCycle } from "@/hooks/use-subscription";
import { planBenefits } from "@/lib/premium-access";

const MemberTools = lazy(() => import("@/components/member-tools").then(module => ({ default: module.MemberTools })));
const plans: { id: PlanId; name: string; monthly: number; yearly: number; tagline: string }[] = [
  { id: "starter", name: "Starter", monthly: 149, yearly: 1499, tagline: "Your training, organised" },
  { id: "pro", name: "Pro", monthly: 299, yearly: 2999, tagline: "Compare, plan and export" },
  { id: "elite", name: "Elite", monthly: 599, yearly: 5999, tagline: "A deeper view of your training" },
  { id: "ultimate", name: "Ultimate", monthly: 999, yearly: 9999, tagline: "The full member training studio" },
];
const inr = (n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

export default function SubscriptionPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { subscription, plan, isPremium, userId, loading, syncing, error, refresh } = useSubscription();
  const [tab, setTab] = useState("plans");
  const [cycle, setCycle] = useState<BillingCycle>("yearly");
  const [selection, setSelection] = useState<{ id: PlanId; cycle: BillingCycle } | null>(null);
  const selected = plans.find(p => p.id === selection?.id);
  const current = plans.find(p => p.id === plan);
  const select = (id: PlanId) => { setSelection({ id, cycle }); setTab("checkout"); };

  return <div className="min-h-screen bg-background pb-28 text-foreground">
    <header className="border-b border-border bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-7 flex items-center justify-between gap-4">
          <Button variant="ghost" size="sm" onClick={() => window.history.length > 1 ? navigate(-1) : navigate("/")}><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
          <Badge variant="outline"><ShieldCheck className="mr-2 h-3 w-3" />Verified membership</Badge>
        </div>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div><div className="mb-3 flex items-center gap-2 text-primary"><Crown className="h-6 w-6" /><span className="text-sm font-semibold">FITXFUSION</span></div><h1 className="text-4xl font-bold sm:text-5xl">Premium</h1><p className="mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">More insight into the training you actually do. Choose the member tools that fit your routine.</p></div>
          {isPremium && current && <Badge variant="secondary" className="px-3 py-2"><BadgeCheck className="mr-2 h-4 w-4" />{current.name} active</Badge>}
        </div>
      </div>
    </header>
    <main className="mx-auto max-w-6xl space-y-5 px-4 py-6 sm:px-6">
      {params.get("checkout") === "success" && <div role="status" className="rounded-lg border border-border bg-muted/40 p-4 text-sm">{isPremium ? "Your verified membership is active." : "Checking your membership. A checkout return alone does not confirm payment."}<Button variant="ghost" size="sm" onClick={() => void refresh()} disabled={syncing} className="ml-2"><RefreshCw className="mr-2 h-4 w-4" />Check status</Button></div>}
      {error && <div role="alert" className="rounded-lg border border-destructive/40 p-4 text-sm"><p>{error}</p><Button variant="outline" size="sm" className="mt-3" onClick={() => void refresh()} disabled={syncing}>Retry verification</Button></div>}
      <Tabs value={tab === "members" && !isPremium ? "plans" : tab} onValueChange={setTab}>
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="checkout" disabled={!selection}><CreditCard className="mr-2 h-4 w-4" />Checkout</TabsTrigger>
          <TabsTrigger value="manage">My subscription</TabsTrigger>
          {isPremium && <TabsTrigger value="members"><Sparkles className="mr-2 h-4 w-4" />Member tools</TabsTrigger>}
        </TabsList>
        <TabsContent value="plans" className="mt-6 space-y-7">
          <div role="status" className="border-l-2 border-primary bg-muted/30 px-4 py-3"><p className="font-medium">Online payments are unavailable</p><p className="mt-1 text-sm text-muted-foreground">No payment service is connected. You can review an order, but no money will be collected and no plan will be activated.</p></div>
          <div className="flex flex-wrap items-center justify-between gap-4"><h2 className="text-xl font-semibold">Choose your plan</h2><Tabs value={cycle} onValueChange={v => setCycle(v as BillingCycle)}><TabsList><TabsTrigger value="monthly">Monthly</TabsTrigger><TabsTrigger value="yearly">Yearly</TabsTrigger></TabsList></Tabs></div>
          <div className="grid items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {plans.map(p => <Card key={p.id} className={p.id === "pro" ? "flex flex-col border-primary/50 bg-primary/5" : "flex flex-col bg-card/70 backdrop-blur-lg"}>
              <CardHeader><div className="flex items-center justify-between"><CardTitle className="text-xl">{p.name}</CardTitle>{p.id === "pro" && <Badge variant="secondary">Pro</Badge>}</div><p className="text-sm text-muted-foreground">{p.tagline}</p><div className="pt-3"><span className="text-3xl font-bold">{inr(p[cycle])}</span><span className="ml-1 text-xs text-muted-foreground">/{cycle === "monthly" ? "month" : "year"}</span>{cycle === "yearly" && <p className="mt-2 text-xs text-primary">Save {inr(p.monthly * 12 - p.yearly)} vs monthly</p>}</div></CardHeader>
              <CardContent className="flex flex-1 flex-col"><ul className="mb-6 space-y-2 text-sm">{planBenefits(p.id).map(benefit => <li key={benefit} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span>{benefit}</span></li>)}</ul><Button variant={p.id === "pro" ? "default" : "outline"} className="mt-auto w-full" disabled={loading || plan === p.id} onClick={() => select(p.id)}>{plan === p.id ? "Current plan" : `Choose ${p.name}`}</Button></CardContent>
            </Card>)}
          </div>
          <div className="border-y border-border py-5"><h3 className="font-semibold">Your free tools stay free</h3><p className="mt-2 text-sm text-muted-foreground">Existing workouts, progress, scheduling and workout creation remain available. Member tools add training reviews, comparisons and reports based on recorded sessions.</p></div>
        </TabsContent>
        <TabsContent value="checkout" className="mt-6 space-y-5">
          {selected && selection && <>
            <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-2xl font-semibold">Review your order</h2><Button variant="ghost" onClick={() => setTab("plans")}><ArrowLeft className="mr-2 h-4 w-4" />Change plan</Button></div>
            <dl className="grid gap-4 border-y border-border py-5 sm:grid-cols-3"><div><dt className="text-sm text-muted-foreground">Plan</dt><dd className="mt-1 font-semibold">FitXFusion {selected.name}</dd></div><div><dt className="text-sm text-muted-foreground">Period</dt><dd className="mt-1 capitalize">{selection.cycle}</dd></div><div><dt className="text-sm text-muted-foreground">Listed price</dt><dd className="mt-1 text-xl font-semibold">{inr(selected[selection.cycle])}</dd></div></dl>
            <section className="space-y-4 py-2"><h3 className="font-semibold">Payment options</h3><p className="text-sm text-muted-foreground">Indian UPI checkout is not connected yet. Eligible apps and payment methods will be shown by the payment provider when checkout is available.</p><div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">{["Google Pay", "PhonePe", "Paytm", "Amazon Pay", "Other UPI apps", "Cards / net banking"].map(method => <div key={method} className="flex items-center gap-2 text-sm text-muted-foreground"><LockKeyhole className="h-4 w-4 shrink-0" /><span>{method}<span className="block text-xs">Not available</span></span></div>)}</div><p className="text-sm text-muted-foreground">Cash is not supported for automatic online activation. Never send money outside a verified checkout.</p></section>
            <div className="border-t border-border pt-5"><Button disabled className="w-full sm:w-auto"><LockKeyhole className="mr-2 h-4 w-4" />Payment service not connected</Button><p className="mt-3 text-xs text-muted-foreground">Premium activates only after verified payment. Taxes and available methods must be confirmed at the provider’s checkout.</p></div>
            <div className="flex flex-wrap gap-4 text-sm"><Link to="/terms-of-service" className="text-primary underline">Terms</Link><Link to="/privacy-policy" className="text-primary underline">Privacy</Link><Link to="/refund-policy" className="text-primary underline">Refund policy</Link></div>
          </>}
        </TabsContent>
        <TabsContent value="manage" className="mt-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-semibold">Your membership</h2><Button variant="outline" size="sm" disabled={syncing} onClick={() => void refresh()}><RefreshCw className={`mr-2 h-4 w-4 ${syncing ? "animate-spin motion-reduce:animate-none" : ""}`} />{syncing ? "Checking…" : "Refresh status"}</Button></div>
          {loading ? <p role="status" className="py-8 text-muted-foreground">Verifying your membership…</p> : isPremium && subscription && current ? <>
            <div className="border-y border-border py-6"><Badge variant="secondary"><BadgeCheck className="mr-2 h-4 w-4" />Verified {current.name}</Badge><dl className="mt-5 grid gap-5 sm:grid-cols-2"><div><dt className="text-xs text-muted-foreground">Billing period</dt><dd className="mt-1 capitalize">{subscription.billing_cycle} · {inr(subscription.price_inr)}</dd></div><div><dt className="text-xs text-muted-foreground">Paid access until</dt><dd className="mt-1">{new Date(subscription.expires_at).toLocaleString()}</dd></div><div><dt className="text-xs text-muted-foreground">Renewal</dt><dd className="mt-1">{subscription.auto_renew ? "Enabled with your payment provider" : "Not renewing automatically"}</dd></div><div><dt className="text-xs text-muted-foreground">Payment reference</dt><dd className="mt-1 break-all">{subscription.transaction_id ?? "Not recorded"}</dd></div></dl></div>
            <Button onClick={() => setTab("members")}><Sparkles className="mr-2 h-4 w-4" />Open member tools</Button><p className="text-sm text-muted-foreground">Billing changes are unavailable while the payment service is disconnected. Your verified, already-paid access remains valid until expiry.</p><Button variant="outline" asChild><Link to="/help"><ExternalLink className="mr-2 h-4 w-4" />Billing help</Link></Button>
          </> : <div className="py-8"><h3 className="font-semibold">No verified active Premium plan</h3><p className="mt-2 text-sm text-muted-foreground">Your free workouts and progress tools are still available.</p><Button className="mt-4" variant="outline" onClick={() => setTab("plans")}>View plans</Button></div>}
        </TabsContent>
        {isPremium && plan && userId && <TabsContent value="members" className="mt-6"><Suspense fallback={<p role="status" className="py-6 text-muted-foreground">Loading member tools…</p>}><MemberTools plan={plan} userId={userId} /></Suspense></TabsContent>}
      </Tabs>
    </main><MobileNav />
  </div>;
}
