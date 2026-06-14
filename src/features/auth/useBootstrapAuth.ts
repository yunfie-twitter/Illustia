import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useSettingsStore } from "@/stores/settingsStore";

export function useBootstrapAuth() {
  const bootstrap = useAuthStore((state) => state.bootstrap);
  const hydrate = useSettingsStore((state) => state.hydrate);

  useEffect(() => {
    void hydrate();
    void bootstrap();
  }, [bootstrap, hydrate]);
}
