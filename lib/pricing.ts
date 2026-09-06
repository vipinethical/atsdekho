export const REWRITE_PRICE_RUPEES = 199;
export const REWRITE_PRICE_PAISE = REWRITE_PRICE_RUPEES * 100;
export const MONTHLY_PRICE_RUPEES = 499;
export const MONTHLY_PRICE_PAISE = MONTHLY_PRICE_RUPEES * 100;
export const REWRITE_CURRENCY = "INR";
export const MONTHLY_PLAN_NOTES = "atsdekho-monthly";

export function razorpayKeys() {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim() ?? "";
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim() ?? "";
  return { keyId, keySecret, configured: Boolean(keyId && keySecret) };
}

export function paymentsRequired() {
  return razorpayKeys().configured;
}
