import type { BeaconMode, BeaconService } from '@/src/domain/services/BeaconService';

export class BeaconAdapter implements BeaconService {
  async getMode(): Promise<BeaconMode> {
    return 'silent';
  }

  async setMode(_mode: BeaconMode): Promise<void> {
    // no-op stub
  }

  async isAdvertising(): Promise<boolean> {
    return false;
  }
}

export const beaconAdapter = new BeaconAdapter();
