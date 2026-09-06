import { createHmac, timingSafeEqual } from "node:crypto";
import {
  MONTHLY_PLAN_NOTES,
  MONTHLY_PRICE_PAISE,
  REWRITE_CURRENCY,
  REWRITE_PRICE_PAISE,
  razorpayKeys,
} from "./pricing";

export type RazorpayOrder = {
  id: string;
  amount: number;
  currency: string;
};

const ACTIVE_SUB_STATUSES = new Set(["authenticated", "active", "pending"]);

function authHeader(keyId: string, keySecret: string) {
  return `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;
}

type RazorpayErrorBody = { error?: { description?: string } };

async function razorpayFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const { keyId, keySecret, configured } = razorpayKeys();
  if (!configured) throw new Error("Razorpay keys are not set.");
  const response = await fetch(`https://api.razorpay.com/v1${path}`, {
    ...init,
    headers: {
      Authorization: authHeader(keyId, keySecret),
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const data = (await response.json()) as T & RazorpayErrorBody;
  if (!response.ok) {
    throw new Error(data.error?.description || `Razorpay request failed (${path}).`);
  }
  return data;
}

export type RazorpaySubscription = {
  id: string;
  status: string;
  plan_id?: string;
  customer_id?: string;
};

export function isActiveSubscriptionStatus(status: string) {
  return ACTIVE_SUB_STATUSES.has(status);
}

export async function createRazorpayOrder(): Promise<RazorpayOrder> {
  const { keyId, keySecret, configured } = razorpayKeys();
  if (!configured) {
    throw new Error("Razorpay keys are not set.");
  }

  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: authHeader(keyId, keySecret),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: REWRITE_PRICE_PAISE,
      currency: REWRITE_CURRENCY,
      receipt: `atsdekho_${Date.now()}`.slice(0, 40),
      notes: { product: "atsdekho-rewrite" },
    }),
  });

  const data = (await response.json()) as { id?: string; amount?: number; currency?: string; error?: { description?: string } };
  if (!response.ok || !data.id || data.amount == null) {
    throw new Error(data.error?.description || "Could not start Razorpay checkout.");
  }

  return {
    id: data.id,
    amount: data.amount,
    currency: data.currency ?? REWRITE_CURRENCY,
  };
}

export function verifyRazorpaySignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}) {
  const { keySecret, configured } = razorpayKeys();
  if (!configured) return false;
  const expected = createHmac("sha256", keySecret)
    .update(`${params.orderId}|${params.paymentId}`)
    .digest("hex");
  const left = Buffer.from(expected);
  const right = Buffer.from(params.signature);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function verifySubscriptionSignature(params: {
  paymentId: string;
  subscriptionId: string;
  signature: string;
}) {
  const { keySecret, configured } = razorpayKeys();
  if (!configured) return false;
  const expected = createHmac("sha256", keySecret)
    .update(`${params.paymentId}|${params.subscriptionId}`)
    .digest("hex");
  const left = Buffer.from(expected);
  const right = Buffer.from(params.signature);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function getSubscription(id: string) {
  return razorpayFetch<RazorpaySubscription>(`/subscriptions/${id}`);
}

export async function ensureMonthlyPlanId() {
  const fromEnv = process.env.RAZORPAY_PLAN_ID?.trim();
  if (fromEnv) return fromEnv;

  const listed = await razorpayFetch<{
    items?: { id: string; notes?: Record<string, string>; item?: { name?: string } }[];
  }>("/plans?count=100");
  const existing = listed.items?.find(
    (plan) =>
      plan.notes?.product === MONTHLY_PLAN_NOTES || plan.item?.name === "ATSDekho monthly",
  );
  if (existing?.id) return existing.id;

  const created = await razorpayFetch<{ id: string }>("/plans", {
    method: "POST",
    body: JSON.stringify({
      period: "monthly",
      interval: 1,
      item: {
        name: "ATSDekho monthly",
        amount: MONTHLY_PRICE_PAISE,
        currency: REWRITE_CURRENCY,
        description: "Unlimited ATS-safe resume rewrites",
      },
      notes: { product: MONTHLY_PLAN_NOTES },
    }),
  });
  return created.id;
}

export async function findOrCreateCustomer(params: { email: string; contact?: string }) {
  const email = params.email.toLowerCase().trim();
  const body: Record<string, string | number> = {
    name: email.split("@")[0]?.slice(0, 40) || "ATSDekho",
    email,
    fail_existing: 0,
  };
  if (params.contact) body.contact = params.contact;
  const customer = await razorpayFetch<{ id: string; email?: string }>("/customers", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return { id: customer.id, email: customer.email ?? email };
}

export async function findActiveSubscription(customerId: string) {
  const listed = await razorpayFetch<{ items?: RazorpaySubscription[] }>(
    `/subscriptions?customer_id=${encodeURIComponent(customerId)}&count=20`,
  );
  return listed.items?.find((item) => isActiveSubscriptionStatus(item.status)) ?? null;
}

export async function createMonthlySubscription(customerId: string, email: string) {
  const planId = await ensureMonthlyPlanId();
  return razorpayFetch<RazorpaySubscription>("/subscriptions", {
    method: "POST",
    body: JSON.stringify({
      plan_id: planId,
      customer_id: customerId,
      quantity: 1,
      total_count: 36,
      customer_notify: 1,
      notes: { product: MONTHLY_PLAN_NOTES, email },
    }),
  });
}

export async function subscriptionUnlocksDownloads(subscriptionId: string) {
  const sub = await getSubscription(subscriptionId);
  return isActiveSubscriptionStatus(sub.status) ? sub : null;
}
