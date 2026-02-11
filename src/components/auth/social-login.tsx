import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { lovable } from "@/integrations/lovable";
import { Chrome, Apple, Loader2 } from "lucide-react";

export function SocialLogin() {
  const { toast } = useToast();
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  const handleOAuthSignIn = async (provider: "google" | "apple") => {
    setLoadingProvider(provider);
    try {
      const result = await lovable.auth.signInWithOAuth(provider, {
        redirect_uri: window.location.origin,
      });

      if (result.error) {
        throw result.error;
      }
    } catch (error: any) {
      toast({
        title: `${provider === "google" ? "Google" : "Apple"} Sign In Failed`,
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => handleOAuthSignIn("google")}
          disabled={!!loadingProvider}
        >
          {loadingProvider === "google" ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Chrome className="mr-2 h-4 w-4" />
          )}
          Google
        </Button>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => handleOAuthSignIn("apple")}
          disabled={!!loadingProvider}
        >
          {loadingProvider === "apple" ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Apple className="mr-2 h-4 w-4" />
          )}
          Apple
        </Button>
      </div>
    </div>
  );
}
