import { getSignedInEmail } from "@/lib/google-session";
import { verifySubscriptionSignature } from "@/lib/razorpay";
import { writeSubscriptionSession } from "@/lib/subscription-session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const email = await getSignedInEmail();
  if (!email) {
    return Response.json({ error: "Sign in with Google first." }, { status: 401 });
  }
  const body = (await request.json()) as {
    paymentId?: string;
    subscriptionId?: string;
    signature?: string;
  };
  if (!body.paymentId || !body.subscriptionId || !body.signature) {
    return Response.json({ error: "Missing subscription details." }, { status: 400 });
  }
  if (
    !verifySubscriptionSignature({
      paymentId: body.paymentId,
      subscriptionId: body.subscriptionId,
      signature: body.signature,
    })
  ) {
    return Response.json({ error: "Subscription signature did not match." }, { status: 400 });
  }
  await writeSubscriptionSession({ email, subscriptionId: body.subscriptionId });
  return Response.json({ ok: true, email, subscriptionId: body.subscriptionId });
}
