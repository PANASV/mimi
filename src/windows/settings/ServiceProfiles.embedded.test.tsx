// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { useStore } from "../../lib/store";
import { I18N, setStoredUiLanguage } from "../../lib/i18n";
import { ServiceProfiles } from "./ServiceProfiles";

let root: Root;
let host: HTMLDivElement;
const initial = useStore.getInitialState();
function Embedded() { const settings = useStore(state => state.settings); return <ServiceProfiles settings={settings} sessionIsActive={false} embedded />; }
beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  Element.prototype.scrollIntoView = vi.fn(); setStoredUiLanguage("zh");
  useStore.setState({ ...initial, settings: { ...initial.settings, activeProfileId: "synthetic", profiles: [{ id: "synthetic", name: "Fixture", provider: "alibabaCloud", credentialState: "missing" }] } }, true);
  host = document.createElement("div"); document.body.append(host); root = createRoot(host);
});
afterEach(async () => { await act(() => root.unmount()); host.remove(); useStore.setState(initial, true); });
async function change(value: string) { const input = host.querySelector<HTMLInputElement>('input[type="password"]')!; await act(() => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, value); input.dispatchEvent(new Event("input", { bubbles: true })); }); }
async function submit() { await act(async () => { host.querySelector("form")!.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })); }); }
it("uses the real save/activation path and keeps the failed draft editable", async () => {
  const save = vi.fn().mockRejectedValueOnce(new Error("synthetic save unavailable")).mockImplementation(async () => {
    const settings = useStore.getState().settings;
    const snapshot = { ...settings, profiles: settings.profiles.map(profile => ({ ...profile, credentialState: "present" as const })) };
    useStore.setState({ settings: snapshot }); return snapshot;
  });
  const select = vi.fn().mockImplementation(async () => useStore.getState().settings);
  useStore.setState({ saveProfileCredentials: save, selectProfile: select });
  await act(() => root.render(<Embedded />));
  expect(host.querySelector(".service-back")).toBeNull(); expect(host.querySelector('button[type="submit"]')).toBeTruthy();
  expect(host.querySelector("input")?.id).toBe("guide-profile-api-key-synthetic-apiKey");
  await change("synthetic-invalid-key"); await submit();
  expect(save).toHaveBeenCalledOnce(); expect(select).not.toHaveBeenCalled();
  expect(host.querySelector<HTMLInputElement>("input")!.value).toBe("synthetic-invalid-key");
  expect(host.textContent).toContain("操作未完成，请重试。");
  await submit(); expect(save).toHaveBeenCalledTimes(2); expect(select).toHaveBeenCalledWith("synthetic");
  expect(host.querySelector('input[type="password"]')).toBeNull(); expect(host.textContent).toContain(I18N.settings.credentialsSaved);
});
it("follows active provider changes and retains session locking", async () => {
  await act(() => root.render(<Embedded />));
  await act(() => useStore.setState(state => ({ settings: { ...state.settings, activeProfileId: "other", profiles: [...state.settings.profiles, { id: "other", name: "Other", provider: "openAIRealtime", credentialState: "missing" }] } })));
  expect(host.querySelector("input")?.id).toContain("guide-profile-api-key-other");
  await act(() => root.render(<ServiceProfiles settings={useStore.getState().settings} sessionIsActive embedded />));
  expect([...host.querySelectorAll<HTMLInputElement>("input")].every(input => input.disabled)).toBe(true);
});
