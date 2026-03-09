import svgs from "../assets/images/auto_gen/svgs";
import React from "react";

interface InlineSVGProps {
    src: keyof typeof svgs;
    sx?: any;

    [key: string]: any;
}

const SVGLoader: React.FC<InlineSVGProps> = ({ src, style, ...otherProps }) => {
    const getSVG = (): string => {
        return svgs[src] || "";
    };

    return (
        <div className="inline-svg" style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            ...style,
        }}
            {...otherProps}
            dangerouslySetInnerHTML={{ __html: getSVG() }}
        />
    );
};

export default SVGLoader;
