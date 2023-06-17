import { GatewayIntentBits, ActivityType, PresenceData } from 'discord.js';

/*
  The default data for the client.
 */
const defaultData = {
  /**
   * Intents to enable for this connection.
   */
  intents: [GatewayIntentBits.Guilds],
  /**
   * The default value for MessageReplyOptions#failIfNotExists.
   */
  failIfNotExists: false,
  /**
   * Presence data to use upon login.
   */
  presence: {
    status: 'online',
    activities: [
      {
        name: 'with TypeScript',
        type: ActivityType.Playing,
      },
    ],
  } as PresenceData,
  /**
   * The directory to load the commands from.
   */
  commandsDir: 'Res/Commands',
  /**
   * Whether the client should load commands or not. Load commands means sending commands to the API.
   * Don't activate this permanently, it's only on change.
   */
  loadCommands: true,
};

export default defaultData;
