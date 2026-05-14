import dns from "node:dns/promises";

export async function isEmailDeliverable(email: string | undefined) {
  if (!email) return true;

  const parts = email.split("@");
  if (parts.length < 2) return false;

  const domain = parts[1];
  try {
    const records = await dns.resolveMx(domain);
    return records && records.length > 0;
  } catch {
    return false;
  }
}
