import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  type ParsedInstruction,
  type ParsedTransactionWithMeta,
  type PartiallyDecodedInstruction,
} from '@solana/web3.js';

import type { Transaction } from '@/src/domain/entities/Transaction';

const SOLANA_RPC = 'https://api.devnet.solana.com';
const DEFAULT_HISTORY_LIMIT = 12;

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

interface ParsedTransfer {
  amount: string;
  destination: string;
  source: string;
}

function formatSolAmount(lamports: number): string {
  const amount = lamports / LAMPORTS_PER_SOL;
  return amount.toFixed(6).replace(/\.?0+$/, '');
}

function extractTransfer(
  instruction: ParsedInstruction | PartiallyDecodedInstruction,
  walletAddress: string,
): ParsedTransfer | null {
  if (!('parsed' in instruction)) return null;
  if (instruction.program !== 'system') return null;
  if (!instruction.parsed || typeof instruction.parsed !== 'object') return null;
  if (!('type' in instruction.parsed) || instruction.parsed.type !== 'transfer') return null;
  if (!('info' in instruction.parsed) || typeof instruction.parsed.info !== 'object') return null;

  const info = instruction.parsed.info as {
    destination?: unknown;
    lamports?: unknown;
    source?: unknown;
  };
  const source = typeof info.source === 'string' ? info.source : null;
  const destination = typeof info.destination === 'string' ? info.destination : null;
  const lamports =
    typeof info.lamports === 'number'
      ? info.lamports
      : typeof info.lamports === 'string'
        ? Number(info.lamports)
        : null;

  if (!source || !destination || lamports === null || Number.isNaN(lamports)) {
    return null;
  }

  if (source !== walletAddress && destination !== walletAddress) {
    return null;
  }

  return {
    amount: formatSolAmount(lamports),
    destination,
    source,
  };
}

function toDomainTransaction(
  walletAddress: string,
  signature: string,
  blockTime: number | null,
  parsedTx: ParsedTransactionWithMeta | null,
): Transaction | null {
  if (!parsedTx?.meta || parsedTx.meta.err !== null) {
    return null;
  }

  const instructions = parsedTx.transaction.message.instructions;
  const transfer = instructions
    .map((instruction) => extractTransfer(instruction, walletAddress))
    .find(Boolean);

  if (!transfer) {
    return null;
  }

  const createdAt = blockTime ? blockTime * 1000 : Date.now();
  const direction = transfer.source === walletAddress ? 'send' : 'receive';

  return {
    id: signature,
    direction,
    amount: transfer.amount,
    symbol: 'SOL',
    recipientId: transfer.destination,
    senderId: transfer.source,
    status: 'Settled',
    createdAt,
    settledAt: createdAt,
    signature,
  };
}

export async function getWalletTransferHistory(
  address: PublicKey,
  limit: number = DEFAULT_HISTORY_LIMIT,
): Promise<Transaction[]> {
  try {
    const walletAddress = address.toBase58();
    const signatures = await solanaConnection.getSignaturesForAddress(address, { limit });

    const parsed = await Promise.all(
      signatures.map(async (entry) => {
        const tx = await solanaConnection.getParsedTransaction(entry.signature, {
          maxSupportedTransactionVersion: 0,
        });

        return toDomainTransaction(walletAddress, entry.signature, entry.blockTime ?? null, tx);
      }),
    );

    return parsed.filter((tx): tx is Transaction => tx !== null);
  } catch {
    return [];
  }
}
