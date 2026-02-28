/**
 * M-07 S1: WatermelonDB schema definition (v1 baseline).
 *
 * Prepared for M-21 (Full Offline & Delta Sync Engine).
 * Not actively used at runtime until WatermelonDB is activated.
 */

import { appSchema, tableSchema } from "@nozbe/watermelondb";

export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: "jobs",
      columns: [
        { name: "server_id", type: "string", isIndexed: true },
        { name: "title", type: "string" },
        { name: "status", type: "string" },
        { name: "job_type", type: "string" },
        { name: "job_number", type: "string" },
        { name: "scheduled_start", type: "number" },
        { name: "scheduled_end", type: "number" },
        { name: "account_name", type: "string" },
        { name: "account_id", type: "string" },
        { name: "address_street", type: "string" },
        { name: "address_city", type: "string" },
        { name: "address_state", type: "string" },
        { name: "address_zip", type: "string" },
        { name: "address_lat", type: "number" },
        { name: "address_lng", type: "number" },
        { name: "client_name", type: "string" },
        { name: "client_phone", type: "string" },
        { name: "description", type: "string" },
        { name: "special_instructions", type: "string" },
        { name: "gate_code", type: "string" },
        { name: "estimated_hours", type: "number" },
        { name: "data_json", type: "string" },
        { name: "synced_at", type: "number" },
      ],
    }),

    tableSchema({
      name: "time_entries",
      columns: [
        { name: "server_id", type: "string", isIndexed: true },
        { name: "job_id", type: "string", isIndexed: true },
        { name: "user_id", type: "string" },
        { name: "clock_in", type: "number" },
        { name: "clock_out", type: "number" },
        { name: "break_minutes", type: "number" },
        { name: "status", type: "string" },
        { name: "data_json", type: "string" },
        { name: "synced_at", type: "number" },
      ],
    }),

    tableSchema({
      name: "checklist_items",
      columns: [
        { name: "server_id", type: "string", isIndexed: true },
        { name: "job_id", type: "string", isIndexed: true },
        { name: "section", type: "string" },
        { name: "label", type: "string" },
        { name: "completed", type: "boolean" },
        { name: "required", type: "boolean" },
        { name: "requires_photo", type: "boolean" },
        { name: "sort_order", type: "number" },
        { name: "data_json", type: "string" },
        { name: "synced_at", type: "number" },
      ],
    }),

    tableSchema({
      name: "mutation_queue",
      columns: [
        { name: "entity_type", type: "string", isIndexed: true },
        { name: "entity_id", type: "string" },
        { name: "action", type: "string" },
        { name: "method", type: "string" },
        { name: "endpoint", type: "string" },
        { name: "payload", type: "string" },
        { name: "description", type: "string" },
        { name: "created_at", type: "number" },
        { name: "status", type: "string", isIndexed: true },
        { name: "retry_count", type: "number" },
        { name: "error_message", type: "string" },
      ],
    }),
  ],
});
