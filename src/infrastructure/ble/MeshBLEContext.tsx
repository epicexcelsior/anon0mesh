import React, { createContext, useContext, useEffect } from 'react';
import { bleMeshAdapter } from './BLEMeshAdapter';

const MeshBLEContext = createContext<typeof bleMeshAdapter | null>(null);

export function MeshBLEProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    bleMeshAdapter.startScan().catch(() => {});
    return () => { bleMeshAdapter.stopScan(); };
  }, []);
  return <MeshBLEContext.Provider value={bleMeshAdapter}>{children}</MeshBLEContext.Provider>;
}

export function useMeshBLE() {
  const ctx = useContext(MeshBLEContext);
  if (!ctx) throw new Error('useMeshBLE must be used inside MeshBLEProvider');
  return ctx;
}
