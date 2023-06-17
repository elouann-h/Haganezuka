import { connect } from 'mongoose';

/**
 * Connects to the database.
 * @returns Void.
 */
export default async function (): Promise<void> {
  await connect(process.env.DB_CONN_STRING as string, { dbName: 'game' });
}
