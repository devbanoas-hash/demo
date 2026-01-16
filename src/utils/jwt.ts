/**
 * JWT Token utilities
 * Decodes JWT token without verification (client-side only)
 * Note: Token verification should be done on the server
 */

export interface JWTPayload {
  user_id: string;
  role_name: string;
  jti: string;
  iat?: number;
  exp?: number;
}

/**
 * Decode JWT token (base64 decode only, no verification)
 * Returns null if token is invalid
 */
export function decodeJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // Decode payload (second part)
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const parsed = JSON.parse(decoded) as JWTPayload;

    // Check if token is expired
    if (parsed.exp && parsed.exp * 1000 < Date.now()) {
      return null;
    }

    return parsed;
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

/**
 * Get user info from token
 */
export function getUserFromToken(token: string): { user_id: string; role_name: string } | null {
  const payload = decodeJWT(token);
  if (!payload) {
    return null;
  }

  return {
    user_id: payload.user_id,
    role_name: payload.role_name,
  };
}
