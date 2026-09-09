import React, { useState } from "react";
import { motion } from "framer-motion";
import { KeyRound, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

/**
 * Second factor for the admin area. The database still enforces the real
 * permissions (RLS + the user_roles table) — this passphrase only unlocks the
 * UI for the current browser session so a signed-in admin device left open
 * cannot be used by someone else.
 */
const ADMIN_PASSPHRASE = "fitfusion2026";
const SESSION_KEY = "fitfusion-admin-unlocked";

export const AdminPasswordGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [unlocked, setUnlocked] = useState(
    () => sessionStorage.getItem(SESSION_KEY) === "1",
  );
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  if (unlocked) return <>{children}</>;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() === ADMIN_PASSPHRASE) {
      sessionStorage.setItem(SESSION_KEY, "1");
      setUnlocked(true);
      return;
    }
    setError("Incorrect admin password.");
    setValue("");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="liquid-glass w-full max-w-sm space-y-4 rounded-3xl border border-border/40 p-8 text-center"
      >
        <ShieldCheck className="mx-auto h-9 w-9 text-primary" />
        <div>
          <h1 className="text-xl font-bold">Admin Control Center</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter the admin password to continue.
          </p>
        </div>
        <div className="relative">
          <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="password"
            autoFocus
            className="pl-9"
            placeholder="Admin password"
            aria-label="Admin password"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError("");
            }}
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full">
          Unlock
        </Button>
        <Button type="button" variant="ghost" className="w-full" onClick={() => navigate("/")}>
          Back to app
        </Button>
      </motion.form>
    </div>
  );
};

export default AdminPasswordGate;
