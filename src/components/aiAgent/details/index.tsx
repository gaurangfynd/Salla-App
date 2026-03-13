import { useEffect, useState, useMemo } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { useNavigate } from "react-router";
// import { useFetcher, useLoaderData, useRevalidator } from "react-router";
// import { authenticate } from "../shopify.server";
// import { setShopMetaFields } from "../utils/shop.metafields";
import Pixelbin from "@pixelbin/core";
// import { FUSION_SHOPIFY_DOMAIN } from "../config/config";
import { embedded } from "@salla.sa/embedded-sdk";
import { fetchWithAuth } from "../../../utils/fetchWithAuth";
import { useSalla } from "../../../context/salla-context";

const BACKEND_URL = "http://localhost:3032";

// ---------- update-copilot ----------
async function updateCopilot(
  payload: { sallaStoreId: string; ownerEmail: string; data: Record<string, any> },
  token: string,
) {
  console.log("payload:", payload)
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
}

// ---------- icon-init (get signed upload URL) ----------
async function iconInit(
  payload: { sallaStoreId: string; ownerEmail: string; file_name: string; file_type: string; file_size: number },
  token: string,
) {
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
  // returns: { ok, signed: { data: { method, url, fields, cdn_path, storage_type } } }
  return data;
}



const THEMES: Record<string, any> = {
  "cosmic-chills": {
    label: "Cosmic Chills",
    appearance: {
      layoutBackground: "#ffffff",
      minimizedBackgroundColor: "#ffffff",
      inputBackground: "#f6f8f9",
      inputFontColor: "#0a0e18",
      primaryButton: "#7a5af5",
      borderColor: "#ebebeb",
      copilotReplyBackground: "#f7f0ff",
      copilotFontColor: "#0a0e18",
      userReplyBackground: "#f6f8f9",
      userFontColor: "#0a0e18",
    },
    font: { family: "lato" },
  },

  // default: {
  //   label: "Cosmic Depth",
  //   appearance: {
  //     layoutBackground: "#0a0e18",
  //     minimizedBackgroundColor: "#0a0e18",
  //     inputBackground: "#212121",
  //     inputFontColor: "#fff9f5",
  //     primaryButton: "#7a5af5",
  //     borderColor: "#363636",
  //     copilotReplyBackground: "#141822",
  //     copilotFontColor: "#d5d5d5",
  //     userReplyBackground: "#1b1b1b",
  //     userFontColor: "#ffffff",
  //   },
  //   font: { family: "lato" },
  // },

  "sunset-bliss": {
    label: "Sunset Bliss",
    appearance: {
      layoutBackground: "#ffefe3",
      minimizedBackgroundColor: "#ffefe3",
      inputBackground: "#fff9f5",
      inputFontColor: "#000000",
      primaryButton: "#f4805d",
      borderColor: "#ffe1cc",
      copilotReplyBackground: "#fff9f5",
      copilotFontColor: "#000000",
      userReplyBackground: "#ffe3d1",
      userFontColor: "#000000",
    },
    font: { family: "ubuntu" },
  },

  "stary-night": {
    label: "Stary Night",
    appearance: {
      layoutBackground: "#ffffff",
      minimizedBackgroundColor: "#ffffff",
      inputBackground: "#f6f8f9",
      inputFontColor: "#0a0e18",
      primaryButton: "#3535f3",
      borderColor: "#ebebeb",
      copilotReplyBackground: "#f0f0ff",
      copilotFontColor: "#0a0e18",
      userReplyBackground: "#f6f8f9",
      userFontColor: "#0a0e18",
    },
    font: { family: "balsamiq-sans" },
  },

  "mint-breeze": {
    label: "Mint Breeze",
    appearance: {
      layoutBackground: "#effdfa",
      minimizedBackgroundColor: "#effdfa",
      inputBackground: "#c8e2e2",
      inputFontColor: "#000000",
      primaryButton: "#e60787",
      borderColor: "#b7cdcd",
      copilotReplyBackground: "#d1dfdf",
      copilotFontColor: "#000000",
      userReplyBackground: "#b2dada",
      userFontColor: "#000000",
    },
    font: { family: "titillium-web" },
  },
};

// ========================= Loader =========================
// export const loader = async ({ request }: LoaderFunctionArgs) => {
//   //   const { admin, session } = await authenticate.admin(request);

//   //   const shopResponse = await admin.graphql(`
//   //       #graphql
//   //       query {
//   //         shop {
//   //           id
//   //           name
//   //           email
//   //           shopOwnerName
//   //           myshopifyDomain
//   //           billingAddress {
//   //             countryCodeV2
//   //             province
//   //           }
//   //         }
//   //       }
//   //   `);

//   //   const shopInfo = (await shopResponse.json())?.data?.shop;

//   //   console.log("Shop Info in loader:", shopInfo);
//   //   const companyCountry = shopInfo?.billingAddress?.countryCodeV2;
//   //   const companyProvince = shopInfo?.billingAddress?.province;

//   //   const billingAddress = !!(companyCountry && companyProvince);
//   //   // Example parameters (can be dynamic)
//   //   const shopifyStoreId = shopInfo?.id;
//   //   const ownerEmail = shopInfo?.email;
//   //   //const ownerEmail = "testshopify12@gmail.com";
//   //   const x_shopify_shop_token = session?.accessToken;
//   //   const x_shopify_shop_domain = shopInfo?.myshopifyDomain;

//   // ---------- NEW: Editor URLs like your reference ----------
//   const appEmbedUrl = `https://${session.shop}/admin/themes/current/editor?context=apps&template=product&activateAppId=${process.env.SHOPIFY_API_KEY}/copilot-embed`;
//   const appBlockUrl = `https://${session.shop}/admin/themes/current/editor?template=product&addAppBlockId=${process.env.SHOPIFY_API_KEY}/copilot-embed&target=mainSection`;

//   // ---------- NEW: Detect if app-embed is enabled in MAIN theme ----------
//   let isEnableAppEmbed = false;
//   let activeThemeId: string | undefined;

//   try {
//     // 1) MAIN theme via GraphQL
//     // const themesResponse = await admin.graphql(`
//     //   #graphql
//     //   query GetMainTheme {
//     //     themes(first: 10) {
//     //       edges {
//     //         node { id name role }
//     //       }
//     //     }
//     //   }
//     // `);
//     // const themesData = await themesResponse.json();
//     // const mainTheme = themesData?.data?.themes?.edges?.find(
//     //   (t: any) => t?.node?.role === "MAIN",
//     // );
//     // activeThemeId = mainTheme?.node?.id;
//     // 2) Read settings_data.json via REST and check embed
//     // if (activeThemeId && x_shopify_shop_domain && x_shopify_shop_token) {
//     //   const themeNumericId = activeThemeId.split("/").pop();
//     //   const url = `https://${x_shopify_shop_domain}/admin/api/2025-01/themes/${themeNumericId}/assets.json?asset[key]=config/settings_data.json`;
//     //   const res = await fetch(url, {
//     //     method: "GET",
//     //     headers: {
//     //       "X-Shopify-Access-Token": String(x_shopify_shop_token || ""),
//     //       "Content-Type": "application/json",
//     //     },
//     //   });
//     //   if (res.ok) {
//     //     const payload = await res.json();
//     //     const raw = payload?.asset?.value ?? "";
//     //     if (raw) {
//     //       // Some themes may include comments—try plain JSON first
//     //       let parsed: any = {};
//     //       try {
//     //         parsed = JSON.parse(raw);
//     //       } catch {
//     //         // remove /* */ and // comments if any
//     //         const removeCommentsFromJSON = (input: string) =>
//     //           input
//     //             .replace(/\/\*[\s\S]*?\*\//g, "")
//     //             .replace(/(^|[^:])\/\/.*$/gm, "$1");
//     //         parsed = JSON.parse(removeCommentsFromJSON(raw));
//     //       }
//     //       const current = parsed?.current ?? {};
//     //       const embeds = current?.enabled_app_embeds;
//     //       // Preferred OS2.0 field: enabled_app_embeds
//     //       if (Array.isArray(embeds)) {
//     //         isEnableAppEmbed = embeds.includes("copilot-embed");
//     //       } else if (embeds && typeof embeds === "object") {
//     //         isEnableAppEmbed =
//     //           embeds["copilot-embed"] === true ||
//     //           embeds["app:copilot-embed"] === true;
//     //       }
//     //       // Fallback: check blocks (older theme setups)
//     //       if (!isEnableAppEmbed) {
//     //         const blocks = current?.blocks || {};
//     //         isEnableAppEmbed = Object.values(blocks).some(
//     //           (block: any) =>
//     //             block &&
//     //             typeof block === "object" &&
//     //             typeof block.type === "string" &&
//     //             block.type.includes("copilot-embed") &&
//     //             block.disabled !== true,
//     //         );
//     //       }
//     //     }
//     //   } else {
//     //     console.warn("Could not load settings_data.json:", await res.text());
//     //   }
//     // }
//   } catch (e) {
//     console.warn("Theme/embed detection failed:", e);
//   }

//   //ableToCreateBot

//   //const ableToCreateBot = false;

//   let ableToCreateBot = false;

//   //   const canCreateUrl = `${FUSION_SHOPIFY_DOMAIN}/api/shopify/canCreateAgent?ownerEmail=${encodeURIComponent(ownerEmail || "")}`;

