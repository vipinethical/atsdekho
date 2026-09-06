import { REWRITE_CURRENCY, paymentsRequired, razorpayKeys } from "@/lib/pricing";
import { createRazorpayOrder } from "@/lib/razorpay";

export const runtime = "nodejs";

export async function POST() {
  const { configured, keyId } = razorpayKeys();
  if (!configured) {
    return Response.json(
      {
        error: paymentsRequired()
          ? "Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET."
          : "Payments are off in local dev.",
        configured: false,
      },
      { status: 503 },
    );
  }

  try {
    const order = await createRazorpayOrder();
    return Response.json({
      keyId,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency || REWRITE_CURRENCY,
      name: "ATSDekho",
      description: "One ATS-safe resume rewrite",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create order.";
    return Response.json({ error: message }, { status: 502 });
  }
}
