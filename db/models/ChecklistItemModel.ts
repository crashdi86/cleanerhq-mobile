/**
 * M-07 S1: WatermelonDB ChecklistItem model skeleton.
 *
 * Not actively used until M-21 (Full Offline & Delta Sync Engine).
 * Defines the ORM mapping for the "checklist_items" table.
 */

import { Model } from "@nozbe/watermelondb";
import { field } from "@nozbe/watermelondb/decorators";

export default class ChecklistItemModel extends Model {
  static table = "checklist_items";

  @field("server_id") serverId!: string;
  @field("job_id") jobId!: string;
  @field("section") section!: string;
  @field("label") label!: string;
  @field("completed") completed!: boolean;
  @field("required") required!: boolean;
  @field("requires_photo") requiresPhoto!: boolean;
  @field("sort_order") sortOrder!: number;
  @field("data_json") dataJson!: string;
  @field("synced_at") syncedAt!: number;
}
