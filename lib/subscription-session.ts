import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { razorpayKeys } from "./pricing";

export const SUB_COOKIE = "atsdekho_sub";
const MAX_AGE_SEC = 60 * 60 * 24 * 45;

export type SubscriptionSession = {
  email: string;
  subscriptionId: string;
};

function secret() {
  const { keySecret } = razorpayKeys();
  return keySecret || "atsdekho-dev-session";
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function encodeSession(session: SubscriptionSession) {
  const payload = Buffer.from(
    JSON.stringify({ ...session, email: session.email.toLowerCase().trim() }),
    "utf8",
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function decodeSession(token: string | undefined): SubscriptionSession | null {
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot < 1) return null;
  const payload = token.slice(0, dot);
  const signature = token.slice(dot + 1);
  const expected = sign(payload);
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Partial<SubscriptionSession>;
    if (!data.email || !data.subscriptionId) return null;
    return { email: data.email.toLowerCase().trim(), subscriptionId: data.subscriptionId };
  } catch {
    return null;
  }
}

export async function readSubscriptionSession() {
  const jar = await cookies();
  return decodeSession(jar.get(SUB_COOKIE)?.value);
}

export async function writeSubscriptionSession(session: SubscriptionSession) {
  const jar = await cookies();
  jar.set(SUB_COOKIE, encodeSession(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SEC,
  });
}

export async function clearSubscriptionSession() {
  const jar = await cookies();
  jar.delete(SUB_COOKIE);
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}
