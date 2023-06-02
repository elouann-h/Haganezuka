// Importing dotenv and configuring it
import * as dotenv from 'dotenv';
dotenv.config();

// Importing the client
import Client from './Root/Classes/Client';

// Creating a new instance of the client
const client: Client = new Client();

client.Events.bindEvent('ready');
client.Events.bindEvent('interactionCreate');

// Logging in the client
void client.login(process.env.token);
