import { describe, expect, it } from "vitest";
import { firstMissingStep, guideComplete, type GuideEvidence } from "./guideModel";
const ready: GuideEvidence = { serviceSelected: true, credentials: "ready", permissions: "ready", audio: "ready", captionVisible: true };
describe("first-run evidence", () => {
  it("does not complete on a connection or saved credential without subtitles", () => {
    expect(guideComplete({ ...ready, captionVisible: false })).toBe(false);
  });
  it("rechecks revoked permissions and missing credentials even after a subtitle", () => {
    expect(firstMissingStep({ ...ready, permissions: "revoked" })).toBe("permissions");
    expect(guideComplete({ ...ready, credentials: "missing" })).toBe(false);
  });
  it("keeps silence and unknown audio incomplete", () => {
    expect(firstMissingStep({ ...ready, audio: "missing" })).toBe("audio");
    expect(guideComplete({ ...ready, audio: "unknown" })).toBe(false);
    expect(guideComplete({ ...ready, audio: "silent" })).toBe(false);
    expect(guideComplete(ready)).toBe(true);
  });
});
