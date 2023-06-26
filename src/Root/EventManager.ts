import { Collection } from 'discord.js';

import * as Event from './Event';
import Client from './Client';

/**
 * Represents the event manager for the client service.
 */
export default class EventManager {
  /**
   * The client instance.
   */
  public readonly client: Client;
  /**
   * The collection of the events.
   */
  public readonly events: Collection<string, Event.default> = new Collection();

  /**
   * @param client The client instance.
   */
  constructor(client: Client) {
    this.client = client;
  }

  /**
   * Add an event to the bot. Will be listened when the bot will be launched.
   * @param name The event name.
   * @param callback The function to be called back when the event is triggered.
   * @returns The bound event instance.
   */
  public bindEvent(name: string, callback?: Event.EventCallback): Event.default {
    const event: Event.default = new Event.default(this.client, name);
    if (callback && typeof callback === 'function') event.callback = callback;
    else if (!callback) event.callback = Event.defaultEventsCb.get(name) || Event.callbackDefault;

    this.events.set(name, event);
    return event;
  }
}
