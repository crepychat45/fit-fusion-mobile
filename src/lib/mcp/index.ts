import { auth, defineMcp } from "@lovable.dev/mcp-js";
import echoTool from "./tools/echo";
import getProfileTool from "./tools/get-profile";
import listWorkoutsTool from "./tools/list-workouts";

// The OAuth issuer MUST be the direct Supabase host. Build it from the project
// ref (Vite inlines VITE_SUPABASE_PROJECT_ID at build time so this stays
// import-safe). The fallback keeps the issuer well-formed during the manifest
// extract eval, where a token never verifies against the sentinel.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "fitfusion-mcp",
  title: "FitFusion MCP",
  version: "0.1.0",
  instructions:
    "Tools for the FitFusion fitness app. Use `get_profile` to read the signed-in user's profile, `list_workouts` to fetch recent workout sessions, and `echo` to verify connectivity.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [echoTool, getProfileTool, listWorkoutsTool],
});
