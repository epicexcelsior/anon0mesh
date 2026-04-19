// useLxmf — delegates to the LXMF adapter provided via AdapterProvider. Return shape matches
// the @lxmf/react-native public API (D25). When the real package ships, swap the infrastructure
// adapter — the hook signature and return shape stay the same.

import { useAdapters } from "@/src/providers/AdapterProvider";
import {
  LxmfNodeMode,
  type Beacon,
  type LxmfEvent,
  type LxmfNodeStatus,
  type LxmfReturnShape,
  type TcpInterface,
  type UseLxmfOptions,
} from "@/src/domain/services/LxmfService";

export { LxmfNodeMode };
export type { Beacon, LxmfEvent, LxmfNodeStatus, LxmfReturnShape, TcpInterface, UseLxmfOptions };

export function useLxmf(_options: UseLxmfOptions = {}): LxmfReturnShape {
  const { lxmf } = useAdapters();
  return lxmf;
}
