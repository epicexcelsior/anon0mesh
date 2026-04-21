import { useCallback, useEffect, useState } from "react";

import type {
  NetworkPreferences,
  PrivacyPreferences,
} from "@/src/domain/services/PreferencesService";
import {
  DEFAULT_NETWORK_PREFERENCES,
  DEFAULT_PRIVACY_PREFERENCES,
} from "@/src/domain/services/PreferencesService";
import { useAdapters } from "@/src/providers/AdapterProvider";

export function usePreferences() {
  const adapters = useAdapters();
  const [network, setNetwork] = useState<NetworkPreferences>(DEFAULT_NETWORK_PREFERENCES);
  const [privacy, setPrivacy] = useState<PrivacyPreferences>(DEFAULT_PRIVACY_PREFERENCES);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [nextNetwork, nextPrivacy] = await Promise.all([
        adapters.preferences.getNetwork(),
        adapters.preferences.getPrivacy(),
      ]);
      setNetwork(nextNetwork);
      setPrivacy(nextPrivacy);
    } finally {
      setLoading(false);
    }
  }, [adapters]);

  useEffect(() => {
    void load();
    const unsubscribe = adapters.preferences.subscribe?.(() => {
      void load();
    });
    return () => {
      unsubscribe?.();
    };
  }, [adapters, load]);

  const updateNetwork = useCallback(
    async (update: Partial<NetworkPreferences>) => {
      const next = await adapters.preferences.saveNetwork(update);
      setNetwork(next);
      return next;
    },
    [adapters],
  );

  const updatePrivacy = useCallback(
    async (update: Partial<PrivacyPreferences>) => {
      const next = await adapters.preferences.savePrivacy(update);
      setPrivacy(next);
      return next;
    },
    [adapters],
  );

  return {
    network,
    privacy,
    loading,
    refresh: load,
    updateNetwork,
    updatePrivacy,
  };
}
