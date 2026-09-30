import { createRoot } from "react-dom/client";
import "../../index.css";
import App from "../../App";
import { useStore } from "../../lib/store";
import { setStoredUiLanguage } from "../../lib/i18n";
import { requestGuideNavigation } from "./guideNavigation";
import { isTauri } from "../../lib/ipc";

// Public browser fixture only: no OS credentials or provider sessions.
if (isTauri) throw new Error("First-run fixture is browser-only.");
const parameters = new URLSearchParams(location.search);
const language = parameters.get("lang");
setStoredUiLanguage(language === "en" || language === "ja" ? language : "zh");
if (parameters.get("scenario") === "immersive") requestGuideNavigation("immersiveHelp");
useStore.setState(state => ({
  settings: { ...state.settings, profiles: state.settings.profiles.map(profile => ({ ...profile, credentialState: "missing" })) },
}));
createRoot(document.getElementById("root")!).render(<App />);
