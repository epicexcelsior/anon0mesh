import { useState, useEffect, useCallback } from 'react';
import type { Peer } from '@/src/domain/entities/Peer';
import { useAdapters } from '@/src/providers/AdapterProvider';

export function usePeers() {
  const [peers, setPeers] = useState<Peer[]>([]);
  const [loading, setLoading] = useState(true);
  const adapters = useAdapters();

  useEffect(() => {
    adapters.mesh
      .getPeers()
      .then(p => {
        setPeers(p);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [adapters]);

  const trust = useCallback((id: string) => adapters.mesh.trust(id), [adapters]);
  const block = useCallback((id: string) => adapters.mesh.block(id), [adapters]);

  return { peers, loading, trust, block };
}
