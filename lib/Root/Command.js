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
     * The context of the command.
     */
    ctx;
    /**
     * The constructor of the command.
     */
    constructor(client, data) {
        this.client = client;
        this.data = data;
        this.execute = data.execute;
    }
    /**
     * End the command. Call it when you want the command to be considered as finished and remove it from the interfering queue.
     * @returns Void.
     */
    end() {
        if (!this.ctx)
            return;
        if (!this.ctx.interaction)
            return;
        this.client.Commands.Interfering.removeInterfering(this.ctx.interaction.user.id, this.ctx.interaction.id);
    }
}
exports.default = Command;
