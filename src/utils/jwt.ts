/**
 * JWT utility helpers.
 * Decoding is done client-side for display/expiry only; verification happens on the backend.
 */

export interface JwtUser {
  email: string;
  name: string;
}

/**
 * Decode a JWT payload without verifying the signature.
 * Verification is done on the backend — we just read display info from the payload here.
 */
export const decodeJwtPayload = (token: string): Record<string, unknown> => {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return {};
  }
};

/**
 * Extract a user object from a JWT token.
 * Adjust the field names to match what your Spring Boot JWT actually contains.
 */
export const userFromToken = (token: string): JwtUser | null => {
  const payload = decodeJwtPayload(token);
  const email = payload["email"] as string | undefined;
  const name = (payload["name"] ?? payload["sub"]) as string | undefined;
  if (!email) return null;
  return { email, name: name ?? email.split("@")[0] };
};

/**
 * Check if a JWT token is expired.
 */
export const isTokenExpired = (token: string): boolean => {
  const payload = decodeJwtPayload(token);
  const exp = payload["exp"] as number | undefined;
  if (!exp) return false;
  return Date.now() >= exp * 1000;
};
