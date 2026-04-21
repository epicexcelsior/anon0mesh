import { LxmfNodeMode } from "@/src/domain/services/LxmfService";
import type {
  NetworkPreferences,
  PrivacyPreferences,
} from "@/src/domain/services/PreferencesService";
import {
  DEFAULT_NETWORK_PREFERENCES,
  DEFAULT_PRIVACY_PREFERENCES,
} from "@/src/domain/services/PreferencesService";

export const APP_PREFERENCES_STORAGE_KEY = "anonmesh.app-preferences.v1";

export interface StoredPreferences {
  network: NetworkPreferences;
  privacy: PrivacyPreferences;
}

export const DEFAULT_STORED_PREFERENCES: StoredPreferences = {
  network: DEFAULT_NETWORK_PREFERENCES,
  privacy: DEFAULT_PRIVACY_PREFERENCES,
};

function normalizeNetworkPreferences(raw: unknown): NetworkPreferences {
  const value = raw && typeof raw === "object" ? (raw as Partial<NetworkPreferences>) : {};
  const lxmfMode =
    typeof value.lxmfMode === "number"
      ? (value.lxmfMode as LxmfNodeMode)
      : DEFAULT_NETWORK_PREFERENCES.lxmfMode;

  return {
    bleEnabled:
      typeof value.bleEnabled === "boolean"
        ? value.bleEnabled
        : DEFAULT_NETWORK_PREFERENCES.bleEnabled,
    autoConnect:
      typeof value.autoConnect === "boolean"
        ? value.autoConnect
        : DEFAULT_NETWORK_PREFERENCES.autoConnect,
    lxmfMode,
  };
}

function normalizePrivacyPreferences(raw: unknown): PrivacyPreferences {
  const value = raw && typeof raw === "object" ? (raw as Partial<PrivacyPreferences>) : {};

  return {
    stealthByDefault:
      typeof value.stealthByDefault === "boolean"
        ? value.stealthByDefault
        : DEFAULT_PRIVACY_PREFERENCES.stealthByDefault,
    privacyMode:
      value.privacyMode === "Enhanced" ||
      value.privacyMode === "Maximum" ||
      value.privacyMode === "Standard"
        ? value.privacyMode
        : DEFAULT_PRIVACY_PREFERENCES.privacyMode,
    rotationCadence:
      value.rotationCadence === "Weekly" ||
      value.rotationCadence === "Monthly" ||
      value.rotationCadence === "Never"
        ? value.rotationCadence
        : DEFAULT_PRIVACY_PREFERENCES.rotationCadence,
  };
}

export function normalizeStoredPreferences(raw: unknown): StoredPreferences {
  const value = raw && typeof raw === "object" ? (raw as Partial<StoredPreferences>) : {};

  return {
    network: normalizeNetworkPreferences(value.network),
    privacy: normalizePrivacyPreferences(value.privacy),
  };
}
