import { embedded } from "@salla.sa/embedded-sdk";

export interface FetchWithAuthOptions {
  token?: string | null;
  storeId?: number | string | null;
}

// Central fetch wrapper:
// - Injects Authorization: Bearer <token> header (required by sallaAuthMiddleware)
// - Injects x-salla-store-id header when storeId is provided (optional but
//   recommended — backend validates it matches the token's merchant, preventing
//   token reuse across different stores)
// - Triggers embedded.auth.refresh() on any 401, which reloads the iframe
//   with a fresh token so execution effectively stops after it is called.
export async function fetchWithAuth(
  input: RequestInfo,
  init?: RequestInit,
  { token, storeId }: FetchWithAuthOptions = {},
): Promise<Response>  {
  const headers = new Headers(init?.headers);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (storeId != null) {
    headers.set("x-salla-store-id", String(storeId));
  }

  const res = await fetch(input, { ...init, headers });

  if (res.status === 401) {
    console.warn("Token expired (401). Refreshing via embedded.auth.refresh()...");
    await embedded.auth.refresh();
  }

  return res;
}
