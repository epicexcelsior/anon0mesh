// useLxmf — thin hook delegating to LxmfStubAdapter. Mirrors the @lxmf/react-native public API (D25).
// When the parallel agent publishes the real package, swap this body for a re-export:
//   export { useLxmf, LxmfNodeMode } from '@lxmf/react-native';
// No component code changes required.

import { lxmfStub, LxmfNodeMode } from "@/src/infrastructure/lxmf/LxmfStubAdapter";
import type {
  Beacon,
  LxmfEvent,
  LxmfNodeStatus,
  LxmfReturnShape,
  TcpInterface,
  UseLxmfOptions,
} from "@/src/infrastructure/lxmf/LxmfStubAdapter";

export { LxmfNodeMode };
export type { Beacon, LxmfEvent, LxmfNodeStatus, LxmfReturnShape, TcpInterface, UseLxmfOptions };

export function useLxmf(_options: UseLxmfOptions = {}): LxmfReturnShape {
  // Stub implementation: returns a frozen state + no-op actions. No React state because
  // the stub has no dynamic behavior. Real package will maintain running state via native events.
  return lxmfStub;
}
