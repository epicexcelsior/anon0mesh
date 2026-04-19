// Stub hook mirroring @lxmf/react-native public API shape (D25).
// When the parallel agent publishes the real package, this becomes a re-export.
export type LxmfNodeMode = 'BleOnly' | 'TcpClient' | 'TcpServer' | 'Reticulum';
export type LxmfStatus = 'idle' | 'starting' | 'running' | 'stopped' | 'error';

export interface LxmfState {
  status: LxmfStatus;
  mode: LxmfNodeMode;
  nodeId: string | null;
  beacons: string[];
}

export function useLxmf(): LxmfState & {
  start: (mode: LxmfNodeMode) => Promise<void>;
  stop: () => Promise<void>;
  send: (to: string, payload: Uint8Array) => Promise<void>;
} {
  return {
    status: 'idle',
    mode: 'BleOnly',
    nodeId: null,
    beacons: [],
    start: async () => {},
    stop: async () => {},
    send: async () => {},
  };
}
