import React from "react";
import { FDSSpinner } from "..";
import SVGLoader from "../svgLoader";
import "./index.less";
interface IStep {
    leftItem?: React.ReactNode;
    title: string;
    subtitle?: string;
    loading?: boolean;
    completed?: boolean;
}
interface IStepper {
    steps: IStep[];
}
const Stepper = ({ steps = [] }: IStepper) => {
    return (
        <div className="stepper">
            {steps.map((step, index) => {
                const { loading, title, subtitle, completed } = step;
                return (
                    <div key={index} className="stepper__step" data-testid="stepper__step">
                        <div className="stepper__step-left">
                            {loading && (
                                <FDSSpinner
                                    className="stepper__step-spinner"
                                    data-testid="stepper__step-spinner"
                                    size="m"
                                />
                            )}
                            {completed && !loading && (
                                <SVGLoader
                                    src="ic_green_check"
                                    className="stepper__step-left__icon"
                                    data-testid="stepper__step-left__icon"
                                />
                            )}{" "}
                            {!completed && !loading && (
                                <div className="stepper__step-left__counter">{index + 1}</div>
                            )}
                        </div>
                        <div className="stepper__step-content">
                            <div className="stepper__step-content__title">{title}</div>
                            {subtitle && (
                                <div className="stepper__step-content__subtitle">{subtitle}</div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default Stepper;
