import Stepper from "../../../common/stepper";
import SVGLoader from "../../../common/svgLoader";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../index.less";
import "./index.css";
import { set } from "react-hook-form";

const AIAgentSetup = () => {
  const navigate = useNavigate();
  const [productAccountData, setProductAccountData] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isCommerceDataPushed, setIsCommerceDataPushed] = useState(false);
  const [createdAIAgent, setCreatedAIAgent] = useState<any>(null);

  const product_type = "boltic";

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
    if (true) {
      setTimeout(() => {
        setSteps((prevSteps) => {
          const updatedSteps = [...prevSteps];
          updatedSteps[0].loading = false;
          updatedSteps[0].completed = true;
          updatedSteps[1].loading = true;
          return updatedSteps;
        });
      }, 1000);

      setTimeout(() => {
        setSteps((prevSteps) => {
          const updatedSteps = [...prevSteps];
          updatedSteps[1].loading = false;
          updatedSteps[1].completed = true;
          updatedSteps[2].loading = true;
          return updatedSteps;
        });
      }, 2000);

      setTimeout(() => {
        setSteps((prevSteps) => {
          const updatedSteps = [...prevSteps];
          updatedSteps[2].loading = false;
          updatedSteps[2].completed = true;
          return updatedSteps;
        });
      }, 3000);

      // const applicationData = companyApplicationData?.find(
      //     (val: any) => val?._id === applicationId,
      // );
      setTimeout(() => {
        navigate(`/details`);
      }, 4000);
    }
  }, []);

  /**
   * Step 5: Navigate to AI Agent details page after creation
   *
   * Once the AI Agent is successfully created and all steps are completed,
   * navigates to the AI Agent details page with a query parameter indicating
   * the user came from the setup flow.
   */
  useEffect(() => {
    if (steps[2].completed && createdAIAgent?.id) {
      navigate(`../${createdAIAgent.id}?fromSetup=true`);
    }
  }, [steps, createdAIAgent, navigate]);

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
          <hr  className="border-[var(--salla-border-color)]"/>
          <div className="ai-agent__body__card__footer">
            <p className="ai-agent__body__card__footer-note text-sm text-[var(--salla-secondary-font-color)]">
              Note: You'll be auto-redirected to next screen once setup is complete. This may take upto 1 minute.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default AIAgentSetup;
