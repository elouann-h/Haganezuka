/**
 * Few useful strings that need to be used in few parts of the code.
 */
const strings: Record<string, [string, RegExp] | string> = {
  startUsernameContent: [
    "Entrez un nom d'utilisateur en appuyant sur le crayon. Validez ensuite votre choix. Valeur actuelle:\n\n{value}",
    /Entrez un nom d'utilisateur en appuyant sur le crayon. Validez ensuite votre choix. Valeur actuelle:\n\n(.+)/,
  ],
  beginText:
    '## Haganezuka - Commencer\n\n' +
    "Haganezuka vous propose un jeu de rôle dans l'univers de **Demon Slayer: Kimetsu no Yaiba.** " +
    'Vous incarnerez un pourfendeur ou un démon, vous personnaliserez votre personnage et vous combattrez dans des scénarios épiques !\n\n' +
    "Le contenu du jeu est inspiré de l'oeuvre originale de **Koyoharu Gotōge**, tout en introduisant des créations originales.\n" +
    'Vous découvrirez par la suite les différentes mécaniques du jeu à travers des tutoriels.\n\n' +
    'Êtes-vous certain de vouloir commencer votre aventure ?',
  raceText:
    '## Parfait ! Avant de commencer...\n\n' +
    "```Vous voilà pourfendeur de démons depuis quelques semaines. Vous maîtrisez le Souffle de l'Eau après avoir suivi un entraînement polyvalent.\n\n" +
    ' Cependant, vous vous trouvez face à un adversaire plus puissant, et le combat joue en votre défaveur. Il est sur le point de vous tuer, mais vous pose une dernière question.\n\n' +
    "« Je trouve que te tuer maintenant serait gâcher ton potentiel. Je te propose alors de devenir un démon afin que tu puisses atteindre ton maximum. Qu'en dis-tu ? »```\n" +
    '- Si vous répondez oui, vous choisirez votre style de combat, votre nom de démon et également un potentiel accessoire.\n' +
    '- Si vous répondez non, vous déterminerez votre Souffle et votre nom de pourfendeur.\nPeu importe le choix que vous faites, vous devrez choisir une Voie.' +
    '\n## Voulez-vous devenir un démon ?',
  wayText:
    "## Votre Voie\nIl est temps de choisir votre Voie. Une Voie est une pré-sélection d'atouts et de malus parmi vos compétences. Sélectionnez celle qui vous ressemble le plus !",
  artText:
    '## Votre Art/Ensemble de techniques\\nSi vous êtes un humain, vous devrez vous armez du **Style de Souffle** de votre choix.\n' +
    "Tandis que si vous êtes un démon, c'est un **Pouvoir Sanguinaire qu'il faudra choisir**.",
  usernameText: `## Nom d'Utilisateur\nIl est désormais temps de choisir votre identité. Écrivez un nom, celui que vous souhaitez utiliser durant votre aventure.`,
};
export default strings;
