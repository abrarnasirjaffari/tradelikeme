import { getMigrations } from "better-auth/db/migration";
import { auth } from "./auth.js";

const { toBeCreated, toBeAdded, runMigrations } = await getMigrations(auth.options);
console.log("Tables to create:", toBeCreated.map((t: any) => t.table));
console.log("Columns to add:", toBeAdded);
await runMigrations();
console.log("Migration complete.");
process.exit(0);
