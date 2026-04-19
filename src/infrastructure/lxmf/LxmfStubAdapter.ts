// LxmfStubAdapter — implements LxmfService (domain-level contract for the @lxmf/react-native API).
// When the parallel LXMF agent publishes @lxmf/react-native, swap this module's default export
// for a concrete adapter that delegates to the real package. Per D25 the hook return shape
// must match exactly — types live in src/domain/services/LxmfService.ts.

import {
  LxmfNodeMode,
  type LxmfReturnShape,
  type LxmfService,
} from "@/src/domain/services/LxmfService";

// Re-export types + enum for convenience (infrastructure is allowed to re-export domain).
export { LxmfNodeMode };
export type {
  Beacon,
  LxmfEvent,
  LxmfNodeStatus,
  LxmfReturnShape,
  LxmfService,
  TcpInterface,
  UseLxmfOptions,
} from "@/src/domain/services/LxmfService";

export const lxmfStubState: Pick<
  LxmfReturnShape,
  "status" | "beacons" | "events" | "error" | "isRunning" | "isNativeAvailable"
> = {
  status: null,
  beacons: [],
  events: [],
  error: null,
  isRunning: false,
  isNativeAvailable: false,
};

export const lxmfStubActions: Pick<
  LxmfReturnShape,
  | "start"
  | "stop"
  | "send"
  | "broadcast"
  | "getStatus"
  | "getBeacons"
  | "fetchMessages"
  | "setLogLevel"
  | "startBLE"
  | "stopBLE"
  | "bleUnpairedRNodeCount"
> = {
  start: async () => false,
  stop: async () => {},
  send: async (_destHex, _bodyBase64) => Promise.resolve(0),
  broadcast: async (_destsHex, _bodyBase64) => Promise.resolve(0),
  getStatus: () => null,
  getBeacons: () => [],
  fetchMessages: () => [],
  setLogLevel: () => {},
  startBLE: () => {},
  stopBLE: () => {},
  bleUnpairedRNodeCount: () => 0,
};

/** Full stub combining state + actions — satisfies the LxmfService contract. */
export const lxmfStub: LxmfService = {
  ...lxmfStubState,
  ...lxmfStubActions,
};
