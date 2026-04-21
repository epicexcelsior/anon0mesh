export function getExplorerTransactionUrl(signature: string): string {
  const network = process.env.EXPO_PUBLIC_SOLANA_NETWORK ?? "devnet";
  const cluster = network === "mainnet" || network === "mainnet-beta"
    ? null
    : network === "testnet"
      ? "testnet"
      : "devnet";
  const suffix = cluster ? `?cluster=${cluster}` : "";
  return `https://explorer.solana.com/tx/${encodeURIComponent(signature)}${suffix}`;
}