//   //   const canCreateResponse = await fetch(canCreateUrl, {
//   //     method: "GET",
//   //     headers: {
//   //       "x-shopify-shop-domain": String(x_shopify_shop_domain || ""),
//   //       "x-shopify-shop-token": String(x_shopify_shop_token || ""),
//   //     },
//   //   });

//   //   const canCreateResponseJson = await canCreateResponse.json();
//   //console.log("Can Create Agent Response:", canCreateResponseJson);

//   //   if (canCreateResponseJson?.data?.canCreate === true) {
//   //     ableToCreateBot = true;
//   //   }

//   // Get App Data
//   //   const apiUrl = `${FUSION_SHOPIFY_DOMAIN}/api/shopify/getApp?shopifyStoreId=${shopifyStoreId}&ownerEmail=${encodeURIComponent(
//   //     ownerEmail || "",
//   //   )}`;

//   try {
//     // const response = await fetch(apiUrl, {
//     //   method: "GET",
//     //   headers: {
//     //     "x-shopify-shop-domain": String(x_shopify_shop_domain || ""),
//     //     "x-shopify-shop-token": String(x_shopify_shop_token || ""),
//     //   },
//     // });

//     // if (!response.ok) {
//     //   throw new Error(`API error: ${response.status} ${response.statusText}`);
//     // }

//     // const data = await response.json();

//     // if (data?.data?.copilot?.token) {
//     //   //console.log("✅ Received Copilot Token:", data.data.copilot.token);
//     //   const metaFieldsObject = {
//     //     namespace: "kaily_app_token",
//     //     key: "key_kaily_app_token",
//     //     type: "json",
//     //     value: JSON.stringify(data.data.copilot.token || ""),
//     //     ownerId: shopInfo?.id,
//     //   };

//     //   //console.log("Meta Field Object to set:", metaFieldsObject);
//     //   const metaFieldsArray = new Array(metaFieldsObject);
//     //   const metaFieldsResponse = await setShopMetaFields(
//     //     admin,
//     //     metaFieldsArray,
//     //   );
//     // }

//     // Additional fetch for usage data
//     // const apiUrlUsage = `${FUSION_SHOPIFY_DOMAIN}/api/shopify/getUsage?shopifyStoreId=${encodeURIComponent(
//     //   shopifyStoreId,
//     // )}&ownerEmail=${encodeURIComponent(ownerEmail || "")}`;

//     // const responseUsage = await fetch(apiUrlUsage, {
//     //   method: "GET",
//     //   headers: {
//     //     "x-shopify-shop-domain": String(x_shopify_shop_domain || ""),
//     //     "x-shopify-shop-token": String(x_shopify_shop_token || ""),
//     //   },
//     // });

//     // if (!responseUsage.ok) {
//     //   throw new Error(
//     //     `API error: ${responseUsage.status} ${responseUsage.statusText}`,
//     //   );
//     // }

//     // const dataUsage = await responseUsage.json();

//     //const data = null;

//     //console.log("✅ Shopify App Data:", data);

//     return Response.json({
//       success: true,
//       data,
//       dataUsage,
//       appEmbedUrl,
//       appBlockUrl,
//       isEnableAppEmbed,
//       activeThemeId,
//       billingAddress,
//       ableToCreateBot,
//     });
//   } catch (error) {
//     console.error("❌ Failed to fetch Shopify App data:");
//     return Response.json(
//       {
//         success: false,
//         error: String(error),
//         appEmbedUrl,
//         appBlockUrl,
//         isEnableAppEmbed,
//         activeThemeId,
//         billingAddress,
//         ableToCreateBot,
//       },
//       { status: 500 },
//     );
//   }
// };

// ========================= Action (FIXED + toggle support) =========================
// export const action = async ({ request }: ActionFunctionArgs) => {
//   //return { success: true }

//   const { admin, session } = await authenticate.admin(request);

//   // Detect if this is a toggle request
//   const contentType = request.headers.get("content-type") || "";
//   const isJson = contentType.includes("application/json");
//   const formData = isJson ? null : await request.formData();
//   const jsonBody = isJson ? await request.json() : null;
//   const intent = (isJson ? jsonBody?.intent : formData?.get("intent")) as
//     | string
//     | null;

//   // ---------- NEW: icon upload init (signed URL) ----------
//   if (intent === "icon-init") {
//     try {
//       const shopResponse = await admin.graphql(`
//       #graphql
//       query { shop { id email myshopifyDomain } }
//     `);
//       const shopInfo = (await shopResponse.json())?.data?.shop;

//       const x_shopify_shop_token = session?.accessToken;
//       const x_shopify_shop_domain = shopInfo?.myshopifyDomain;

//       const shopifyStoreId = shopInfo?.id;
//       const ownerEmail = shopInfo?.email;

//       // metadata from client
//       const payload =
//         (isJson
//           ? jsonBody?.payload
//           : JSON.parse(String(formData?.get("payload") || "{}"))) || {};

//       // payload expected: { file_name, file_type, file_size }
//       const res = await fetch(
//         `${FUSION_SHOPIFY_DOMAIN}/api/shopify/icon/init`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             "x-shopify-shop-domain": String(x_shopify_shop_domain || ""),
//             "x-shopify-shop-token": String(x_shopify_shop_token || ""),
//           },
//           body: JSON.stringify({
//             ownerEmail,
//             shopifyStoreId,
//             file_name: payload.file_name,
//             file_type: payload.file_type,
//             file_size: payload.file_size,
//           }),
//         },
//       );

//       if (!res.ok) {
//         const t = await res.text().catch(() => "");
//         return Response.json(
//           { ok: false, error: `Init API error: ${res.status} ${t}` },
//           { status: 400 },
//         );
//       }

//       const out = await res.json();
//       console.log("responce data -- ", out);
//       // out should contain: data: { method, url, fields, cdn_path, storage_type }
//       return Response.json({ ok: true, signed: out });
//     } catch (err: any) {
//       console.error("icon-init failed:", err);
//       return Response.json({ ok: false, error: String(err) }, { status: 500 });
//     }
//   }

//   // ---------- NEW: update copilot settings (name + model + tone + appearance) ----------
//   if (intent === "update-copilot") {
//     try {
//       const payload =
//         (isJson
//           ? jsonBody?.payload
//           : JSON.parse(String(formData?.get("payload") || "{}"))) || {};

//       const shopResponse = await admin.graphql(`
//       #graphql
//       query { shop { id email myshopifyDomain } }
//     `);
//       const shopInfo = (await shopResponse.json())?.data?.shop;

//       const x_shopify_shop_token = session?.accessToken;
//       const x_shopify_shop_domain = shopInfo?.myshopifyDomain;

//       const shopifyStoreId = shopInfo?.id;
//       const ownerEmail = shopInfo?.email;

//       // payload expected: { name, configuration: { provider, traits, appearance } }
//       const res = await fetch(
//         `${FUSION_SHOPIFY_DOMAIN}/api/shopify/updateApp`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             "x-shopify-shop-domain": String(x_shopify_shop_domain || ""),
//             "x-shopify-shop-token": String(x_shopify_shop_token || ""),
//           },
//           body: JSON.stringify({
//             shopifyStoreId,
//             ownerEmail,
//             data: payload,
//           }),
//         },
//       );
//       // const responceA = await res.json();
//       // console.log("update responce : ", responceA);
//       if (!res.ok) {
//         const t = await res.text().catch(() => "");
//         return Response.json(
//           { ok: false, error: `API error: ${res.status} ${t}` },
//           { status: 400 },
//         );
//       }

//       const out = await res.json().catch(() => ({}));
//       return Response.json({ ok: true, api: out, payload });
//     } catch (err: any) {
//       console.error("Update copilot failed:", err);
//       return Response.json({ ok: false, error: String(err) }, { status: 500 });
//     }
//   }

//   // ---------- Original createApp flow ----------
//   const fd = formData ?? new FormData();

//   const shopResponse = await admin.graphql(`
//       #graphql
//       query {
//         shop {
//           id
//           name
//           email
//           shopOwnerName
//           myshopifyDomain
//           billingAddress {
//             countryCodeV2
//             province
//           }
//         }
//       }
//   `);

//   const shopInfo = (await shopResponse.json())?.data?.shop;

//   // Create a new Storefront Access Token (Admin GraphQL)
//   const storefrontTokenRes = await admin.graphql(
//     `
//     #graphql
//     mutation storefrontAccessTokenCreate($input: StorefrontAccessTokenInput!) {
//       storefrontAccessTokenCreate(input: $input) {
//         storefrontAccessToken {
//           accessToken
//         }
//         userErrors {
//           field
//           message
//         }
//       }
//     }
//     `,
//     {
//       variables: {
//         input: {
//           title: `Copilot Token - ${shopInfo?.myshopifyDomain ?? "store"}`, // any title you want
//         },
//       },
//     },
//   );

//   const storefrontTokenJson = await storefrontTokenRes.json();
//   const userErrors =
//     storefrontTokenJson?.data?.storefrontAccessTokenCreate?.userErrors ?? [];
//   if (userErrors.length) {
//     return Response.json(
//       { ok: false, error: "Storefront token create failed", userErrors },
//       { status: 400 },
//     );
//   }

//   const storefrontToken =
//     storefrontTokenJson?.data?.storefrontAccessTokenCreate
//       ?.storefrontAccessToken?.accessToken;

//   if (!storefrontToken) {
//     return Response.json(
//       { ok: false, error: "Storefront token missing in response" },
//       { status: 500 },
//     );
//   }

