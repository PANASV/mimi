// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { guideFocusControls } from "./guideFocus";
afterEach(() => { vi.restoreAllMocks(); document.body.innerHTML = ""; });
it("excludes closed details controls even when the engine retains their layout", () => {
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({ width: 50, height: 20 } as DOMRect);
  const container = document.createElement("div");
  container.innerHTML = '<button id="first">Later</button><details><summary id="summary">Advanced</summary><select id="closed"><option>Hidden choice</option></select><button id="closed-link">Pricing</button></details><input id="field"><button disabled>Disabled</button><div hidden><button>Hidden</button></div>';
  document.body.append(container);
  expect(guideFocusControls(container).map(control => control.id)).toEqual(["first", "summary", "field"]);
  container.querySelector("details")!.open = true;
  expect(guideFocusControls(container).map(control => control.id)).toEqual(["first", "summary", "closed", "closed-link", "field"]);
});
it("keeps an inner summary out of the tab loop until its outer details opens", () => {
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({ width: 50, height: 20 } as DOMRect);
  const container = document.createElement("div");
  container.innerHTML = '<details><summary id="outer">Outer</summary><details open><summary id="inner">Inner</summary><input id="field"></details></details>';
  document.body.append(container);
  expect(guideFocusControls(container).map(control => control.id)).toEqual(["outer"]);
  container.querySelector("details")!.open = true;
  expect(guideFocusControls(container).map(control => control.id)).toEqual(["outer", "inner", "field"]);
});
