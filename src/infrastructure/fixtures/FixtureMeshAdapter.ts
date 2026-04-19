import type { MeshService } from '@/src/domain/services/MeshService';
import type { Peer } from '@/src/domain/entities/Peer';
import { fixturePeers } from '@/src/fixtures/peers';

export class FixtureMeshAdapter implements MeshService {
  async startScan(): Promise<void> {}

  async stopScan(): Promise<void> {}

  async getPeers(): Promise<Peer[]> {
    return fixturePeers;
  }

  async trust(_peerId: string): Promise<void> {}

  async block(_peerId: string): Promise<void> {}
}

export const fixtureMeshAdapter = new FixtureMeshAdapter();
