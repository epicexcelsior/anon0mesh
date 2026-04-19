// LxmfService — domain-level contract mirroring the @lxmf/react-native public API (D25).
//
// Types and the LxmfNodeMode enum live here so src/hooks/ can consume them without
// importing from src/infrastructure/ (which would violate the hexagonal-lite layer
// rule in architecture.md). Infrastructure's LxmfStubAdapter implements LxmfService
// by providing state + actions that match LxmfReturnShape.
//
// When the real @lxmf/react-native package ships, its hook return shape is expected
// to satisfy LxmfReturnShape by construction (types were verified against
// lxmf_react_native_rust/expo-module/src/useLxmf.ts at 2026-04-18).

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
    | "statusChanged"
    | "packetReceived"
    | "txReceived"
    | "beaconDiscovered"
    | "messageReceived"
    | "announceReceived"
    | "log"
    | "error";
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

/** Return shape of useLxmf() — state + actions, matches real package. */
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

/** LxmfService is the adapter-level contract — same shape as the hook's return value. */
export type LxmfService = LxmfReturnShape;
