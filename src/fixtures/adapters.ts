import type { Adapters } from '@/src/providers/AdapterProvider';
import { fixtureWalletAdapter } from '@/src/infrastructure/fixtures/FixtureWalletAdapter';
import { fixtureMeshAdapter } from '@/src/infrastructure/fixtures/FixtureMeshAdapter';
import { fixtureMessagingAdapter } from '@/src/infrastructure/fixtures/FixtureMessagingAdapter';
import { fixtureTransactionAdapter } from '@/src/infrastructure/fixtures/FixtureTransactionAdapter';
import { lxmfStub } from '@/src/infrastructure/lxmf';
import { asyncPreferencesAdapter } from '@/src/infrastructure/preferences';

// Fixture adapters for development / Storybook-style rendering.
export const fixtureAdapters: Adapters = {
  wallet: fixtureWalletAdapter,
  transaction: fixtureTransactionAdapter,
  mesh: fixtureMeshAdapter,
  messaging: fixtureMessagingAdapter,
  beacon: {
    getMode: async () => 'passive',
    setMode: async () => {},
    isAdvertising: async () => false,
  },
  lxmf: lxmfStub,
  preferences: asyncPreferencesAdapter,
};
