export const getDeviceType = () => {
    if (typeof window === "undefined") {
        // Server-side rendering or pre-rendering, return a default value
        return "server";
    }

    const userAgent = navigator.userAgent;

    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
        return "mobile";
    } else if (/iPad/i.test(userAgent)) {
        return "tablet";
    } else {
        return "desktop";
    }
};
