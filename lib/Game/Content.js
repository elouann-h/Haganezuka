"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wayStats = exports.wayDescriptions = exports.wayNames = exports.wayEmojis = void 0;
/**
 * The emoji of each way.
 */
exports.wayEmojis = {
    warrior: '<:warrior:891978848669831936>',
    strategist: '<:strategist:891978848669831936>',
    agile: '<:agile:891978848669831936>',
    goliath: '<:goliath:891978848669831936>',
    ninja: '<:ninja:891978848669831936>',
};
/**
 * The name of each way.
 */
exports.wayNames = {
    warrior: 'Guerrier',
    strategist: 'Stratège',
    agile: 'Agile',
    goliath: 'Goliath',
    ninja: 'Ninja',
};
/**
 * The description of each way.
 */
exports.wayDescriptions = {
    warrior: 'Cette Voie possède des facultés polyvalentes avec un point fort dans la force physique. '
        + 'Elle est également avantageuse pour une grande durabilité en combat. '
        + 'Toutefois, ses points faibles restent la vitesse et la récupération.',
    strategist: 'Cette Voie possède des capacités très développées dans la synergie, ainsi qu\'une bonne force mentale. '
        + 'Cependant, ses points faibles résident dans la vitesse et l\'encaissement.',
    agile: 'Cette Voie possède des atouts hors du commun en endurance, mais également en vitesse. '
        + 'Néanmoins, ses points faibles sont la force physique et la récupération.',
    goliath: 'Cette Voie possède un avantages incontestable en encaissement ainsi qu\'une force physique sur-développée. '
        + 'Malgré cela, le Goliath possède une mauvaise synergie et une endurance moindre.',
    ninja: 'Cette Voie possède une vitesse divine et une synergie très avantageuse.'
        + 'Or, le Ninja possède une force physique et un encaissement très faible.',
};
/**
 * The main skill, bonus and malus of each way.
 */
exports.wayStats = {
    warrior: ["strength", "durability", "speed", "recovery"],
    strategist: ["synergy", "mental", "speed", "collection"],
    agile: ["endurance", "speed", "strength", "recovery"],
    goliath: ["collection", "strength", "synergy", "endurance"],
    ninja: ["speed", "synergy", "strength", "durability"],
};
