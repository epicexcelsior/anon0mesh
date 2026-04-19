import type { Adapters } from "@/src/providers/AdapterProvider";

// Fixture adapters for development / Storybook-style rendering.
export const fixtureAdapters: Adapters = {
  wallet: {
    getWallet: async () => ({
      address: "AnoN...1234",
      balances: [
        { symbol: "SOL", amount: "4.20", usdValue: "$672.00" },
        { symbol: "USDC", amount: "100.00", usdValue: "$100.00" },
      ],
      identity: "fixture-identity-1",
    }),
    refreshBalances: async () => {},
    send: async () => { throw new Error("send not implemented in fixtures"); },
    getHistory: async () => [],
  },
  transaction: {
    getById: async () => null,
    list: async () => [],
    updateStatus: async () => {},
  },
  mesh: {
    startScan: async () => {},
    stopScan: async () => {},
    getPeers: async () => [],
    trust: async () => {},
    block: async () => {},
  },
  messaging: {
    getThreads: async () => [],
    getMessages: async () => [],
    send: async () => { throw new Error("send not implemented in fixtures"); },
  },
  beacon: {
    getMode: async () => "passive",
    setMode: async () => {},
    isAdvertising: async () => false,
  },
};
