import type { MeshService } from '@/src/domain/services/MeshService';
import type { Peer } from '@/src/domain/entities/Peer';
import { fixturePeers } from '@/src/fixtures/peers';

export class FixtureMeshAdapter implements MeshService {
  private peers: Peer[] = fixturePeers.map((peer) => ({ ...peer }));

  async startScan(): Promise<void> {}

  async stopScan(): Promise<void> {}

  async getPeers(): Promise<Peer[]> {
    return [...this.peers].sort((left, right) => right.signalStrength - left.signalStrength);
  }

  async trust(peerId: string): Promise<void> {
    this.peers = this.peers.map((peer) =>
      peer.id === peerId
        ? { ...peer, isTrusted: true }
        : peer,
    );
  }

  async block(peerId: string): Promise<void> {
    this.peers = this.peers.filter((peer) => peer.id !== peerId);
  }
}

export const fixtureMeshAdapter = new FixtureMeshAdapter();
