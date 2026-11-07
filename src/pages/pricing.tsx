import { Link } from "react-router-dom";
import { LegalPage } from "@/components/legal/legal-page";

const plans = [
  { name: "Starter", monthly: 149, yearly: 1499, desc: "Ad-free workouts and core tracking." },
  { name: "Pro", monthly: 299, yearly: 2999, desc: "Full workout library, advanced progress analytics and AI coach." },
  { name: "Elite", monthly: 599, yearly: 5999, desc: "Everything in Pro plus personalised plans and priority support." },
  { name: "Ultimate", monthly: 999, yearly: 9999, desc: "Every feature, all future Premium content and top-priority support." },
];
const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

const Pricing = () => (
  <LegalPage title="Pricing">
    <p>FitXFusion is free to use. Premium plans unlock extra features and are billed in Indian Rupees, monthly or yearly. Taxes may be added at checkout.</p>
    <div className="grid gap-4 sm:grid-cols-2">
      {plans.map((p) => (
        <div key={p.name} className="rounded-xl border border-border bg-card p-5 text-card-foreground">
          <h2 className="!mt-0">{p.name}</h2>
          <p className="mt-2 text-2xl font-bold text-foreground">{inr(p.monthly)}<span className="text-sm font-normal text-muted-foreground"> / month</span></p>
          <p className="text-muted-foreground">or {inr(p.yearly)} / year</p>
          <p className="mt-3 text-muted-foreground">{p.desc}</p>
        </div>
      ))}
    </div>
    <p>Subscriptions renew automatically until cancelled and come with a 30-day money-back guarantee — see our <Link to="/refund-policy">Refund Policy</Link>. Payments are handled by Paddle, our Merchant of Record.</p>
    <p><Link to="/subscription">Sign in to subscribe</Link></p>
  </LegalPage>
);

export default Pricing;
