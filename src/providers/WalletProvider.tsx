import React, { createContext, useContext } from "react";

import type { Wallet } from "@/src/domain/entities/Wallet";

interface WalletState {
  wallet: Wallet | null;
  isLoading: boolean;
}

const WalletContext = createContext<WalletState>({ wallet: null, isLoading: false });

export function WalletProvider({ children }: { children: React.ReactNode }) {
  return (
    <WalletContext.Provider value={{ wallet: null, isLoading: false }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet(): WalletState {
  return useContext(WalletContext);
}
