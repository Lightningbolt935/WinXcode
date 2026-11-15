import { useStore } from "./store";
import { api } from "./ipc";
import { createDoc, getDoc } from "./models";

/**
 * Dev-only corpus file loader.
 * Loads a Swift file directly into the editor and opens the Canvas preview.
 * This is tree-shaken and excluded from production builds.
 */
export async function initDevCorpusLoader(fileParam: string): Promise<void> {
  if (!import.meta.env.DEV) return;

  // 1. Ensure basic settings exist in store
  const settings = await api.getSettings().catch(() => null);
  if (settings) {
    useStore.setState({ settings, configuration: settings.defaultConfiguration ?? "debug" });
  }

  // 2. Normalize file path and fetch content
  const normalized = fileParam.replace(/\\/g, "/");
  let content = "";
  try {
    const res = await fetch(`/__dev/file?path=${encodeURIComponent(normalized)}`);
    if (!res.ok) {
      console.error(`[DevLoader] Could not load file: ${fileParam} (HTTP ${res.status})`);
      return;
    }
    content = await res.text();
  } catch (err) {
    console.error(`[DevLoader] Failed to fetch: ${fileParam}`, err);
    return;
  }

  // 3. Determine project root folder and project name
  const dir = normalized.includes("/") ? normalized.slice(0, normalized.lastIndexOf("/")) : ".";
  const name = dir.split("/").pop() || "CorpusApp";

  // 4. Set project info (iosApp kind is required for Canvas preview)
  const state = useStore.getState();
  await state.setProject({
    root: dir,
    name,
    kind: "iosApp",
    bundleId: `dev.xwincode.${name.toLowerCase()}`,
  });

  // 5. Ensure Monaco text model exists
  if (!getDoc(normalized)) {
    createDoc(normalized, content);
  }

  // 6. Open file and activate
  await state.openFile(normalized);

  // 7. Ensure Canvas is toggled on
  state.toggleCanvas(true);
}
