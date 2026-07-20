import React from "react";
import { AdvancedChatInterface } from "./advanced-chat-interface";

export function MobileChatInterface() {
  return <AdvancedChatInterface compact className="h-full min-h-[calc(100dvh-15rem)] rounded-none border-0" />;
}