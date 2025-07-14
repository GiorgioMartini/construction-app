import { createRxDatabase, removeRxDatabase } from "rxdb";
import type { RxDatabase } from "rxdb";
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";
import { userSchema } from "./models/userSchema";
import { taskSchema } from "./models/taskSchema";

// Keep track of database instances to avoid recreating
const dbInstances = new Map<string, RxDatabase>();

export async function initDB(name: string): Promise<RxDatabase> {
  // Check if we already have this database instance
  if (dbInstances.has(name)) {
    return dbInstances.get(name)!;
  }

  // First attempt - try normal initialization
  try {
    const db = await createRxDatabase({
      name,
      storage: getRxStorageDexie(),
    });

    await db.addCollections({
      users: { schema: userSchema },
      tasks: { schema: taskSchema },
    });

    dbInstances.set(name, db);
    return db;
  } catch {
    // Second attempt - try connecting to existing database
    try {
      const db = await createRxDatabase({
        name,
        storage: getRxStorageDexie(),
        ignoreDuplicate: true,
      });

      // Try to add collections (they might already exist)
      try {
        await db.addCollections({
          users: { schema: userSchema },
          tasks: { schema: taskSchema },
        });
      } catch {
        // Collections already exist, which is fine
      }

      dbInstances.set(name, db);
      return db;
    } catch {
      // Last resort - remove and recreate
      try {
        await removeRxDatabase(name, getRxStorageDexie());

        const db = await createRxDatabase({
          name,
          storage: getRxStorageDexie(),
        });

        await db.addCollections({
          users: { schema: userSchema },
          tasks: { schema: taskSchema },
        });

        dbInstances.set(name, db);
        return db;
      } catch (recreateError) {
        throw new Error(`Failed to initialize database: ${recreateError}`);
      }
    }
  }
}
