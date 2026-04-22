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
const BALANCE_CACHE_TTL_MS = 15_000;
const HISTORY_CACHE_TTL_MS = 30_000;

export const solanaConnection = new Connection(SOLANA_RPC, 'confirmed');

type BalanceCacheEntry = {
  fetchedAt: number;
  value: number;
};

type HistoryCacheEntry = {
  fetchedAt: number;
  value: Transaction[];
};

const balanceCache = new Map<string, BalanceCacheEntry>();
const balanceRequests = new Map<string, Promise<number>>();
const historyCache = new Map<string, HistoryCacheEntry>();
const historyRequests = new Map<string, Promise<Transaction[]>>();

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

export async function getWalletBalance(
  address: PublicKey,
  options?: { force?: boolean },
): Promise<number> {
  const key = address.toBase58();
  const force = options?.force ?? false;
  const cached = balanceCache.get(key);

  if (!force && cached && Date.now() - cached.fetchedAt < BALANCE_CACHE_TTL_MS) {
    return cached.value;
  }

  const pending = balanceRequests.get(key);
  if (!force && pending) {
    return pending;
  }

  const request = solanaConnection
    .getBalance(address)
    .then((value) => {
      balanceCache.set(key, { fetchedAt: Date.now(), value });
      return value;
    })
    .catch((error) => {
      if (cached) {
        return cached.value;
      }
      throw error;
    })
    .finally(() => {
      balanceRequests.delete(key);
    });

  balanceRequests.set(key, request);
  return request;
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
  const key = `${address.toBase58()}:${limit}`;
  const cached = historyCache.get(key);

  if (cached && Date.now() - cached.fetchedAt < HISTORY_CACHE_TTL_MS) {
    return cached.value;
  }

  const pending = historyRequests.get(key);
  if (pending) {
    return pending;
  }

  const request = (async () => {
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

      const transactions = parsed.filter((tx): tx is Transaction => tx !== null);
      historyCache.set(key, { fetchedAt: Date.now(), value: transactions });
      return transactions;
    } catch {
      return cached?.value ?? [];
    } finally {
      historyRequests.delete(key);
    }
  })();

  historyRequests.set(key, request);
  return request;
}
