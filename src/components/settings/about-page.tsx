import { AboutReportPanel } from "@/components/extras/page-toolkits";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { APP_VERSION, APP_RELEASE_DATE, RELEASE_NOTES } from "@/lib/app-version";
import { getBuildNumber, getBuildCommit } from "@/utils/system-diagnostics";
import { SystemDiagnosticsPanel, LicenseDialog, ChangelogDrawer } from "./about-diagnostics";
import { FileText, HelpCircle, Users } from "lucide-react";

export function AboutPage() {
  return <div className="space-y-8">
    <section className="flex flex-wrap items-center gap-4 border-b border-border pb-6">
      <img src="/icons/icon-192.png" alt="FitxFusion" className="h-16 w-16 rounded-lg" />
      <div className="min-w-0 flex-1 space-y-2">
        <h2 className="text-xl font-semibold">FitxFusion</h2>
        <div className="flex flex-wrap gap-2"><Badge>v{APP_VERSION}</Badge><Badge variant="outline">Build {getBuildNumber()}</Badge><Badge variant="outline">{getBuildCommit()}</Badge></div>
        <p className="text-sm text-muted-foreground">Released {new Date(APP_RELEASE_DATE).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</p>
      </div>
    </section>
    <section className="space-y-5">
      <h2 className="text-lg font-semibold">Recent releases</h2>
      {RELEASE_NOTES.slice(0, 3).map(release => <article key={release.version} className="space-y-3 border-b border-border pb-5">
        <Badge variant="secondary">Version {release.version}</Badge>
        {release.sections.map(section => <div key={section.title} className="space-y-2">
          <h3 className="font-medium">{section.title}</h3>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">{section.items.map(item => <li key={item}>{item}</li>)}</ul>
        </div>)}
      </article>)}
      <ChangelogDrawer trigger={<Button variant="outline">Full release history</Button>} />
    </section>
    <SystemDiagnosticsPanel />
    <div className="flex flex-wrap gap-3">
      <Button variant="outline" asChild><Link to="/help"><HelpCircle className="mr-2 h-4 w-4" />Help & feedback</Link></Button>
      <Button variant="outline" asChild><Link to="/community"><Users className="mr-2 h-4 w-4" />Community</Link></Button>
      <Button variant="outline" asChild><Link to="/privacy-policy"><FileText className="mr-2 h-4 w-4" />Privacy policy</Link></Button>
      <LicenseDialog />
    </div>
    <AboutReportPanel />
  </div>;
}
