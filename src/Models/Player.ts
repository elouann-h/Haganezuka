import { Schema, model } from 'mongoose';
import { BloodDemonArt, BreathingStyle, Race, Way } from '../Game/Typings';

/**
 * The interface of a player document.
 */
interface PlayerInterface {
  /**
   * The Discord ID of the player.
   */
  discordId: string;
  /**
   * The username of the player.
   */
  username: string;
  /**
   * The experience of the player.
   */
  experience: number;
  /**
   * The race of the user (Demon, Human).
   */
  race: Race;
  /**
   * If the player is a premium subscriber.
   */
  premium: boolean;
  /**
   * The art of the player. It could be a breathing style or a blood demon art.
   */
  art: BreathingStyle | BloodDemonArt;
  /**
   * The way of the player.
   */
  way: Way;
  techniqueCategoryLevels: {
    /**
     * The level of the base attack.
     */
    basic: number;
    /**
     * The level of the fineness attack.
     */
    fineness: number;
    /**
     * The level of the heavy attack.
     */
    heavy: number;
    /**
     * The level of the ultimate attack.
     */
    ultimate: number;
  };
}

const schema = new Schema<PlayerInterface>({
  discordId: { type: String, required: true },
  username: { type: String, required: true },
  experience: { type: Number, required: true },
  race: { type: String, required: true },
  premium: { type: Boolean, required: true },
  art: { type: String, required: true },
  way: { type: String, required: true },
  techniqueCategoryLevels: {
    basic: { type: Number, required: true },
    fineness: { type: Number, required: true },
    heavy: { type: Number, required: true },
    ultimate: { type: Number, required: true },
  },
});

export const Player = model<PlayerInterface>('Player', schema);
