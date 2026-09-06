import { MONTHLY_PRICE_PAISE, REWRITE_CURRENCY, paymentsRequired, razorpayKeys } from "@/lib/pricing";
import { getSignedInEmail } from "@/lib/google-session";
import {
  createMonthlySubscription,
  findActiveSubscription,
  findOrCreateCustomer,
} from "@/lib/razorpay";
import { writeSubscriptionSession } from "@/lib/subscription-session";

export const runtime = "nodejs";

export async function POST() {
  const { configured, keyId } = razorpayKeys();
  if (!configured) {
    return Response.json(
      {
        error: paymentsRequired()
          ? "Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET."
          : "Payments are off in local dev.",
      },
      { status: 503 },
    );
  }

  const email = await getSignedInEmail();
  if (!email) {
    return Response.json({ error: "Sign in with Google to start ₹499/month." }, { status: 401 });
  }

  try {
    const customer = await findOrCreateCustomer({ email });
    const existing = await findActiveSubscription(customer.id);
    if (existing) {
      await writeSubscriptionSession({ email, subscriptionId: existing.id });
      return Response.json({
        alreadyActive: true,
        email,
        subscriptionId: existing.id,
        status: existing.status,
      });
    }

    const subscription = await createMonthlySubscription(customer.id, email);
    return Response.json({
      alreadyActive: false,
      keyId,
      subscriptionId: subscription.id,
      amount: MONTHLY_PRICE_PAISE,
      currency: REWRITE_CURRENCY,
      email,
      name: "ATSDekho",
      description: "Unlimited ATS-safe resume rewrites",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not start the monthly plan.";
    return Response.json({ error: message }, { status: 502 });
  }
}
