import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

export const SELLER = "FitXFusion";
export const LEGAL_UPDATED = "6 November 2026";

export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border px-4 pt-10 pb-5">
        <div className="mx-auto flex max-w-3xl items-center gap-2">
          <button onClick={() => navigate(-1)} aria-label="Go back" className="rounded-full p-2 hover:bg-muted">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold">{title}</h1>
        </div>
      </header>
      <main className="mx-auto max-w-3xl space-y-6 px-4 py-8 pb-24 text-sm leading-relaxed text-muted-foreground [&_h2]:mt-6 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-foreground [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_a]:text-primary [&_a]:underline">
        <p>Last updated: {LEGAL_UPDATED}</p>
        {children}
        <nav className="flex flex-wrap gap-4 border-t border-border pt-6">
          <Link to="/pricing">Pricing</Link>
          <Link to="/terms-of-service">Terms</Link>
          <Link to="/privacy-policy">Privacy</Link>
          <Link to="/refund-policy">Refunds</Link>
        </nav>
      </main>
    </div>
  );
}
