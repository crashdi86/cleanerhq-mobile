/**
 * M-07 S1: AsyncStorage implementation of CacheStorage.
 *
 * Uses a key prefix and an index of keys per entity type for efficient lookups.
 * Each cached record is stored individually; the index tracks which keys
 * belong to which entity type for bulk retrieval.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import type { CacheStorage, CachedRecord } from "./cache-storage";

const PREFIX = "@cleanerhq/cache:";
const INDEX_KEY = "@cleanerhq/cache_index";

interface CacheIndex {
  [entityType: string]: string[];
}

async function loadIndex(): Promise<CacheIndex> {
  try {
    const raw = await AsyncStorage.getItem(INDEX_KEY);
    if (raw) {
      return JSON.parse(raw) as CacheIndex;
    }
  } catch {
    // Corrupted index — start fresh
  }
  return {};
}

async function saveIndex(index: CacheIndex): Promise<void> {
  try {
    await AsyncStorage.setItem(INDEX_KEY, JSON.stringify(index));
  } catch {
    // Non-critical — index will be rebuilt on next write
  }
}

export class AsyncStorageCache implements CacheStorage {
  async get(key: string): Promise<CachedRecord | null> {
    try {
      const raw = await AsyncStorage.getItem(`${PREFIX}${key}`);
      if (raw) {
        return JSON.parse(raw) as CachedRecord;
      }
    } catch {
      // Corrupted record — treat as miss
    }
    return null;
  }

  async set(record: CachedRecord): Promise<void> {
    try {
      await AsyncStorage.setItem(
        `${PREFIX}${record.key}`,
        JSON.stringify(record)
      );

      // Update the index
      const index = await loadIndex();
      const typeKeys = index[record.entityType] ?? [];
      if (!typeKeys.includes(record.key)) {
        index[record.entityType] = [...typeKeys, record.key];
        await saveIndex(index);
      }
    } catch {
      // Non-critical — cache write failure is tolerable
    }
  }

  async getByEntityType(entityType: string): Promise<CachedRecord[]> {
    try {
      const index = await loadIndex();
      const keys = index[entityType] ?? [];
      if (keys.length === 0) return [];

      const storageKeys = keys.map((k) => `${PREFIX}${k}`);
      const pairs = await AsyncStorage.multiGet(storageKeys);

      const records: CachedRecord[] = [];
      for (const [, value] of pairs) {
        if (value) {
          try {
            records.push(JSON.parse(value) as CachedRecord);
          } catch {
            // Skip corrupted records
          }
        }
      }
      return records;
    } catch {
      return [];
    }
  }

  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`${PREFIX}${key}`);

      // Remove from index
      const index = await loadIndex();
      for (const entityType of Object.keys(index)) {
        const typeKeys = index[entityType];
        if (typeKeys?.includes(key)) {
          index[entityType] = typeKeys.filter((k) => k !== key);
          break;
        }
      }
      await saveIndex(index);
    } catch {
      // Non-critical
    }
  }

  async removeByEntityType(entityType: string): Promise<void> {
    try {
      const index = await loadIndex();
      const keys = index[entityType] ?? [];
      if (keys.length > 0) {
        const storageKeys = keys.map((k) => `${PREFIX}${k}`);
        await AsyncStorage.multiRemove(storageKeys);
        delete index[entityType];
        await saveIndex(index);
      }
    } catch {
      // Non-critical
    }
  }

  async clear(): Promise<void> {
    try {
      const index = await loadIndex();
      const allKeys: string[] = [];
      for (const keys of Object.values(index)) {
        for (const k of keys) {
          allKeys.push(`${PREFIX}${k}`);
        }
      }
      if (allKeys.length > 0) {
        await AsyncStorage.multiRemove(allKeys);
      }
      await AsyncStorage.removeItem(INDEX_KEY);
    } catch {
      // Non-critical
    }
  }
}
