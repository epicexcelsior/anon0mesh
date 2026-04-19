export type AssetSymbol = "SOL" | "USDC";

export interface WalletBalance {
  symbol: AssetSymbol;
  amount: string;
  usdValue: string;
}

export interface Wallet {
  address: string;
  balances: WalletBalance[];
  identity: string;
}
