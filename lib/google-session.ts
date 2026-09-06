import { auth } from "@/auth";

export function googleAuthConfigured() {
  const id = process.env.AUTH_GOOGLE_ID ?? process.env.GOOGLE_CLIENT_ID;
  const secret = process.env.AUTH_GOOGLE_SECRET ?? process.env.GOOGLE_CLIENT_SECRET;
  return Boolean(id?.trim() && secret?.trim());
}

export async function getSignedInEmail() {
  const session = await auth();
  return session?.user?.email?.trim().toLowerCase() || null;
}
