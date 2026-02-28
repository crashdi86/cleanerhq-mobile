/**
 * M-07 S1: WatermelonDB MutationQueue model skeleton.
 *
 * Not actively used until M-21 (Full Offline & Delta Sync Engine).
 * Defines the ORM mapping for the "mutation_queue" table.
 */

import { Model } from "@nozbe/watermelondb";
import { field } from "@nozbe/watermelondb/decorators";

export default class MutationQueueModel extends Model {
  static table = "mutation_queue";

  @field("entity_type") entityType!: string;
  @field("entity_id") entityId!: string;
  @field("action") action!: string;
  @field("method") method!: string;
  @field("endpoint") endpoint!: string;
  @field("payload") payload!: string;
  @field("description") description!: string;
  @field("created_at") createdAt!: number;
  @field("status") status!: string;
  @field("retry_count") retryCount!: number;
  @field("error_message") errorMessage!: string;
}
