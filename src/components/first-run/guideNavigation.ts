// Keep the edit intent until the service page mounts; no secret or disk state.
let editIntent: string | undefined;
export function requestGuideEdit(profileId: string | undefined): void {
  editIntent = profileId;
  window.dispatchEvent(new Event("mimi-guide-edit"));
}
export function consumeGuideEdit(): string | undefined {
  const result = editIntent;
  editIntent = undefined;
  return result;
}

// Queue cold-window native navigation until the lazy guide has mounted.
type GuideTarget = "guide" | "immersiveHelp";
let navigationIntent: GuideTarget | undefined;
export function requestGuideNavigation(target: GuideTarget): void {
  navigationIntent = target;
  window.dispatchEvent(new Event("mimi-guide-navigation"));
}
export function consumeGuideNavigation(): GuideTarget | undefined {
  const target = navigationIntent;
  navigationIntent = undefined;
  return target;
}
