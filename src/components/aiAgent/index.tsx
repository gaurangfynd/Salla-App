import SVGLoader from "../../common/svgLoader";
import { aiProviders, benefits, channels } from "../../constants/aiAgent";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";

import { openWindow } from "../../utils/browser";
import { fetchWithAuth } from "../../utils/fetchWithAuth";
import "./index.less";
import { useSalla } from "../../context/salla-context";

const BACKEND_URL = "http://localhost:3032";

async function createSallaAgent(payload: {
  ownerFirstName: string;
  ownerLastName: string;
  ownerEmail: string;
  sallaStoreId: number;
  aiAgentName: string;
  active?: boolean;
  companyName: string;
  companyCountry: string;
  companyState: string;
  metadata: Record<string, any>;
}): Promise<any> {
  const res = await fetchWithAuth(`${BACKEND_URL}/api/salla/createApp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  console.log("createSallaAgent response", data);
  return data;
}

function AIAgent() {
  const navigate = useNavigate();
  const { ableToCreateBot, sallaStoreInfo, merchantId } = useSalla();
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
    if (!ableToCreateBot) {
      navigate("/details");
      return;
    }

    if (!sallaStoreInfo || !merchantId) {
      console.error("Missing store info or merchant ID");
      return;
    }

    try {
      setIsCreating(true);
      navigate("/setup"); // show stepper immediately while creation runs

      const result = await createSallaAgent({
        ownerFirstName: sallaStoreInfo.name?.split(" ")[0] || "",
        ownerLastName: sallaStoreInfo.name?.split(" ")[1] || "Salla",
        ownerEmail: sallaStoreInfo.email,
        sallaStoreId: merchantId,
        aiAgentName: sallaStoreInfo.merchant.name,
        active: true,
        metadata: {},
        companyName: sallaStoreInfo.merchant.name,
        companyCountry: sallaStoreInfo.merchant.kyc_country,
        companyState: 'Saudi Arabia',
      });

      if (!result?.success) {
        console.error("createSallaAgent failed:", result?.error || result?.message);
      }
    } catch (err) {
      console.error("Error creating Salla agent:", err);
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

  return (
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
  );
}

export default AIAgent;
