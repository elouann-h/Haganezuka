"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * The class that represents a command.
 */
class Command {
    /**
     * The client instance.
     */
    client;
    /**
     * The data of the command.
     */
    data;
    /**
     * The function that will be executed when the command is called.
     */
    execute;
    /**
     * The constructor of the command.
     */
    constructor(client, data) {
        this.client = client;
        this.data = data;
        this.execute = data.execute;
    }
}
exports.default = Command;
