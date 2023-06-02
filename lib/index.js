"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Importing dotenv and configuring it
const dotenv = require("dotenv");
dotenv.config();
// Importing the client
const Client_1 = require("./Root/Classes/Client");
// Creating a new instance of the client
const client = new Client_1.default();
client.Events.bindEvent('ready');
client.Events.bindEvent('interactionCreate');
client.load = true;
// Logging in the client
void client.login(process.env.token);
