/**
 * M-07 S1: WatermelonDB Job model skeleton.
 *
 * Not actively used until M-21 (Full Offline & Delta Sync Engine).
 * Defines the ORM mapping for the "jobs" table.
 */

import { Model } from "@nozbe/watermelondb";
import { field, date, readonly } from "@nozbe/watermelondb/decorators";

export default class JobModel extends Model {
  static table = "jobs";

  @field("server_id") serverId!: string;
  @field("title") title!: string;
  @field("status") status!: string;
  @field("job_type") jobType!: string;
  @field("job_number") jobNumber!: string;
  @field("scheduled_start") scheduledStart!: number;
  @field("scheduled_end") scheduledEnd!: number;
  @field("account_name") accountName!: string;
  @field("account_id") accountId!: string;
  @field("address_street") addressStreet!: string;
  @field("address_city") addressCity!: string;
  @field("address_state") addressState!: string;
  @field("address_zip") addressZip!: string;
  @field("address_lat") addressLat!: number;
  @field("address_lng") addressLng!: number;
  @field("client_name") clientName!: string;
  @field("client_phone") clientPhone!: string;
  @field("description") description!: string;
  @field("special_instructions") specialInstructions!: string;
  @field("gate_code") gateCode!: string;
  @field("estimated_hours") estimatedHours!: number;
  @field("data_json") dataJson!: string;
  @field("synced_at") syncedAt!: number;
}
