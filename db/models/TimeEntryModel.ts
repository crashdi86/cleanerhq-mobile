/**
 * M-07 S1: WatermelonDB TimeEntry model skeleton.
 *
 * Not actively used until M-21 (Full Offline & Delta Sync Engine).
 * Defines the ORM mapping for the "time_entries" table.
 */

import { Model } from "@nozbe/watermelondb";
import { field } from "@nozbe/watermelondb/decorators";

export default class TimeEntryModel extends Model {
  static table = "time_entries";

  @field("server_id") serverId!: string;
  @field("job_id") jobId!: string;
  @field("user_id") userId!: string;
  @field("clock_in") clockIn!: number;
  @field("clock_out") clockOut!: number;
  @field("break_minutes") breakMinutes!: number;
  @field("status") status!: string;
  @field("data_json") dataJson!: string;
  @field("synced_at") syncedAt!: number;
}
