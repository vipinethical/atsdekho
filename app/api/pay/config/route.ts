import { googleAuthConfigured } from "@/lib/google-session";
import {
  MONTHLY_PRICE_PAISE,
  REWRITE_CURRENCY,
  REWRITE_PRICE_PAISE,
  paymentsRequired,
  razorpayKeys,
} from "@/lib/pricing";

export const runtime = "nodejs";

export async function GET() {
  const { configured } = razorpayKeys();
  return Response.json({
    configured,
    required: paymentsRequired(),
    amountPaise: REWRITE_PRICE_PAISE,
    monthlyPaise: MONTHLY_PRICE_PAISE,
    currency: REWRITE_CURRENCY,
    rupees: REWRITE_PRICE_PAISE / 100,
    monthlyRupees: MONTHLY_PRICE_PAISE / 100,
    googleAuth: googleAuthConfigured(),
  });
}