//   const x_shopify_shop_token = session?.accessToken;
//   const x_shopify_shop_domain = shopInfo?.myshopifyDomain;
//   const shopifyStoreId = shopInfo?.id;
//   //const shopifyStoreId = "gid://shopify/Shop/025481234567"; // TESTING FIXED ID
//   const email = shopInfo?.email;
//   //const email = "testshopify12@gmail.com";
//   const shopName = shopInfo?.name;
//   const companyCountry = shopInfo?.billingAddress?.countryCodeV2;
//   const companyProvince = shopInfo?.billingAddress?.province;
//   const aiAgentName = shopName; // Use shop name as AI agent name
//   const shopOwnerName = shopInfo?.shopOwnerName;

//   try {
//     const response = await fetch(
//       `${FUSION_SHOPIFY_DOMAIN}/api/shopify/createApp`,
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           "x-shopify-shop-domain": String(x_shopify_shop_domain || ""),
//           "x-shopify-shop-token": String(x_shopify_shop_token || ""),
//         },
//         body: JSON.stringify({
//           ownerFirstName: shopOwnerName?.split(" ")[0] || "",
//           ownerLastName: shopOwnerName?.split(" ")[1] || "",
//           ownerEmail: email,
//           companyName: shopName,
//           companyCountry: companyCountry,
//           companyState: companyProvince,
//           shopifyStoreId: shopifyStoreId,
//           aiAgentName: aiAgentName,
//           storefrontToken: storefrontToken,
//           active: true,
//         }),
//       },
//     );

//     const apiResult = await response.json();

//     console.log("🤖 API Result:", JSON.stringify(apiResult, null, 2));
//     //console.log("🏬 Shop Info:", JSON.stringify(shopInfo, null, 2));

//     // ❌ If API returned error status code (400, 500 etc)
//     if (!response.ok) {
//       return {
//         success: false,
//         error: apiResult?.message || "Something went wrong. please try again!",
//         apiResult,
//         shopInfo,
//       };
//     }

//     // ✅ Success
//     return {
//       success: true,
//       shopInfo,
//       apiResult,
//     };
//   } catch (error) {
//     console.error("❌ Error occurred:", error);

//     return {
//       success: false,
//       error: error?.message || "Something went wrong",
//     };
//   }
// };

