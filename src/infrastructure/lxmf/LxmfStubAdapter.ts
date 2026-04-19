/**
 * LxmfStubAdapter — mirrors the real @lxmf/react-native module API (D25).
 *
 * Types are sourced directly from:
 *   lxmf_react_native_rust/expo-module/src/useLxmf.ts
 *
 * When the real package ships, swap the import path — no logic changes needed.
 */

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

/** Node transport mode — matches real LxmfNodeMode enum values exactly. */
export enum LxmfNodeMode {
  /** BLE-only mesh (default) */
  BleOnly = 0,
  /** Connect via FFI's internal TCP */
  TcpClient = 1,
  /** Listen via FFI's internal TCP */
  TcpServer = 2,
  /** Connect to standard Reticulum daemon (rnsd) via HDLC-framed TCP */
  Reticulum = 3,
}

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------

export interface TcpInterface {
  host: string;
  port: number;
}

/** Peer beacon as returned by the native layer. */
export interface Beacon {
  destHash: string;
  state: string;
  lastAnnounce: number;
  reconnectAttempts: number;
}

/** Node counters & lifecycle info. Mirrors LxmfNodeStatus from real package. */
export interface LxmfNodeStatus {
  running: boolean;
  mode: number;
  identityHex: string;
  addressHex: string;
  lifecycle: number;
  epoch: number;
  pendingOutbound: number;
  outboundSent: number;
  inboundAccepted: number;
  announcesReceived: number;
  lxmfMessagesReceived: number;
  blePeerCount: number;
}

export interface LxmfEvent {
  type:
    | 'statusChanged'
    | 'packetReceived'
    | 'txReceived'
    | 'beaconDiscovered'
    | 'messageReceived'
    | 'announceReceived'
    | 'log'
    | 'error';
  [key: string]: unknown;
}

export interface UseLxmfOptions {
  autoStart?: boolean;
  identityHex?: string;
  lxmfAddressHex?: string;
  dbPath?: string;
  logLevel?: number;
  mode?: LxmfNodeMode;
  tcpInterfaces?: TcpInterface[];
  announceIntervalMs?: number;
  bleMtuHint?: number;
  displayName?: string;
}

// ---------------------------------------------------------------------------
// Return shape of useLxmf() / stub state & actions
// ---------------------------------------------------------------------------

export interface LxmfReturnShape {
  // State
  status: LxmfNodeStatus | null;
  beacons: Beacon[];
  events: LxmfEvent[];
  error: string | null;
  isRunning: boolean;
  isNativeAvailable: boolean;
  // Actions
  start(overrides?: {
    identityHex?: string;
    lxmfAddressHex?: string;
    mode?: LxmfNodeMode;
    tcpInterfaces?: TcpInterface[];
    displayName?: string;
  }): Promise<boolean>;
  stop(): Promise<void>;
  send(destHex: string, bodyBase64: string): Promise<number>;
  broadcast(destsHex: string[], bodyBase64: string): Promise<number>;
  getStatus(): LxmfNodeStatus | null;
  getBeacons(): Beacon[];
  fetchMessages(limit?: number): unknown[];
  setLogLevel(level: number): void;
  startBLE(): void;
  stopBLE(): void;
  bleUnpairedRNodeCount(): number;
}

// ---------------------------------------------------------------------------
// Stub state constant
// ---------------------------------------------------------------------------

export const lxmfStubState: Pick<
  LxmfReturnShape,
  'status' | 'beacons' | 'events' | 'error' | 'isRunning' | 'isNativeAvailable'
> = {
  status: null,
  beacons: [],
  events: [],
  error: null,
  isRunning: false,
  isNativeAvailable: false,
};

// ---------------------------------------------------------------------------
// Stub actions constant (all async no-ops)
// ---------------------------------------------------------------------------

export const lxmfStubActions: Pick<
  LxmfReturnShape,
  | 'start'
  | 'stop'
  | 'send'
  | 'broadcast'
  | 'getStatus'
  | 'getBeacons'
  | 'fetchMessages'
  | 'setLogLevel'
  | 'startBLE'
  | 'stopBLE'
  | 'bleUnpairedRNodeCount'
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

/** Full stub combining state + actions — mirrors the return value of useLxmf(). */
export const lxmfStub: LxmfReturnShape = {
  ...lxmfStubState,
  ...lxmfStubActions,
};
