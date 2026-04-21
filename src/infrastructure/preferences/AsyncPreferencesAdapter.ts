import AsyncStorage from "@react-native-async-storage/async-storage";

import type {
  NetworkPreferences,
  PreferencesService,
  PrivacyPreferences,
} from "@/src/domain/services/PreferencesService";
import {
  APP_PREFERENCES_STORAGE_KEY,
  DEFAULT_STORED_PREFERENCES,
  type StoredPreferences,
  normalizeStoredPreferences,
} from "./defaults";

class AsyncPreferencesAdapter implements PreferencesService {
  private readonly listeners = new Set<() => void>();

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  async getNetwork(): Promise<NetworkPreferences> {
    const prefs = await this.readAll();
    return prefs.network;
  }

  async saveNetwork(update: Partial<NetworkPreferences>): Promise<NetworkPreferences> {
    const prefs = await this.readAll();
    const next: StoredPreferences = {
      ...prefs,
      network: {
        ...prefs.network,
        ...update,
      },
    };
    await this.writeAll(next);
    return next.network;
  }

  async getPrivacy(): Promise<PrivacyPreferences> {
    const prefs = await this.readAll();
    return prefs.privacy;
  }

  async savePrivacy(update: Partial<PrivacyPreferences>): Promise<PrivacyPreferences> {
    const prefs = await this.readAll();
    const next: StoredPreferences = {
      ...prefs,
      privacy: {
        ...prefs.privacy,
        ...update,
      },
    };
    await this.writeAll(next);
    return next.privacy;
  }

  private async readAll(): Promise<StoredPreferences> {
    try {
      const raw = await AsyncStorage.getItem(APP_PREFERENCES_STORAGE_KEY);
      if (!raw) return DEFAULT_STORED_PREFERENCES;
      return normalizeStoredPreferences(JSON.parse(raw));
    } catch {
      return DEFAULT_STORED_PREFERENCES;
    }
  }

  private async writeAll(next: StoredPreferences): Promise<void> {
    await AsyncStorage.setItem(APP_PREFERENCES_STORAGE_KEY, JSON.stringify(next));
    this.emit();
  }

  private emit(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }
}

export const asyncPreferencesAdapter = new AsyncPreferencesAdapter();
