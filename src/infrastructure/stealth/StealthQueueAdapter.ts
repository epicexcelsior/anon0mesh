import type { StealthService } from '@/src/domain/services/StealthService';

export class StealthQueueAdapter implements StealthService {
  async queue(_txId: string, _recipientAddress: string): Promise<string> {
    return `stealth-${Date.now()}`;
  }

  async getQueuedIds(): Promise<string[]> {
    return [];
  }
}

export const stealthQueueAdapter = new StealthQueueAdapter();
