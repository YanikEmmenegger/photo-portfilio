export const isIOSDevice = () => {const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;

    const isiPhone = /iPhone/.test(userAgent);
    const isiPad = /iPad/.test(userAgent);

// For iPadOS 13+ which says "Macintosh"
    const isiPadOS = /Macintosh/.test(userAgent) && navigator.maxTouchPoints > 1;

    console.log("isipad " +userAgent)

    return isiPhone || isiPad || isiPadOS
};
