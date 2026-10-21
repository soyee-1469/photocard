import AsyncStorage from '@react-native-async-storage/async-storage';

export interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export const defaultStorage: StorageAdapter = {
  async getItem(key: string) {
    return await AsyncStorage.getItem(key);
  },
  async setItem(key: string, value: string) {
    await AsyncStorage.setItem(key, value);
  },
  async removeItem(key: string) {
    await AsyncStorage.removeItem(key);
  },
};

export async function loadJson<T>(storage: StorageAdapter, key: string, defaultValue: T): Promise<T> {
  try {
    const raw = await storage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T;
  } catch {
    return defaultValue;
  }
}

export async function saveJson<T>(storage: StorageAdapter, key: string, value: T): Promise<void> {
  await storage.setItem(key, JSON.stringify(value));
}
