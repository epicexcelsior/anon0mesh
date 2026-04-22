import React, { createContext, useContext, useMemo } from "react";

import type { BeaconService } from "@/src/domain/services/BeaconService";
import type { LxmfService } from "@/src/domain/services/LxmfService";
import type { MeshService } from "@/src/domain/services/MeshService";
import type { MessagingService } from "@/src/domain/services/MessagingService";
import type { PreferencesService } from "@/src/domain/services/PreferencesService";
import type { TransactionService } from "@/src/domain/services/TransactionService";
import type { WalletService } from "@/src/domain/services/WalletService";
import { fixtureAdapters } from "@/src/fixtures/adapters";
import { realAdapters } from "@/src/infrastructure/adapters";

export interface Adapters {
  wallet: WalletService;
  transaction: TransactionService;
  mesh: MeshService;
  messaging: MessagingService;
  beacon: BeaconService;
  lxmf: LxmfService;
  preferences: PreferencesService;
}

const AdapterContext = createContext<Adapters | null>(null);

interface AdapterProviderProps {
  children: React.ReactNode;
  overrides?: Partial<Adapters>;
}

export function AdapterProvider({ children, overrides }: AdapterProviderProps) {
  const useFixtures = process.env.EXPO_PUBLIC_ADAPTERS === "fixtures";

  const adapters = useMemo<Adapters>(() => {
    const base = useFixtures ? fixtureAdapters : realAdapters;
    return { ...base, ...overrides };
  }, [useFixtures, overrides]);

  return <AdapterContext.Provider value={adapters}>{children}</AdapterContext.Provider>;
}

export function useAdapters(): Adapters {
  const ctx = useContext(AdapterContext);
  if (!ctx) throw new Error("useAdapters must be used inside AdapterProvider");
  return ctx;
}
