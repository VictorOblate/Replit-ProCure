import { nanoid } from 'nanoid';

// Helper function to get an inserted record by id
export async function getInsertedRecord<T extends { id: string }>(
  db: any,
  table: any,
  id: string
): Promise<T | undefined> {
  const [record] = await db.select().from(table).where({ id });
  return record;
}

// Helper function to get an updated record by id
export async function getUpdatedRecord<T extends { id: string }>(
  db: any,
  table: any,
  id: string
): Promise<T | undefined> {
  const [record] = await db.select().from(table).where({ id });
  return record;
}