import React, { createContext, useContext, useEffect, useState } from 'react';
import { bleMeshAdapter } from './BLEMeshAdapter';
import type { BLEMeshAdapter } from './BLEMeshAdapter';

interface MeshBLEContextValue {
  adapter: BLEMeshAdapter;
  bleError: string | null;
}

const MeshBLEContext = createContext<MeshBLEContextValue | null>(null);

export function MeshBLEProvider({ children }: { children: React.ReactNode }) {
  const [bleError, setBleError] = useState<string | null>(null);

  useEffect(() => {
    bleMeshAdapter.startScan().catch((e: unknown) => {
      if (__DEV__) console.warn('[BLE] startScan failed:', e);
      setBleError(e instanceof Error ? e.message : 'BLE unavailable');
    });
    return () => { bleMeshAdapter.stopScan(); };
  }, []);

  return (
    <MeshBLEContext.Provider value={{ adapter: bleMeshAdapter, bleError }}>
      {children}
    </MeshBLEContext.Provider>
  );
}

export function useMeshBLE() {
  const ctx = useContext(MeshBLEContext);
  if (!ctx) throw new Error('useMeshBLE must be used inside MeshBLEProvider');
  return ctx;
}
