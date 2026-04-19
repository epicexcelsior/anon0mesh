export type PeerTransport = "ble" | "lxmf" | "wifi-direct";
export type SignalStrength = 0 | 1 | 2 | 3 | 4;

export interface Peer {
  id: string;
  alias: string;
  publicKey: string;
  transport: PeerTransport;
  signalStrength: SignalStrength;
  lastSeen: number;
  isTrusted: boolean;
}
