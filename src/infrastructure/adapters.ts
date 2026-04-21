import { LocalWalletAdapter, MWAWalletAdapter, WalletFactory } from '@/src/infrastructure/wallet';
import { solanaTransactionService } from '@/src/infrastructure/solana';
import { bleMeshAdapter } from '@/src/infrastructure/ble';
import { beaconAdapter } from '@/src/infrastructure/beacon';
import { lxmfStub } from '@/src/infrastructure/lxmf';
import { asyncPreferencesAdapter } from '@/src/infrastructure/preferences';

// Messaging: use FixtureMessagingAdapter until LXMF parallel agent ships @lxmf/react-native (D16/D24/D25).
import { fixtureMessagingAdapter } from '@/src/infrastructure/fixtures';
import type { Adapters } from '@/src/providers/AdapterProvider';

// M1 — use MWA on Solana Mobile (Saga/Seeker), LocalWallet elsewhere. D16 core target is Seeker,
// so detection belongs here — hardcoding LocalWalletAdapter silently degraded the Seeker experience.
const walletAdapter = WalletFactory.isSolanaMobile()
  ? new MWAWalletAdapter()
  : new LocalWalletAdapter();

export const realAdapters: Adapters = {
  wallet: walletAdapter,
  transaction: solanaTransactionService,
  mesh: bleMeshAdapter,
  messaging: fixtureMessagingAdapter,
  beacon: beaconAdapter,
  lxmf: lxmfStub,
  preferences: asyncPreferencesAdapter,
};
