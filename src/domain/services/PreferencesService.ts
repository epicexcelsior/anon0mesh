import { LxmfNodeMode } from "@/src/domain/services/LxmfService";

export type PrivacyMode = "Standard" | "Enhanced" | "Maximum";
export type RotationCadence = "Weekly" | "Monthly" | "Never";

export interface NetworkPreferences {
  bleEnabled: boolean;
  autoConnect: boolean;
  lxmfMode: LxmfNodeMode;
}

export interface PrivacyPreferences {
  stealthByDefault: boolean;
  privacyMode: PrivacyMode;
  rotationCadence: RotationCadence;
}

export const DEFAULT_NETWORK_PREFERENCES: NetworkPreferences = {
  bleEnabled: true,
  autoConnect: true,
  lxmfMode: LxmfNodeMode.BleOnly,
};

export const DEFAULT_PRIVACY_PREFERENCES: PrivacyPreferences = {
  stealthByDefault: false,
  privacyMode: "Standard",
  rotationCadence: "Monthly",
};

export interface PreferencesService {
  getNetwork(): Promise<NetworkPreferences>;
  saveNetwork(update: Partial<NetworkPreferences>): Promise<NetworkPreferences>;
  getPrivacy(): Promise<PrivacyPreferences>;
  savePrivacy(update: Partial<PrivacyPreferences>): Promise<PrivacyPreferences>;
  subscribe?(listener: () => void): () => void;
}
