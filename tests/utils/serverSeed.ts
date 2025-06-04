import type { SeedData } from "./clientSeed"

export async function seedServerNotes(data: SeedData) {
  await fetch("http://localhost:3000/api/trpc/test.seedNotes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input: data, method: "seedNotes" })
  })
}
