import React, { useEffect } from "react";

interface AccessibilityManagerProps {
  children: React.ReactNode;
}

export function AccessibilityManager({ children }: AccessibilityManagerProps) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Ensure all images have alt tags
    const addMissingAltTags = () => {
      try {
        const images = document.querySelectorAll("img:not([alt])");
        images.forEach((img, index) => {
          img.setAttribute("alt", `Image ${index + 1}`);
        });
      } catch (error) {
        console.warn("Failed to add alt tags:", error);
      }
    };

    // Add keyboard navigation support
    const addKeyboardNavigation = () => {
      try {
        const interactiveElements = document.querySelectorAll(
          "button, a, input, select, textarea",
        );
        interactiveElements.forEach((element, index) => {
          if (!element.getAttribute("tabindex")) {
            element.setAttribute("tabindex", "0");
          }
        });
      } catch (error) {
        console.warn("Failed to add keyboard navigation:", error);
      }
    };

    // Add ARIA labels where missing
    const addAriaLabels = () => {
      try {
        const buttons = document.querySelectorAll(
          "button:not([aria-label]):not([aria-labelledby])",
        );
        buttons.forEach((button) => {
          const text = button.textContent?.trim();
          if (text) {
            button.setAttribute("aria-label", text);
          }
        });
      } catch (error) {
        console.warn("Failed to add ARIA labels:", error);
      }
    };

    // Add focus indicators
    const addFocusIndicators = () => {
      try {
        const style = document.createElement("style");
        style.textContent = `
          *:focus {
            outline: 2px solid hsl(var(--primary)) !important;
            outline-offset: 2px !important;
          }
          button:focus, a:focus {
            box-shadow: 0 0 0 2px hsl(var(--background)), 0 0 0 4px hsl(var(--primary)) !important;
          }
        `;
        document.head.appendChild(style);
      } catch (error) {
        console.warn("Failed to add focus indicators:", error);
      }
    };

    // Run accessibility enhancements
    const timeout = setTimeout(() => {
      addMissingAltTags();
      addKeyboardNavigation();
      addAriaLabels();
      addFocusIndicators();
    }, 100);

    return () => clearTimeout(timeout);
  }, []);

  return <>{children}</>;
}
