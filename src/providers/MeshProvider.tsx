import React, { createContext, useContext } from "react";

import type { Peer } from "@/src/domain/entities/Peer";

interface MeshState {
  peers: Peer[];
  isScanning: boolean;
}

const MeshContext = createContext<MeshState>({ peers: [], isScanning: false });

export function MeshProvider({ children }: { children: React.ReactNode }) {
  return (
    <MeshContext.Provider value={{ peers: [], isScanning: false }}>
      {children}
    </MeshContext.Provider>
  );
}

export function useMesh(): MeshState {
  return useContext(MeshContext);
}
