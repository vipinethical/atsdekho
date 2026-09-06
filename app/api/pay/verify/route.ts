import { verifyRazorpaySignature } from "@/lib/razorpay";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    orderId?: string;
    paymentId?: string;
    signature?: string;
  };
  if (!body.orderId || !body.paymentId || !body.signature) {
    return Response.json({ error: "Missing payment details." }, { status: 400 });
  }
  if (
    !verifyRazorpaySignature({
      orderId: body.orderId,
      paymentId: body.paymentId,
      signature: body.signature,
    })
  ) {
    return Response.json({ error: "Payment signature did not match." }, { status: 400 });
  }
  return Response.json({ ok: true });
}
