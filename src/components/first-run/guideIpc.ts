import { invoke } from "@tauri-apps/api/core";
import { isTauri } from "../../lib/ipc";
import type { DesktopShortcutCommands } from "../../lib/ipc";
export interface NativeGuideStatus {
  generation: string;
  captureRunning: boolean;
  nonSilentAudio: boolean;
  audioFramesObserved: boolean;
  captionVisible: boolean;
  synthetic: boolean;
  permissionGranted: boolean | null;
}
export const EMPTY_GUIDE_STATUS: NativeGuideStatus = { generation: "0", captureRunning: false, nonSilentAudio: false, audioFramesObserved: false, captionVisible: false, synthetic: true, permissionGranted: null };
export function getGuideStatus(): Promise<NativeGuideStatus> {
  return isTauri ? invoke("guide_status") : Promise.resolve(EMPTY_GUIDE_STATUS);
}
export function enableGuideImmersive(): Promise<void> { return invoke("guide_enable_immersive"); }
export interface GuideShortcuts {
  startStop: boolean;
  immersive: boolean;
  subtitleDisplay: boolean;
  systemCommands: DesktopShortcutCommands | null;
}
export const EMPTY_GUIDE_SHORTCUTS: GuideShortcuts = { startStop: false, immersive: false, subtitleDisplay: false, systemCommands: null };
export function getGuideShortcuts(): Promise<GuideShortcuts> {
  return isTauri ? invoke("guide_shortcuts") : Promise.resolve(EMPTY_GUIDE_SHORTCUTS);
}
export function openGuideAudioSettings(): Promise<void> {
  return isTauri ? invoke("guide_open_audio_settings") : Promise.reject(new Error("guide.permissions_preview"));
}
export function openGuideLink(url: string): Promise<void> {
  if (isTauri) return invoke("guide_open_link", { url });
  window.open(url, "_blank", "noopener,noreferrer");
  return Promise.resolve();
}

/** After actual overlay paint, confirm this current native generation only. */
export async function reportPaintedCaption(generation: string): Promise<void> {
  if (isTauri) await invoke("guide_caption_visible", { generation });
}
