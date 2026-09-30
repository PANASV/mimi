/** Non-secret evidence contract shared with the Android onboarding design. */
export type GuideStep = "service" | "credentials" | "permissions" | "audio" | "caption";
export type EvidenceState = "unknown" | "missing" | "denied" | "revoked" | "ready";
export interface GuideEvidence {
  serviceSelected: boolean;
  credentials: EvidenceState;
  permissions: EvidenceState;
  audio: EvidenceState | "silent";
  /** Only current-session, nonempty, actually rendered subtitles qualify. */
  captionVisible: boolean;
}
export function firstMissingStep(evidence: GuideEvidence): GuideStep {
  if (!evidence.serviceSelected) return "service";
  if (evidence.credentials !== "ready") return "credentials";
  if (evidence.permissions !== "ready") return "permissions";
  if (evidence.audio !== "ready") return "audio";
  return "caption";
}
export function guideComplete(evidence: GuideEvidence): boolean {
  return firstMissingStep(evidence) === "caption" && evidence.captionVisible;
}
