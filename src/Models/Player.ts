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
  /**
   * The different skills of the player.
   */
  skills: {
    /**
     * The physical strength of the player.
     */
    strength: number;
    /**
     * The durability of the player.
     */
    durability: number;
    /**
     * The endurance of the player.
     */
    endurance: number;
    /**
     * The speed of the player.
     */
    speed: number;
    /**
     * The collection of the player.
     */
    collection: number;
    /**
     * The recovery of the player.
     */
    recovery: number;
    /**
     * The synergy of the player.
     */
    synergy: number;
    /**
     * The mental strength of the player.
     */
    mental: number;
  };
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
  skills: {
    strength: { type: Number, required: true },
    durability: { type: Number, required: true },
    endurance: { type: Number, required: true },
    speed: { type: Number, required: true },
    collection: { type: Number, required: true },
    recovery: { type: Number, required: true },
    synergy: { type: Number, required: true },
    mental: { type: Number, required: true },
  },
  techniqueCategoryLevels: {
    basic: { type: Number, required: true },
    fineness: { type: Number, required: true },
    heavy: { type: Number, required: true },
    ultimate: { type: Number, required: true },
  },
});

export const Player = model<PlayerInterface>('Player', schema);
