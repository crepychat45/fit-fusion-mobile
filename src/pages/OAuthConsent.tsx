import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/common/loading-spinner";

// Consent screen the Supabase OAuth 2.1 authorization server redirects to
// with ?authorization_id=... when an external MCP client wants to connect.
export default function OAuthConsent() {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const [details, setDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) {
        setError("Missing authorization_id");
        return;
      }
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        const next = window.location.pathname + window.location.search;
        window.location.href = "/auth?next=" + encodeURIComponent(next);
        return;
      }
      const { data, error } = await supabase.auth.oauth.getAuthorizationDetails(
        authorizationId,
      );
      if (!active) return;
      if (error) return setError(error.message);
      if (data && "redirect_url" in data && !("client" in data)) {
        window.location.href = data.redirect_url;
        return;
      }
      setDetails(data);
    })();
    return () => {
      active = false;
    };
  }, [authorizationId]);

  async function decide(approve: boolean) {
    setBusy(true);
    const { data, error } = approve
      ? await supabase.auth.oauth.approveAuthorization(authorizationId)
      : await supabase.auth.oauth.denyAuthorization(authorizationId);
    if (error) {
      setBusy(false);
      setError(error.message);
      return;
    }
    const target = data && "redirect_url" in data ? data.redirect_url : undefined;
    if (!target) {
      setBusy(false);
      setError("No redirect returned by the authorization server.");
      return;
    }
    window.location.href = target;
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Authorization error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (!details) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </main>
    );
  }

  const clientName = details.client?.name ?? "An external app";

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Connect {clientName} to FitFusion?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {clientName} is requesting access to use FitFusion's MCP tools as
            you. It will be able to read your profile and workout data through
            the tools you've exposed.
          </p>
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => decide(false)}
            >
              Deny
            </Button>
            <Button disabled={busy} onClick={() => decide(true)}>
              {busy ? "Working…" : "Approve"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
