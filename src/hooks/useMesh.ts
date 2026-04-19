import { useCallback, useEffect, useState } from "react";

import type { Peer } from "@/src/domain/entities/Peer";
import { useAdapters } from "@/src/providers/AdapterProvider";

export type ConnectionState = "Live" | "Silent" | "Offline";

export function useMesh() {
  const [peers, setPeers] = useState<Peer[]>([]);
  const adapters = useAdapters();

  useEffect(() => {
    adapters.mesh.getPeers().then(setPeers).catch(() => {});
  }, [adapters]);

  const refresh = useCallback(() => {
    adapters.mesh.getPeers().then(setPeers).catch(() => {});
  }, [adapters]);

  const nodeCount = peers.length;
  const connectionState: ConnectionState = nodeCount > 0 ? "Live" : "Offline";
  const iface = "BLE";

  return { peers, nodeCount, connectionState, iface, refresh };
}
