// @vitest-environment jsdom
import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { FirstRunVisualCandidate } from "./FirstRunVisualCandidate";
import { EMPTY_GUIDE_SHORTCUTS } from "./guideIpc";
import { providerHelp } from "./providerHelp";
import { setStoredUiLanguage } from "../../lib/i18n";

let root: Root;
let host: HTMLDivElement;
let props: Parameters<typeof FirstRunVisualCandidate>[0];
beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  setStoredUiLanguage("zh");
  host = document.createElement("div"); document.body.append(host); root = createRoot(host);
  props = { evidence: { serviceSelected: true, credentials: "missing", permissions: "unknown", audio: "unknown", captionVisible: false }, services: [{ id: "alibabaCloud", name: "Alibaba", description: "" }], selectedService: "alibabaCloud", help: providerHelp("alibabaCloud"), platform: "macos", onSelect: vi.fn(), onEdit: vi.fn(), onStart: vi.fn(), onLater: vi.fn(), onPermissionSettings: vi.fn(), onPermissionRefresh: vi.fn(), onImmersive: vi.fn(), onExitImmersive: vi.fn() };
});
afterEach(async () => { await act(() => root.unmount()); host.remove(); });
async function render(next = props) { props = next; await act(() => root.render(<FirstRunVisualCandidate {...props} />)); }
async function button(text: string) { const node = [...host.querySelectorAll("button")].find(item => item.textContent === text)!; expect(node).toBeTruthy(); await act(() => node.click()); }
async function nav(index: number) { await act(() => host.querySelectorAll<HTMLButtonElement>("nav button")[index].click()); }

it("keeps a configuration draft mounted across back/forward navigation", async () => {
  function Draft() { const [value, setValue] = useState(""); return <input value={value} onChange={event => setValue(event.target.value)} />; }
  await render({ ...props, configuration: <Draft /> });
  const input = host.querySelector("input")!;
  await act(() => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, "synthetic-draft"); input.dispatchEvent(new Event("input", { bubbles: true })); });
  expect(host.querySelector<HTMLButtonElement>(".mvg-primary")!.disabled).toBe(true);
  await nav(1); expect(input.closest("[hidden]")).toBeTruthy();
  await button("← 返回"); expect(input.closest("[hidden]")).toBeNull(); expect(input.value).toBe("synthetic-draft");
  expect(props.onLater).not.toHaveBeenCalled(); expect(props.onStart).not.toHaveBeenCalled();
});
it("missing credentials bring start back to the same form without closing", async () => {
  await render(); await nav(1); await button("开始字幕");
  expect(host.querySelector('nav [aria-current="step"]')?.textContent).toContain("连接服务");
  expect(props.onEdit).toHaveBeenCalledOnce(); expect(props.onStart).not.toHaveBeenCalled(); expect(props.onLater).not.toHaveBeenCalled();
});
it("permission actions never invent audio or caption evidence", async () => {
  await render({ ...props, evidence: { ...props.evidence, credentials: "ready" } });
  await button("打开权限设置"); await button("重新检查");
  expect(props.onPermissionSettings).toHaveBeenCalledOnce(); expect(props.onPermissionRefresh).toHaveBeenCalledOnce();
  expect(props.onStart).not.toHaveBeenCalled(); expect(host.textContent).not.toContain("声音权限已就绪。");
  await button("开始字幕"); expect(props.onStart).toHaveBeenCalledOnce(); expect(host.querySelector(".mvg-caption-status")?.textContent).toBe("还没开始字幕");
});
it("retains the guide during an active session and enables stop/retry", async () => {
  await render({ ...props, sessionActive: true, onStop: vi.fn(), evidence: { ...props.evidence, credentials: "ready" } }); await nav(2);
  expect(host.querySelector<HTMLButtonElement>(".mvg-primary")!.disabled).toBe(true);
  await button("停止字幕"); expect(props.onStop).toHaveBeenCalledOnce();
  await button("修改服务"); expect(host.querySelector<HTMLButtonElement>(".mvg-select")!.disabled).toBe(true); expect(props.onLater).not.toHaveBeenCalled();
});
it("offers real mode buttons but advertises only registered platform shortcuts", async () => {
  await render({ ...props, evidence: { ...props.evidence, credentials: "ready", audio: "ready" } });
  expect(host.querySelector("kbd")).toBeNull(); await button("进入沉浸模式"); expect(props.onImmersive).toHaveBeenCalledOnce();
  await render({ ...props, isImmersive: true, shortcuts: { ...EMPTY_GUIDE_SHORTCUTS, immersive: true } });
  expect(host.querySelector("kbd")?.textContent).toBe("⌘⇧M"); await button("退出沉浸模式"); expect(props.onExitImmersive).toHaveBeenCalledOnce();
  await render({ ...props, platform: "linux", shortcuts: { ...EMPTY_GUIDE_SHORTCUTS, systemCommands: { toggleSession: "mimi --toggle-session", toggleImmersive: "mimi --toggle-immersive", cycleSubtitleDisplay: "mimi --cycle-subtitle-display" } } });
  expect(host.querySelector("kbd")).toBeNull(); expect(host.querySelectorAll("code")).toHaveLength(3);
});
it("requires current caption, audio and permission proof before offering Done", async () => {
  await render({ ...props, evidence: { ...props.evidence, credentials: "ready", permissions: "ready", audio: "ready" } });
  expect(host.querySelector(".mvg-primary")?.textContent).not.toBe("完成");
  await render({ ...props, evidence: { ...props.evidence, captionVisible: true } }); await button("完成"); expect(props.onLater).toHaveBeenCalledOnce();
  await render({ ...props, evidence: { ...props.evidence, permissions: "revoked" } }); expect(host.querySelector(".mvg-primary")?.textContent).not.toBe("完成");
});
