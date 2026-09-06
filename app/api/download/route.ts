import { resumeToDocx } from "@/lib/export-docx";
import { resumeToPdf } from "@/lib/export-pdf";
import { getSignedInEmail } from "@/lib/google-session";
import { paymentsRequired } from "@/lib/pricing";
import {
  findActiveSubscription,
  findOrCreateCustomer,
  verifyRazorpaySignature,
} from "@/lib/razorpay";
import { fileSlug } from "@/lib/resume-format";
import type { RewrittenResume } from "@/lib/types";

export const runtime = "nodejs";

async function googleAccountIsSubscribed() {
  const email = await getSignedInEmail();
  if (!email) return false;
  try {
    const customer = await findOrCreateCustomer({ email });
    return Boolean(await findActiveSubscription(customer.id));
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    rewrite?: RewrittenResume;
    format?: "docx" | "pdf";
    payment?: { orderId?: string; paymentId?: string; signature?: string };
  };
  if (!body.rewrite?.name) {
    return Response.json({ error: "Nothing to export." }, { status: 400 });
  }

  if (paymentsRequired()) {
    const subscribed = await googleAccountIsSubscribed();
    if (!subscribed) {
      const payment = body.payment;
      if (!payment?.orderId || !payment.paymentId || !payment.signature) {
        return Response.json(
          { error: "Pay ₹199 once, or sign in with Google for ₹499/month." },
          { status: 402 },
        );
      }
      if (
        !verifyRazorpaySignature({
          orderId: payment.orderId,
          paymentId: payment.paymentId,
          signature: payment.signature,
        })
      ) {
        return Response.json({ error: "Payment could not be verified." }, { status: 402 });
      }
    }
  }

  const format = body.format === "pdf" ? "pdf" : "docx";
  const slug = fileSlug(body.rewrite.name);

  if (format === "pdf") {
    const buffer = await resumeToPdf(body.rewrite);
    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${slug}-resume.pdf"`,
      },
    });
  }

  const buffer = await resumeToDocx(body.rewrite);
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${slug}-resume.docx"`,
    },
  });
}
