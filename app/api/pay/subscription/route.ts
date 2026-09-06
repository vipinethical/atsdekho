import { getSignedInEmail } from "@/lib/google-session";
import { razorpayKeys } from "@/lib/pricing";
import {
  findActiveSubscription,
  findOrCreateCustomer,
} from "@/lib/razorpay";
import { writeSubscriptionSession } from "@/lib/subscription-session";

export const runtime = "nodejs";

export async function GET() {
  const email = await getSignedInEmail();
  if (!email) {
    return Response.json({ subscribed: false, signedIn: false });
  }
  if (!razorpayKeys().configured) {
    return Response.json({ subscribed: false, signedIn: true, email });
  }
  try {
    const customer = await findOrCreateCustomer({ email });
    const existing = await findActiveSubscription(customer.id);
    if (!existing) {
      return Response.json({ subscribed: false, signedIn: true, email });
    }
    await writeSubscriptionSession({ email, subscriptionId: existing.id });
    return Response.json({
      subscribed: true,
      signedIn: true,
      email,
      subscriptionId: existing.id,
      status: existing.status,
    });
  } catch {
    return Response.json({ subscribed: false, signedIn: true, email });
  }
}
