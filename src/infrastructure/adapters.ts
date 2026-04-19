import { LocalWalletAdapter } from '@/src/infrastructure/wallet';
import { solanaTransactionService } from '@/src/infrastructure/solana';
import { bleMeshAdapter } from '@/src/infrastructure/ble';
import { beaconAdapter } from '@/src/infrastructure/beacon';

// Messaging: use FixtureMessagingAdapter for now — no real messaging backend (LXMF handles this later)
import { fixtureMessagingAdapter } from '@/src/infrastructure/fixtures';
import type { Adapters } from '@/src/providers/AdapterProvider';

const walletAdapter = new LocalWalletAdapter();

export const realAdapters: Adapters = {
  wallet: walletAdapter,
  transaction: solanaTransactionService,
  mesh: bleMeshAdapter,
  messaging: fixtureMessagingAdapter,
  beacon: beaconAdapter,
};
