export type RazorpayCheckoutOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id?: string;
  subscription_id?: string;
  prefill?: { email?: string; contact?: string };
  theme?: { color: string };
  method?: {
    upi?: boolean;
    card?: boolean;
    netbanking?: boolean;
    wallet?: boolean;
    emi?: boolean;
    paylater?: boolean;
  };
  handler: (response: {
    razorpay_payment_id: string;
    razorpay_order_id?: string;
    razorpay_subscription_id?: string;
    razorpay_signature: string;
  }) => void;
  modal?: { ondismiss?: () => void };
};

export type RazorpayInstance = {
  open: () => void;
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => RazorpayInstance;
  }
}

export type PaymentReceipt = {
  orderId: string;
  paymentId: string;
  signature: string;
};

export type SubscriptionReceipt = {
  email: string;
  subscriptionId: string;
};

export async function collectRazorpaySubscription(email: string): Promise<SubscriptionReceipt> {
  const startRes = await fetch("/api/pay/subscribe", { method: "POST" });
  const start = (await startRes.json()) as {
    error?: string;
    alreadyActive?: boolean;
    keyId?: string;
    subscriptionId?: string;
    amount?: number;
    currency?: string;
    name?: string;
    description?: string;
    email?: string;
  };
  if (!startRes.ok) throw new Error(start.error || "Could not start the monthly plan.");
  if (start.alreadyActive && start.subscriptionId) {
    return { email, subscriptionId: start.subscriptionId };
  }
  if (!start.keyId || !start.subscriptionId) {
    throw new Error(start.error || "Could not start the monthly plan.");
  }

  await loadCheckoutScript();
  if (!window.Razorpay) throw new Error("Razorpay checkout did not load.");

  return new Promise((resolve, reject) => {
    const checkout = new window.Razorpay!({
      key: start.keyId!,
      amount: start.amount ?? 0,
      currency: start.currency ?? "INR",
      name: start.name ?? "ATSDekho",
      description: start.description ?? "Unlimited ATS-safe resume rewrites",
      subscription_id: start.subscriptionId,
      prefill: { email },
      theme: { color: "#9a3412" },
      method: {
        upi: true,
        card: true,
        netbanking: true,
        wallet: false,
        emi: false,
        paylater: false,
      },
      handler: (response) => {
        void (async () => {
          const subscriptionId = response.razorpay_subscription_id || start.subscriptionId!;
          const verifyRes = await fetch("/api/pay/verify-subscription", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              paymentId: response.razorpay_payment_id,
              subscriptionId,
              signature: response.razorpay_signature,
            }),
          });
          const verify = (await verifyRes.json()) as { error?: string };
          if (!verifyRes.ok) {
            reject(new Error(verify.error || "Subscription could not be verified."));
            return;
          }
          resolve({ email, subscriptionId });
        })();
      },
      modal: {
        ondismiss: () => reject(new Error("Payment cancelled.")),
      },
    });
    checkout.open();
  });
}

function loadCheckoutScript() {
  if (typeof window === "undefined") return Promise.reject(new Error("No window"));
  if (window.Razorpay) return Promise.resolve();
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existing) {
      if (window.Razorpay) {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Could not load Razorpay.")));
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Could not load Razorpay."));
    document.body.appendChild(script);
  });
}

export async function collectRazorpayPayment(): Promise<PaymentReceipt> {
  const orderRes = await fetch("/api/pay/order", { method: "POST" });
  const order = (await orderRes.json()) as {
    error?: string;
    keyId?: string;
    orderId?: string;
    amount?: number;
    currency?: string;
    name?: string;
    description?: string;
  };
  if (!orderRes.ok || !order.keyId || !order.orderId || order.amount == null) {
    throw new Error(order.error || "Could not start payment.");
  }

  await loadCheckoutScript();
  if (!window.Razorpay) throw new Error("Razorpay checkout did not load.");

  return new Promise((resolve, reject) => {
    const checkout = new window.Razorpay!({
      key: order.keyId!,
      amount: order.amount!,
      currency: order.currency ?? "INR",
      name: order.name ?? "ATSDekho",
      description: order.description ?? "One ATS-safe resume rewrite",
      order_id: order.orderId!,
      theme: { color: "#9a3412" },
      method: {
        upi: true,
        card: true,
        netbanking: true,
        wallet: false,
        emi: false,
        paylater: false,
      },
      handler: (response) => {
        void (async () => {
          const verifyRes = await fetch("/api/pay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            }),
          });
          const verify = (await verifyRes.json()) as { error?: string };
          if (!verifyRes.ok) {
            reject(new Error(verify.error || "Payment could not be verified."));
            return;
          }
          if (!response.razorpay_order_id) {
            reject(new Error("Payment missing order id."));
            return;
          }
          resolve({
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
          });
        })();
      },
      modal: {
        ondismiss: () => reject(new Error("Payment cancelled.")),
      },
    });
    checkout.open();
  });
}
