import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { MobileNav } from "@/components/mobile-nav";
import { AboutPage } from "@/components/settings/about-page";

export default function About() {
  const navigate = useNavigate();
  return <div className="min-h-screen bg-background pb-28">
    <main className="mx-auto max-w-screen-xl space-y-6 px-4 py-6">
      <Button variant="ghost" onClick={() => navigate("/settings?tab=about")}><ArrowLeft className="mr-2 h-4 w-4" />Settings</Button>
      <h1 className="text-2xl font-bold">About FitxFusion</h1>
      <AboutPage />
    </main>
    <MobileNav />
  </div>;
}