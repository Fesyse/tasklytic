// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import {
  index,
  int,
  singlestoreTableCreator,
  text,
  timestamp,
} from "drizzle-orm/singlestore-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = singlestoreTableCreator((name) => `froo_${name}`);

export const posts = createTable(
  "post",
  {
    id: int("id").primaryKey().autoincrement(),
    name: text("name"),

    createdAt: timestamp("created_at", {
      mode: "date",
    }).$defaultFn(() => new Date()),
    updatedAt: timestamp("updated_at", {
      mode: "date",
    }).$onUpdateFn(() => new Date()),
  },
  (t) => [index("name_idx").on(t.name)],
);
