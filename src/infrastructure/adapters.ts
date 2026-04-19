import type { Adapters } from "@/src/providers/AdapterProvider";

// Stub real adapters — replace each with real implementations in Phase 4+.
const stub = () => { throw new Error("Real adapter not yet implemented"); };

export const realAdapters: Adapters = {
  wallet: { getWallet: stub, refreshBalances: stub, send: stub, getHistory: stub },
  transaction: { getById: stub, list: stub, updateStatus: stub },
  mesh: { startScan: stub, stopScan: stub, getPeers: stub, trust: stub, block: stub },
  messaging: { getThreads: stub, getMessages: stub, send: stub },
  beacon: { getMode: stub, setMode: stub, isAdvertising: stub },
};
