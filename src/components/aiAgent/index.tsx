
import SVGLoader from "../../common/svgLoader";
import { aiProviders, benefits, channels } from "../../constants/aiAgent";
import { useCallback, useEffect, useMemo, useState } from "react";

import { openWindow } from "../../utils/browser";
import "./index.less"
import {
    FDSButton,
    FDSDivider,
    FDSIcon,
    FDSNotificationBanner,
    FDSTypography,
} from "../../common/index";

function AIAgent() {

    const [isReadyForSetup, setIsReadyForSetup] = useState(false);
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




    const handleSetupRedirection = () => {
        // navigate("/setup");
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
                                <FDSTypography
                                    variant="heading-2xl"
                                    type="h2"
                                    className="ai-agent__body__card__header__content-title"
                                >
                                    Create an AI Agent with Kaily!
                                </FDSTypography>
                                <FDSTypography
                                    type="p"
                                    variant="body-l"
                                    className="ai-agent__body__card__header__content-description"
                                >
                                    Set up your AI-powered assistant in just one click and unlock
                                    24/7 support, personalized shopping experiences, and more
                                </FDSTypography>
                            </div>
                            <FDSButton
                                type="primary"
                                size="s"
                                className="ai-agent__body__card__header-button"
                                data-testid="setup-button"
                                onClick={handleSetupRedirection}
                            >
                                Setup in 1 click
                            </FDSButton>
                        </div>
                        <div className="ai-agent__body__card__header-right">
                            <SVGLoader
                                className="ai-agent__body__card__header-banner"
                                src="ic_ai_agent_banner"
                            />
                        </div>
                    </div>
                    <FDSDivider withLabel={false} />
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
                        <FDSNotificationBanner
                            type="suggestion"
                            appearance="warning"
                            closeIcon={false}
                            title={`AI Agent Limit Reached`}
                            description={`You've reached the maximum number of AI Agents allowed on your ${mappingData?.planName} plan.\n\nYou've built ${mappingData?.aiAgentCount ?? 0} out of ${mappingData?.aiAgentLimit ?? "-"} available AI Agents.Upgrade your plan to unlock more AI Agents for your website.`}
                            primaryButtonText="Upgrade"
                            secondaryButtonText="Manage"
                            onSecondaryButtonClick={handleManage}
                            onPrimaryButtonClick={handleCheckPricing}
                            showButtons={true}
                        />
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
                            <FDSTypography
                                type="h3"
                                variant="heading-m"
                                className="ai-agent__body__card__body__section-title"
                            >
                                Deploy on Multiple Channels
                            </FDSTypography>
                            <div className="ai-agent__body__card__body__integrations-icons">
                                {channels?.map((channel) => (
                                    <div key={channel?.id} className="flex gap-8 items-center">
                                        <SVGLoader src={channel?.icon} />
                                        <FDSTypography
                                            type="p"
                                            variant="body-m-prominent"
                                            className="ai-agent__body__card__body__icon-title"
                                        >
                                            {channel?.name}
                                        </FDSTypography>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <FDSDivider
                            orientation="vertical"
                            withLabel={false}
                            lineType="normal"
                            className="ai-agent__body__card__body__connections-divider"
                        />
                        <div className="ai-agent__body__card__body__integrations">
                            <FDSTypography
                                type="h3"
                                variant="heading-m"
                                className="ai-agent__body__card__body__section-title"
                            >
                                Powered by top AI providers
                            </FDSTypography>
                            <div className="ai-agent__body__card__body__integrations-icons">
                                {aiProviders?.map((integration) => (
                                    <div key={integration?.id} className="flex gap-8 items-center">
                                        <div className="ai-agent__body__card__body__icon">
                                            <img
                                                loading="lazy"
                                                src={`/images/svgs/${String(integration?.icon)}.svg`}
                                            />
                                        </div>
                                        <FDSTypography
                                            type="p"
                                            variant="body-m-prominent"
                                            className="ai-agent__body__card__body__icon-title"
                                        >
                                            {integration?.name}
                                        </FDSTypography>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <FDSDivider withLabel={false} />

                    <div className="ai-agent__body__card__body__benefits">
                        <FDSTypography
                            type="h3"
                            variant="heading-m"
                            className="ai-agent__body__card__body__section-title"
                        >
                            Benefits of using AI Agent
                        </FDSTypography>
                        <div className="ai-agent__body__card__body__benefits__items">
                            {benefits.map((benefit) => (
                                <div
                                    key={benefit.id}
                                    className="ai-agent__body__card__body__benefit"
                                >
                                    <FDSIcon name={benefit?.icon} color="neutral" size="m" />
                                    <div className="ai-agent__body__card__body__benefit-content">
                                        <FDSTypography
                                            type="h4"
                                            variant="heading-m"
                                            className="ai-agent__body__card__body-info-title"
                                        >
                                            {benefit.title}
                                        </FDSTypography>
                                        <FDSTypography
                                            type="p"
                                            variant="body-m"
                                            className="ai-agent__body__card__body-info-subtitle"
                                        >
                                            {benefit.subtitle}
                                        </FDSTypography>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <FDSDivider withLabel={false} />
                    <div className="ai-agent__body__card__body__redirect">
                        Visit
                        <FDSButton
                            className="ai-agent__body__card__body-info-button"
                            type="tertiary"
                            size="m"
                            data-testid="footer-check-pricing-button"
                            onClick={handleCheckPricing}
                        >
                            <div className="flex flex-item gap-8 check-pricing-btn">Check Pricing</div>
                        </FDSButton>
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