// ========================= Component =========================
export default function AiAgentDetails() {
  const navigate = useNavigate();
  const { merchantId, sallaStoreInfo, appData, usageData, ableToCreateBot, token } = useSalla();

  const [iconUploading, setIconUploading] = useState(false);
  const [iconError, setIconError] = useState<string>("");

  const [copilotReloadKey, setCopilotReloadKey] = useState(0);

  //console.log("Loader Data -->:", nameFetcher);
  //   const [editName, setEditName] = useState(
  //     loaderData?.data?.copilot?.name ?? "",
  //   );
  //console.log("Loader Data Copilot Usage -->:", loaderData?.dataUsage);
  //   const handleUpdateName = () => {
  //     const formData = new FormData();
  //     formData.append("intent", "update-name");
  //     formData.append("aiAgentName", editName.trim());
  //     nameFetcher.submit(formData, { method: "POST" });
  //   };

  // when loader revalidates (after update), sync editName with latest
  //   useEffect(() => {
  //     const latest =
  //       loaderData?.data?.data?.copilot?.name ||
  //       loaderData?.data?.copilot?.name ||
  //       "";
  //     setEditName(latest);
  //   }, [loaderData?.data?.data?.copilot?.name, loaderData?.data?.copilot?.name]);


  // 0|2|3|4 = step numbers (2 = loader, 3 = success)
  const [currentStep, setCurrentStep] = useState<0 | 2 | 3 | 4>(3);

  // Salla equivalent of Shopify's useLoaderData
  const existingData = appData ?? null;
  const usage = (usageData as any)?.data?.usage ?? {};


  console.log("Existing Data:", existingData);

  const planName = usage?.plan?.name || "Free Trial";
  const endDate = usage?.endDate || null;
  const date = new Date(endDate);
  const options = {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  };
  const formattedDate = date.toLocaleString("en-US", options);
  console.log("usage", usage);
  const features = usage?.features || [];

  const appFeature = features.find((f) => f.id === "app") || {};
  const qFeature = features.find((f) => f.id === "q") || {};
  const dssyFeature = features.find((f) => f.id === "dssy") || {};
  const dsFeature = features.find((f) => f.id === "ds") || {};

  const appTotal = appFeature?.units || 0;
  const appUsed = appFeature?.currentUsage || 0;
  const appPercent = appTotal > 0 ? (appUsed / appTotal) * 100 : 0;

  const qTotal = qFeature?.units ?? 0;
  const qUsed = qFeature?.currentUsage ?? 0;
  const qPercent = qTotal > 0 ? (qUsed / qTotal) * 100 : 0;

  const dssyTotal = dssyFeature?.units || 0;
  const dssyUsed = dssyFeature?.currentUsage || 0;
  const dssyPercent = dssyTotal > 0 ? (dssyUsed / dssyTotal) * 100 : 0;

  const dsTotal = dsFeature?.units || 0;
  const dsUsed = dsFeature?.currentUsage || 0;
  const dsPercent = dsTotal > 0 ? (dsUsed / dsTotal) * 100 : 0;

  const [showSetupLoader, setShowSetupLoader] = useState(false);
  const [showSecondItem, setShowSecondItem] = useState(false);
  const [activeTab, setActiveTab] = useState<"template" | "customize">(
    "template",
  );

  const TOTAL_MS = 15000; // 15s total

  const [done1, setDone1] = useState(false);
  const [done2, setDone2] = useState(false);
  const [done3, setDone3] = useState(false);

  const [showMore, setShowMore] = useState(false);

  const NAME_MAX = 30;
  const PERSONA_MAX = 2500;

  const [nameError, setNameError] = useState<string>("");
  const [personaError, setPersonaError] = useState<string>("");

  const [pickedFile, setPickedFile] = useState<File | null>(null);

  //   const isLoading =
  //     ["loading", "submitting"].includes(fetcher.state) &&
  //     fetcher.formMethod === "POST";

  //   const handleStartSync = () => {
  //     const formData = new FormData();
  //     fetcher.submit(formData, { method: "POST" });
  //   };

  //   useEffect(() => {
  //     if (!existingData && !window.location.search.includes("op=1")) {
  //       const url = new URL(window.location.href);
  //       url.searchParams.set("op", "1");
  //       window.location.replace(url.toString());
  //     }
  //   }, [existingData]);

  useEffect(() => {
    if (existingData?.data?.copilot?.token) {
      const existingScript = document.getElementById("copilot-script");
      if (existingScript) {
        window.oneClickCopilot?.("destroy");
        existingScript.remove();
      }
      if (document.getElementById("oneClickCopilot")) {
        document.getElementById("oneClickCopilot")?.remove();
      }
      if (showSecondItem) {
        // Create the script element with the exact format requested
        const script = document.createElement("script");
        script.id = "copilot-script";
        script.type = "application/javascript";

        // Set the script content using the format provided
        script.innerHTML = `
              (function(w,d,s,o,f,js,fjs){w[o]=w[o]||function(){(w[o].q=w[o].q||[]).push(arguments);};(js=d.createElement(s)),(fjs=d.getElementsByTagName(s)[0]);js.id=o;js.src=f;js.async=1;js.referrerPolicy = "origin";fjs.parentNode.insertBefore(js,fjs);})(window,document,"script","oneClickCopilot", "https://script.copilot.live/v1/copilot.min.js?tkn=${existingData.data.copilot.token}&region=asia-south1");
              oneClickCopilot("init",{element: "copilot-container"});
              `;

        // Append the script and update loading state when done
        document.body.appendChild(script);
      }
      // Clean up on unmount
      return () => {
        if (document.getElementById("copilot-script")) {
          window?.oneClickCopilot?.("destroy");
          document.getElementById("copilot-script")?.remove();
        }
        if (document.getElementById("oneClickCopilot")) {
          document.getElementById("oneClickCopilot")?.remove();
        }
      };
    }

    // Return empty cleanup function for the case when copilotToken is not available
    return () => { };
  }, [existingData?.data?.copilot?.token, showSecondItem, copilotReloadKey]);

  const openModal = () => {
    const btn = document.querySelector('s-button[commandFor="modal"]');
    if (btn) {
      //   btn.click();
    }
  };

  useEffect(() => {
    const url = new URL(window.location.href);
    if (
      existingData &&
      url.searchParams.get("op") === "1" &&
      currentStep === 3
    ) {
      const timer = setTimeout(() => {
        openModal();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [existingData, currentStep]);



  //   const settingsFetcher = useFetcher<typeof action>();

  const copilotFromServer = existingData?.data?.copilot || null;

  const [draftCopilot, setDraftCopilot] = useState<any>(copilotFromServer);

  const [baselineCopilot, setBaselineCopilot] =
    useState<any>(copilotFromServer);

  useEffect(() => {
    setDraftCopilot(copilotFromServer);
    setBaselineCopilot(copilotFromServer);
  }, [copilotFromServer?.id]);

  const updateDraft = (path: string[], value: any) => {
    setDraftCopilot((prev: any) => {
      const next = structuredClone(prev || {});
      let cur = next;
      for (let i = 0; i < path.length - 1; i++) {
        cur[path[i]] = cur[path[i]] ?? {};
        cur = cur[path[i]];
      }
      cur[path[path.length - 1]] = value;
      return next;
    });
  };

  const validateBeforeSave = () => {
    const name = (draftCopilot?.name || "").trim();
    const persona = draftCopilot?.persona || "";

    let ok = true;

    if (!name) {
      setNameError("Name is required.");
      ok = false;
    } else if (name.length > NAME_MAX) {
      setNameError(`Maximum ${NAME_MAX} characters allowed.`);
      ok = false;
    } else {
      setNameError("");
    }

    if (persona.length > PERSONA_MAX) {
      setPersonaError(`Maximum ${PERSONA_MAX} characters allowed.`);
      ok = false;
    } else {
      setPersonaError("");
    }

    return ok;
  };

  const onSave = async () => {
    if (!draftCopilot) return;

    // send ONLY what you want to update (recommended)
    const payloadToSend = {
      name: draftCopilot?.name,
      persona: draftCopilot?.persona,
      icon: pendingIconCdnPath || draftCopilot?.icon,
      configuration: {
        ...draftCopilot?.configuration,
        traits: { ...draftCopilot?.configuration?.traits },
        provider: { ...draftCopilot?.configuration?.provider },
        appearance: {
          ...draftCopilot?.configuration?.appearance,
          themeId: draftCopilot?.configuration?.appearance?.themeId,
          font: { ...draftCopilot?.configuration?.appearance?.font },
          colors: { ...draftCopilot?.configuration?.appearance?.colors },
        },
      },
    };

    console.log("payloadToSend", JSON.stringify(payloadToSend));

    if (!merchantId || !sallaStoreInfo?.email) {
      console.error("Missing merchantId or ownerEmail for updateCopilot");
      return;
    }

    try {
      await updateCopilot(
        {
          sallaStoreId: merchantId,
          ownerEmail: sallaStoreInfo.activeAdminStoreUser.email,
          data: payloadToSend,
        },
        token ?? "",
      );
      setBaselineCopilot(structuredClone(draftCopilot));
      console.log("Copilot updated successfully");
    } catch (err) {
      console.error("updateCopilot failed:", err);
    }
  };

  const onDiscard = () => setDraftCopilot(structuredClone(baselineCopilot));

  //   useEffect(() => {
  //     if (
  //       settingsFetcher.state === "idle" &&
  //       settingsFetcher.data &&
  //       (settingsFetcher.data as any).ok !== undefined
  //     ) {
  //       if ((settingsFetcher.data as any).ok) {
  //         setBaselineCopilot(structuredClone(draftCopilot));
  //         shopify.toast.show("Settings updated");
  //         shopify.saveBar.hide("save-bar");
  //       } else {
  //         const errorMessage =
  //           (settingsFetcher.data as any)?.error ||
  //           (settingsFetcher.data as any)?.api?.message ||
  //           "Failed to update settings";

  //         shopify.toast.show(errorMessage);
  //       }
  //     }
  //   }, [settingsFetcher.state]);

  //   useEffect(() => {
  //     if (settingsFetcher.state !== "idle") return;
  //     const d: any = settingsFetcher.data;

  //     if (d?.ok) {
  //       // refresh loader data so latest config comes (optional but recommended)
  //       revalidator.revalidate();

  //       // ✅ force copilot re-init (only if panel is open)
  //       if (showSecondItem) {
  //         setCopilotReloadKey((k) => k + 1);
  //       }
  //     }
  //   }, [settingsFetcher.state]);

  const isDirty = useMemo(() => {
    return JSON.stringify(draftCopilot) !== JSON.stringify(baselineCopilot);
  }, [draftCopilot, baselineCopilot]);

  //   useEffect(() => {
  //     if (isDirty) {
  //       shopify.saveBar.show("save-bar");
  //     } else {
  //       shopify.saveBar.hide("save-bar");
  //     }
  //   }, [isDirty, shopify]);

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!validateBeforeSave()) {
      return;
    }
    setIsSaving(true);
    try {
      await onSave();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    onDiscard();
    setNameError("");
    setPersonaError("");
  };

  const [selectedThemeId, setSelectedThemeId] = useState<string>("");
  //draftCopilot?.configuration?.appearance?.themeId || "";

  const templateOptions = useMemo(() => {
    return Object.entries(THEMES).map(([themeId, t]: any) => ({
      themeId,
      label: t.label,
      color: t.appearance?.primaryButton || "#7A5AF5",
    }));
  }, []);

  //   //const [personaDraft, setPersonaDraft] = useState(draftCopilot?.persona || "");
  //   const [personaDraft, setPersonaDraft] = useState("");
  //   const isPersonaDirty = useMemo(() => {
  //     return personaDraft !== (draftCopilot?.persona || "");
  //   }, [personaDraft, draftCopilot?.persona]);

  //   useEffect(() => {
  //     setPersonaDraft(draftCopilot?.persona || "");
  //   }, [draftCopilot?.persona]);

  const [iconPreviewUrl, setIconPreviewUrl] = useState<string>(""); // local blob url
  const [pendingIconCdnPath, setPendingIconCdnPath] = useState<string>(""); // cdn_path to send on save
  const [embedEnabled, setEmbedEnabled] = useState<boolean>(
    Boolean(existingData?.isEnableAppEmbed)
  );

  useEffect(() => {
    setEmbedEnabled(Boolean(existingData?.isEnableAppEmbed));
  }, [existingData?.isEnableAppEmbed]);

  const onToggleEmbed = (checked: boolean) => {
    window.open(existingData?.appEmbedUrl, '_blank');
  };

  const triggerIconPicker = () => {
    const el = document.getElementById(
      "copilot-icon-input",
    ) as HTMLInputElement | null;
    el?.click();
  };

  const onPickIconFile = async (file: File) => {
    setIconError("");
    if (!file) return;

    // validate
    if (file.type !== "image/png") {
      embedded.ui.toast.error("Please upload PNG only");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      embedded.ui.toast.error("Max file size is 2MB");
      return;
    }

    const localUrl = URL.createObjectURL(file);
    setIconPreviewUrl(localUrl);

    setIconUploading(true);

    try {
      if (!merchantId || !sallaStoreInfo?.email) {
        throw new Error("Missing merchantId or ownerEmail for icon upload");
      }

      // 1) Get signed upload URL from backend
      const initResponse = await iconInit(
        {
          sallaStoreId: merchantId,
          ownerEmail: sallaStoreInfo.email,
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
        },
        token ?? "",
      );

      if (!initResponse?.ok) {
        throw new Error(initResponse?.error || "Icon init failed");
      }

      const signed = initResponse?.signed?.data;
      const { method = "PUT", url, fields, cdn_path } = signed || {};

      if (!url || !cdn_path) {
        throw new Error("Missing signed URL or cdn_path from icon init");
      }

      // 2) Upload the file directly to the signed URL
      if (fields) {
        // Multipart / S3-style POST
        const uploadForm = new FormData();
        Object.entries(fields).forEach(([k, v]) =>
          uploadForm.append(k, v as string),
        );
        uploadForm.append("file", file);
        await fetch(url, { method: "POST", body: uploadForm });
      } else {
        // Simple PUT
        await fetch(url, {
          method,
          headers: { "Content-Type": file.type },
          body: file,
        });
      }

      // 3) Store the cdn_path so it's included in the next save
      const localUrl = URL.createObjectURL(file);
      setIconPreviewUrl(localUrl);
      setPendingIconCdnPath(cdn_path);
      console.log("Icon uploaded, cdn_path:", cdn_path);
    } catch (err) {
      console.error("Icon upload failed:", err);
      setIconError(String(err));
    } finally {
      setIconUploading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (iconPreviewUrl) URL.revokeObjectURL(iconPreviewUrl);
    };
  }, [iconPreviewUrl]);

  //   useEffect(() => {
  //     // if (iconInitFetcher.state !== "idle") return;
  //     if (!iconUploading) return;

  //     const data: any = iconInitFetcher.data;
  //     if (!data?.ok) {
  //       setIconUploading(false);
  //       const msg = data?.error || "Init failed";
  //       setIconError(msg);
  //       //   shopify.toast.show(msg);
  //       return;
  //     }

  //     const signed = data?.signed?.data;
  //     const { url, fields, cdn_path } = signed || {};
  //     if (!url || !cdn_path) {
  //       setIconUploading(false);
  //       //   shopify.toast.show("Signed response missing url/cdn_path");
  //       return;
  //     }

  //     (async () => {
  //       try {
  //         if (!pickedFile) throw new Error("No file selected");

  //         // ✅ wait for upload to finish
  //         await Pixelbin.upload(pickedFile, { url, fields });

  //         // ✅ ONLY store cdn_path for later save
  //         setPendingIconCdnPath(cdn_path);

  //         // Optional: also keep in draft (but preview will still override)
  //         updateDraft(["icon"], cdn_path);

  //         shopify.toast.show("Uploaded. Click Save to apply.");
  //       } catch (e: any) {
  //         const msg = e?.message || "Upload failed";
  //         setIconError(msg);
  //         shopify.toast.show(msg);

  //         // if upload fails, remove preview too (optional UX)
  //         setIconPreviewUrl("");
  //         setPendingIconCdnPath("");
  //       } finally {
  //         setIconUploading(false);
  //         setPickedFile(null);
  //       }
  //     })();
  //   }, [iconInitFetcher.state, iconInitFetcher.data]);

  //   useEffect(() => {
  //     if (settingsFetcher.state !== "idle") return;
  //     const d: any = settingsFetcher.data;
  //     if (d?.ok) {
  //       // ✅ remove optimistic preview
  //       if (iconPreviewUrl) URL.revokeObjectURL(iconPreviewUrl);
  //       setIconPreviewUrl("");
  //       setPendingIconCdnPath("");

  //       // ✅ refresh loader so existingData.copilot.icon updated shows
  //       revalidator.revalidate();
  //     }
  //   }, [settingsFetcher.state]);

  useEffect(() => {
    const modal = document.getElementById("modal") as HTMLElement | null;
    if (!modal) return;

    const onHide = () => {
      const url = new URL(window.location.href);
      if (url.searchParams.get("op") === "1") {
        url.searchParams.delete("op");
        window.history.replaceState({}, document.title, url.toString());
      }
    };

    modal.addEventListener("hide", onHide);

    return () => {
      modal.removeEventListener("hide", onHide);
    };
  }, []);

  const handleUpgrade = () => {
    if (isDirty) {
      const ok = window.confirm("You have unsaved changes. Leave this page?");
      if (!ok) return;
    }
    // shopify.saveBar.hide("save-bar");
    navigate("/app/subscription");
  };

  return (

    <div className="mx-auto w-full max-w-7xl px-4 py-6 my-5">
      <div className="relative mt-4">
        {/* Save bar — slides in from top when there are unsaved changes */}
        <div
          className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between gap-3 px-5 py-3 shadow-md transition-transform duration-300 ${isDirty ? "translate-y-0" : "-translate-y-25"
            }`}
          style={{
            backgroundColor: "var(--salla-background-color)",
            borderBottom: "1px solid var(--salla-secondary-color)",
          }}
        >
          <p className="text-sm font-medium" style={{ color: "var(--salla-primary-color)" }}>
            Unsaved changes
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDiscard}
              disabled={isSaving}
              className="cursor-pointer inline-flex items-center justify-center rounded-lg border px-4 py-1.5 text-sm font-medium transition disabled:opacity-50"
              style={{
                borderColor: "var(--salla-secondary-color)",
                color: "var(--salla-primary-color)",
              }}
            >
              Discard
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || !!nameError || !!personaError}
              className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-lg px-4 py-1.5 text-sm font-semibold transition disabled:opacity-50"
              style={{
                backgroundColor: "var(--salla-secondary-color)",
                color: "var(--salla-light-mode-primary-color)",
              }}
            >
              {isSaving ? (
                <>
                  <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Saving…
                </>
              ) : (
                "Save"
              )}
            </button>
          </div>
        </div>
        <div
          className={`grid gap-6 ${showSecondItem
            ? "grid-cols-1 lg:grid-cols-[1fr_360px]"
            : "grid-cols-1"
            }`}
        >
          {/* LEFT COLUMN */}
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                {/* Avatar + update pill */}
                <div className="relative">
                  <div className="h-14 w-14 overflow-hidden rounded-xl border border-gray-200 bg-white">
                    <img
                      className="h-full w-full object-contain"
                      src={
                        iconPreviewUrl ||
                        existingData?.data?.copilot?.icon ||
                        "https://cdn.shopify.com/s/files/1/0768/5410/0025/files/Bot_Logo-2.avif?v=1767817849"
                      }
                      alt="Agent avatar"
                    />
                  </div>

                  <div className="group absolute -bottom-2 right-1">
                    <button
                      type="button"
                      className="flex items-center gap-2 rounded-lg bg-gray-200 px-2 py-1 text-sm font-medium text-[var(--salla-primary-color)] transition hover:text-white cursor-pointer"
                      onClick={() => !iconUploading && triggerIconPicker()}
                      disabled={iconUploading}
                    >
                      {iconUploading ? (
                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-black" />
                      ) : (
                        <span className="text-sm leading-none">⬆</span>
                      )}
                    </button>
                    <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded bg-[var(--salla-background-color)] px-2 py-1 text-xs text-[var(--salla-primary-color)] opacity-0 transition-opacity group-hover:opacity-100 border border-[var(--salla-border-color)]">
                      Upload icon
                      <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent " />
                    </div>
                  </div>

                  {/* hidden input */}
                  {/* hidden input */}
                  <input
                    id="copilot-icon-input"
                    type="file"
                    accept="image/png"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const f = (e.target as HTMLInputElement).files?.[0];
                      if (f) onPickIconFile(f);
                      (e.target as HTMLInputElement).value = "";
                    }}
                  />
                </div>

                {/* Greeting */}
                <div className="pt-1">
                  <h2 className="text-2xl font-semibold text-[var(--salla-primary-color)]">
                    {existingData?.data?.copilot?.name || "Gaurang"}{" "}
                    <span className="align-middle">👋🏻</span>
                  </h2>
                  <p className="mt-1 text-sm text-[var(--salla-secondary-font-color)]">
                    Welcome back to Kaily
                  </p>
                </div>
              </div>

              {/* Toggle right action */}
              <button
                onClick={() => setShowSecondItem(!showSecondItem)}
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl transition border border-[var(--salla-secondary-color)] text-[var(--salla-secondary-color)]"
              >
                <p className="text-sm py-2 font-medium p-2 text-[var(--salla-primary-color)] ">
                  {showSecondItem ? "Hide Agent" : "Test Agent"}
                </p>
              </button>
            </div>

            {/* Enable app card */}
            <div className="rounded-2xl border border-[var(--salla-border-color)] bg-[var(--salla-background-color)] px-5 py-2   mb-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 justify-center align-center">
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-medium text-[var(--salla-primary-color)]">
                      Enable app on your store
                    </p>
                    {embedEnabled ? (
                      <></>
                    ) : (
                      <span className="rounded-full border border-[var(--salla-secondary-color)] p-3 py-0.5 text-xs font-semibold text-[var(--salla-primary-color)]">
                        Off
                      </span>
                    )}
                  </div>
                </div>
                {embedEnabled ?
                  (
                    <button
                      type="button"
                      className="cursor-pointer rounded-xl  px-3 py-1.5   transition border border-[var(--salla-secondary-color)]"
                    >
                      <span className="text-sm font-medium text-[var(--salla-secondary-color)] ">
                        Enabled
                      </span>
                    </button>)
                  :
                  (
                    <button
                      type="button"
                      className="cursor-pointer rounded-xl  px-3 py-1.5   transition bg-[var(--salla-secondary-color)]"
                      onClick={() => onToggleEmbed(!embedEnabled)}
                    >
                      <span className="text-sm font-medium text-[var(--salla-light-mode-primary-color)] ">
                        Turn On
                      </span>
                    </button>

                  )}
              </div>
            </div>

            {/* Main form card */}
            <div className="rounded-2xl border border-[var(--salla-border-color)] bg-[var(--salla-background-color)] p-6  ">
              <div className="space-y-6">
                {/* Row 1: agent name + model */}
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 mb-2">
                  {/* AI agent name */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-[var(--salla-primary-color)]">
                      AI agent name
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-xl border border-[var(--salla-border-color)] bg-[var(--salla-background-color)] px-4 py-2 text-sm !text-[var(--salla-secondary-font-color)] placeholder-[var(--salla-secondary-font-color)]   outline-none transition focus:border-[var(--salla-secondary-color)] focus:ring-1 focus:ring-border-[var(--salla-secondary-color)]"
                      placeholder="Enter AI agent name"
                      value={draftCopilot?.name || ""}
                      onInput={(e) => {
                        const raw = e?.target?.value ?? "";
                        const next = raw.slice(0, NAME_MAX);

                        updateDraft(["name"], next);

                        if (raw.length > NAME_MAX) {
                          setNameError(
                            `Maximum ${NAME_MAX} characters allowed.`,
                          );
                        } else if (!next.trim()) {
                          setNameError("Name is required.");
                        } else {
                          setNameError("");
                        }
                      }}
                    />
                    {!!nameError && (
                      <p className="text-sm font-medium text-red-600">
                        {nameError}
                      </p>
                    )}
                  </div>

                  {/* AI model */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-[var(--salla-primary-color)]">
                      AI model
                    </label>
                    <select className="w-full rounded-xl border border-[var(--salla-border-color)] bg-[var(--salla-background-color)] px-4 py-1 !text-sm !text-[var(--salla-secondary-font-color)] placeholder-[var(--salla-secondary-font-color)]   outline-none transition focus:border-[var(--salla-secondary-color)] focus:ring-1 focus:ring-border-[var(--salla-secondary-color)]">
                      <option value="gpt-3.5-turbo">
                        OpenAI GPT-3.5 Turbo (1 credit/message)
                      </option>
                      <option value="o3-mini">
                        OpenAI GPT-o3-mini (1 credit/message)
                      </option>
                      <option value="gpt-4">
                        OpenAI GPT-4 (10 credits/message)
                      </option>
                      <option value="gpt-4o-mini">
                        OpenAI GPT-4o mini (1 credit/message)
                      </option>
                      <option value="gpt-4.1-nano">
                        OpenAI GPT-4.1 nano (1 credit/message)
                      </option>
                      <option value="gpt-4.1-mini">
                        OpenAI GPT-4.1 mini (1 credit/message)
                      </option>
                      <option value="gpt-4.1">
                        OpenAI GPT-4.1 (10 credit/message)
                      </option>
                      <option value="o4-mini">
                        OpenAI GPT-o4 mini (1 credit/message)
                      </option>
                      <option value="gpt-4o">
                        OpenAI GPT-4o (5 credits/message)
                      </option>
                      <option value="gpt-5">
                        OpenAI GPT-5 (10 credit/message)
                      </option>
                      <option value="gpt-5-mini">
                        OpenAI GPT-5 mini (1 credit/message)
                      </option>
                      <option value="gpt-5-nano">
                        OpenAI GPT-5 nano (1 credit/message)
                      </option>
                      <option value="gpt-5.2">
                        OpenAI GPT-5.2 (5 credit/message)
                      </option>
                      <option value="gemini-2.0-flash">
                        Google Gemini-2.0 Flash (1 credit/message)
                      </option>
                      <option value="gemini-2.5-flash">
                        Google Gemini-2.5 Flash (1 credit/message)
                      </option>
                      <option value="gemini-2.5-pro">
                        Google Gemini-2.5 Pro (5 credits/message)
                      </option>
                      <option value="claude-3-5-haiku">
                        Anthropic Claude-3.5 Haiku (1 credit/message)
                      </option>
                      <option value="claude-3-5-sonnet">
                        Anthropic Claude-3.5 Sonnet (5 credits/message)
                      </option>
                      <option value="claude-4-opus">
                        Anthropic Claude-4 Opus (10 credits/message)
                      </option>
                      <option value="claude-4-sonnet">
                        Anthropic Claude-4 Sonnet (5 credits/message)
                      </option>
                      <option value="claude-4.5-sonnet">
                        Anthropic Claude-4.5 Sonnet (5 credits/message)
                      </option>
                      <option value="claude-4.5-haiku">
                        Anthropic Claude-4.5 Haiku (10 credits/message)
                      </option>
                      <option value="claude-4.5-opus">
                        Anthropic Claude-4.5 Opus (10 credits/message)
                      </option>
                      <option value="deepseek-chat">
                        DeepSeek-chat (1 credit/message) [experimental]
                      </option>
                      <option value="qwen-turbo">
                        Qwen-Turbo (1 credit/message)
                      </option>
                      <option value="qwen-plus">
                        Qwen-Plus (3 credit/message)
                      </option>
                      <option value="qwen-max">
                        Qwen-Max (11 credit/message)
                      </option>
                    </select>
                  </div>
                </div>

                {/* Row 2: tone */}
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 mb-2">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-[var(--salla-primary-color)]">
                      Tone
                    </label>
                    <select className="w-full rounded-xl border border-[var(--salla-border-color)] bg-[var(--salla-background-color)] px-4 py-1 !text-sm !text-[var(--salla-secondary-font-color)] placeholder-[var(--salla-secondary-font-color)]   outline-none transition focus:border-[var(--salla-secondary-color)] focus:ring-1 focus:ring-border-[var(--salla-secondary-color)]">
                      <option value="professional">Professional</option>
                      <option value="sassy">Sassy</option>
                      <option value="empathetic">Empathetic</option>
                      <option value="formal">Formal</option>
                      <option value="humorous">Humorous</option>
                      <option value="friendly">Friendly</option>
                    </select>
                  </div>
                  <div className="hidden md:block" />
                </div>

                {/* Persona */}
                <div className="space-y-2 mb-1">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-[var(--salla-primary-color)]">
                      Persona
                    </label>
                    <span className="text-sm text-[var(--salla-secondary-font-color)]">
                      Note: Your AI Agent will act according to these
                      guidelines.
                    </span>
                  </div>

                  <textarea
                    rows={6}
                    className="w-full rounded-xl border border-[var(--salla-border-color)] bg-[var(--salla-background-color)] px-4 py-2 text-sm !text-[var(--salla-secondary-font-color)] placeholder-[var(--salla-secondary-font-color)]   outline-none transition focus:border-[var(--salla-secondary-color)] focus:ring-1 focus:ring-border-[var(--salla-secondary-color)]"
                    placeholder="**Role:** You are an E-commerce Shopping Assistant..."
                  />
                </div>

                {/* Appearance */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-semibold text-[var(--salla-primary-color)]">
                      Appearance
                    </h3>

                    {/* Segmented control */}
                    <div className="inline-flex  border border-[var(--salla-border-color)] rounded-xl bg-[var(--salla-background-color)] p-1">
                      <button
                        type="button"
                        onClick={() => setActiveTab("template")}
                        className={`cursor-pointer rounded-lg px-3 py-1.5  transition ${activeTab === "template"
                          ? "bg-[var(--salla-secondary-color)] text-[var(--salla-light-mode-primary-color)]  "
                          : "!text-[var(--salla-secondary-font-color)]"
                          }`}
                      >
                        <p className="text-sm font-medium">Predefined</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab("customize")}
                        className={`cursor-pointer rounded-lg px-3 py-1.5 text-sm font-medium transition ${activeTab === "customize"
                          ? "bg-[var(--salla-secondary-color)] text-[var(--salla-light-mode-primary-color)]  "
                          : "!text-[var(--salla-secondary-font-color)]"
                          }`}
                      >
                        <p className="text-sm font-medium">Custom</p>
                      </button>
                    </div>
                  </div>

                  {/* Templates */}
                  {activeTab === "template" && (
                    <div className="flex flex-wrap gap-3">
                      {templateOptions.map((t) => {
                        const selected = t.themeId === selectedThemeId;
                        return (
                          <button
                            key={t.themeId}
                            type="button"
                            onClick={() => {
                              const theme = THEMES[t.themeId];
                              setSelectedThemeId(t.themeId);
                              updateDraft(
                                ["configuration", "appearance", "themeId"],
                                t.themeId,
                              );
                              updateDraft(
                                ["configuration", "appearance", "colors"],
                                {
                                  ...theme.appearance,
                                },
                              );
                              updateDraft(
                                ["configuration", "appearance", "font"],
                                {
                                  family: theme.font.family,
                                },
                              );
                            }}
                            className={`cursor-pointer rounded-xl p-0.5 transition ${selected
                              ? "ring-1 ring-[var(--salla-secondary-color)]"
                              : "ring-1 ring-transparent hover:ring-[var(--salla-border-color)]"
                              }`}
                            title={t.themeId}
                          >
                            <span
                              className="block h-10 w-10 rounded-lg"
                              style={{ backgroundColor: t.color }}
                            />
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Customize */}
                  {activeTab === "customize" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2 flex flex-col">
                          <label className="text-sm font-medium text-[var(--salla-primary-color)] mb-1">
                            Layout background
                          </label>
                          <div className="flex items-center gap-2 rounded-md border border-[var(--salla-border-color)] bg-[var(--salla-background-color)] p-1 w-full max-w-xs">
                            {/* Left: color picker */}
                            <input
                              type="color"
                              value={
                                draftCopilot?.configuration?.appearance?.colors
                                  ?.layoutBackground || "#ffffff"
                              }
                              onChange={(e: any) =>
                                updateDraft(
                                  [
                                    "configuration",
                                    "appearance",
                                    "colors",
                                    "layoutBackground",
                                  ],
                                  e?.target?.value,
                                )
                              }
                              className="h-6 w-6 cursor-pointer rounded-sm  p-0"
                            />

                            {/* Right: hex code */}
                            <input
                              type="text"
                              value={
                                draftCopilot?.configuration?.appearance?.colors
                                  ?.layoutBackground || "#ffffff"
                              }
                              readOnly
                              className="w-full bg-transparent text-sm !text-[var(--salla-secondary-font-color)] outline-none"
                            />
                          </div>
                        </div>
                        <div className="space-y-2 flex flex-col">
                          <label className="text-sm font-medium text-[var(--salla-primary-color)] mb-1">
                            Minimized background
                          </label>
                          <div className="flex items-center gap-2 rounded-md border border-[var(--salla-border-color)] bg-[var(--salla-background-color)] p-1 w-full max-w-xs">
                            {/* Left: color picker */}
                            <input
                              type="color"
                              value={
                                draftCopilot?.configuration?.appearance?.colors
                                  ?.minimizedBackgroundColor || "#ffffff"
                              }
                              onChange={(e: any) =>
                                updateDraft(
                                  [
                                    "configuration",
                                    "appearance",
                                    "colors",
                                    "minimizedBackgroundColor",
                                  ],
                                  e?.target?.value,
                                )
                              }
                              className="h-6 w-6 cursor-pointer rounded-sm   p-0"
                            />

                            {/* Right: hex code */}
                            <input
                              type="text"
                              value={
                                draftCopilot?.configuration?.appearance?.colors
                                  ?.minimizedBackgroundColor || "#ffffff"
                              }
                              readOnly
                              className="w-full bg-transparent text-sm !text-[var(--salla-secondary-font-color)] outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                        <div className="space-y-2 flex flex-col">
                          <label className="text-sm font-medium text-[var(--salla-primary-color)] mb-1">
                            Input background
                          </label>
                          <div className="flex items-center gap-2 rounded-md border border-[var(--salla-border-color)] bg-[var(--salla-background-color)] p-1 w-full max-w-xs">
                            {/* Left: color picker */}
                            <input
                              type="color"
                              value={
                                draftCopilot?.configuration?.appearance?.colors
                                  ?.inputBackground || "#ffffff"
                              }
                              onChange={(e: any) =>
                                updateDraft(
                                  [
                                    "configuration",
                                    "appearance",
                                    "colors",
                                    "inputBackground",
                                  ],
                                  e?.target?.value,
                                )
                              }
                              className="h-6 w-6 cursor-pointer rounded-sm   p-0"
                            />

                            {/* Right: hex code */}
                            <input
                              type="text"
                              value={
                                draftCopilot?.configuration?.appearance?.colors
                                  ?.inputBackground || "#ffffff"
                              }
                              readOnly
                              className="w-full bg-transparent text-sm !text-[var(--salla-secondary-font-color)] outline-none"
                            />
                          </div>
                        </div>
                        <div className="space-y-2 flex flex-col">
                          <label className="text-sm font-medium text-[var(--salla-primary-color)] mb-1">
                            Input font
                          </label>
                          <div className="flex items-center gap-2 rounded-md border border-[var(--salla-border-color)] bg-[var(--salla-background-color)] p-1 w-full max-w-xs">
                            {/* Left: color picker */}
                            <input
                              type="color"
                              value={
                                draftCopilot?.configuration?.appearance?.colors
                                  ?.inputFontColor || "#ffffff"
                              }
                              onChange={(e: any) =>
                                updateDraft(
                                  [
                                    "configuration",
                                    "appearance",
                                    "colors",
                                    "inputFontColor",
                                  ],
                                  e?.target?.value,
                                )
                              }
                              className="h-6 w-6 cursor-pointer rounded-sm   p-0"
                            />

                            {/* Right: hex code */}
                            <input
                              type="text"
                              value={
                                draftCopilot?.configuration?.appearance?.colors
                                  ?.inputFontColor || "#ffffff"
                              }
                              readOnly
                              className="w-full bg-transparent text-sm !text-[var(--salla-secondary-font-color)] outline-none"
                            />
                          </div>
                        </div>
                        <div className="space-y-2 flex flex-col">
                          <label className="text-sm font-medium text-[var(--salla-primary-color)] mb-1">
                            Primary Button
                          </label>
                          <div className="flex items-center gap-2 rounded-md border border-[var(--salla-border-color)] bg-[var(--salla-background-color)] p-1 w-full max-w-xs">
                            {/* Left: color picker */}
                            <input
                              type="color"
                              value={
                                draftCopilot?.configuration?.appearance?.colors
                                  ?.primaryButton || "#ffffff"
                              }
                              onChange={(e: any) =>
                                updateDraft(
                                  [
                                    "configuration",
                                    "appearance",
                                    "colors",
                                    "primaryButton",
                                  ],
                                  e?.target?.value,
                                )
                              }
                              className="h-6 w-6 cursor-pointer rounded-sm   p-0"
                            />

                            {/* Right: hex code */}
                            <input
                              type="text"
                              value={
                                draftCopilot?.configuration?.appearance?.colors
                                  ?.primaryButton || "#ffffff"
                              }
                              readOnly
                              className="w-full bg-transparent text-sm !text-[var(--salla-secondary-font-color)] outline-none"
                            />
                          </div>
                        </div>
                        <div className="space-y-2 flex flex-col">
                          <label className="text-sm font-medium text-[var(--salla-primary-color)] mb-1">
                            Border/stroke
                          </label>
                          <div className="flex items-center gap-2 rounded-md border border-[var(--salla-border-color)] bg-[var(--salla-background-color)] p-1 w-full max-w-xs">
                            {/* Left: color picker */}
                            <input
                              type="color"
                              value={
                                draftCopilot?.configuration?.appearance?.colors
                                  ?.borderColor || "#ffffff"
                              }
                              onChange={(e: any) =>
                                updateDraft(
                                  [
                                    "configuration",
                                    "appearance",
                                    "colors",
                                    "borderColor",
                                  ],
                                  e?.target?.value,
                                )
                              }
                              className="h-6 w-6 cursor-pointer rounded-sm   p-0"
                            />

                            {/* Right: hex code */}
                            <input
                              type="text"
                              value={
                                draftCopilot?.configuration?.appearance?.colors
                                  ?.borderColor || "#ffffff"
                              }
                              readOnly
                              className="w-full bg-transparent text-sm !text-[var(--salla-secondary-font-color)] outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                        <div className="space-y-2 flex flex-col">
                          <label className="text-sm font-medium text-[var(--salla-primary-color)] mb-1">
                            Agent reply bg
                          </label>
                          <div className="flex items-center gap-2 rounded-md border border-[var(--salla-border-color)] bg-[var(--salla-background-color)] p-1 w-full max-w-xs">
                            {/* Left: color picker */}
                            <input
                              type="color"
                              value={
                                draftCopilot?.configuration?.appearance?.colors
                                  ?.copilotReplyBackground || "#ffffff"
                              }
                              onChange={(e: any) =>
                                updateDraft(
                                  [
                                    "configuration",
                                    "appearance",
                                    "colors",
                                    "copilotReplyBackground",
                                  ],
                                  e?.target?.value,
                                )
                              }
                              className="h-6 w-6 cursor-pointer rounded-sm   p-0"
                            />

                            {/* Right: hex code */}
                            <input
                              type="text"
                              value={
                                draftCopilot?.configuration?.appearance?.colors
                                  ?.copilotReplyBackground || "#ffffff"
                              }
                              readOnly
                              className="w-full bg-transparent text-sm !text-[var(--salla-secondary-font-color)] outline-none"
                            />
                          </div>
                        </div>
                        <div className="space-y-2 flex flex-col">
                          <label className="text-sm font-medium text-[var(--salla-primary-color)] mb-1">
                            Agent font color
                          </label>
                          <div className="flex items-center gap-2 rounded-md border border-[var(--salla-border-color)] bg-[var(--salla-background-color)] p-1 w-full max-w-xs">
                            {/* Left: color picker */}
                            <input
                              type="color"
                              value={
                                draftCopilot?.configuration?.appearance?.colors
                                  ?.copilotFontColor || "#ffffff"
                              }
                              onChange={(e: any) =>
                                updateDraft(
                                  [
                                    "configuration",
                                    "appearance",
                                    "colors",
                                    "copilotFontColor",
                                  ],
                                  e?.target?.value,
                                )
                              }
                              className="h-6 w-6 cursor-pointer rounded-sm   p-0"
                            />

                            {/* Right: hex code */}
                            <input
                              type="text"
                              value={
                                draftCopilot?.configuration?.appearance?.colors
                                  ?.copilotFontColor || "#ffffff"
                              }
                              readOnly
                              className="w-full bg-transparent text-sm !text-[var(--salla-secondary-font-color)] outline-none"
                            />
                          </div>
                        </div>
                        <div className="space-y-2 flex flex-col">
                          <label className="text-sm font-medium text-[var(--salla-primary-color)] mb-1">
                            User reply bg
                          </label>
                          <div className="flex items-center gap-2 rounded-md border border-[var(--salla-border-color)] bg-[var(--salla-background-color)] p-1 w-full max-w-xs">
                            {/* Left: color picker */}
                            <input
                              type="color"
                              value={
                                draftCopilot?.configuration?.appearance?.colors
                                  ?.userReplyBackground || "#ffffff"
                              }
                              onChange={(e: any) =>
                                updateDraft(
                                  [
                                    "configuration",
                                    "appearance",
                                    "colors",
                                    "userReplyBackground",
                                  ],
                                  e?.target?.value,
                                )
                              }
                              className="h-6 w-6 cursor-pointer rounded-sm   p-0"
                            />

                            {/* Right: hex code */}
                            <input
                              type="text"
                              value={
                                draftCopilot?.configuration?.appearance?.colors
                                  ?.userReplyBackground || "#ffffff"
                              }
                              readOnly
                              className="w-full bg-transparent text-sm !text-[var(--salla-secondary-font-color)] outline-none"
                            />
                          </div>
                        </div>
                        <div className="space-y-2 flex flex-col">
                          <label className="text-sm font-medium text-[var(--salla-primary-color)] mb-1">
                            User font
                          </label>
                          <div className="flex items-center gap-2 rounded-md border border-[var(--salla-border-color)] bg-[var(--salla-background-color)] p-1 w-full max-w-xs">
                            {/* Left: color picker */}
                            <input
                              type="color"
                              value={
                                draftCopilot?.configuration?.appearance?.colors
                                  ?.userFontColor || "#ffffff"
                              }
                              onChange={(e: any) =>
                                updateDraft(
                                  [
                                    "configuration",
                                    "appearance",
                                    "colors",
                                    "userFontColor",
                                  ],
                                  e?.target?.value,
                                )
                              }
                              className="h-6 w-6 cursor-pointer rounded-sm  p-0"
                            />

                            {/* Right: hex code */}
                            <input
                              type="text"
                              value={
                                draftCopilot?.configuration?.appearance?.colors
                                  ?.userFontColor || "#ffffff"
                              }
                              readOnly
                              className="w-full bg-transparent text-sm !text-[var(--salla-secondary-font-color)] outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2 flex flex-col">
                          <label className="text-sm font-medium text-[var(--salla-primary-color)] mb-1">
                            Font
                          </label>
                          <select
                            className="w-full appearance-none rounded-xl border border-[var(--salla-border-color)] bg-[var(--salla-background-color)] px-4 py-2 text-sm !text-[var(--salla-primary-color)]   outline-none transition focus:border-[var(--salla-secondary-color)]  focus:ring-[var(--salla-secondary-color)]"
                            value={
                              draftCopilot?.configuration?.appearance?.font
                                ?.family || ""
                            }
                            onChange={(e: any) => {
                              const family = e?.target?.value;

                              const linkMap: any = {
                                roboto:
                                  "https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&display=swap",
                                "open-sans":
                                  "https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;600;700;800&display=swap",
                                lato: "https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700;900&display=swap",
                                nunito:
                                  "https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700;800;900&display=swap",
                                poppins:
                                  "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap",
                                "source-sans-pro":
                                  "https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@300;400;600;700;900&display=swap",
                                raleway:
                                  "https://fonts.googleapis.com/css2?family=Raleway:wght@300;400;500;600;700;800;900&display=swap",
                                montserrat:
                                  "https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&display=swap",
                                merriweather:
                                  "https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700;900&display=swap",
                                "playfair-display":
                                  "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800;900&display=swap",
                                ubuntu:
                                  "https://fonts.googleapis.com/css2?family=Ubuntu:wght@300;400;500;700&display=swap",
                                "amatic-sc":
                                  "https://fonts.googleapis.com/css2?family=Amatic+SC:wght@400;700&display=swap",
                                "work-sans":
                                  "https://fonts.googleapis.com/css2?family=Work+Sans:wght@300;400;500;600;700;800;900&display=swap",
                                "pt-sans":
                                  "https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap",
                                quicksand:
                                  "https://fonts.googleapis.com/css2?family=Quicksand:wght@300;400;500;600;700&display=swap",
                                "balsamiq-sans":
                                  "https://fonts.googleapis.com/css2?family=Balsamiq+Sans:wght@400;700&display=swap",
                                rubik:
                                  "https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700;800;900&display=swap",
                                "comic-neue":
                                  "https://fonts.googleapis.com/css2?family=Comic+Neue:wght@300;400;700&display=swap",
                                "exo-2":
                                  "https://fonts.googleapis.com/css2?family=Exo+2:wght@300;400;500;600;700;800;900&display=swap",
                                "josefin-sans":
                                  "https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@300;400;500;600;700&display=swap",
                                "titillium-web":
                                  "https://fonts.googleapis.com/css2?family=Titillium+Web:wght@300;400;600;700;900&display=swap",
                                "ibm-plex-sans":
                                  "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap",
                                karla:
                                  "https://fonts.googleapis.com/css2?family=Karla:wght@300;400;500;600;700;800&display=swap",
                                asap: "https://fonts.googleapis.com/css2?family=Asap:wght@400;500;600;700&display=swap",
                                cabin:
                                  "https://fonts.googleapis.com/css2?family=Cabin:wght@400;500;600;700&display=swap",
                                chewy:
                                  "https://fonts.googleapis.com/css2?family=Chewy&display=swap",
                                tajawal:
                                  "https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;900&display=swap",
                                "noto-sans":
                                  "https://fonts.googleapis.com/css2?family=Noto+Sans:wght@300;400;500;600;700;800;900&display=swap",
                                pacifico:
                                  "https://fonts.googleapis.com/css2?family=Pacifico&display=swap",
                                lexend:
                                  "https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700;800;900&display=swap",
                                inter:
                                  "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap",
                              };

                              updateDraft(
                                [
                                  "configuration",
                                  "appearance",
                                  "font",
                                  "family",
                                ],
                                family,
                              );
                              updateDraft(
                                ["configuration", "appearance", "font", "link"],
                                linkMap[family] || "",
                              );
                            }}
                          >
                            <option value="roboto">Roboto</option>
                            <option value="open-sans">Open Sans</option>
                            <option value="lato">Lato</option>
                            <option value="nunito">Nunito</option>
                            <option value="poppins">Poppins</option>
                            <option value="source-sanpro">
                              Source Sans Pro
                            </option>
                            <option value="raleway">Raleway</option>
                            <option value="montserrat">Montserrat</option>
                            <option value="merriweather">Merriweather</option>
                            <option value="playfair-display">
                              Playfair Display
                            </option>
                            <option value="ubuntu">Ubuntu</option>
                            <option value="amatic-sc">Amatic SC</option>
                            <option value="work-sans">Work Sans</option>
                            <option value="pt-sans">PT Sans</option>
                            <option value="quicksand">Quicksand</option>
                            <option value="balsamiq-sans">Balsamiq Sans</option>
                            <option value="rubik">Rubik</option>
                            <option value="comic-neue">Comic Neue</option>
                            <option value="exo-2">Exo 2</option>
                            <option value="josefin-sans">Josefin Sans</option>
                            <option value="titillium-web">Titillium Web</option>
                            <option value="ibm-plex-sans">IBM Plex Sans</option>
                            <option value="karla">Karla</option>
                            <option value="asap">Asap</option>
                            <option value="cabin">Cabin</option>
                            <option value="chewy">Chewy</option>
                            <option value="tajawal">Tajawal</option>
                            <option value="noto-sans">Noto Sans</option>
                            <option value="pacifico">Pacifico</option>
                            <option value="lexend">Lexend</option>
                            <option value="inter">Inter</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Plan card (matches screenshot’s lower card vibe) */}
            <div className="rounded-2xl border border-[var(--salla-border-color)] bg-[var(--salla-background-color)] p-6  ">
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-[var(--salla-primary-color)]">
                      {planName}
                    </h3>
                    <span className="rounded-full border border-[var(--salla-secondary-color)] px-2 py-0.5 !text-sm font-medium text-[var(--salla-primary-color)]">
                      Active
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-[var(--salla-secondary-font-color)]">
                    Expires on {formattedDate}
                  </p>
                </div>

                <button
                  type="button"
                  className="cursor-pointer rounded-xl bg-[var(--salla-secondary-color)] px-4 py-2  font-semibold text-white"
                  onClick={handleUpgrade}
                >
                  <span className="text-sm font-medium text-[var(--salla-light-mode-primary-color)] ">
                    Upgrade Now
                  </span>
                </button>
              </div>

              <div className="mt-6 space-y-5">
                {/* Progress row */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* AI Agents allowed */}
                  <div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-[var(--salla-secondary-font-color)]">
                        AI Agents allowed
                      </p>
                      <p className="text-sm font-semibold text-[var(--salla-secondary-font-color)]">
                        {appUsed} / {appTotal}
                      </p>
                    </div>

                    <div className="mt-2 h-2 w-full rounded-md border border-[var(--salla-border-color)] bg-[var(--salla-background-color)]">
                      <div
                        className="h-2 rounded-md border border-[var(--salla-border-color)] bg-[var(--salla-secondary-color)] transition-[width] duration-300"
                        style={{ width: `${appPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Message credits left */}
                  <div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-[var(--salla-secondary-font-color)]">
                        Message credits left
                      </p>
                      <p className="text-sm font-semibold text-[var(--salla-secondary-font-color)]">
                        {qUsed} / {qTotal}
                      </p>
                    </div>

                    <div className="mt-2 h-2 w-full rounded-md border border-[var(--salla-border-color)] bg-[var(--salla-background-color)]">
                      <div
                        className="h-2 rounded-md border border-[var(--salla-border-color)] bg-[var(--salla-secondary-color)] transition-[width] duration-300"
                        style={{ width: `${qPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {showMore && (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Training characters left */}
                    <div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-[var(--salla-secondary-font-color)]">
                          Training characters left
                        </p>
                        <p className="text-sm font-semibold text-[var(--salla-secondary-font-color)]">
                          {dssyUsed} / {dssyTotal}
                        </p>
                      </div>

                      <div className="mt-2 h-2 w-full rounded-md border border-[var(--salla-border-color)] bg-[var(--salla-background-color)]">
                        <div
                          className="h-2 rounded-md border border-[var(--salla-border-color)] bg-[var(--salla-secondary-color)] transition-[width] duration-300"
                          style={{ width: `${dssyPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Data sources */}
                    <div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-[var(--salla-secondary-font-color)]">
                          Data sources
                        </p>
                        <p className="text-sm font-semibold text-[var(--salla-secondary-font-color)]">
                          {dsUsed} / {dsTotal}
                        </p>
                      </div>

                      <div className="mt-2 h-2 w-full rounded-md border border-[var(--salla-border-color)] bg-[var(--salla-background-color)]">
                        <div
                          className="h-2 rounded-md border border-[var(--salla-border-color)] bg-[var(--salla-secondary-color)] transition-[width] duration-300"
                          style={{ width: `${dsPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setShowMore(!showMore)}
                  className="cursor-pointer inline-flex items-center rounded-lg px-3 py-2 !text-sm font-medium !text-[var(--salla-primary-color)] transition border border-[var(--salla-secondary-color)]"
                >
                  {showMore ? "Show less" : "Show more"}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (Agent panel) */}
          {showSecondItem && (
            <aside className="hidden lg:block">
              <div className="sticky top-4 h-[calc(100vh-2rem)] overflow-hidden rounded-2xl border border-[var(--salla-border-color)] bg-[var(--salla-background-color)]  ">
                <div className="flex h-full flex-col">
                  <div className="border-b border-[var(--salla-border-color)] px-4 py-3">
                    <p className="text-sm font-semibold text-[var(--salla-primary-color)]">
                      Agent
                    </p>
                  </div>

                  <div
                    id="copilot-container"
                    className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center"
                  >
                    <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--salla-border-color)] border-t-[var(--salla-primary-color)]" />
                    <div className="text-sm font-medium !text-[var(--salla-secondary-font-color)]">
                      Loading your AI Agent
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          )}
        </div>

        {/* If you still want the overlay modal blocks, keep them below with Tailwind too */}
      </div>
    </div>
  );
}
