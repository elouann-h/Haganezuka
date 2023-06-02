"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const Event = require("./Event");
/**
 * Represents the event manager for the client service.
 */
class EventManager {
    /**
     * The client instance.
     */
    client;
    /**
     * The collection of the events.
     */
    events = new discord_js_1.Collection();
    /**
     * @param client The client instance.
     */
    constructor(client) {
        this.client = client;
    }
    /**
     * Add an event to the bot. Will be listened when the bot will be launched.
     * @param name The event name.
     * @param callback The function to be called back when the event is triggered.
     * @returns The bound event instance.
     */
    bindEvent(name, callback) {
        const event = new Event.default(this.client, name);
        if (callback && typeof callback === 'function')
            event.callback = callback;
        else if (!callback)
            event.callback = Event.defaultEventsCb.get(name) || Event.callbackDefault;
        this.events.set(name, event);
        return event;
    }
    /**
     * Unbind a specific event. Doesn't have any effect when the bot is launched.
     * @param name The event name.
     * @returns True if the command has been removed, or false if not.
     */
    unbindEvent(name) {
        return this.events.delete(name);
    }
}
exports.default = EventManager;
