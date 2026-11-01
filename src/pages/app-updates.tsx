import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { MobileNav } from "@/components/mobile-nav";
import { LiveUpdatePanel } from "@/components/settings/live-update-panel";
import { ChangelogDrawer } from "@/components/settings/about-diagnostics";

export default function AppUpdates() {
  const navigate = useNavigate();
  return <div className="min-h-screen bg-background pb-28">
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-6">
      <Button variant="ghost" onClick={() => navigate("/settings?tab=about")}><ArrowLeft className="mr-2 h-4 w-4" />Settings</Button>
      <h1 className="text-2xl font-bold">App Updates</h1>
      <LiveUpdatePanel />
      <ChangelogDrawer trigger={<Button variant="outline">Release history</Button>} />
    </main>
    <MobileNav />
  </div>;
}