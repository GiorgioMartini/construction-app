import { createRxDatabase } from "rxdb";
import type { RxDatabase } from "rxdb";
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";
import { userSchema } from "./models/userSchema";
import { taskSchema } from "./models/taskSchema";

// Keep track of database instances to avoid recreating
const dbInstances = new Map<string, RxDatabase>();

/**
 * Initialize and return a cached RxDB instance.
 * Throws an error if initialization fails.
 */
export async function initDB(name: string): Promise<RxDatabase> {
  // Return cached instance if it exists
  if (dbInstances.has(name)) {
    return dbInstances.get(name)!;
  }

  try {
    // Create the database instance
    const db = await createRxDatabase({
      name,
      storage: getRxStorageDexie(),
    });

    // Add collections (users, tasks)
    await db.addCollections({
      users: { schema: userSchema },
      tasks: { schema: taskSchema },
    });

    // Cache and return the instance
    dbInstances.set(name, db);
    return db;
  } catch (err) {
    // If initialization fails, surface the error
    throw new Error(`Failed to initialize database: ${err}`);
  }
}
