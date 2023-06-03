import { connect } from 'mongoose';

/**
 * Connects to the database.
 */
export default async function () {
  await connect(process.env.DB_CONN_STRING as string, { dbName: 'game' });
}
