import { useCallback, useEffect, useState } from "react";

import type { Peer } from "@/src/domain/entities/Peer";
import { useAdapters, useMeshBLE } from "@/src/providers";

export type ConnectionState = "Live" | "Silent" | "Offline";

export function useMesh() {
  const [peers, setPeers] = useState<Peer[]>([]);
  const adapters = useAdapters();
  const { bleError, enabled, scanning, setEnabled } = useMeshBLE();

  const loadPeers = useCallback(async () => {
    try {
      const nextPeers = await adapters.mesh.getPeers();
      setPeers(nextPeers);
    } catch {
      setPeers([]);
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

  const refresh = useCallback(() => {
    void loadPeers();
  }, [loadPeers]);

  const nodeCount = peers.length;
  const connectionState: ConnectionState = !enabled
    ? "Offline"
    : nodeCount > 0
      ? "Live"
      : scanning
        ? "Silent"
        : "Offline";
  const iface = "BLE";

  return {
    peers,
    nodeCount,
    connectionState,
    iface,
    refresh,
    bleError,
    enabled,
    scanning,
    setEnabled,
  };
}
