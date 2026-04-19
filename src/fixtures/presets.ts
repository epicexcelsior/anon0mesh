export type FixturePreset = 'default' | 'empty' | 'many-peers';

export const PRESETS: Record<FixturePreset, { label: string; description: string }> = {
  default: { label: 'Default', description: '3 peers, 3 convos, 6 txs' },
  empty: { label: 'Empty', description: 'No data — tests empty states' },
  'many-peers': { label: 'Many peers', description: '10 peers, all connected' },
};
