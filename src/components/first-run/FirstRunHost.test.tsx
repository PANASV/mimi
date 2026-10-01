// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { useStore } from "../../lib/store";
import { setStoredUiLanguage } from "../../lib/i18n";
import { FirstRunHost } from "./FirstRunHost";

let root: Root;
let host: HTMLDivElement;
const initial = useStore.getInitialState();
beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  localStorage.clear(); setStoredUiLanguage("zh");
  vi.stubGlobal("requestAnimationFrame", vi.fn(() => 0));
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
  useStore.setState({ ...initial, initialized: true, settings: { ...initial.settings, activeProfileId: "synthetic", profiles: [{ id: "synthetic", name: "Fixture", provider: "alibabaCloud", credentialState: "missing" }] } }, true);
  host = document.createElement("div"); document.body.append(host); root = createRoot(host);
});
afterEach(async () => { await act(async () => root.unmount()); host.remove(); useStore.setState(initial, true); vi.unstubAllGlobals(); });
async function mount() { await act(async () => { root.render(<FirstRunHost />); await new Promise(resolve => setTimeout(resolve, 0)); }); }

it("keeps the automatically opened guide after the real embedded form saves and selects a profile", async () => {
  // No explicit guide-navigation intent: this is the native first-run entry condition.
  await mount(); expect(host.querySelector('[role="dialog"]')).toBeTruthy();
  const input = host.querySelector<HTMLInputElement>('input[type="password"]')!;
  await act(async () => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, "synthetic-not-a-real-key"); input.dispatchEvent(new Event("input", { bubbles: true })); });
  await act(async () => { host.querySelector("form")!.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })); });
  expect(useStore.getState().settings.profiles[0].credentialState).toBe("present");
  expect(host.querySelector('[role="dialog"]')).toBeTruthy();
  expect(host.querySelector<HTMLButtonElement>(".mvg-primary")!.disabled).toBe(false);
  await act(async () => host.querySelector<HTMLButtonElement>(".mvg-primary")!.click());
  expect(host.querySelector('nav [aria-current="step"]')?.textContent).toContain("播放声音");
  await act(async () => host.querySelectorAll<HTMLButtonElement>("nav button")[2].click());
  expect(host.querySelector('nav [aria-current="step"]')?.textContent).toContain("显示字幕");
  expect(host.querySelector(".mvg-primary")?.textContent).not.toBe("完成");
});

it("retains an automatic flow started by asynchronous credential hydration", async () => {
  useStore.setState(state => ({ initialized: false, settings: { ...state.settings, profiles: state.settings.profiles.map(profile => ({ ...profile, credentialState: "unavailable" })) } }));
  await mount(); expect(host.querySelector('[role="dialog"]')).toBeNull();
  await act(async () => useStore.setState(state => ({ initialized: true, settings: { ...state.settings, profiles: state.settings.profiles.map(profile => ({ ...profile, credentialState: "missing" })) } })));
  expect(host.querySelector('[role="dialog"]')).toBeTruthy();
  await act(async () => useStore.setState(state => ({ settings: { ...state.settings, profiles: state.settings.profiles.map(profile => ({ ...profile, credentialState: "present" })) } })));
  expect(host.querySelector('[role="dialog"]')).toBeTruthy();
});

it("dismisses only on an explicit action and allows reopening with ready credentials", async () => {
  await mount(); await act(async () => host.querySelector<HTMLButtonElement>(".mvg-later")!.click());
  expect(host.querySelector('[role="dialog"]')).toBeNull();
  await act(async () => useStore.setState(state => ({ settings: { ...state.settings, profiles: state.settings.profiles.map(profile => ({ ...profile, credentialState: "present" })) } })));
  expect(host.querySelector('[role="dialog"]')).toBeNull();
  await act(async () => host.querySelector<HTMLButtonElement>(".first-run-launch")!.click());
  expect(host.querySelector('[role="dialog"]')).toBeTruthy();
  await act(async () => host.querySelector('[role="dialog"]')!.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })));
  expect(host.querySelector('[role="dialog"]')).toBeNull();
});
