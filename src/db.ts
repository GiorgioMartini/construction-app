import { createRxDatabase } from "rxdb";
import type { RxDatabase } from "rxdb";
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";
import { userSchema } from "./models/userSchema";
import { taskSchema } from "./models/taskSchema";

// To enable helpful warnings during development you can add the dev-mode plugin:
// import { addRxPlugin } from 'rxdb'
// import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode'
// addRxPlugin(RxDBDevModePlugin)

export async function initDB(name: string): Promise<RxDatabase> {
  const db = await createRxDatabase({
    name,
    storage: getRxStorageDexie(),
  });

  // ADD THIS: Create collections for users and tasks
  await db.addCollections({
    users: { schema: userSchema },
    tasks: { schema: taskSchema },
  });

  return db;
}
