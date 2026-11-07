import { supabase } from "@/integrations/supabase/client";

const clientToken = import.meta.env.VITE_PAYMENTS_CLIENT_TOKEN as string | undefined;

declare global {
  interface Window { Paddle: any }
}

export function getPaddleEnvironment(): "sandbox" | "live" {
  return clientToken?.startsWith("test_") ? "sandbox" : "live";
}

export function isPaymentsConfigured(): boolean {
  return Boolean(clientToken);
}

let ready: Promise<void> | null = null;
export function initializePaddle(): Promise<void> {
  if (!clientToken) return Promise.reject(new Error("Payments are not configured"));
  ready ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
    script.onload = () => {
      window.Paddle.Environment.set(getPaddleEnvironment() === "sandbox" ? "sandbox" : "production");
      window.Paddle.Initialize({ token: clientToken });
      resolve();
    };
    script.onerror = () => { ready = null; reject(new Error("Could not load checkout")); };
    document.head.appendChild(script);
  });
  return ready;
}

export async function getPaddlePriceId(priceId: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke("get-paddle-price", {
    body: { priceId, environment: getPaddleEnvironment() },
  });
  if (error || !data?.paddleId) throw new Error(`Failed to resolve price: ${priceId}`);
  return data.paddleId;
}

export async function openPaddleCheckout(opts: { priceId: string; userId: string; email?: string }) {
  await initializePaddle();
  const paddlePriceId = await getPaddlePriceId(opts.priceId);
  window.Paddle.Checkout.open({
    items: [{ priceId: paddlePriceId, quantity: 1 }],
    customer: opts.email ? { email: opts.email } : undefined,
    customData: { userId: opts.userId },
    settings: {
      displayMode: "overlay",
      successUrl: `${window.location.origin}/subscription?checkout=success`,
      allowLogout: false,
      variant: "one-page",
    },
  });
}

export async function openBillingPortal() {
  const { data, error } = await supabase.functions.invoke("payments-portal", {
    body: { environment: getPaddleEnvironment() },
  });
  if (error || !data?.url) throw new Error("Could not open billing portal");
  window.open(data.url, "_blank", "noopener");
}
