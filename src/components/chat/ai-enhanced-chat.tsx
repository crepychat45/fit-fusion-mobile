import React from "react";
import type { User } from "@supabase/supabase-js";
import { AdvancedChatInterface } from "./advanced-chat-interface";

interface AIEnhancedChatProps {
  user?: User | null;
}

export function AIEnhancedChat({ user }: AIEnhancedChatProps) {
  return (
    <AdvancedChatInterface
      user={user}
      defaultMode="ai"
      securityLevel="high"
      className="h-full min-h-[620px]"
    />
  );
}