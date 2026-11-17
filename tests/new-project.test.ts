// Mock minimal browser globals for testing feature flag logic in Node
const mockStorage = new Map<string, string>();
(globalThis as any).localStorage = {
  getItem: (k: string) => mockStorage.get(k) ?? null,
  setItem: (k: string, v: string) => mockStorage.set(k, String(v)),
  removeItem: (k: string) => mockStorage.delete(k),
  clear: () => mockStorage.clear(),
};
(globalThis as any).window = globalThis;

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  isExtraPlatformsEnabled,
  EXTRA_PLATFORMS_FLAG_KEY,
  PLATFORMS,
  TEMPLATES,
} from "../XWinCode/src/lib/templates";
import { t } from "../XWinCode/src/i18n";
import en from "../XWinCode/src/i18n/locales/en.json";

describe("New Project Dialog & Template Requirements", () => {
  const originalWindowProp = (globalThis as unknown as { __XWC_EXTRA_PLATFORMS__?: boolean }).__XWC_EXTRA_PLATFORMS__;

  beforeEach(() => {
    localStorage.removeItem(EXTRA_PLATFORMS_FLAG_KEY);
    delete (globalThis as unknown as { __XWC_EXTRA_PLATFORMS__?: boolean }).__XWC_EXTRA_PLATFORMS__;
  });

  afterEach(() => {
    localStorage.removeItem(EXTRA_PLATFORMS_FLAG_KEY);
    if (originalWindowProp !== undefined) {
      (globalThis as unknown as { __XWC_EXTRA_PLATFORMS__?: boolean }).__XWC_EXTRA_PLATFORMS__ = originalWindowProp;
    } else {
      delete (globalThis as unknown as { __XWC_EXTRA_PLATFORMS__?: boolean }).__XWC_EXTRA_PLATFORMS__;
    }
  });

  describe("Feature Flag & Platform Tabs", () => {
    it("defaults to feature flag OFF so Windows and Multiplatform tabs are hidden", () => {
      expect(isExtraPlatformsEnabled()).toBe(false);

      const availablePlatforms = PLATFORMS.filter((p) => isExtraPlatformsEnabled() || p.id === "ios");
      expect(availablePlatforms).toHaveLength(1);
      expect(availablePlatforms[0].id).toBe("ios");
    });

    it("enables Windows and Multiplatform tabs when localStorage flag is set to 1", () => {
      localStorage.setItem(EXTRA_PLATFORMS_FLAG_KEY, "1");
      expect(isExtraPlatformsEnabled()).toBe(true);

      const availablePlatforms = PLATFORMS.filter((p) => isExtraPlatformsEnabled() || p.id === "ios");
      expect(availablePlatforms).toHaveLength(3);
      expect(availablePlatforms.map((p) => p.id)).toEqual(["ios", "windows", "multi"]);
    });

    it("enables Windows and Multiplatform tabs when __XWC_EXTRA_PLATFORMS__ window prop is true", () => {
      (globalThis as unknown as { __XWC_EXTRA_PLATFORMS__?: boolean }).__XWC_EXTRA_PLATFORMS__ = true;
      expect(isExtraPlatformsEnabled()).toBe(true);

      const availablePlatforms = PLATFORMS.filter((p) => isExtraPlatformsEnabled() || p.id === "ios");
      expect(availablePlatforms).toHaveLength(3);
    });

    it("opens straight to Swift Student Challenge as the default template", () => {
      const defaultTemplate = TEMPLATES[0];
      expect(defaultTemplate.id).toBe("appPlayground");
      expect(t(defaultTemplate.title)).toBe("Swift Student Challenge");
    });
  });

  describe("Template Requirements & Notices", () => {
    it("Swift Student Challenge template has unverified-template warning notice visible", () => {
      const ssc = TEMPLATES.find((t) => t.id === "appPlayground");
      expect(ssc).toBeDefined();
      expect(ssc?.notice).toBe("np.tpl.ssc.notice");
      expect(t(ssc!.notice!)).toContain("Template format not yet verified on a Mac");
    });

    it("Swift Student Challenge template shows standalone capability without WSL/xtool/SDK requirements", () => {
      const ssc = TEMPLATES.find((t) => t.id === "appPlayground");
      expect(ssc).toBeDefined();

      const standaloneLine = t("np.standaloneNotice");
      expect(standaloneLine).toBe("Live Preview, Submission Check and Export work without WSL, an iPhone, or a Mac.");
    });

    it("Native iOS App template requires WSL & xtool pipeline", () => {
      const app = TEMPLATES.find((t) => t.id === "iosApp");
      expect(app).toBeDefined();
      expect(app?.notice).toBeUndefined();

      const requiresStr = t("np.requires");
      expect(requiresStr).toContain("Requires WSL, xtool and the iOS SDK");
      expect(t("np.step.sdk")).toBe("iOS SDK");
      expect(t("np.step.signing")).toBe("Apple ID signing");
      expect(t("np.step.usb")).toBe("iPhone over USB");
    });
  });

  describe("i18n String Keys Audit", () => {
    const requiredKeys = [
      "np.tpl.ssc.title",
      "np.tpl.ssc.desc",
      "np.tpl.ssc.notice",
      "np.standaloneNotice",
      "np.tpl.app.title",
      "np.tpl.app.desc",
      "np.platform.ios",
      "np.platform.windows",
      "np.platform.multi",
      "np.step.sdk",
      "np.step.signing",
      "np.step.usb",
      "np.requires",
    ] as const;

    for (const key of requiredKeys) {
      it(`en.json contains non-empty string for key "${key}"`, () => {
        expect(en[key]).toBeDefined();
        expect(typeof en[key]).toBe("string");
        expect(en[key].length).toBeGreaterThan(0);
      });
    }
  });
});
