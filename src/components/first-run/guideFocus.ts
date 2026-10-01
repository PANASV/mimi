/** Closed details may keep layout rects, but their contents cannot take focus. */
export function guideFocusControls(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>("button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), summary, [tabindex='0']")).filter(control => {
    if (control.closest("[hidden]")) return false;
    for (let ancestor = control.parentElement; ancestor && ancestor !== container; ancestor = ancestor.parentElement) {
      if (ancestor instanceof HTMLDetailsElement && !ancestor.open) {
        const summary = ancestor.querySelector(":scope > summary");
        if (!summary?.contains(control)) return false;
      }
    }
    const rect = control.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 && getComputedStyle(control).visibility !== "hidden";
  });
}
