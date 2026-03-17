import SVGLoader from "../../common/svgLoader";
import { aiProviders, benefits, channels } from "../../constants/aiAgent";
import { useCallback, useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { openWindow } from "../../utils/browser";
import "./index.less";
import { useSalla } from "../../context/salla-context";
import Stepper from "../../common/stepper";
import { fetchAppData, fetchUsageData } from "../../utils/sallaApi";
import { fetchWithAuth } from "../../utils/fetchWithAuth";
import { embedded } from "@salla.sa/embedded-sdk";





const BACKEND_URL = "";




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

function AIAgent() {
  const navigate = useNavigate();
  const { merchantId, sallaStoreInfo, appData, usageData, ableToCreateBot, accessToken: token, setAppData, appId, locale, dark, accessToken, setAgentData, setUsageData, agentData } = useSalla();
  const existingData = appData ?? null;
  const usage = (usageData as any)?.usage ?? {};
  const [isReadyForSetup, setIsReadyForSetup] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [hasMapping, setHasMapping] = useState<boolean | null>(null);
  const [hasUsage, setHasUsage] = useState<boolean | null>(null);
  const [mappingData, setMappingData] = useState<{
    userId?: string;
    accountId?: string;
    planName?: string;
    aiAgentLimit?: number;
    aiAgentCount?: number;
  } | null>(null);

  const [currentStep, setCurrentStep] = useState<0 | 2 | 3 | 4>(
    existingData ? 3 : 0
  );
  const [productAccountData, setProductAccountData] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isCommerceDataPushed, setIsCommerceDataPushed] = useState(false);
  const [createdAIAgent, setCreatedAIAgent] = useState<any>(null);


  const [iconUploading, setIconUploading] = useState(false);
  const [iconError, setIconError] = useState<string>("");

  const [copilotReloadKey, setCopilotReloadKey] = useState(0);

  const product_type = "boltic";


  async function fetchData() {
    const ownerEmail = sallaStoreInfo?.email;
    const tokenValue = accessToken;
    const app = await fetchAppData(merchantId || "", ownerEmail || "", tokenValue || "");
    if (app) setAppData(app);

    // 7) Fetch usage data
    const usage = await fetchUsageData(merchantId || "", ownerEmail || "", tokenValue || "");
    if (usage) setUsageData(usage);
  }


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

  // Salla equivalent of Shopify's useLoaderData


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


  useEffect(() => {
    if (!ableToCreateBot) {
      navigate("/details");
    }
  }, [ableToCreateBot]);

  async function createSallaAgent(payload: {
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
  }): Promise<any> {
    const res = await fetchWithAuth(`${BACKEND_URL}/api/salla/createApp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
      { token: accessToken, storeId: merchantId });
    const data = await res.json();
    console.log("createSallaAgent response", data);
    return data;
  }

  const handleCheckPricing = useCallback(() => {
    openWindow(
      "https://www.kaily.ai/pricing?utm_source=fynd-commerce&utm_medium=boltic&utm_campaign=ai-agent-setup&utm_content=check-pricing",
      "_blank",
    );
  }, []);

  const handleManage = useCallback(() => {
    openWindow(
      "https://www.kaily.ai/manage?utm_source=fynd-commerce&utm_medium=boltic&utm_campaign=ai-agent-setup&utm_content=manage",
      "_blank",
    );
  }, []);

  // Handle mapping result and determine next steps
  const handleMappingResult = ({ data }: { data: any }) => {
    if (data?.error) {
      setHasMapping(false);
      setHasUsage(true);
      return;
    }
    if (!data?.data) return;

    const { user_id, account_id, has_commerce_mapping } = data.data;

    // Set mapping status
    setHasMapping(Boolean(has_commerce_mapping));

    // If we have both IDs, store them and proceed with usage check
    if (user_id && account_id) {
      setMappingData({ userId: user_id, accountId: account_id });
    } else {
      // No complete mapping - skip usage check
      setMappingData(null);
      setHasUsage(true);
    }
  };

  const handleSetupRedirection = async () => {
    if (ableToCreateBot) {
      setCurrentStep(2);
    }
    else {
      setCurrentStep(3);
    }

    if (!sallaStoreInfo || !merchantId) {
      console.error("Missing store info or merchant ID");
      return;
    }

    try {
      setIsCreating(true);

      setSteps((prevSteps) => {
        const updatedSteps = [...prevSteps];
        updatedSteps[0].loading = false;
        updatedSteps[0].completed = true;
        updatedSteps[1].loading = true;
        return updatedSteps;
      });

      const result = await createSallaAgent({
        ownerFirstName: sallaStoreInfo.activeAdminStoreUser.name?.split(" ")[0]?.replace(/[^a-zA-Z\u0600-\u06FF]/g, "") || "",
        ownerLastName: sallaStoreInfo.activeAdminStoreUser.name?.split(" ")[1]?.replace(/[^a-zA-Z\u0600-\u06FF]/g, "") || "Salla",
        ownerEmail: sallaStoreInfo.activeAdminStoreUser.email,
        sallaStoreId: merchantId,
        aiAgentName: sallaStoreInfo.merchant.name,
        active: true,
        metadata: {},
        companyName: sallaStoreInfo.merchant.name,
        companyCountry: 'Saudi Arabia',
        companyState: 'Mecca',
        storefrontToken: accessToken ?? "",
      });

      if (!result?.data?.success) {
        console.error("createSallaAgent failed:", result?.error || result?.message);
      }

      if (result?.data?.success && result?.data?.data) {
        setAgentData(result?.data?.data);
        setSteps((prevSteps) => {
          const updatedSteps = [...prevSteps];
          updatedSteps[1].loading = false;
          updatedSteps[1].completed = true;
          updatedSteps[2].loading = true;
          return updatedSteps;
        });

        embedded.ui.toast.success("AI agent created successfully");

        setSteps((prevSteps) => {
          const updatedSteps = [...prevSteps];
          updatedSteps[2].loading = false;
          updatedSteps[2].completed = true;
          return updatedSteps;
        });

        if (result?.data?.data?.id) {
          fetchData();
        }

        setTimeout(() => {
          setCurrentStep(3);
        }, 2000);
      }
    } catch (err) {
      embedded.ui.toast.error("Error while creating agent.");
      setCurrentStep(0);
    } finally {
      setIsCreating(false);
    }
  };

  const handlePrimaryButtonClick = async () => {
    // window.parent.postMessage(
    //     {
    //         data: {
    //             type: "internal_self",
    //             link: `/user-profile?company_id=${companyId}`,
    //         },
    //         type: "FP_NAVIGATE",
    //     },
    //     "*",
    // );
  };


  const [steps, setSteps] = useState([
    {
      title: "Creating your AI Agent",
      subtitle:
        "Setting up your AI Agent using your business name and preferences.",
      loading: true,
      completed: false,
    },
    {
      title: "Adding Capabilities to Your AI Agent",
      subtitle:
        "Enhancing your AI Agent with powerful features and integrations.",
      completed: false,
      loading: false,
    },
    {
      title: "Launching your AI Agent",
      subtitle: "Activating your AI Agent on your website to assist customers.",
      completed: false,
      loading: false,
    },
  ]);

  // Define the type for AI Agent data
  type AIAgentData = {
    name: string;
    source: string;
    fpCreds: any;
    active?: boolean;
  };

  // useEffect(() => {
  //     if (steps[2].completed && createdAIAgent?.id) {
  //         navigate(`../${createdAIAgent.id}?fromSetup=true`);
  //     }
  // }, [steps, createdAIAgent, navigate]);




  useEffect(() => {
    if (steps[2].completed && agentData?.id) {
      setTimeout(() => {
        navigate(`/details`);
      }, 2000);
    }
  }, [steps, agentData, navigate]);




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
    if (existingData?.copilot?.token) {
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
              (function(w,d,s,o,f,js,fjs){w[o]=w[o]||function(){(w[o].q=w[o].q||[]).push(arguments);};(js=d.createElement(s)),(fjs=d.getElementsByTagName(s)[0]);js.id=o;js.src=f;js.async=1;fjs.parentNode.insertBefore(js,fjs);})(window,document,"script","oneClickCopilot", "https://script.copilot.live/v1/copilot.min.js?tkn=${existingData.copilot.token}&region=asia-south1");
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
  }, [existingData?.copilot?.token, showSecondItem, copilotReloadKey]);

  // const openModal = () => {
  //   const btn = document.querySelector('s-button[commandFor="modal"]');
  //   if (btn) {
  //     //   btn.click();
  //   }
  // };

  // useEffect(() => {
  //   const url = new URL(window.location.href);
  //   if (
  //     existingData &&
  //     url.searchParams.get("op") === "1" &&
  //     currentStep === 3
  //   ) {
  //     const timer = setTimeout(() => {
  //       openModal();
  //     }, 3000);
  //     return () => clearTimeout(timer);
  //   }
  // }, [existingData, currentStep]);



  //   const settingsFetcher = useFetcher<typeof action>();

  const copilotFromServer = existingData?.copilot || null;

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
      const ownerEmail = sallaStoreInfo.activeAdminStoreUser.email;
      const app = await fetchAppData(merchantId, ownerEmail, token || "");
      if (app) setAppData(app);
      // Clear icon preview and pending path after successful save
      if (iconPreviewUrl) URL.revokeObjectURL(iconPreviewUrl);
      setIconPreviewUrl("");
      setPendingIconCdnPath("");

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

  //const [personaDraft, setPersonaDraft] = useState(draftCopilot?.persona || "");
  const [personaDraft, setPersonaDraft] = useState("");
  const [showPersonaModal, setShowPersonaModal] = useState(false);
  const personaTextareaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (showPersonaModal) {
      // wait one frame for the modal to mount before focusing
      requestAnimationFrame(() => personaTextareaRef.current?.focus());
    }
  }, [showPersonaModal]);
  const isPersonaDirty = useMemo(() => {
    return personaDraft !== (draftCopilot?.persona || "");
  }, [personaDraft, draftCopilot?.persona]);

  useEffect(() => {
    setPersonaDraft(draftCopilot?.persona || "");
  }, [draftCopilot?.persona]);

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

      if (!initResponse?.data?.success) {
        throw new Error(initResponse?.data?.error || "Icon init failed");
      }

      const signed = initResponse?.data?.data;
      const { method = "PUT", url, fields, cdn_path } = signed || {};

      if (!url || !cdn_path) {
        throw new Error("Missing signed URL or cdn_path from icon init");
      }

      // 2) Upload via Pixelbin SDK
      await Pixelbin.upload(file, { url, fields });

      // 3) Store cdn_path for next save and sync into draft
      setPendingIconCdnPath(cdn_path);
      updateDraft(["icon"], cdn_path);
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
    <>
      {currentStep === 0 && (
        <main className="ai-agent">
          <section className="ai-agent__body py-5">
            <div className="ai-agent__body__card">
              <div className="ai-agent__body__card__header">
                <div className="ai-agent__body__card__header-left">
                  <SVGLoader
                    className="ai-agent__body__card__header-icon ai-agent__body__card__header-icon--large"
                    src="ic_rocket"
                  />
                  <div className="ai-agent__body__card__header__content">
                    <h2 className="ai-agent__body__card__header__content-title text-2xl font-semibold">
                      Create an AI Agent with Kaily!
                    </h2>
                    <p className="ai-agent__body__card__header__content-description text-sm text-gray-600">
                      Set up your AI-powered assistant in just one click and unlock
                      24/7 support, personalized shopping experiences, and more
                    </p>
                  </div>
                  {ableToCreateBot && (
                    <button
                      type="button"
                      className="cursor-pointer ai-agent__body__card__header-button inline-flex items-center justify-center rounded-lg bg-[var(--salla-secondary-color)] px-4 py-2 text-sm font-medium text-[var(--salla-light-mode-primary-color)] shadow-sm hover:bg-gray-800 transition"
                      data-testid="setup-button"
                      onClick={handleSetupRedirection}
                    >
                      Setup in 1 click
                    </button>
                  )}
                </div>
                <div className="ai-agent__body__card__header-right">
                  <SVGLoader
                    className="ai-agent__body__card__header-banner"
                    src="ic_ai_agent_banner"
                  />
                </div>
              </div>
              <hr className="my-4 border-[var(--salla-border-color)]" />
              {/* {notificationConfig?.description && (
                        <FDSNotificationBanner
                            type="suggestion"
                            appearance={"default"}
                            closeIcon={false}
                            description={notificationConfig?.description}
                            title={`Hello ${first_name}`}
                            primaryButtonText={notificationConfig?.primaryButtonText}
                            onPrimaryButtonClick={handlePrimaryButtonClick}
                            showButtons={notificationConfig?.showButtons}
                        />
                    )} */}
              {hasUsage === false && hasMapping === true && (
                <div className="ai-agent__notification-banner ai-agent__notification-banner--warning rounded-lg border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-900">
                  <h3 className="ai-agent__notification-banner-title mb-1 font-semibold">
                    AI Agent Limit Reached
                  </h3>
                  <p className="ai-agent__notification-banner-description mb-3 whitespace-pre-line">
                    {`You've reached the maximum number of AI Agents allowed on your ${mappingData?.planName} plan.\n\nYou've built ${mappingData?.aiAgentCount ?? 0} out of ${mappingData?.aiAgentLimit ?? "-"} available AI Agents.Upgrade your plan to unlock more AI Agents for your website.`}
                  </p>
                  <div className="ai-agent__notification-banner-actions flex gap-2">
                    <button
                      type="button"
                      className="cursor-pointer ai-agent__notification-banner-button ai-agent__notification-banner-button--primary inline-flex items-center justify-center rounded-md bg-[var(--salla-secondary-color)] px-3 py-1.5 text-sm font-medium text-[var(--salla-light-mode-primary-color)] shadow-sm hover:bg-gray-800 transition"
                      onClick={handleCheckPricing}
                    >
                      Upgrade
                    </button>
                    <button
                      type="button"
                      className="cursor-pointer ai-agent__notification-banner-button ai-agent__notification-banner-button--secondary inline-flex items-center justify-center rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-800 hover:bg-gray-50 transition"
                      onClick={handleManage}
                    >
                      Manage
                    </button>
                  </div>
                </div>
              )}
              {/* <div className="ai-agent__body__card__body">
                        <div className="ai-agent__body__card__body-icon">
                            <SVGLoader
                                src="ic_offer_coupon"
                                className="ai-agent__body__card__header-icon ai-agent__body__card__header-icon--small"
                            />
                        </div>
                        <div className="ai-agent__body__card__body-info">
                            <FDSTypography
                                type="p"
                                variant="heading-m"
                                className="ai-agent__body__card__body-info-title"
                            >
                                Start 30-day free trial!
                            </FDSTypography>
                            <div className="ai-agent__body__card__body-trial">
                                <p className="ai-agent__body__card__body-info-subtitle">
                                    Try the Growth Plan risk-free for 30 days. After the trial,
                                    you’ll be auto-subscribed at $39/month growth plan.
                                </p>
                                <FDSButton
                                    className="ai-agent__body__card__body-info-button"
                                    type="tertiary"
                                    size="m"
                                    data-testid="check-pricing-button"
                                    onClick={handleCheckPricing}
                                >
                                    <div className="flex flex-item gap-8">
                                        Check Pricing
                                        <SVGLoader src="ic_open_with" />
                                    </div>
                                </FDSButton>
                            </div>
                        </div>
                    </div> */}
              {ableToCreateBot && (
                <div className="flex items-start gap-3 ">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--salla-secondary-color)]">

                    <SVGLoader src="ic_offer_coupon" className="offer-icon" />
                  </div>
                  <div className="flex flex-1 flex-col gap-2">
                    <p className="text-md font-semibold text-[var(--salla-primary-color)]">Start 30-day free trial!</p>


                    <div className="ai-agent__body__card__body__redirect font-normal text-sm flex flex-col items-start sm:flex-row sm:items-center gap-1">
                      <span>Try the Growth Plan risk-free for 30 days. After the trial, you'll be auto-subscribed at $39/month growth plan.</span>
                      <span className="inline-flex items-center gap-1">
                        <a
                          href="https://www.kaily.ai/pricing?utm_source=fynd-commerce&utm_medium=boltic&utm_campaign=ai-agent-setup&utm_content=check-pricing"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="cursor-pointer ai-agent__body__card__body-info-button text-sm font-medium text-[var(--salla-primary-color)] underline hover:opacity-80 transition"
                          data-testid="footer-check-pricing-button"
                        >
                          Check Pricing
                        </a>
                        <SVGLoader
                          src="ic_open_with"
                          className="ai-agent__body__card__body__redirect-icon"
                        />
                      </span>
                    </div>

                  </div>
                </div>
              )}
              {ableToCreateBot && (
                <hr className="my-4 border-[var(--salla-border-color)]" />
              )}
              {/* <FDSDivider withLabel={false} /> */}
              <div className="ai-agent__body__card__body__connections">
                <div className="ai-agent__body__card__body__integrations">
                  <h3 className="ai-agent__body__card__body__section-title text-base font-semibold">
                    Deploy on Multiple Channels
                  </h3>
                  <div className="ai-agent__body__card__body__integrations-icons">
                    {channels?.map((channel) => (
                      <div key={channel?.id} className="flex gap-8 items-center">
                        <SVGLoader src={channel?.icon} />
                        <p className="ai-agent__body__card__body__icon-title text-sm font-medium text-gray-800">
                          {channel?.name}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  role="separator"
                  className="ai-agent__body__card__body__connections-divider w-px bg-gray-200"
                />
                <div className="ai-agent__body__card__body__integrations">
                  <h3 className="ai-agent__body__card__body__section-title text-base font-semibold">
                    Powered by top AI providers
                  </h3>
                  <div className="ai-agent__body__card__body__integrations-icons">
                    {aiProviders?.map((integration) => (
                      <div
                        key={integration?.id}
                        className="flex gap-8 items-center"
                      >
                        <div className="ai-agent__body__card__body__icon">
                          <img
                            loading="lazy"
                            src={`/images/svgs/${String(integration?.icon)}.svg`}
                          />
                        </div>
                        <p className="ai-agent__body__card__body__icon-title text-sm font-medium text-gray-800">
                          {integration?.name}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <hr className="my-4 border-[var(--salla-border-color)]" />

              <div className="ai-agent__body__card__body__benefits">
                <h3 className="ai-agent__body__card__body__section-title text-base font-semibold">
                  Benefits of using AI Agent
                </h3>
                <div className="ai-agent__body__card__body__benefits__items">
                  {benefits.map((benefit) => (
                    <div
                      key={benefit.id}
                      className="ai-agent__body__card__body__benefit"
                    >

                      <SVGLoader src={benefit?.icon} className="ai-agent-body-icons" />

                      <div className="ai-agent__body__card__body__benefit-content">
                        <h4 className="ai-agent__body__card__body-info-title text-sm font-semibold">
                          {benefit.title}
                        </h4>
                        <p className="ai-agent__body__card__body-info-subtitle text-sm text-gray-600">
                          {benefit.subtitle}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <hr className="my-4 border-[var(--salla-border-color)]" />
              <div className="ai-agent__body__card__body__redirect">
                Visit
                <a
                  href="https://www.kaily.ai/pricing?utm_source=fynd-commerce&utm_medium=boltic&utm_campaign=ai-agent-setup&utm_content=check-pricing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer ai-agent__body__card__body-info-button text-sm font-medium text-[var(--salla-primary-color)] underline hover:opacity-80 transition"
                  data-testid="footer-check-pricing-button"
                >
                  Check Pricing
                </a>
                to know more.
                <SVGLoader
                  src="ic_open_with"
                  className="ai-agent__body__card__body__redirect-icon"
                />
              </div>
            </div>
          </section>
        </main>
      )}
      {currentStep === 2 && (
        <main className="ai-agent">
          <section className="ai-agent__body py-5">
            <div className="ai-agent__body__card">
              <div className="ai-agent__body__card__header">
                <div className="ai-agent__body__card__header-left">
                  <SVGLoader
                    className="ai-agent__body__card__header-icon ai-agent__body__card__header-icon--large"
                    src="ic_rocket"
                  />
                  <div className="ai-agent__body__card__header-content">
                    <h1 className="ai-agent__body__card__header__content-title">
                      Setting up Your AI Agent
                    </h1>
                    <p className="ai-agent__body__card__header__content-description">
                      Your AI Agent is being automatically configured to understand
                      your business context and assist customers effectively.
                    </p>
                  </div>
                </div>
              </div>
              <hr className="border-[var(--salla-border-color)]" />

              <div className="ai-agent__body__card__body">
                <Stepper steps={steps} />
              </div>
              <hr className="border-[var(--salla-border-color)]" />
              <div className="ai-agent__body__card__footer">
                <p className="ai-agent__body__card__footer-note text-sm text-[var(--salla-secondary-font-color)]">
                  Note: You'll be auto-redirected to next screen once setup is complete. This may take upto 1 minute.
                </p>
              </div>
            </div>
          </section>
        </main>
      )}

      {/* =================== Step 3 (Success) =================== */}
      {currentStep === 3 && (
        <div className="mx-auto w-full max-w-7xl px-4 py-6 my-5">
          <div className="relative mt-4">

            {/* Persona edit modal */}
            {showPersonaModal && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    setPersonaDraft(draftCopilot?.persona || "");
                    setPersonaError("");
                    setShowPersonaModal(false);
                  }
                }}
              >
                <div
                  className="flex w-full max-w-2xl flex-col rounded-2xl shadow-2xl overflow-hidden"
                  style={{ backgroundColor: "var(--salla-background-color)" }}
                >
                  {/* Header */}
                  <div
                    className="flex items-center justify-between px-6 py-4"
                    style={{ borderBottom: "1px solid var(--salla-border-color)" }}
                  >
                    <h2 className="text-base font-semibold" style={{ color: "var(--salla-primary-color)" }}>
                      Edit Persona
                    </h2>
                    <button
                      type="button"
                      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition hover:opacity-70"
                      style={{ color: "var(--salla-secondary-font-color)" }}
                      onClick={() => {
                        setPersonaDraft(draftCopilot?.persona || "");
                        setPersonaError("");
                        setShowPersonaModal(false);
                      }}
                    >
                      ✕
                    </button>
                  </div>

                  {/* Body */}
                  <div className="flex flex-col gap-3 px-6 py-5">
                    <textarea
                      ref={personaTextareaRef}
                      rows={14}
                      className="w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none transition"
                      style={{
                        borderColor: personaError ? "#ef4444" : "var(--salla-border-color)",
                        backgroundColor: "var(--salla-background-color)",
                        color: "var(--salla-primary-color)",
                        boxShadow: "none",
                      }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = personaError ? "#ef4444" : "var(--salla-secondary-color)")}
                      onBlur={(e) => (e.currentTarget.style.borderColor = personaError ? "#ef4444" : "var(--salla-border-color)")}
                      value={personaDraft}
                      onChange={(e) => {
                        const raw = e.target.value;
                        const next = raw.slice(0, PERSONA_MAX);
                        setPersonaDraft(next);
                        setPersonaError(raw.length > PERSONA_MAX ? `Maximum ${PERSONA_MAX} characters allowed.` : "");
                      }}
                    />

                    {/* char count / error */}
                    <div className="flex items-center justify-between text-xs">
                      {personaError ? (
                        <span className="font-medium text-red-500">{personaError}</span>
                      ) : (
                        <span style={{ color: "var(--salla-secondary-font-color)" }}>
                          {personaDraft.length} / {PERSONA_MAX}
                        </span>
                      )}
                      {/* progress bar */}
                      <div className="h-1 w-32 overflow-hidden rounded-full" style={{ backgroundColor: "var(--salla-border-color)" }}>
                        <div
                          className="h-full rounded-full transition-all duration-200"
                          style={{
                            width: `${Math.min((personaDraft.length / PERSONA_MAX) * 100, 100)}%`,
                            backgroundColor: personaError ? "#ef4444" : "var(--salla-secondary-color)",
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div
                    className="flex items-center justify-end gap-3 px-6 py-4"
                    style={{ borderTop: "1px solid var(--salla-border-color)" }}
                  >
                    <button
                      type="button"
                      className="cursor-pointer rounded-xl border px-5 py-2 text-sm font-medium transition hover:opacity-80"
                      style={{
                        borderColor: "var(--salla-border-color)",
                        color: "var(--salla-primary-color)",
                        backgroundColor: "var(--salla-background-color)",
                      }}
                      onClick={() => {
                        setPersonaDraft(draftCopilot?.persona || "");
                        setPersonaError("");
                        setShowPersonaModal(false);
                      }}
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      disabled={!isPersonaDirty || !!personaError}
                      className="cursor-pointer rounded-xl px-5 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40 hover:opacity-85"
                      style={{
                        backgroundColor: "var(--salla-secondary-color)",
                        color: "var(--salla-light-mode-primary-color)",
                      }}
                      onClick={() => {
                        updateDraft(["persona"], personaDraft);
                        setPersonaError("");
                        setShowPersonaModal(false);
                      }}
                    >
                      Update
                    </button>
                  </div>
                </div>
              </div>
            )}
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
                            existingData?.copilot?.icon ||
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
                        {existingData?.copilot?.name || "Kaily User"}{" "}
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
                        <select className="w-full rounded-xl border border-[var(--salla-border-color)] bg-[var(--salla-background-color)] px-4 py-1 !text-sm !text-[var(--salla-secondary-font-color)] placeholder-[var(--salla-secondary-font-color)]   outline-none transition focus:border-[var(--salla-secondary-color)] focus:ring-1 focus:ring-border-[var(--salla-secondary-color)]" value={draftCopilot?.configuration?.provider?.chatModelName || ""}
                          onChange={(e: any) =>
                            updateDraft(["configuration", "provider", "chatModelName"], e?.target?.value)
                          }>
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
                        <select className="w-full rounded-xl border border-[var(--salla-border-color)] bg-[var(--salla-background-color)] px-4 py-1 !text-sm !text-[var(--salla-secondary-font-color)] placeholder-[var(--salla-secondary-font-color)]   outline-none transition focus:border-[var(--salla-secondary-color)] focus:ring-1 focus:ring-border-[var(--salla-secondary-color)]"
                          value={draftCopilot?.configuration?.traits?.personality || ""}
                          onChange={(e: any) =>
                            updateDraft(["configuration", "traits", "personality"], e?.target?.value)
                          }>
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
                        value={draftCopilot?.persona || ""}

                        onClick={() => {
                          setPersonaDraft(draftCopilot?.persona || "");
                          setShowPersonaModal(true);
                        }}
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
      )}
    </>)
}


export default AIAgent;
