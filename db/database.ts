/**
 * M-07 S1: WatermelonDB singleton factory.
 *
 * Lazy initialization — not created until explicitly called.
 * Uses LokiJS adapter on web, SQLiteAdapter with JSI on native.
 * Not activated in M-07 (AsyncStorage cache used instead).
 * Will be activated in M-21 for full delta sync.
 */

import { Platform } from "react-native";
import { Database } from "@nozbe/watermelondb";
import { schema } from "./schema";
import { migrations } from "./migrations";

let database: Database | null = null;

/**
 * Get or create the WatermelonDB database instance.
 * Call this only when transitioning to WatermelonDB-backed storage (M-21).
 */
export function getDatabase(): Database {
  if (database) return database;

  if (Platform.OS === "web") {
    // Web: use LokiJS adapter (in-memory, non-persistent)
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const LokiJSAdapter = require("@nozbe/watermelondb/adapters/lokijs").default;
    const adapter = new LokiJSAdapter({
      schema,
      migrations,
      useWebWorker: false,
      useIncrementalIndexedDB: true,
    });
    database = new Database({ adapter, modelClasses: [] });
  } else {
    // Native: use SQLite adapter with JSI for performance
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const SQLiteAdapter = require("@nozbe/watermelondb/adapters/sqlite").default;
    const adapter = new SQLiteAdapter({
      schema,
      migrations,
      jsi: true,
      dbName: "cleanerhq",
    });
    database = new Database({ adapter, modelClasses: [] });
  }

  return database;
}

/**
 * Reset the database (clear all data). Used on logout / account switch.
 */
export async function resetDatabase(): Promise<void> {
  if (database) {
    await database.write(async () => {
      await database!.unsafeResetDatabase();
    });
  }
  database = null;
}
