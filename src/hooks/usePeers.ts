import { useCallback, useEffect, useState } from "react";

import type { Peer } from '@/src/domain/entities/Peer';
import { useAdapters } from '@/src/providers/AdapterProvider';

export function usePeers() {
  const [peers, setPeers] = useState<Peer[]>([]);
  const [loading, setLoading] = useState(true);
  const adapters = useAdapters();

  const loadPeers = useCallback(async () => {
    try {
      const nextPeers = await adapters.mesh.getPeers();
      setPeers(nextPeers);
    } finally {
      setLoading(false);
    }
  }, [adapters]);

  useEffect(() => {
    void loadPeers();
    const intervalId = setInterval(() => {
      void loadPeers();
    }, 1500);
    return () => {
      clearInterval(intervalId);
    };
  }, [loadPeers]);

  const trust = useCallback(
    async (id: string) => {
      await adapters.mesh.trust(id);
      await loadPeers();
    },
    [adapters, loadPeers],
  );
  const block = useCallback(
    async (id: string) => {
      await adapters.mesh.block(id);
      await loadPeers();
    },
    [adapters, loadPeers],
  );

  return { peers, loading, trust, block };
}
