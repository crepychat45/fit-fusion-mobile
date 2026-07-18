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

const SITE_URL = "https://fitxfusion.lovable.app";

const pageMetadata: Record<string, PageMeta> = {
  "/": {
    title: "FitFusion — AI Fitness Coach & Workout Tracker",
    description:
      "FitFusion is your AI fitness companion: adaptive workouts, streak tracking, biometric sync, and personalized plans to hit every health goal.",
    keywords: "AI fitness, workout tracker, personal trainer app, fitness coach, home workout, streak",
  },
  "/workouts": {
    title: "Workouts — Guided Sessions & Routines | FitFusion",
    description:
      "Browse guided workouts by goal, level, and equipment. Follow AI-curated routines with rest timers, form tips, and progress logging.",
    keywords: "workouts, exercise routines, strength training, cardio, HIIT, home workouts",
  },
  "/workout-plans": {
    title: "AI Workout Plans — Personalized Training | FitFusion",
    description:
      "Multi-week AI workout plans tailored to your goals, fitness level, schedule, and available equipment. Start a plan in seconds.",
    keywords: "workout plan, training program, AI workout, fitness plan, strength program",
  },
  "/progress": {
    title: "Progress & Analytics — Track Your Fitness | FitFusion",
    description:
      "See streaks, personal records, body metrics, and long-term fitness trends with clear charts and actionable insights.",
    keywords: "fitness progress, workout analytics, body metrics, personal records, streak tracker",
  },
  "/nutrition": {
    title: "Nutrition Tracker — Log Meals & Macros | FitFusion",
    description:
      "Track meals, calories, and macros in sync with your training. Get AI nutrition suggestions aligned with your fitness goals.",
    keywords: "nutrition tracker, macro tracker, calorie counter, meal log, fitness nutrition",
  },
  "/chat": {
    title: "FitX Fusion AI Chat — Real-time Coaching | FitFusion",
    description:
      "Chat with FitX Fusion AI for instant coaching, form guidance, workout swaps, and motivation whenever you need it.",
    keywords: "AI fitness chat, workout coaching, form guidance, virtual trainer",
  },
  "/community": {
    title: "Community & Challenges | FitFusion",
    description:
      "Join challenges, share transformations, and follow other members on their fitness journey inside the FitFusion community.",
    keywords: "fitness community, fitness challenges, transformations, workout social",
  },
  "/subscription": {
    title: "Premium Plans — Unlock Advanced AI | FitFusion",
    description:
      "Upgrade to FitFusion Premium for advanced AI coaching, deeper analytics, custom plan generation, and exclusive workouts.",
    keywords: "fitness premium, subscription, AI coach premium, fitness plans",
  },
  "/tools": {
    title: "Fitness Tools & AI Utilities | FitFusion",
    description:
      "AI fitness calculators, workout generators, and quick-use tools to plan training and recovery smarter.",
    keywords: "fitness calculator, workout generator, AI fitness tool",
  },
  "/wearables": {
    title: "Wearables & Smartwatch Sync | FitFusion",
    description:
      "Connect smartwatches and fitness trackers to FitFusion for real-time biometrics, heart rate zones, and recovery insights.",
    keywords: "smartwatch sync, wearables, fitness tracker, heart rate, biometrics",
  },
  "/help": {
    title: "Help & Support | FitFusion",
    description: "Guides, FAQs, and support to get the most out of FitFusion.",
    keywords: "fitfusion help, support, faq, contact",
  },
  "/onboarding": {
    title: "Get Started with FitFusion — Personalized Setup",
    description:
      "Answer a few questions and FitFusion builds your first AI workout plan tailored to your goals and schedule.",
    keywords: "onboarding, fitness setup, personalized workout",
  },
  "/profile": {
    title: "Your Profile | FitFusion",
    description: "Manage your FitFusion profile, goals, and achievements.",
    keywords: "profile, fitness goals, achievements",
  },
  "/settings": {
    title: "Settings | FitFusion",
    description: "Configure FitFusion preferences, notifications, privacy, and app updates.",
    keywords: "settings, preferences, notifications",
  },
  "/privacy-policy": {
    title: "Privacy Policy | FitFusion",
    description: "How FitFusion collects, uses, and protects your personal fitness data.",
    keywords: "privacy policy, data protection",
  },
  "/terms-of-service": {
    title: "Terms of Service | FitFusion",
    description: "The terms governing your use of FitFusion.",
    keywords: "terms of service, legal",
  },
};

export function SEOManager({ children }: SEOManagerProps) {
  const location = useLocation();

  useEffect(() => {
    const meta = pageMetadata[location.pathname] || pageMetadata["/"];
    const pageUrl = `${SITE_URL}${location.pathname}`;

    document.title = meta.title;
    updateMetaTag("description", meta.description);
    updateMetaTag("keywords", meta.keywords);

    updateMetaTag("og:title", meta.title, "property");
    updateMetaTag("og:description", meta.description, "property");
    updateMetaTag("og:url", pageUrl, "property");
    updateMetaTag("og:type", location.pathname === "/" ? "website" : "article", "property");
    updateMetaTag("og:site_name", "FitFusion", "property");

    updateMetaTag("twitter:card", "summary_large_image");
    updateMetaTag("twitter:title", meta.title);
    updateMetaTag("twitter:description", meta.description);

    updateCanonicalLink(pageUrl);
    addStructuredData(location.pathname, meta);
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
    ) as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = href;
  };

  const addStructuredData = (pathname: string, meta: PageMeta) => {
    document
      .querySelectorAll('script[data-seo="fitfusion"]')
      .forEach((n) => n.remove());

    const blocks: Record<string, unknown>[] = [
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "FitFusion",
        url: SITE_URL,
        logo: `${SITE_URL}/placeholder.svg`,
      },
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "FitFusion",
        url: SITE_URL,
      },
      {
        "@context": "https://schema.org",
        "@type": "MobileApplication",
        name: "FitFusion",
        description: meta.description,
        applicationCategory: "HealthApplication",
        operatingSystem: "Web, iOS, Android",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.8",
          ratingCount: "1000",
        },
      },
    ];

    for (const data of blocks) {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute("data-seo", "fitfusion");
      script.textContent = JSON.stringify(data);
      document.head.appendChild(script);
    }
  };

  return <>{children}</>;
}

export default SEOManager;
