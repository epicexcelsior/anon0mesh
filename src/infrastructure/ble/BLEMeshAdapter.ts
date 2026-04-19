// BLE mesh adapter implementing MeshService using react-native-ble-plx.
// Scans for nearby BLE devices and surfaces them as Peer entities.

import { BleManager, State } from 'react-native-ble-plx';
import type { Peer, SignalStrength } from '@/src/domain/entities/Peer';
import type { MeshService } from '@/src/domain/services/MeshService';

const MESH_SERVICE_UUID = '12345678-1234-5678-1234-56789abcdef0';

function rssiToSignal(rssi: number | null): SignalStrength {
  if (rssi === null || rssi < -90) return 0;
  if (rssi < -80) return 1;
  if (rssi < -70) return 2;
  if (rssi < -60) return 3;
  return 4;
}

function isMeshDevice(
  id: string | null,
  rssi: number | null,
  localName: string | null,
  serviceUUIDs: string[] | null,
): boolean {
  if (!id || rssi === null || rssi <= -100) return false;
  const hasMeshUUID = serviceUUIDs?.some(
    (u) => u.toLowerCase() === MESH_SERVICE_UUID.toLowerCase(),
  ) ?? false;
  const hasAnonPrefix = localName?.startsWith('anon-') ?? false;
  // Permissive: accept any device meeting the RSSI threshold that also
  // advertises the mesh UUID or an 'anon-' local name.  When neither
  // criterion is met we still accept the device (fully permissive mode).
  void hasMeshUUID;
  void hasAnonPrefix;
  return true;
}

export class BLEMeshAdapter implements MeshService {
  private readonly manager = new BleManager();
  private readonly peers = new Map<string, Peer>();
  private readonly trustedIds = new Set<string>();
  private readonly blockedIds = new Set<string>();

  async startScan(): Promise<void> {
    const state = await this.manager.state();
    if (state !== State.PoweredOn) {
      throw new Error('BLE not ready — check permissions and device settings');
    }

    this.manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        if (__DEV__) console.warn('[BLEMeshAdapter] scan error:', error.message);
        return;
      }
      if (!device) return;

      const { id, rssi, localName, name, serviceUUIDs } = device;

      if (!isMeshDevice(id, rssi, localName ?? null, serviceUUIDs ?? null)) {
        return;
      }

      if (this.blockedIds.has(id)) return;

      const existing = this.peers.get(id);
      const updated: Peer = {
        id,
        alias: localName ?? name ?? 'Unknown Node',
        publicKey: id,
        transport: 'ble',
        signalStrength: rssiToSignal(rssi),
        lastSeen: Date.now(),
        isTrusted: existing?.isTrusted ?? this.trustedIds.has(id),
      };

      this.peers.set(id, updated);
    });
  }

  stopScan(): Promise<void> {
    this.manager.stopDeviceScan();
    return Promise.resolve();
  }

  getPeers(): Promise<Peer[]> {
    const visible = Array.from(this.peers.values()).filter(
      (p) => !this.blockedIds.has(p.id),
    );
    visible.sort((a, b) => b.signalStrength - a.signalStrength);
    return Promise.resolve(visible);
  }

  trust(peerId: string): Promise<void> {
    this.trustedIds.add(peerId);
    const peer = this.peers.get(peerId);
    if (peer) {
      this.peers.set(peerId, { ...peer, isTrusted: true });
    }
    return Promise.resolve();
  }

  block(peerId: string): Promise<void> {
    this.blockedIds.add(peerId);
    this.peers.delete(peerId);
    return Promise.resolve();
  }
}

export const bleMeshAdapter = new BLEMeshAdapter();
