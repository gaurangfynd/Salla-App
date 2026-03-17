import { fetchWithAuth } from "./fetchWithAuth";

const BACKEND_URL = "";

export async function introspectToken(token: string, appId: string | null) {
  try {
    console.log("in interospect");
    const res = await fetchWithAuth(
      `${BACKEND_URL}/api/salla/introspect`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, appId }),
      },
    );
    const data = await res.json();
    console.log("data from introspect api", data);
    return data;
  } catch (err) {
    console.error("introspectToken failed:", err);
    return null;
  }
}

export async function fetchCanCreateAgent(merchantId: string, ownerEmail: string, token: string) {
  try {
    const url = `${BACKEND_URL}/api/salla/canCreateAgent?ownerEmail=${encodeURIComponent(ownerEmail)}`;
    const res = await fetchWithAuth(url, { method: "GET" }, { token, storeId: merchantId });
    const data = await res.json();
    console.log("canCreateAgent response", data);
    return data?.data?.canCreate === true;
  } catch (err) {
    console.error("fetchCanCreateAgent failed:", err);
    return false;
  }
}

export async function fetchAppData(merchantId: string, ownerEmail: string, token: string) {
  try {
    const url = `${BACKEND_URL}/api/salla/getApp?sallaStoreId=${merchantId}&ownerEmail=${encodeURIComponent(ownerEmail)}`;
    const res = await fetchWithAuth(url, { method: "GET" }, { token, storeId: merchantId });
    if (!res.ok) throw new Error(`getApp error: ${res.status} ${res.statusText}`);
    const data = await res.json();
    console.log("appData response", data);
    return data?.data ?? null;
  } catch (err) {
    console.error("fetchAppData failed:", err);
    return null;
  }
}

export async function fetchUsageData(merchantId: string, ownerEmail: string, token: string) {
  try {
    const url = `${BACKEND_URL}/api/salla/getUsage?sallaStoreId=${encodeURIComponent(merchantId)}&ownerEmail=${encodeURIComponent(ownerEmail)}`;
    const res = await fetchWithAuth(url, { method: "GET" }, { token, storeId: merchantId });
    if (!res.ok) throw new Error(`getUsage error: ${res.status} ${res.statusText}`);
    const data = await res.json();
    console.log("usageData response", data);
    return data?.data ?? null;
  } catch (err) {
    console.error("fetchUsageData failed:", err);
    return null;
  }
}

export async function updateCopilot(
  payload: { sallaStoreId: string; ownerEmail: string; data: Record<string, any> },
  token: string,
) {
  try {
    console.log("payload:", payload);
    const res = await fetchWithAuth(
      `${BACKEND_URL}/api/salla/updateApp`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
      { token, storeId: payload.sallaStoreId },
    );
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`updateCopilot API error: ${res.status} ${text}`);
    }
    const data = await res.json().catch(() => ({}));
    console.log("updateCopilot response", data);
    return data;
  } catch (err) {
    console.error("updateCopilot failed:", err);
    return null;
  }
}

export async function iconInit(
  payload: { sallaStoreId: string; ownerEmail: string; file_name: string; file_type: string; file_size: number },
  token: string,
) {
  try {
    const res = await fetchWithAuth(
      `${BACKEND_URL}/api/salla/icon/init`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
      { token, storeId: payload.sallaStoreId },
    );
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`iconInit API error: ${res.status} ${text}`);
    }
    const data = await res.json();
    console.log("iconInit response", data);
    return data;
  } catch (err) {
    console.error("iconInit failed:", err);
    return null;
  }
}

export async function createSallaAgent(
  payload: {
    ownerFirstName: string;
    ownerLastName: string;
    ownerEmail: string;
    sallaStoreId: string;
    aiAgentName: string;
    active?: boolean;
    companyName: string;
    companyCountry: string;
    companyState: string;
    storefrontToken: string;
    metadata: Record<string, any>;
  },
  token: string,
  merchantId: string,
) {
  try {
    const res = await fetchWithAuth(
      `${BACKEND_URL}/api/salla/createApp`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
      { token, storeId: merchantId },
    );
    const data = await res.json();
    console.log("createSallaAgent response", data);
    return data;
  } catch (err) {
    console.error("createSallaAgent failed:", err);
    return null;
  }
}

export async function fetchSallaStoreInfo(token: string, merchantId: string) {
  try {
    const res = await fetchWithAuth(
      `${BACKEND_URL}/api/salla/userInfo`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      },
      { token, storeId: merchantId },
    );
    const data = await res.json();
    console.log("salla user info", data);
    if (!data?.success || !data?.data?.data) return null;
    return {
      ...data.data.data,
      activeAdminStoreUser: data.data.activeAdminStoreUser ?? null,
    };
  } catch (err) {
    console.error("fetchSallaStoreInfo failed:", err);
    return null;
  }
}
