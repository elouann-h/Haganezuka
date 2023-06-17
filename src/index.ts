// Importing dotenv and configuring it
import * as dotenv from 'dotenv';
dotenv.config();

// Importing the database service and launch the client if the connection is successful.
import dbservice from './database.service';
import { err, log } from './Root/Util';
dbservice()
  .then(() => log('Database connected'))
  .catch(err);

// Importing the client
import Client from './Root/Client';

// Creating a new instance of the client
const client: Client = new Client();

client.Events.bindEvent('ready');
client.Events.bindEvent('interactionCreate');

// Logging in the client
void client.login(process.env.TOKEN);
