import type { Peer } from "@/src/domain/entities/Peer";

export interface MeshService {
  startScan(): Promise<void>;
  stopScan(): Promise<void>;
  getPeers(): Promise<Peer[]>;
  trust(peerId: string): Promise<void>;
  block(peerId: string): Promise<void>;
}
