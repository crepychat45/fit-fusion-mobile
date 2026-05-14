import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
    undefined,
  );

  React.useEffect(() => {
    const checkMobile = () => {
      const width = window.innerWidth;
      const userAgent = navigator.userAgent;

      // Check for mobile user agents
      const mobileUserAgents =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          userAgent,
        );

      // Combine width check with user agent detection
      const isMobileDevice = width < MOBILE_BREAKPOINT || mobileUserAgents;

      setIsMobile(isMobileDevice);
    };

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => checkMobile();

    mql.addEventListener("change", onChange);
    checkMobile();

    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}
