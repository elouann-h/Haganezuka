"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Importing dotenv and configuring it
const dotenv = require("dotenv");
dotenv.config();
// Importing the database service and launch the client if the connection is successful.
const database_service_1 = require("./database.service");
(0, database_service_1.default)()
    .then(() => console.log('Database connected'))
    .catch(console.error);
// Importing the client
const Client_1 = require("./Root/Client");
// Creating a new instance of the client
const client = new Client_1.default();
client.Events.bindEvent('ready');
client.Events.bindEvent('interactionCreate');
// Logging in the client
void client.login(process.env.TOKEN);
