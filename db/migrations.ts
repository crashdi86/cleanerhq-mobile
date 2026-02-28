/**
 * M-07 S1: WatermelonDB migration definitions.
 *
 * Version 1 is the baseline — no migrations needed yet.
 * Future schema changes add migration steps here.
 */

import {
  schemaMigrations,
  // addColumns,
  // createTable,
} from "@nozbe/watermelondb/Schema/migrations";

export const migrations = schemaMigrations({
  migrations: [
    // Future migrations go here:
    // {
    //   toVersion: 2,
    //   steps: [
    //     addColumns({ table: "jobs", columns: [{ name: "new_field", type: "string" }] }),
    //   ],
    // },
  ],
});
