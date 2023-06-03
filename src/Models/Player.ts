import { Schema, model } from 'mongoose';

/**
 * The interface of a player document.
 */
interface Interface {
  /**
   * The Discord ID of the player.
   */
  discordId: string;
  /**
   * The username of the player.
   */
  username: string;
}

const schema = new Schema<Interface>({
  discordId: { type: String, required: true },
  username: { type: String, required: true },
});

export const Player = model<Interface>('Player', schema);
