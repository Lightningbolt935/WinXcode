import type { TKey } from "../i18n";

export type Platform = "ios" | "windows" | "multi";

export const EXTRA_PLATFORMS_FLAG_KEY = "xwc.feature.extraPlatforms";

export function isExtraPlatformsEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return (
      (window as unknown as { __XWC_EXTRA_PLATFORMS__?: boolean }).__XWC_EXTRA_PLATFORMS__ === true ||
      localStorage.getItem(EXTRA_PLATFORMS_FLAG_KEY) === "1"
    );
  } catch {
    return false;
  }
}

export interface Template {
  id: "iosApp" | "appPlayground" | "executable" | "library";
  platform: Platform;
  title: TKey;
  desc: TKey;
  iconName: "Sparkles" | "Smartphone" | "SquareTerminal" | "Library";
  notice?: TKey;
}

export const TEMPLATES: Template[] = [
  {
    id: "appPlayground",
    platform: "ios",
    title: "np.tpl.ssc.title",
    desc: "np.tpl.ssc.desc",
    iconName: "Sparkles",
    notice: "np.tpl.ssc.notice",
  },
  {
    id: "iosApp",
    platform: "ios",
    title: "np.tpl.app.title",
    desc: "np.tpl.app.desc",
    iconName: "Smartphone",
  },
  {
    id: "executable",
    platform: "windows",
    title: "np.tpl.cli.title",
    desc: "np.tpl.cli.desc",
    iconName: "SquareTerminal",
  },
  {
    id: "library",
    platform: "multi",
    title: "np.tpl.lib.title",
    desc: "np.tpl.lib.desc",
    iconName: "Library",
  },
];

export const PLATFORMS: { id: Platform; label: TKey }[] = [
  { id: "ios", label: "np.platform.ios" },
  { id: "windows", label: "np.platform.windows" },
  { id: "multi", label: "np.platform.multi" },
];
