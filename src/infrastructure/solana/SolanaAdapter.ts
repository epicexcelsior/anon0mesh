import { Connection } from '@solana/web3.js';

const SOLANA_RPC = 'https://api.devnet.solana.com';

export const solanaConnection = new Connection(SOLANA_RPC, 'confirmed');

/**
 * Poll once — check if the given signature is confirmed on-chain.
 * Returns 'Settled' if confirmed or finalized, null if not yet confirmed or on error.
 */
export async function checkConfirmation(signature: string): Promise<'Settled' | null> {
  try {
    const status = await solanaConnection.getSignatureStatus(signature, {
      searchTransactionHistory: true,
    });
    if (
      (status?.value?.confirmationStatus === 'confirmed' ||
        status?.value?.confirmationStatus === 'finalized') &&
      status.value.err === null
    ) {
      return 'Settled';
    }
    return null;
  } catch {
    return null;
  }
}
