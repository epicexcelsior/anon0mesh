export interface StealthService {
  /** Enqueue a stealth transfer. Returns a mock routing ID. */
  queue(txId: string, recipientAddress: string): Promise<string>;
  /** Returns IDs of all currently queued transfers. */
  getQueuedIds(): Promise<string[]>;
}
