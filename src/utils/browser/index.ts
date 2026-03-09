// import environment from "config/environment";

// Function to detect basic device and browser information
export const getDeviceInfo = () => {
    const userAgent = navigator.userAgent;
    const platform = navigator.platform.toLowerCase();

    // Detect operating system
    let device_os = "Unknown";
    if (platform.includes("win")) {
        device_os = "Windows";
    } else if (platform.includes("mac")) {
        device_os = "macOS";
    } else if (platform.includes("linux")) {
        device_os = "Linux";
    } else if (/android/i.test(userAgent)) {
        device_os = "Android";
    } else if (/iphone|ipad|ipod/i.test(userAgent)) {
        device_os = "iOS";
    }

    // Detect device type
    let device_type = "Desktop";
    if (/mobile/i.test(userAgent)) {
        device_type = "Mobile";
    } else if (/tablet/i.test(userAgent)) {
        device_type = "Tablet";
    }

    // Detect browser
    let device_browser = "Unknown";
    if (/chrome|crios|crmo/i.test(userAgent)) {
        device_browser = "Chrome";
    } else if (/firefox|fxios/i.test(userAgent)) {
        device_browser = "Firefox";
    } else if (/safari/i.test(userAgent) && !/chrome|crios|crmo/i.test(userAgent)) {
        device_browser = "Safari";
    } else if (/edg/i.test(userAgent)) {
        device_browser = "Edge";
    } else if (/opr|opera/i.test(userAgent)) {
        device_browser = "Opera";
    }

    // Model detection is typically limited in browsers
    let device_model = "none";

    return {
        device_os,
        device_type,
        device_model,
        device_browser,
    };
};

export const openWindow = (url: string, target = "_blank") => {
    const newWindow = window.open(url, target);
    if (newWindow) {
        // Window opened successfully with target
        // No need to set location.href as it's already handled by window.open()
    } else {
        // Fallback if the window couldn't be opened
        const link = document.createElement("a");
        link.href = url;
        link.target = target;
        link.rel = "noopener noreferrer";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

// export const checkOrigin = (origin: string) => {
//     // check if the event is from the parent window is in allowed domains or not
//     const allowedOrigins = environment.FRAME_ANCESTORS.split(" ");
//     const regex = new RegExp(
//         allowedOrigins
//             .map((origin: string) => origin.replace(/\*/g, ".*").replace(/\./g, "\\."))
//             .join("|"),
//     );
//     const isValid = regex.test(origin);
//     return isValid;
// };
