import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";

interface SEOManagerProps {
  children: React.ReactNode;
}

interface PageMeta {
  title: string;
  description: string;
  keywords: string;
  canonical?: string;
}

const pageMetadata: Record<string, PageMeta> = {
  "/": {
    title: "FitFusion - Your Ultimate Fitness Companion",
    description:
      "Transform your fitness journey with FitFusion. Track workouts, monitor progress, and achieve your health goals with our comprehensive fitness app.",
    keywords:
      "fitness, workout, health, exercise, tracking, mobile app, fitness companion",
  },
  "/workouts": {
    title: "Workouts - FitFusion",
    description:
      "Discover personalized workout routines tailored to your fitness level and goals. From beginner to advanced exercises.",
    keywords:
      "workouts, exercise routines, fitness plans, training, strength, cardio",
  },
  "/progress": {
    title: "Progress Tracking - FitFusion",
    description:
      "Monitor your fitness progress with detailed analytics, charts, and achievement tracking.",
    keywords:
      "progress tracking, fitness analytics, health metrics, achievement tracking",
  },
  "/chat": {
    title: "FitFusion Chat - Connect with Fitness Community",
    description:
      "Join our secure fitness community. Chat with trainers, share progress, and get motivated with fellow fitness enthusiasts.",
    keywords: "fitness community, chat, trainers, motivation, social fitness",
  },
};

export function SEOManager({ children }: SEOManagerProps) {
  const location = useLocation();

  useEffect(() => {
    const meta = pageMetadata[location.pathname] || pageMetadata["/"];

    // Update title
    document.title = meta.title;

    // Update meta description
    updateMetaTag("description", meta.description);

    // Update meta keywords
    updateMetaTag("keywords", meta.keywords);

    // Update Open Graph tags
    updateMetaTag("og:title", meta.title, "property");
    updateMetaTag("og:description", meta.description, "property");
    updateMetaTag("og:url", window.location.href, "property");

    // Update Twitter Card tags
    updateMetaTag("twitter:title", meta.title);
    updateMetaTag("twitter:description", meta.description);

    // Add canonical URL
    updateCanonicalLink(meta.canonical || window.location.href);

    // Add structured data for fitness app
    addStructuredData();
  }, [location.pathname]);

  const updateMetaTag = (
    name: string,
    content: string,
    attribute: string = "name",
  ) => {
    let element = document.querySelector(`meta[${attribute}="${name}"]`);

    if (!element) {
      element = document.createElement("meta");
      element.setAttribute(attribute, name);
      document.head.appendChild(element);
    }

    element.setAttribute("content", content);
  };

  const updateCanonicalLink = (href: string) => {
    let canonical = document.querySelector(
      'link[rel="canonical"]',
    ) as HTMLLinkElement;

    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }

    canonical.href = href;
  };

  const addStructuredData = () => {
    const existingScript = document.querySelector(
      'script[type="application/ld+json"]',
    );
    if (existingScript) {
      existingScript.remove();
    }

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "MobileApplication",
      name: "FitFusion",
      description:
        "Your ultimate fitness companion for tracking workouts and achieving health goals",
      applicationCategory: "HealthApplication",
      operatingSystem: "Web, iOS, Android",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.8",
        ratingCount: "1000",
      },
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);
  };

  return <>{children}</>;
}
