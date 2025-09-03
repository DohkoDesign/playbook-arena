export const guideContents = {
  // Quick Guides
  "configuration-initiale": {
    title: "Configuration initiale",
    description: "Tout configurer en 15 minutes pour commencer avec Shadow Hub",
    time: "15 min",
    category: "Guide rapide",
    steps: [
      {
        title: "Créer votre compte et équipe",
        content: `
          <p>Commencez par vous inscrire sur Shadow Hub et créer votre première équipe eSport.</p>
          <ul>
            <li>Choisissez un nom d'équipe unique</li>
            <li>Sélectionnez votre jeu principal (Valorant, CS2, League of Legends, etc.)</li>
            <li>Définissez votre région de jeu</li>
            <li>Ajoutez le logo de votre équipe</li>
          </ul>
        `,
        tip: "Choisissez un nom d'équipe facile à retenir et qui représente bien votre identité gaming."
      },
      {
        title: "Inviter vos premiers membres",
        content: `
          <p>Ajoutez vos joueurs à l'équipe pour commencer à collaborer.</p>
          <ul>
            <li>Allez dans la section "Équipe" de votre dashboard</li>
            <li>Cliquez sur "Inviter un joueur"</li>
            <li>Envoyez les invitations par email ou partagez le lien d'invitation</li>
            <li>Attribuez les rôles appropriés (Joueur, Coach, Manager)</li>
          </ul>
        `,
        warning: "Assurez-vous de vérifier l'identité des joueurs avant de leur donner des permissions d'administration."
      },
      {
        title: "Configurer votre premier roster",
        content: `
          <p>Organisez vos joueurs en roster selon leur spécialité et leur niveau.</p>
          <ul>
            <li>Créez un roster pour votre équipe principale</li>
            <li>Assignez les positions/rôles de chaque joueur</li>
            <li>Définissez les joueurs titulaires et remplaçants</li>
            <li>Configurez les préférences d'entraînement</li>
          </ul>
        `
      },
      {
        title: "Planifier votre première session",
        content: `
          <p>Organisez votre première session d'entraînement ou match.</p>
          <ul>
            <li>Utilisez le calendrier intégré</li>
            <li>Créez un événement récurrent pour les entraînements</li>
            <li>Invitez tous les membres concernés</li>
            <li>Ajoutez les détails importants (serveur, stratégies, objectifs)</li>
          </ul>
        `,
        tip: "Programmez des sessions courtes mais régulières plutôt que de longues sessions espacées."
      }
    ]
  },

  "premier-match": {
    title: "Organiser votre premier match",
    description: "Guide complet pour planifier et organiser votre première compétition",
    time: "10 min",
    category: "Guide rapide", 
    steps: [
      {
        title: "Créer l'événement match",
        content: `
          <p>Configurez tous les détails de votre match officiel.</p>
          <ul>
            <li>Allez dans "Calendrier" puis "Nouveau Match"</li>
            <li>Renseignez l'équipe adverse et la date</li>
            <li>Ajoutez les informations du serveur/lobby</li>
            <li>Définissez le format (BO1, BO3, BO5)</li>
          </ul>
        `
      },
      {
        title: "Préparer l'équipe",
        content: `
          <p>Assurez-vous que tous vos joueurs sont prêts pour le match.</p>
          <ul>
            <li>Vérifiez la disponibilité de chaque joueur</li>
            <li>Envoyez les rappels automatiques</li>
            <li>Partagez les stratégies et compositions prévues</li>
            <li>Préparez les VODs d'analyse de l'équipe adverse</li>
          </ul>
        `,
        warning: "Vérifiez toujours que tous les joueurs ont confirmé leur présence 24h avant le match."
      },
      {
        title: "Post-match et analyse",
        content: `
          <p>Après le match, utilisez les outils d'analyse pour progresser.</p>
          <ul>
            <li>Enregistrez le résultat dans le système</li>
            <li>Uploadez les VODs/replays du match</li>
            <li>Programmez une session de débriefing</li>
            <li>Notez les points d'amélioration pour chaque joueur</li>
          </ul>
        `
      }
    ]
  },

  "analyse-post-match": {
    title: "Analyse post-match",
    description: "Débriefing et amélioration après vos matchs",
    time: "20 min",
    category: "Guide rapide",
    steps: [
      {
        title: "Upload et organisation des VODs",
        content: `
          <p>Importez vos replays pour l'analyse détaillée.</p>
          <ul>
            <li>Accédez à la section "VOD Analysis"</li>
            <li>Uploadez les fichiers de replay ou ajoutez les liens YouTube/Twitch</li>
            <li>Organisez par carte/round pour faciliter l'analyse</li>
            <li>Ajoutez les métadonnées (score, composition, stratégies)</li>
          </ul>
        `
      },
      {
        title: "Analyse technique et tactique",
        content: `
          <p>Utilisez les outils d'annotation pour analyser les performances.</p>
          <ul>
            <li>Créez des marqueurs temporels aux moments clés</li>
            <li>Analysez les erreurs individuelles et collectives</li>
            <li>Identifiez les schémas tactiques réussis</li>
            <li>Notez les axes d'amélioration prioritaires</li>
          </ul>
        `
      },
      {
        title: "Session de débriefing équipe",
        content: `
          <p>Organisez une réunion constructive avec toute l'équipe.</p>
          <ul>
            <li>Programmez le débriefing dans les 24h suivant le match</li>
            <li>Préparez les points clés à aborder</li>
            <li>Laissez chaque joueur s'exprimer sur sa performance</li>
            <li>Définissez les objectifs d'entraînement pour la semaine</li>
          </ul>
        `,
        tip: "Commencez toujours par les points positifs avant d'aborder les axes d'amélioration."
      },
      {
        title: "Planification des entraînements",
        content: `
          <p>Adaptez vos sessions d'entraînement selon les enseignements du match.</p>
          <ul>
            <li>Créez des exercices spécifiques aux faiblesses identifiées</li>
            <li>Planifiez des scrimmages pour tester les corrections</li>
            <li>Assignez des objectifs individuels à chaque joueur</li>
            <li>Suivez les progrès avec des métriques claires</li>
          </ul>
        `
      },
      {
        title: "Documentation et suivi",
        content: `
          <p>Gardez une trace des analyses pour suivre la progression.</p>
          <ul>
            <li>Sauvegardez les analyses dans le profil de l'équipe</li>
            <li>Créez des rapports de progression mensuelle</li>
            <li>Partagez les insights avec les joueurs concernés</li>
            <li>Archivez les VODs pour référence future</li>
          </ul>
        `
      }
    ]
  },

  // Premiers pas
  "creer-equipe": {
    title: "Créer votre première équipe",
    description: "Guide complet pour configurer votre équipe eSport de A à Z",
    time: "5 min",
    category: "Premiers pas",
    steps: [
      {
        title: "Accéder à la création d'équipe",
        content: `
          <p>Depuis votre dashboard principal, commencez la création de votre équipe. Cette première étape est cruciale car elle détermine la structure de base de votre organisation eSport.</p>
          <ul>
            <li><strong>Option 1 :</strong> Cliquez sur "Créer une équipe" dans le menu principal du dashboard</li>
            <li><strong>Option 2 :</strong> Utilisez le bouton "+" dans la barre de navigation supérieure</li>
            <li><strong>Option 3 :</strong> Accédez via le menu latéral "Équipes" > "Nouvelle équipe"</li>
            <li>Sélectionnez "Nouvelle équipe eSport" dans la liste des options</li>
          </ul>
          <p>Vous serez redirigé vers le formulaire de création en plusieurs étapes qui vous guidera pas à pas.</p>
        `,
        tip: "Vous pouvez sauvegarder votre progression à tout moment et revenir plus tard pour terminer la configuration."
      },
      {
        title: "Informations de base et identité",
        content: `
          <p>Cette étape définit l'identité de votre équipe et sa visibilité publique. Prenez le temps de bien réfléchir à ces éléments car ils seront difficiles à changer par la suite.</p>
          <h4>Informations essentielles :</h4>
          <ul>
            <li><strong>Nom de l'équipe :</strong> Choisissez un nom unique, mémorable et professionnel (ex: "Shadow Hunters", "Phoenix Rising")</li>
            <li><strong>Tag/Sigle :</strong> Acronyme de 2-5 caractères affiché dans les matchs (ex: "SH", "PHX", "RISE")</li>
            <li><strong>Jeu principal :</strong> Sélectionnez parmi Valorant, CS2, League of Legends, Overwatch 2, Rocket League, Apex Legends, Call of Duty, etc.</li>
            <li><strong>Région :</strong> Europe, Amérique du Nord, Asie-Pacifique, etc.</li>
            <li><strong>Fuseau horaire :</strong> Important pour la planification des entraînements</li>
          </ul>
          <h4>Description et objectifs :</h4>
          <ul>
            <li>Rédigez une description engageante de votre équipe (200-500 caractères)</li>
            <li>Définissez vos objectifs à court et long terme</li>
            <li>Mentionnez votre style de jeu ou votre philosophie</li>
          </ul>
        `,
        tip: "Le nom et le tag de votre équipe seront visibles publiquement dans tous les tournois et matchs. Choisissez-les avec soin !"
      },
      {
        title: "Personnalisation visuelle et branding", 
        content: `
          <p>L'identité visuelle de votre équipe est essentielle pour votre reconnaissance et votre professionnalisme. Cette section vous permet de créer une image de marque cohérente.</p>
          <h4>Logo et images :</h4>
          <ul>
            <li><strong>Logo principal :</strong> Format PNG/JPG, résolution minimale 512x512px, fond transparent recommandé</li>
            <li><strong>Bannière d'équipe :</strong> Format 1920x480px pour les profils publics et streams</li>
            <li><strong>Avatar Discord/réseaux :</strong> Version carrée du logo pour les intégrations</li>
            <li><strong>Taille maximale :</strong> 2MB par fichier pour garantir des temps de chargement rapides</li>
          </ul>
          <h4>Palette de couleurs :</h4>
          <ul>
            <li><strong>Couleur primaire :</strong> Couleur principale de votre équipe (utilisation dans l'interface)</li>
            <li><strong>Couleur secondaire :</strong> Couleur d'accent pour les détails et boutons</li>
            <li><strong>Couleurs tierces :</strong> Jusqu'à 3 couleurs supplémentaires pour la personnalisation complète</li>
            <li>Prévisualisez le rendu sur différents fonds (clair/sombre)</li>
          </ul>
          <h4>Templates disponibles :</h4>
          <ul>
            <li>Modèles pré-conçus pour commencer rapidement</li>
            <li>Personnalisation complète pour les équipes expérimentées</li>
            <li>Import depuis Canva, Figma ou Photoshop</li>
          </ul>
        `,
        warning: "Assurez-vous d'avoir les droits sur toutes les images que vous utilisez. Les logos copyrightés peuvent causer des problèmes légaux."
      },
      {
        title: "Configuration avancée et permissions",
        content: `
          <p>Cette section finale configure les aspects techniques et organisationnels de votre équipe. Ces paramètres influencent le fonctionnement quotidien de votre organisation.</p>
          <h4>Niveau de compétition :</h4>
          <ul>
            <li><strong>Amateur :</strong> Équipes récréatives, tournois locaux, apprentissage des bases</li>
            <li><strong>Semi-professionnel :</strong> Compétitions régionales, entraînement structuré, objectifs de performance</li>
            <li><strong>Professionnel :</strong> Ligues majeures, sponsors, salaire des joueurs, staff complet</li>
            <li><strong>Académie :</strong> Structure de développement, formation de jeunes talents</li>
          </ul>
          <h4>Visibilité et recrutement :</h4>
          <ul>
            <li><strong>Équipe privée :</strong> Visible uniquement par les membres, invitations seulement</li>
            <li><strong>Équipe publique :</strong> Visible dans l'annuaire, candidatures spontanées acceptées</li>
            <li><strong>Recrutement actif :</strong> Affichage des postes ouverts, formulaires de candidature</li>
            <li><strong>Recherche de sponsors :</strong> Profil visible pour les partenaires potentiels</li>
          </ul>
          <h4>Intégrations et outils :</h4>
          <ul>
            <li><strong>Discord :</strong> Connexion du serveur Discord de l'équipe</li>
            <li><strong>Streaming :</strong> Intégration Twitch/YouTube pour les diffusions</li>
            <li><strong>Réseaux sociaux :</strong> Liens Twitter, Instagram, TikTok</li>
            <li><strong>Site web :</strong> URL de votre site officiel si existant</li>
          </ul>
          <h4>Paramètres de sécurité :</h4>
          <ul>
            <li>Authentification à deux facteurs obligatoire pour les admins</li>
            <li>Politique de mots de passe forts</li>
            <li>Logs d'activité et audit trail</li>
            <li>Sauvegarde automatique des données importantes</li>
          </ul>
        `,
        warning: "Une équipe publique sera visible dans le répertoire global et pourra recevoir des candidatures. Assurez-vous d'être prêt à gérer les demandes."
      },
      {
        title: "Finalisation et validation",
        content: `
          <p>Dernière étape avant la création officielle de votre équipe. Vérifiez tous les paramètres car certains ne pourront plus être modifiés facilement.</p>
          <h4>Checklist de vérification :</h4>
          <ul>
            <li>✅ Nom d'équipe et tag vérifiés et uniques</li>
            <li>✅ Informations de contact correctes</li>
            <li>✅ Images uploadées et validées (logo, bannière)</li>
            <li>✅ Couleurs d'équipe sélectionnées et testées</li>
            <li>✅ Niveau de compétition et objectifs définis</li>
            <li>✅ Paramètres de visibilité configurés</li>
            <li>✅ Intégrations externes connectées</li>
          </ul>
          <h4>Après création :</h4>
          <ul>
            <li><strong>Email de confirmation :</strong> Vous recevrez un récapitulatif complet</li>
            <li><strong>URL personnalisée :</strong> Votre équipe aura sa propre URL (ex: shadowhub.gg/team/shadow-hunters)</li>
            <li><strong>Tableau de bord :</strong> Accès immédiat au dashboard de gestion d'équipe</li>
            <li><strong>Guide de démarrage :</strong> Checklist des premières actions à effectuer</li>
          </ul>
          <h4>Prochaines étapes recommandées :</h4>
          <ul>
            <li>Inviter vos premiers membres (voir guide "Inviter des joueurs")</li>
            <li>Créer votre premier roster de compétition</li>
            <li>Planifier une session d'entraînement de test</li>
            <li>Explorer les fonctionnalités d'analyse VOD</li>
            <li>Configurer les intégrations Discord et streaming</li>
          </ul>
        `,
        tip: "Prenez quelques minutes pour explorer toutes les sections de votre nouveau dashboard. La familiarisation avec l'interface vous fera gagner du temps par la suite."
      }
    ]
  },

  "inviter-joueurs": {
    title: "Inviter des joueurs",
    description: "Ajouter des membres à votre équipe efficacement",
    time: "3 min", 
    category: "Premiers pas",
    steps: [
      {
        title: "Accéder aux invitations",
        content: `
          <p>Depuis votre équipe, lancez le processus d'invitation.</p>
          <ul>
            <li>Allez dans l'onglet "Membres" de votre équipe</li>
            <li>Cliquez sur "Inviter un joueur"</li>
            <li>Choisissez le type d'invitation (email ou lien)</li>
          </ul>
        `
      },
      {
        title: "Invitation par email",
        content: `
          <p>La méthode la plus directe pour inviter des joueurs spécifiques.</p>
          <ul>
            <li>Saisissez l'adresse email du joueur</li>
            <li>Personnalisez le message d'invitation</li>
            <li>Sélectionnez le rôle initial (Joueur/Coach/Manager)</li>
            <li>Envoyez l'invitation</li>
          </ul>
        `,
        tip: "Ajoutez une note personnelle dans l'invitation pour expliquer pourquoi vous souhaitez recruter cette personne."
      },
      {
        title: "Lien d'invitation partageable",
        content: `
          <p>Créez un lien pour recruter sur les réseaux sociaux ou forums.</p>
          <ul>
            <li>Générez un lien d'invitation temporaire</li>
            <li>Définissez une date d'expiration</li>
            <li>Limitez le nombre d'utilisations si nécessaire</li>
            <li>Partagez sur Discord, Twitter, ou forums gaming</li>
          </ul>
        `
      }
    ]
  },

  "dashboard-overview": {
    title: "Vue d'ensemble du dashboard",
    description: "Naviguer efficacement dans l'interface principale de Shadow Hub",
    time: "8 min",
    category: "Premiers pas",
    steps: [
      {
        title: "Structure générale et navigation",
        content: `
          <p>Le dashboard Shadow Hub est conçu pour vous donner un contrôle total sur votre équipe eSport en un coup d'œil. Voici comment il s'organise :</p>
          <h4>Layout principal :</h4>
          <ul>
            <li><strong>Sidebar gauche :</strong> Menu principal avec navigation vers toutes les sections (Dashboard, Équipe, Calendrier, VOD Analysis, Analytics, Paramètres)</li>
            <li><strong>Header supérieur :</strong> Barre de notifications, changement d'équipe rapide, recherche globale, et menu profil utilisateur</li>
            <li><strong>Zone centrale :</strong> Contenu principal de la section active avec widgets personnalisables</li>
            <li><strong>Panel de droite :</strong> Informations contextuelles, raccourcis rapides, et chat d'équipe intégré</li>
          </ul>
          <h4>Navigation rapide :</h4>
          <ul>
            <li><strong>Raccourcis clavier :</strong> Ctrl+1 à Ctrl+9 pour accéder rapidement aux sections</li>
            <li><strong>Recherche globale :</strong> Ctrl+K pour rechercher joueurs, matchs, VODs, ou paramètres</li>
            <li><strong>Navigation par fil d'Ariane :</strong> Toujours visible pour savoir où vous êtes</li>
            <li><strong>Historique :</strong> Boutons précédent/suivant pour naviguer dans votre historique</li>
          </ul>
        `,
        tip: "Utilisez les raccourcis clavier pour naviguer 3x plus rapidement dans l'interface. La liste complète est disponible via Ctrl+?"
      },
      {
        title: "Sections principales et leurs fonctionnalités",
        content: `
          <p>Chaque section du dashboard a été optimisée pour des tâches spécifiques de gestion d'équipe eSport :</p>
          <h4>🏠 Dashboard (Accueil) :</h4>
          <ul>
            <li><strong>Vue d'ensemble :</strong> Métriques clés, performances récentes, alertes importantes</li>
            <li><strong>Widgets personnalisables :</strong> Prochains événements, statistiques d'équipe, objectifs en cours</li>
            <li><strong>Timeline d'activité :</strong> Résumé des dernières actions de l'équipe</li>
            <li><strong>Indicateurs de santé :</strong> Moral de l'équipe, performances, participation aux entraînements</li>
          </ul>
          <h4>👥 Équipe :</h4>
          <ul>
            <li><strong>Gestion des membres :</strong> Profils joueurs, rôles, statuts, coordonnées</li>
            <li><strong>Rosters multiples :</strong> Équipe A, B, Académie, compositions spécifiques par tournoi</li>
            <li><strong>Invitations :</strong> Système de recrutement et d'invitation de nouveaux talents</li>
            <li><strong>Disponibilités :</strong> Calendrier des disponibilités de chaque membre en temps réel</li>
          </ul>
          <h4>📅 Calendrier :</h4>
          <ul>
            <li><strong>Planning unifié :</strong> Matchs, entraînements, sessions de coaching, événements sociaux</li>
            <li><strong>Intégrations :</strong> Synchronisation avec Google Calendar, Outlook, Discord events</li>
            <li><strong>Rappels automatiques :</strong> Notifications push, email, Discord avant les événements</li>
            <li><strong>Gestion des conflits :</strong> Détection automatique des chevauchements de planning</li>
          </ul>
          <h4>🎬 VOD Analysis :</h4>
          <ul>
            <li><strong>Bibliothèque de VODs :</strong> Organisation par match, joueur, carte, stratégie</li>
            <li><strong>Outils d'annotation :</strong> Marqueurs temporels, notes, highlights, zones de focus</li>
            <li><strong>Sessions de review :</strong> Planification et gestion des séances d'analyse en équipe</li>
            <li><strong>Sharing :</strong> Partage sécurisé de segments spécifiques avec l'équipe ou le coaching staff</li>
          </ul>
          <h4>📊 Analytics :</h4>
          <ul>
            <li><strong>Performances individuelles :</strong> Statistiques détaillées par joueur et évolution dans le temps</li>
            <li><strong>Analyse d'équipe :</strong> Synergies, points faibles collectifs, méta-game adaptation</li>
            <li><strong>Rapports automatisés :</strong> Génération de rapports hebdomadaires/mensuels</li>
            <li><strong>Comparaisons :</strong> Benchmarking avec d'autres équipes de niveau similaire</li>
          </ul>
        `,
        warning: "Certaines fonctionnalités avancées d'analytics nécessitent un abonnement Premium pour accéder aux données détaillées."
      },
      {
        title: "Widgets du dashboard et personnalisation",
        content: `
          <p>Le dashboard d'accueil est entièrement personnalisable selon votre style de management et les besoins de votre équipe :</p>
          <h4>Widgets essentiels disponibles :</h4>
          <ul>
            <li><strong>Prochains événements :</strong> Timeline des 7 prochains jours avec détails et participants confirmés</li>
            <li><strong>Performance récente :</strong> Résultats des derniers matchs avec tendance de progression</li>
            <li><strong>Disponibilités équipe :</strong> Vue en temps réel de qui est connecté et disponible pour jouer</li>
            <li><strong>VODs récentes :</strong> Dernières analyses uploadées avec priorité de review</li>
            <li><strong>Objectifs mensuels :</strong> Progression vers les objectifs fixés avec pourcentages d'accomplissement</li>
            <li><strong>Moral d'équipe :</strong> Indicateur basé sur les feedbacks et participation aux activités</li>
            <li><strong>News et annonces :</strong> Communications importantes, changements de meta, updates du jeu</li>
            <li><strong>Chat d'équipe :</strong> Messages récents et notifications Discord intégrées</li>
          </ul>
          <h4>Personnalisation avancée :</h4>
          <ul>
            <li><strong>Drag & Drop :</strong> Réorganisez les widgets par simple glisser-déposer</li>
            <li><strong>Tailles variables :</strong> Petit, moyen, grand, extra-large selon l'importance</li>
            <li><strong>Filtres par rôle :</strong> Affichez seulement ce qui concerne votre position (Coach, Manager, Joueur)</li>
            <li><strong>Thèmes personnalisés :</strong> Mode sombre/clair, couleurs d'équipe, layout compact/étendu</li>
            <li><strong>Widgets conditionnels :</strong> Certains widgets n'apparaissent qu'en période de compétition</li>
          </ul>
          <h4>Notifications intelligentes :</h4>
          <ul>
            <li><strong>Priorités adaptatives :</strong> Les notifications les plus importantes remontent automatiquement</li>
            <li><strong>Filtrage par urgence :</strong> Critique, Important, Informatif, Social</li>
            <li><strong>Groupement intelligent :</strong> Les notifications similaires sont regroupées pour éviter le spam</li>
            <li><strong>Actions rapides :</strong> Répondre, reporter, archiver directement depuis la notification</li>
          </ul>
        `,
        tip: "Commencez avec le layout par défaut, puis personnalisez progressivement selon votre workflow quotidien. Vous pouvez sauvegarder plusieurs configurations pour différents contextes (saison, hors-saison, boot camp)."
      },
      {
        title: "Fonctionnalités avancées et intégrations",
        content: `
          <p>Le dashboard Shadow Hub va au-delà de la simple gestion d'équipe en proposant des intégrations poussées avec l'écosystème gaming :</p>
          <h4>Intégrations natives :</h4>
          <ul>
            <li><strong>Discord :</strong> Statuts en temps réel, channels d'équipe, vocal intégré pour les briefings</li>
            <li><strong>Streaming platforms :</strong> Twitch, YouTube Gaming pour les diffusions d'entraînements</li>
            <li><strong>Stats APIs :</strong> Connexion directe aux APIs officielles des jeux pour stats automatisées</li>
            <li><strong>Tournament platforms :</strong> FACEIT, ESEA, Challengermode pour import automatique des résultats</li>
            <li><strong>Communication :</strong> Slack, Microsoft Teams pour les organisations professionnelles</li>
          </ul>
          <h4>Outils de productivité intégrés :</h4>
          <ul>
            <li><strong>Notes collaboratives :</strong> Prise de notes partagées pendant les stratégies et debriefs</li>
            <li><strong>To-do lists d'équipe :</strong> Tâches assignées avec échéances et responsables</li>
            <li><strong>Sondages et votes :</strong> Prise de décisions démocratiques sur les stratégies</li>
            <li><strong>Partage de fichiers :</strong> Repository sécurisé pour configs, démos, ressources d'entraînement</li>
          </ul>
          <h4>Mobile et accessibilité :</h4>
          <ul>
            <li><strong>App mobile native :</strong> Accès complet aux fonctionnalités principales depuis smartphone</li>
            <li><strong>Mode hors-ligne :</strong> Consultation des données essentielles sans connexion internet</li>
            <li><strong>Notifications push :</strong> Alertes importantes même quand l'app est fermée</li>
            <li><strong>Synchronisation multi-appareils :</strong> Vos données et préférences suivent sur tous vos appareils</li>
          </ul>
          <h4>Sécurité et confidentialité :</h4>
          <ul>
            <li><strong>Chiffrement bout-en-bout :</strong> Toutes les communications sensibles sont protégées</li>
            <li><strong>Contrôle des accès granulaire :</strong> Permissions spécifiques par membre et par section</li>
            <li><strong>Audit trail complet :</strong> Historique de toutes les actions pour transparence et debugging</li>
            <li><strong>Sauvegarde automatique :</strong> Vos données sont sauvegardées en continu et récupérables</li>
          </ul>
        `,
        warning: "Les intégrations tierces nécessitent des autorisations spécifiques. Vérifiez les politiques de confidentialité avant de connecter des services externes."
      },
      {
        title: "Optimisation du workflow et bonnes pratiques",
        content: `
          <p>Pour maximiser l'efficacité de votre utilisation du dashboard, suivez ces recommandations basées sur l'expérience des meilleures équipes eSport :</p>
          <h4>Routine quotidienne recommandée :</h4>
          <ul>
            <li><strong>Morning check :</strong> Consultez les notifications, événements du jour, et disponibilités équipe</li>
            <li><strong>Pre-training :</strong> Vérifiez les objectifs de la session et préparez les ressources nécessaires</li>
            <li><strong>Post-training :</strong> Notez les observations importantes et planifiez les reviews VOD</li>
            <li><strong>Evening wrap-up :</strong> Planifiez le lendemain et communiquez avec l'équipe</li>
          </ul>
          <h4>Gestion des équipes multiples :</h4>
          <ul>
            <li><strong>Switch rapide :</strong> Menu déroulant en header pour basculer entre équipes instantanément</li>
            <li><strong>Notifications unifiées :</strong> Tableau de bord consolidé pour toutes vos équipes</li>
            <li><strong>Permissions croisées :</strong> Gérez qui peut accéder à quelles informations entre équipes</li>
            <li><strong>Comparaisons inter-équipes :</strong> Analytics comparatives pour identifier les meilleures pratiques</li>
          </ul>
          <h4>Collaboration avec le staff :</h4>
          <ul>
            <li><strong>Rôles définis :</strong> Manager, Head Coach, Assistant Coach, Analyst, chacun avec ses permissions</li>
            <li><strong>Workflow de review :</strong> Circuit de validation pour les décisions importantes</li>
            <li><strong>Communication asynchrone :</strong> Messages et annotations pour coordonner sans réunions constantes</li>
            <li><strong>Partage de responsabilités :</strong> Délégation claire des tâches de gestion quotidienne</li>
          </ul>
          <h4>Conseils pour débutants :</h4>
          <ul>
            <li><strong>Start simple :</strong> Commencez par les fonctionnalités de base avant d'explorer les options avancées</li>
            <li><strong>Tutorials intégrés :</strong> Suivez les guides contextuels qui s'affichent lors des premières utilisations</li>
            <li><strong>Templates prêts :</strong> Utilisez les modèles d'organisation fournis pour différents types d'équipes</li>
            <li><strong>Communauté :</strong> Rejoignez le Discord Shadow Hub pour échanger avec d'autres managers</li>
          </ul>
        `,
        tip: "Investissez 30 minutes par semaine à explorer une nouvelle fonctionnalité. En 3 mois, vous maîtriserez l'ensemble de la plateforme et gagnerez des heures de gestion chaque semaine."
      }
    ]
  },

  // Guides complets pour Gestion d'équipe
  "roles-permissions": {
    title: "Rôles et permissions",
    description: "Définir les droits d'accès et responsabilités de chaque membre",
    time: "6 min",
    category: "Gestion d'équipe",
    steps: [
      {
        title: "Comprendre le système de rôles",
        content: `
          <p>Core.gg utilise un système de rôles hiérarchique flexible qui s'adapte à tous types d'organisations eSport :</p>
          <h4>Rôles prédéfinis :</h4>
          <ul>
            <li><strong>Owner/Propriétaire :</strong> Contrôle total, gestion financière, dissolution d'équipe</li>
            <li><strong>Manager :</strong> Gestion opérationnelle, recrutement, planning, relations extérieures</li>
            <li><strong>Head Coach :</strong> Stratégies, entraînements, compositions d'équipe, objectifs sportifs</li>
            <li><strong>Assistant Coach :</strong> Support coaching, analyse VOD, entraînements spécifiques</li>
            <li><strong>Captain/IGL :</strong> Leadership en jeu, communication équipe, retours performance</li>
            <li><strong>Player :</strong> Participation matchs/entraînements, feedback, respect des règles</li>
            <li><strong>Substitute :</strong> Même que Player mais avec priorité moindre pour les compositions</li>
            <li><strong>Analyst :</strong> Analyse données, préparation adversaires, rapports performance</li>
            <li><strong>Content Creator :</strong> Streaming, réseaux sociaux, création contenu promotionnel</li>
          </ul>
          <h4>Permissions par catégorie :</h4>
          <ul>
            <li><strong>Gestion équipe :</strong> Inviter/exclure membres, modifier rosters, gérer rôles</li>
            <li><strong>Planning :</strong> Créer/modifier événements, gérer disponibilités, rappels</li>
            <li><strong>VOD & Analytics :</strong> Upload/analyser VODs, accès statistiques, création rapports</li>
            <li><strong>Communication :</strong> Annonces équipe, modération chat, notifications push</li>
            <li><strong>Finances :</strong> Gestion budget, salaires, sponsoring, achats équipements</li>
          </ul>
        `,
        tip: "Commencez avec les rôles prédéfinis et ajustez progressivement selon les besoins spécifiques de votre équipe."
      },
      {
        title: "Attribution et modification des rôles",
        content: `
          <p>La gestion des rôles doit être réfléchie et évolutive selon la croissance de votre équipe :</p>
          <h4>Process d'attribution :</h4>
          <ul>
            <li><strong>Évaluation des compétences :</strong> Analysez les forces de chaque membre avant attribution</li>
            <li><strong>Période d'essai :</strong> Commencez avec des permissions limitées puis étendez progressivement</li>
            <li><strong>Validation collective :</strong> Les rôles importants peuvent nécessiter un vote d'équipe</li>
            <li><strong>Documentation :</strong> Tenez un registre des changements avec justifications</li>
          </ul>
          <h4>Interface d'attribution :</h4>
          <ul>
            <li>Accédez à "Équipe" > "Membres" > Cliquez sur le membre concerné</li>
            <li>Section "Rôles et Permissions" avec aperçu détaillé des droits</li>
            <li>Modification en temps réel avec confirmation par email/notification</li>
            <li>Historique des changements visible par tous les admins</li>
          </ul>
          <h4>Cas spéciaux :</h4>
          <ul>
            <li><strong>Rôles temporaires :</strong> Attribution avec date d'expiration automatique</li>
            <li><strong>Rôles conditionnels :</strong> Activation selon contexte (tournoi, bootcamp, etc.)</li>
            <li><strong>Délégation :</strong> Transfer temporaire de permissions en cas d'absence</li>
            <li><strong>Rôles multiples :</strong> Un membre peut cumuler plusieurs fonctions compatibles</li>
          </ul>
        `,
        warning: "Toute modification de rôle est immédiatement active. Assurez-vous de la justesse avant validation."
      },
      {
        title: "Permissions avancées et personnalisation",
        content: `
          <p>Pour les équipes avec des besoins spécifiques, Core.gg offre une granularité fine dans la gestion des permissions :</p>
          <h4>Permissions granulaires :</h4>
          <ul>
            <li><strong>Gestion sélective :</strong> Activez/désactivez chaque permission individuellement</li>
            <li><strong>Restrictions temporelles :</strong> Permissions actives seulement à certains moments</li>
            <li><strong>Conditions d'activation :</strong> Permissions liées à des événements ou statuts</li>
            <li><strong>Hiérarchie custom :</strong> Créez vos propres niveaux d'autorisation</li>
          </ul>
          <h4>Exemples de configurations avancées :</h4>
          <ul>
            <li><strong>Coach Analysis-only :</strong> Accès lecture seule aux VODs et stats, pas de modification</li>
            <li><strong>Captain événementiel :</strong> Leadership activé uniquement pendant les compétitions</li>
            <li><strong>Manager délégué :</strong> Permissions complètes sauf finances et exclusions</li>
            <li><strong>Streamer intégré :</strong> Droits de diffusion + accès limité données équipe</li>
          </ul>
          <h4>Sécurité et audit :</h4>
          <ul>
            <li><strong>Log complet :</strong> Enregistrement de toutes les actions avec timestamp et auteur</li>
            <li><strong>Alertes automatiques :</strong> Notifications pour actions sensibles (exclusions, changements financiers)</li>
            <li><strong>Validation multi-niveaux :</strong> Certaines actions nécessitent plusieurs approbations</li>
            <li><strong>Recovery mode :</strong> Possibilité d'annuler les dernières modifications en cas d'erreur</li>
          </ul>
        `
      }
    ]
  },

  "gestion-remplacants": {
    title: "Gestion des remplaçants",
    description: "Configurer et organiser efficacement vos joueurs de réserve",
    time: "5 min",
    category: "Gestion d'équipe", 
    steps: [
      {
        title: "Stratégie de recrutement des remplaçants",
        content: `
          <p>Une politique de remplaçants bien pensée est essentielle pour maintenir la compétitivité en cas d'absence ou de baisse de forme :</p>
          <h4>Types de remplaçants :</h4>
          <ul>
            <li><strong>Sixth man :</strong> Remplaçant permanent, entraîné régulièrement, prêt à intégrer le roster principal</li>
            <li><strong>Spécialiste :</strong> Joueur expert sur certaines maps/compositions spécifiques</li>
            <li><strong>Académie :</strong> Jeunes talents en développement, futurs titulaires potentiels</li>
            <li><strong>Vétéran :</strong> Ancien joueur expérimenté disponible pour dépannage ponctuel</li>
            <li><strong>Stand-in externe :</strong> Accord avec d'autres équipes pour prêts temporaires</li>
          </ul>
          <h4>Critères de sélection :</h4>
          <ul>
            <li><strong>Polyvalence :</strong> Capacité à jouer plusieurs rôles selon les besoins</li>
            <li><strong>Disponibilité :</strong> Réactivité pour intégrer rapidement l'équipe</li>
            <li><strong>Niveau technique :</strong> Compétences suffisantes pour maintenir le niveau d'équipe</li>
            <li><strong>Compatibilité :</strong> Bon fit avec la mentalité et les stratégies existantes</li>
            <li><strong>Motivation :</strong> Désir de progresser et de contribuer même sans garantie de temps de jeu</li>
          </ul>
        `
      },
      {
        title: "Configuration dans Core.gg",
        content: `
          <p>Organisez vos remplaçants pour une gestion optimale et une intégration fluide :</p>
          <h4>Setup initial :</h4>
          <ul>
            <li>Allez dans "Équipe" > "Rosters" > "Gestion des remplaçants"</li>
            <li>Créez des catégories selon vos besoins (Principal, Spécialisé, Académie)</li>
            <li>Assignez chaque remplaçant à un ou plusieurs rôles/positions</li>
            <li>Définissez leur priorité d'appel (1er, 2ème, 3ème choix par poste)</li>
          </ul>
          <h4>Profils détaillés :</h4>
          <ul>
            <li><strong>Disponibilités :</strong> Planning détaillé avec créneaux de disponibilité</li>
            <li><strong>Spécialisations :</strong> Maps préférées, champions/agents maîtrisés, styles de jeu</li>
            <li><strong>Historique :</strong> Performances passées, temps de jeu, progression</li>
            <li><strong>Objectifs :</strong> Ambitions personnelles et plan de développement</li>
          </ul>
          <h4>Système de rotation :</h4>
          <ul>
            <li><strong>Planning automatique :</strong> Attribution équitable du temps de jeu en scrimmage</li>
            <li><strong>Conditions d'activation :</strong> Critères automatiques pour les remplacements</li>
            <li><strong>Préavis minimum :</strong> Délai requis pour convoquer un remplaçant</li>
            <li><strong>Compensation :</strong> Système de récompenses pour les remplaçants actifs</li>
          </ul>
        `,
        tip: "Maintenez toujours au moins un remplaçant par rôle clé pour éviter les situations de blocage."
      },
      {
        title: "Intégration et développement",
        content: `
          <p>Les remplaçants doivent rester dans la dynamique d'équipe pour être efficaces quand ils sont appelés :</p>
          <h4>Programme d'intégration :</h4>
          <ul>
            <li><strong>Entraînements réguliers :</strong> Participation à 30-50% des sessions selon disponibilité</li>
            <li><strong>Scrimmages dédiés :</strong> Matchs amicaux pour tester différentes compositions</li>
            <li><strong>Analyse VOD commune :</strong> Participation aux reviews pour comprendre les stratégies</li>
            <li><strong>Communication constante :</strong> Inclusion dans les discussions tactiques et debriefs</li>
          </ul>
          <h4>Suivi de progression :</h4>
          <ul>
            <li><strong>Évaluations mensuelles :</strong> Feedback constructif sur performances et axes d'amélioration</li>
            <li><strong>Objectifs personnalisés :</strong> Plans de développement adaptés à chaque remplaçant</li>
            <li><strong>Coaching individuel :</strong> Sessions one-on-one pour travailler les points faibles</li>
            <li><strong>Tracking statistique :</strong> Suivi des performances en match et entraînement</li>
          </ul>
          <h4>Gestion des attentes :</h4>
          <ul>
            <li><strong>Communication transparente :</strong> Expliquer clairement le rôle et les opportunités</li>
            <li><strong>Feedback régulier :</strong> Points mensuels sur situation et perspectives d'évolution</li>
            <li><strong>Opportunités de showcase :</strong> Créer des occasions de briller (tournois B-tier, etc.)</li>
            <li><strong>Plan de carrière :</strong> Discuter des possibilités d'évolution dans l'organisation</li>
          </ul>
        `
      }
    ]
  },

  // Gestion d'équipe
  "organisation-rosters": {
    title: "Organisation des rosters",
    description: "Structurer votre équipe par jeu et rôle pour maximiser l'efficacité",
    time: "10 min",
    category: "Gestion d'équipe",
    steps: [
      {
        title: "Comprendre les rosters",
        content: `
          <p>Un roster est une formation spécifique de joueurs pour une compétition.</p>
          <ul>
            <li>Équipe principale : vos 5 meilleurs joueurs</li>
            <li>Équipe académie : joueurs en développement</li>
            <li>Rosters spécialisés : par tournament ou format de jeu</li>
            <li>Remplaçants : joueurs de réserve pour chaque position</li>
          </ul>
        `
      },
      {
        title: "Créer un nouveau roster",
        content: `
          <p>Configurez un roster adapté à vos besoins compétitifs.</p>
          <ul>
            <li>Allez dans "Équipe" > "Rosters" > "Nouveau Roster"</li>
            <li>Nommez votre roster (ex: "Équipe A", "Main Team")</li>
            <li>Sélectionnez le jeu et le format de compétition</li>
            <li>Définissez le niveau de compétition visé</li>
          </ul>
        `
      },
      {
        title: "Assigner les positions",
        content: `
          <p>Attribuez à chaque joueur sa position/rôle optimal dans l'équipe.</p>
          <ul>
            <li><strong>Valorant/CS2 :</strong> IGL, Entry, Support, AWPer, Lurker</li>
            <li><strong>League of Legends :</strong> Top, Jungle, Mid, ADC, Support</li>
            <li><strong>Overwatch :</strong> Tank, DPS, Support (selon méta 5v5)</li>
            <li>Marquez les joueurs polyvalents pouvant jouer plusieurs rôles</li>
          </ul>
        `,
        tip: "Identifiez toujours un leader d'équipe (IGL/Captain) qui prendra les décisions en jeu."
      },
      {
        title: "Gestion des rotations",
        content: `
          <p>Planifiez les changements et rotations selon les matchs.</p>
          <ul>
            <li>Définissez les critères de rotation (forme, meta, adversaire)</li>
            <li>Préparez les combinaisons de joueurs alternatives</li>
            <li>Communiquez clairement les décisions à l'équipe</li>
            <li>Documentez les performances de chaque composition</li>
          </ul>
        `
      }
    ]
  },

  // Coaching
  "sessions-coaching": {
    title: "Sessions de coaching",
    description: "Organiser et suivre efficacement les formations de votre équipe",
    time: "12 min",
    category: "Coaching",
    steps: [
      {
        title: "Planifier une session",
        content: `
          <p>Organisez des sessions de coaching structurées et productives.</p>
          <ul>
            <li>Définissez l'objectif principal de la session</li>
            <li>Sélectionnez les joueurs concernés</li>
            <li>Choisissez le format (individuel, en groupe, analyse VOD)</li>
            <li>Préparez les exercices et matériels nécessaires</li>
          </ul>
        `
      },
      {
        title: "Conduire la session",
        content: `
          <p>Maximisez l'efficacité de vos sessions de coaching.</p>
          <ul>
            <li>Commencez par un récapitulatif des objectifs</li>
            <li>Alternez théorie, pratique et feedback</li>
            <li>Utilisez les outils d'annotation pour les VODs</li>
            <li>Notez les progrès et points d'attention en temps réel</li>
          </ul>
        `,
        tip: "Gardez les sessions courtes (60-90 min max) pour maintenir l'attention des joueurs."
      },
      {
        title: "Suivi post-session",
        content: `
          <p>Assurez-vous que les enseignements sont bien intégrés.</p>
          <ul>
            <li>Rédigez un résumé des points clés abordés</li>
            <li>Assignez des exercices à pratiquer</li>
            <li>Planifiez les sessions de suivi</li>
            <li>Évaluez les progrès lors du prochain entraînement</li>
          </ul>
        `
      }
    ]
  },

  // VOD Analysis  
  "upload-vods": {
    title: "Upload de VODs",
    description: "Importer et organiser vos replays pour l'analyse",
    time: "5 min",
    category: "Analyse VOD",
    steps: [
      {
        title: "Préparer vos fichiers",
        content: `
          <p>Organisez vos replays avant l'upload pour faciliter l'analyse.</p>
          <ul>
            <li>Nommez vos fichiers avec la date et l'adversaire</li>
            <li>Vérifiez que le format est supporté (MP4, AVI, MOV)</li>
            <li>Compressez si nécessaire pour accélérer l'upload</li>
            <li>Préparez les métadonnées (score, composition, stratégies)</li>
          </ul>
        `
      },
      {
        title: "Upload et métadonnées",
        content: `
          <p>Importez vos VODs avec toutes les informations contextuelles.</p>
          <ul>
            <li>Glissez-déposez vos fichiers ou utilisez l'explorateur</li>
            <li>Renseignez le match, la carte, et le résultat</li>
            <li>Ajoutez les joueurs participants et leurs rôles</li>
            <li>Notez les stratégies utilisées et points à analyser</li>
          </ul>
        `,
        warning: "Les fichiers volumineux peuvent prendre du temps à traiter, soyez patient."
      },
      {
        title: "Organisation et étiquetage",
        content: `
          <p>Classez vos VODs pour les retrouver facilement.</p>
          <ul>
            <li>Utilisez des tags par type (match officiel, scrim, training)</li>
            <li>Organisez par tournoi ou période</li>
            <li>Marquez les VODs prioritaires pour l'analyse</li>
            <li>Créez des playlists thématiques (attaque, défense, clutchs)</li>
          </ul>
        `
      }
    ]
  },

  // Guides complets pour Planification
  "creer-evenements": {
    title: "Créer des événements",
    description: "Planifier efficacement vos matchs et sessions d'entraînement",
    time: "8 min",
    category: "Planification",
    steps: [
      {
        title: "Types d'événements disponibles",
        content: `
          <p>Core.gg propose plusieurs types d'événements adaptés à tous vos besoins organisationnels :</p>
          <h4>Événements de compétition :</h4>
          <ul>
            <li><strong>Match officiel :</strong> Compétitions avec enjeu, classement, prize pool</li>
            <li><strong>Scrimmage :</strong> Matchs d'entraînement contre d'autres équipes</li>
            <li><strong>Tournoi :</strong> Événement multi-équipes avec bracket et phases</li>
            <li><strong>Qualifier :</strong> Matches de qualification pour tournois majeurs</li>
          </ul>
          <h4>Sessions d'entraînement :</h4>
          <ul>
            <li><strong>Practice générale :</strong> Entraînement d'équipe standard</li>
            <li><strong>Coaching session :</strong> Session dirigée par le coach avec objectifs spécifiques</li>
            <li><strong>VOD Review :</strong> Analyse de replays en groupe</li>
            <li><strong>Stratégie meeting :</strong> Discussions tactiques et préparation</li>
          </ul>
          <h4>Événements sociaux :</h4>
          <ul>
            <li><strong>Team building :</strong> Activités de cohésion d'équipe</li>
            <li><strong>Casual gaming :</strong> Sessions détente sur d'autres jeux</li>
            <li><strong>Community event :</strong> Interactions avec la fanbase</li>
          </ul>
        `
      },
      {
        title: "Configuration détaillée d'un événement",
        content: `
          <p>Chaque événement nécessite une configuration précise pour optimiser la participation et l'organisation :</p>
          <h4>Informations de base :</h4>
          <ul>
            <li><strong>Titre :</strong> Nom clair et descriptif (ex: "Scrim vs Team Phoenix - Inferno")</li>
            <li><strong>Type :</strong> Sélection parmi les catégories disponibles</li>
            <li><strong>Date et heure :</strong> Planning précis avec fuseau horaire</li>
            <li><strong>Durée estimée :</strong> Temps prévu pour l'activité</li>
            <li><strong>Récurrence :</strong> Événement unique ou récurrent (quotidien, hebdomadaire, mensuel)</li>
          </ul>
          <h4>Participants et rôles :</h4>
          <ul>
            <li><strong>Roster assigné :</strong> Sélection du roster principal ou secondaire</li>
            <li><strong>Invitations personnalisées :</strong> Invitation de membres spécifiques</li>
            <li><strong>Rôles requis :</strong> Positions obligatoires (IGL, AWPer, Support, etc.)</li>
            <li><strong>Remplaçants :</strong> Liste de backup en cas d'absence</li>
            <li><strong>Staff :</strong> Coach, analyst, manager présents</li>
          </ul>
          <h4>Détails techniques :</h4>
          <ul>
            <li><strong>Serveur/Platform :</strong> Informations de connexion</li>
            <li><strong>Maps :</strong> Cartes prévues pour l'entraînement/match</li>
            <li><strong>Config :</strong> Paramètres de jeu spécifiques</li>
            <li><strong>Streaming :</strong> Diffusion prévue et canaux</li>
          </ul>
        `
      },
      {
        title: "Notifications et rappels automatisés",
        content: `
          <p>Le système de notification intelligent assure une participation optimale :</p>
          <h4>Système de rappels :</h4>
          <ul>
            <li><strong>Notification immédiate :</strong> Dès la création de l'événement</li>
            <li><strong>Rappel 24h avant :</strong> Confirmation de disponibilité</li>
            <li><strong>Rappel 2h avant :</strong> Préparation finale</li>
            <li><strong>Rappel 15min avant :</strong> Connexion imminente</li>
          </ul>
          <h4>Canaux de notification :</h4>
          <ul>
            <li><strong>In-app :</strong> Notifications dans Core.gg</li>
            <li><strong>Email :</strong> Récapitulatifs détaillés</li>
            <li><strong>Discord :</strong> Messages automatiques sur les channels équipe</li>
            <li><strong>SMS :</strong> Pour les événements critiques (selon abonnement)</li>
            <li><strong>Push mobile :</strong> Notifications smartphone</li>
          </ul>
          <h4>Gestion des réponses :</h4>
          <ul>
            <li><strong>Statuts de présence :</strong> Confirmé, Incertain, Absent, En retard</li>
            <li><strong>Commentaires :</strong> Possibilité d'ajouter des notes explicatives</li>
            <li><strong>Remplacement automatique :</strong> Activation des backups si nécessaire</li>
            <li><strong>Suivi en temps réel :</strong> Dashboard des confirmations</li>
          </ul>
        `
      },
      {
        title: "Intégrations et synchronisation",
        content: `
          <p>Connectez vos outils existants pour une gestion centralisée :</p>
          <h4>Calendriers externes :</h4>
          <ul>
            <li><strong>Google Calendar :</strong> Synchronisation bidirectionnelle complète</li>
            <li><strong>Outlook :</strong> Import/export des événements équipe</li>
            <li><strong>Apple Calendar :</strong> Intégration pour les utilisateurs iOS/macOS</li>
            <li><strong>CalDAV :</strong> Support des protocoles standards</li>
          </ul>
          <h4>Plateformes gaming :</h4>
          <ul>
            <li><strong>Discord Events :</strong> Création automatique d'événements Discord</li>
            <li><strong>Steam Groups :</strong> Annonces dans les groupes Steam</li>
            <li><strong>FACEIT :</strong> Planification de matchs sur la plateforme</li>
            <li><strong>Tournament platforms :</strong> Sync avec Challengermode, Toornament</li>
          </ul>
          <h4>Outils de diffusion :</h4>
          <ul>
            <li><strong>Twitch :</strong> Création automatique de streams programmés</li>
            <li><strong>YouTube :</strong> Planification de diffusions en direct</li>
            <li><strong>OBS :</strong> Lancement automatique des scenes de streaming</li>
          </ul>
        `
      }
    ]
  },

  "calendrier-partage": {
    title: "Calendrier partagé",
    description: "Synchroniser les disponibilités de l'équipe efficacement",
    time: "5 min", 
    category: "Planification",
    steps: [
      {
        title: "Configuration du calendrier partagé",
        content: `
          <p>Le calendrier partagé est le cœur de coordination de votre équipe :</p>
          <h4>Paramètres d'accès :</h4>
          <ul>
            <li><strong>Visibilité :</strong> Définir qui peut voir quels événements</li>
            <li><strong>Permissions d'édition :</strong> Qui peut créer/modifier les événements</li>
            <li><strong>Niveaux de détail :</strong> Informations visibles selon le rôle</li>
            <li><strong>Filtrage :</strong> Vues personnalisées par membre ou type d'événement</li>
          </ul>
          <h4>Types de vue :</h4>
          <ul>
            <li><strong>Vue équipe :</strong> Tous les événements collectifs</li>
            <li><strong>Vue individuelle :</strong> Planning personnel de chaque membre</li>
            <li><strong>Vue combinée :</strong> Disponibilités croisées pour planification optimale</li>
            <li><strong>Vue conflit :</strong> Identification des chevauchements et problèmes</li>
          </ul>
        `
      },
      {
        title: "Gestion des disponibilités",
        content: `
          <p>Optimisez la planification grâce à un suivi précis des disponibilités :</p>
          <h4>Saisie des disponibilités :</h4>
          <ul>
            <li><strong>Créneaux récurrents :</strong> Disponibilités hebdomadaires types</li>
            <li><strong>Exceptions ponctuelles :</strong> Modifications temporaires du planning</li>
            <li><strong>Congés et absences :</strong> Périodes d'indisponibilité longue</li>
            <li><strong>Préférences horaires :</strong> Créneaux optimaux vs acceptables</li>
          </ul>
          <h4>Intelligence de planification :</h4>
          <ul>
            <li><strong>Suggestions automatiques :</strong> Créneaux optimaux basés sur les disponibilités</li>
            <li><strong>Détection de conflits :</strong> Alertes en cas de chevauchement</li>
            <li><strong>Optimisation de groupe :</strong> Meilleurs horaires pour la majorité</li>
            <li><strong>Prédictions :</strong> Analyse des patterns pour suggestions futures</li>
          </ul>
        `
      },
      {
        title: "Partage et collaboration",
        content: `
          <p>Facilitez la coordination avec des outils de partage avancés :</p>
          <h4>Partage externe :</h4>
          <ul>
            <li><strong>Liens publics :</strong> Calendrier visible pour sponsors/partenaires</li>
            <li><strong>Intégration site web :</strong> Widget calendrier pour votre site</li>
            <li><strong>Export formats :</strong> ICS, PDF, image pour partage facile</li>
            <li><strong>API publique :</strong> Intégration avec vos outils tiers</li>
          </ul>
          <h4>Notifications collaboratives :</h4>
          <ul>
            <li><strong>Demandes de disponibilité :</strong> Sondages rapides pour nouveaux créneaux</li>
            <li><strong>Confirmations groupées :</strong> Validation collective des événements</li>
            <li><strong>Alertes de changement :</strong> Notifications automatiques des modifications</li>
          </ul>
        `
      }
    ]
  },

  "gestion-disponibilites": {
    title: "Gestion des disponibilités", 
    description: "Suivre et organiser la présence des joueurs efficacement",
    time: "7 min",
    category: "Planification",
    steps: [
      {
        title: "Système de disponibilités avancé",
        content: `
          <p>Maîtrisez parfaitement les disponibilités de votre équipe avec des outils sophistiqués :</p>
          <h4>Types de disponibilité :</h4>
          <ul>
            <li><strong>Disponible :</strong> Prêt pour toute activité équipe</li>
            <li><strong>Disponible avec conditions :</strong> Créneaux limités ou préférences</li>
            <li><strong>Incertain :</strong> Confirmation en attente</li>
            <li><strong>Occupé :</strong> Indisponible mais peut libérer en urgence</li>
            <li><strong>Absent :</strong> Complètement indisponible</li>
            <li><strong>En voyage :</strong> Disponibilité réduite ou décalage horaire</li>
          </ul>
          <h4>Granularité temporelle :</h4>
          <ul>
            <li><strong>Créneaux de 30min :</strong> Précision maximale pour optimisation</li>
            <li><strong>Récurrence intelligente :</strong> Patterns automatiques hebdomadaires</li>
            <li><strong>Exceptions dynamiques :</strong> Modifications ponctuelles faciles</li>
            <li><strong>Planification longue :</strong> Disponibilités sur plusieurs mois</li>
          </ul>
        `
      },
      {
        title: "Outils d'analyse et optimisation",
        content: `
          <p>Utilisez les analytics pour optimiser vos plannings d'équipe :</p>
          <h4>Tableaux de bord :</h4>
          <ul>
            <li><strong>Vue d'ensemble :</strong> Disponibilités de toute l'équipe en un coup d'œil</li>
            <li><strong>Heatmaps :</strong> Visualisation des créneaux les plus populaires</li>
            <li><strong>Statistiques :</strong> Taux de présence par membre et période</li>
            <li><strong>Tendances :</strong> Évolution des disponibilités dans le temps</li>
          </ul>
          <h4>Algorithmes d'optimisation :</h4>
          <ul>
            <li><strong>Meilleur créneau :</strong> Calcul automatique du moment optimal</li>
            <li><strong>Alternatives multiples :</strong> Proposition de plusieurs options</li>
            <li><strong>Équilibrage :</strong> Répartition équitable du temps de jeu</li>
            <li><strong>Prédiction :</strong> Anticipation des conflits futurs</li>
          </ul>
        `
      },
      {
        title: "Gestion des absences et remplacements",
        content: `
          <p>Anticipez et gérez efficacement les indisponibilités :</p>
          <h4>Types d'absence :</h4>
          <ul>
            <li><strong>Congés planifiés :</strong> Vacances, examens, obligations personnelles</li>
            <li><strong>Absence maladie :</strong> Indisponibilité de dernière minute</li>
            <li><strong>Urgence familiale :</strong> Situations imprévisibles prioritaires</li>
            <li><strong>Obligations pro/scolaires :</strong> Conflits avec vie quotidienne</li>
          </ul>
          <h4>Système de remplacement :</h4>
          <ul>
            <li><strong>Pool de remplaçants :</strong> Liste ordonnée par préférence et disponibilité</li>
            <li><strong>Notification cascade :</strong> Alerte automatique des backup players</li>
            <li><strong>Historique :</strong> Tracking des remplacements pour équité</li>
            <li><strong>Compensation :</strong> Système de points/récompenses pour remplaçants actifs</li>
          </ul>
        `
      }
    ]
  },

  // Guides complets pour Coaching
  "systeme-feedback": {
    title: "Système de feedback",
    description: "Documenter et suivre les progrès de vos joueurs efficacement", 
    time: "6 min",
    category: "Coaching",
    steps: [
      {
        title: "Structure du feedback efficace",
        content: `
          <p>Un feedback structuré accélère la progression et maintient la motivation :</p>
          <h4>Méthode SBI (Situation-Behavior-Impact) :</h4>
          <ul>
            <li><strong>Situation :</strong> Contexte précis (round, map, moment du match)</li>
            <li><strong>Behavior :</strong> Action ou décision observée objectivement</li>
            <li><strong>Impact :</strong> Conséquence sur l'équipe et le résultat</li>
            <li><strong>Suggestion :</strong> Alternative constructive proposée</li>
          </ul>
          <h4>Types de feedback :</h4>
          <ul>
            <li><strong>Feedback correctif :</strong> Points à améliorer avec solutions</li>
            <li><strong>Feedback de renforcement :</strong> Actions positives à reproduire</li>
            <li><strong>Feedback de développement :</strong> Nouvelles compétences à acquérir</li>
            <li><strong>Feedback stratégique :</strong> Compréhension du jeu et méta</li>
          </ul>
          <h4>Timing optimal :</h4>
          <ul>
            <li><strong>Feedback immédiat :</strong> Corrections en temps réel pendant l'entraînement</li>
            <li><strong>Feedback post-match :</strong> Analyse détaillée dans les 24h</li>
            <li><strong>Feedback hebdomadaire :</strong> Bilan de progression générale</li>
            <li><strong>Feedback mensuel :</strong> Évaluation complète et objectifs futurs</li>
          </ul>
        `
      },
      {
        title: "Outils de documentation dans Core.gg",
        content: `
          <p>Utilisez les fonctionnalités intégrées pour un suivi professionnel :</p>
          <h4>Templates de feedback :</h4>
          <ul>
            <li><strong>Fiche individuelle :</strong> Évaluation complète par joueur</li>
            <li><strong>Feedback match :</strong> Analyse spécifique à une partie</li>
            <li><strong>Progression skill :</strong> Suivi d'une compétence particulière</li>
            <li><strong>Objectifs SMART :</strong> Définition d'objectifs mesurables</li>
          </ul>
          <h4>Système de notation :</h4>
          <ul>
            <li><strong>Échelles standardisées :</strong> 1-10 avec critères définis</li>
            <li><strong>Comparaisons :</strong> Évolution dans le temps</li>
            <li><strong>Benchmarking :</strong> Positionnement vs autres joueurs du rôle</li>
            <li><strong>Métriques objectives :</strong> Statistiques de performance intégrées</li>
          </ul>
          <h4>Fonctionnalités collaboratives :</h4>
          <ul>
            <li><strong>Multi-évaluateurs :</strong> Feedback croisé coach + captain + analyst</li>
            <li><strong>Auto-évaluation :</strong> Réflexion personnelle du joueur</li>
            <li><strong>Peer review :</strong> Évaluation par les coéquipiers</li>
            <li><strong>Historique complet :</strong> Traçabilité de tous les feedbacks</li>
          </ul>
        `
      },
      {
        title: "Suivi de progression et plans d'amélioration",
        content: `
          <p>Transformez le feedback en progression concrète avec des plans structurés :</p>
          <h4>Plans de développement personnalisés :</h4>
          <ul>
            <li><strong>Diagnostic initial :</strong> Évaluation complète des forces/faiblesses</li>
            <li><strong>Objectifs SMART :</strong> Spécifiques, Mesurables, Atteignables, Réalistes, Temporels</li>
            <li><strong>Roadmap mensuelle :</strong> Étapes progressives avec milestones</li>
            <li><strong>Exercices ciblés :</strong> Drills spécifiques aux axes d'amélioration</li>
          </ul>
          <h4>Tracking automatisé :</h4>
          <ul>
            <li><strong>Métriques de jeu :</strong> Import automatique des stats de performance</li>
            <li><strong>Indicateurs comportementaux :</strong> Ponctualité, attitude, communication</li>
            <li><strong>Progression skills :</strong> Évolution des compétences techniques</li>
            <li><strong>Achievement system :</strong> Reconnaissance des progrès accomplis</li>
          </ul>
          <h4>Rapports et communication :</h4>
          <ul>
            <li><strong>Rapports individuels :</strong> Documents de progression personnalisés</li>
            <li><strong>Synthèses équipe :</strong> Vue d'ensemble du développement collectif</li>
            <li><strong>Partage transparent :</strong> Visibilité contrôlée selon les préférences</li>
            <li><strong>Export formats :</strong> PDF, Excel pour présentation externe</li>
          </ul>
        `
      }
    ]
  },

  "objectifs-evaluations": {
    title: "Objectifs et évaluations",
    description: "Définir et mesurer les performances de manière structurée",
    time: "10 min",
    category: "Coaching",
    steps: [
      {
        title: "Méthodologie de définition d'objectifs",
        content: `
          <p>Des objectifs bien définis sont la clé de la progression individuelle et collective :</p>
          <h4>Framework SMART appliqué à l'eSport :</h4>
          <ul>
            <li><strong>Spécifique :</strong> "Améliorer l'ADR de 15 points" vs "jouer mieux"</li>
            <li><strong>Mesurable :</strong> Métriques quantifiables (KDA, HLTV rating, win rate)</li>
            <li><strong>Atteignable :</strong> Objectifs challenging mais réalistes selon le niveau</li>
            <li><strong>Réaliste :</strong> Prendre en compte le temps disponible et les ressources</li>
            <li><strong>Temporel :</strong> Échéances précises (1 semaine, 1 mois, 3 mois)</li>
          </ul>
          <h4>Catégories d'objectifs :</h4>
          <ul>
            <li><strong>Performance individuelle :</strong> Stats personnelles, consistency, clutch rate</li>
            <li><strong>Compétences techniques :</strong> Aim, movement, game sense, positioning</li>
            <li><strong>Aspects tactiques :</strong> Communication, leadership, adaptation meta</li>
            <li><strong>Mindset :</strong> Gestion du stress, confiance, resilience</li>
            <li><strong>Objectifs d'équipe :</strong> Synergies, coordination, résultats collectifs</li>
          </ul>
          <h4>Niveaux d'objectifs :</h4>
          <ul>
            <li><strong>Objectifs de process :</strong> Actions contrôlables (heures d'entraînement)</li>
            <li><strong>Objectifs de performance :</strong> Résultats mesurables (stats)</li>
            <li><strong>Objectifs de résultat :</strong> Outcomes finaux (classement, victoires)</li>
          </ul>
        `
      },
      {
        title: "Système d'évaluation multi-dimensionnel",
        content: `
          <p>Une évaluation complète combine données objectives et observations qualitatives :</p>
          <h4>Métriques quantitatives automatisées :</h4>
          <ul>
            <li><strong>Statistiques de jeu :</strong> Import direct depuis APIs (Steam, Riot, etc.)</li>
            <li><strong>Performance trends :</strong> Évolution des stats dans le temps</li>
            <li><strong>Comparaisons :</strong> Benchmarking avec players de même niveau</li>
            <li><strong>Consistency metrics :</strong> Régularité des performances</li>
          </ul>
          <h4>Évaluations qualitatives structurées :</h4>
          <ul>
            <li><strong>Grilles d'observation :</strong> Critères standardisés pour chaque rôle</li>
            <li><strong>Évaluations 360° :</strong> Feedback croisé coach/teammates/analyst</li>
            <li><strong>Auto-évaluation :</strong> Réflexion personnelle guidée</li>
            <li><strong>Situational assessment :</strong> Performance selon contexte (clutch, eco rounds)</li>
          </ul>
          <h4>Outils d'évaluation avancés :</h4>
          <ul>
            <li><strong>Heatmaps de performance :</strong> Visualisation des forces/faiblesses</li>
            <li><strong>Radar charts :</strong> Profils de compétences multidimensionnels</li>
            <li><strong>Progression curves :</strong> Graphiques d'évolution temporelle</li>
            <li><strong>Comparative analysis :</strong> Évolution vs objectifs et peers</li>
          </ul>
        `
      },
      {
        title: "Cycle d'amélioration continue",
        content: `
          <p>Créez une boucle vertueuse d'évaluation, ajustement et progression :</p>
          <h4>Planning d'évaluations :</h4>
          <ul>
            <li><strong>Check-ins hebdomadaires :</strong> Points rapides sur progression cours</li>
            <li><strong>Reviews mensuelles :</strong> Évaluation complète avec ajustements</li>
            <li><strong>Bilans trimestriels :</strong> Analyse profonde et redéfinition objectifs</li>
            <li><strong>Évaluations post-événement :</strong> Assessment après tournois/matchs importants</li>
          </ul>
          <h4>Process d'ajustement :</h4>
          <ul>
            <li><strong>Analyse des écarts :</strong> Gap analysis entre objectifs et réalisations</li>
            <li><strong>Identification des blocages :</strong> Obstacles à la progression</li>
            <li><strong>Révision des méthodes :</strong> Ajustement des approches d'entraînement</li>
            <li><strong>Recalibrage :</strong> Modification des objectifs selon évolution du contexte</li>
          </ul>
          <h4>Documentation et communication :</h4>
          <ul>
            <li><strong>Performance dashboards :</strong> Tableaux de bord personnalisés</li>
            <li><strong>Progress reports :</strong> Rapports de progression détaillés</li>
            <li><strong>Success stories :</strong> Célébration des réussites et milestones</li>
            <li><strong>Learning insights :</strong> Partage des apprentissages avec l'équipe</li>
          </ul>
        `
      }
    ]
  },

  // Guides complets pour VOD Analysis
  "organisation-videos": {
    title: "Organisation des vidéos",
    description: "Classer et structurer vos VODs par événement et joueur",
    time: "8 min", 
    category: "Analyse VOD",
    steps: [
      {
        title: "Système de classification intelligent",
        content: `
          <p>Une organisation méthodique de vos VODs facilite l'analyse et accélère l'apprentissage :</p>
          <h4>Hiérarchie de classement :</h4>
          <ul>
            <li><strong>Niveau 1 - Saison/Période :</strong> 2024-Q1, Spring Split, Major Tournament</li>
            <li><strong>Niveau 2 - Competition :</strong> VCT, ESL Pro League, Scrimmages</li>
            <li><strong>Niveau 3 - Adversaire/Match :</strong> Team Phoenix, FNC vs TL, Internal Practice</li>
            <li><strong>Niveau 4 - Maps/Rounds :</strong> Inferno, Ascent, CT Side, T Side</li>
            <li><strong>Niveau 5 - Segments :</strong> Highlights, Mistakes, Clutches, Strats</li>
          </ul>
          <h4>Tags et métadonnées :</h4>
          <ul>
            <li><strong>Type de contenu :</strong> Match, Scrim, Practice, Individual VOD Review</li>
            <li><strong>Focus joueur :</strong> Tags par membre d'équipe concerné</li>
            <li><strong>Compétences :</strong> Aim, Positioning, Communication, Game Sense</li>
            <li><strong>Situations :</strong> Clutch, Eco Round, Force Buy, Anti-eco</li>
            <li><strong>Résultat :</strong> Win, Loss, Close Game, Stomp</li>
            <li><strong>Priorité :</strong> Must Review, Important, Optional, Archived</li>
          </ul>
          <h4>Smart categorization :</h4>
          <ul>
            <li><strong>Auto-tagging :</strong> Reconnaissance automatique du contenu</li>
            <li><strong>Pattern recognition :</strong> Identification des situations récurrentes</li>
            <li><strong>Performance correlation :</strong> Lien entre VODs et statistiques</li>
          </ul>
        `
      },
      {
        title: "Workflows de traitement des VODs",
        content: `
          <p>Établissez des processus efficaces pour maximiser la valeur de vos analyses :</p>
          <h4>Pipeline d'ingestion :</h4>
          <ul>
            <li><strong>Sources multiples :</strong> OBS recordings, stream VODs, demo files, mobile recordings</li>
            <li><strong>Import automatisé :</strong> Synchronisation depuis Twitch, YouTube, Google Drive</li>
            <li><strong>Quality check :</strong> Vérification automatique de la qualité audio/vidéo</li>
            <li><strong>Metadata enrichment :</strong> Ajout automatique des informations de match</li>
          </ul>
          <h4>Traitement post-upload :</h4>
          <ul>
            <li><strong>Transcoding :</strong> Optimisation des formats pour web et mobile</li>
            <li><strong>Thumbnail generation :</strong> Création automatique de vignettes</li>
            <li><strong>Scene detection :</strong> Découpage automatique en rounds/séquences</li>
            <li><strong>Quality enhancement :</strong> Amélioration automatique si nécessaire</li>
          </ul>
          <h4>Indexation intelligente :</h4>
          <ul>
            <li><strong>Timeline markers :</strong> Points clés identifiés automatiquement</li>
            <li><strong>Action recognition :</strong> Détection des kills, deaths, abilities usage</li>
            <li><strong>Audio analysis :</strong> Transcription des communications équipe</li>
            <li><strong>Cross-referencing :</strong> Liens avec stats et événements du match</li>
          </ul>
        `
      },
      {
        title: "Système de recherche et découverte",
        content: `
          <p>Trouvez rapidement le contenu pertinent grâce à des outils de recherche avancés :</p>
          <h4>Moteur de recherche multi-critères :</h4>
          <ul>
            <li><strong>Recherche textuelle :</strong> Titre, description, tags, notes</li>
            <li><strong>Filtres temporels :</strong> Date, durée, période spécifique</li>
            <li><strong>Filtres de contenu :</strong> Joueur, map, arme, situation</li>
            <li><strong>Recherche de performance :</strong> Selon statistiques (KDA, rating, etc.)</li>
          </ul>
          <h4>Suggestions intelligentes :</h4>
          <ul>
            <li><strong>Contenu similaire :</strong> VODs avec situations comparables</li>
            <li><strong>Progression tracking :</strong> Évolution d'un aspect sur plusieurs VODs</li>
            <li><strong>Learning paths :</strong> Séquences recommandées pour amélioration</li>
            <li><strong>Pattern matching :</strong> Situations récurrentes à analyser</li>
          </ul>
          <h4>Vues personnalisées :</h4>
          <ul>
            <li><strong>Tableaux de bord :</strong> Organisation par rôle (Coach, Player, Analyst)</li>
            <li><strong>Collections thématiques :</strong> Playlists par sujet d'apprentissage</li>
            <li><strong>Filtres sauvés :</strong> Recherches fréquentes mémorisées</li>
            <li><strong>Vues collaboratives :</strong> Partage d'organisations avec l'équipe</li>
          </ul>
        `
      },
      {
        title: "Archivage et maintenance",
        content: `
          <p>Gérez efficacement votre bibliothèque sur le long terme :</p>
          <h4>Politiques de rétention :</h4>
          <ul>
            <li><strong>Archivage automatique :</strong> Déplacement des VODs anciennes selon critères</li>
            <li><strong>Niveaux de stockage :</strong> Hot (accès fréquent), Warm (occasionnel), Cold (archive)</li>
            <li><strong>Compression intelligente :</strong> Optimisation de l'espace selon importance</li>
            <li><strong>Backup stratégique :</strong> Sauvegarde prioritaire des VODs critiques</li>
          </ul>
          <h4>Maintenance de la base :</h4>
          <ul>
            <li><strong>Cleanup automatique :</strong> Suppression des doublons et fichiers corrompus</li>
            <li><strong>Tag normalization :</strong> Standardisation des métadonnées</li>
            <li><strong>Link validation :</strong> Vérification des liens externes</li>
            <li><strong>Performance monitoring :</strong> Optimisation des temps de chargement</li>
          </ul>
          <h4>Analytics d'utilisation :</h4>
          <ul>
            <li><strong>Usage statistics :</strong> VODs les plus consultées/utiles</li>
            <li><strong>Learning impact :</strong> Corrélation entre review et amélioration</li>
            <li><strong>Content gaps :</strong> Identification des manques dans la bibliothèque</li>
            <li><strong>ROI analysis :</strong> Valeur apportée par chaque type de VOD</li>
          </ul>
        `
      }
    ]
  },

  "outils-analyse": {
    title: "Outils d'analyse",
    description: "Maîtriser les fonctionnalités d'annotation et d'analyse avancées",
    time: "15 min",
    category: "Analyse VOD",
    steps: [
      {
        title: "Interface d'annotation avancée",
        content: `
          <p>Maîtrisez tous les outils d'annotation pour des analyses détaillées et professionnelles :</p>
          <h4>Marqueurs temporels intelligents :</h4>
          <ul>
            <li><strong>Hotkeys customisables :</strong> Raccourcis clavier pour marquage rapide pendant viewing</li>
            <li><strong>Types de marqueurs :</strong> Kill, Death, Mistake, Good Play, Strategy Point, Communication</li>
            <li><strong>Marquage automatique :</strong> Détection IA des moments clés (clutches, multikills)</li>
            <li><strong>Synchronisation multi-vues :</strong> Marqueurs liés entre différents POV</li>
          </ul>
          <h4>Outils de dessin et annotation :</h4>
          <ul>
            <li><strong>Formes géométriques :</strong> Flèches, cercles, rectangles pour highlight des zones</li>
            <li><strong>Trajectoires :</strong> Tracé de mouvements et rotations d'équipe</li>
            <li><strong>Zones d'intérêt :</strong> Délimitation de positions clés sur les maps</li>
            <li><strong>Overlays tactiques :</strong> Superposition de stratégies et setups</li>
          </ul>
          <h4>Système de notes enrichi :</h4>
          <ul>
            <li><strong>Rich text editor :</strong> Formatage avancé avec listes, liens, images</li>
            <li><strong>Templates de notes :</strong> Structures prédéfinies pour différents types d'analyse</li>
            <li><strong>Collaboration temps réel :</strong> Édition simultanée avec plusieurs analystes</li>
            <li><strong>Historique des modifications :</strong> Versioning des annotations</li>
          </ul>
        `
      },
      {
        title: "Analyse multi-dimensionnelle",
        content: `
          <p>Exploitez toute la richesse des données pour des insights profonds :</p>
          <h4>Analyse de performance individuelle :</h4>
          <ul>
            <li><strong>Heatmaps de positioning :</strong> Visualisation des positions habituelles par map</li>
            <li><strong>Tracking des mouvements :</strong> Analyse des rotations et timings</li>
            <li><strong>Pattern de jeu :</strong> Identification des habitudes et préférences</li>
            <li><strong>Correlation économique :</strong> Performance selon la situation économique</li>
          </ul>
          <h4>Analyse tactique d'équipe :</h4>
          <ul>
            <li><strong>Formation analysis :</strong> Étude des setups et compositions</li>
            <li><strong>Coordination timing :</strong> Synchronisation des actions d'équipe</li>
            <li><strong>Adaptation patterns :</strong> Réponses aux stratégies adverses</li>
            <li><strong>Communication flow :</strong> Analyse des échanges verbaux</li>
          </ul>
          <h4>Comparative analysis :</h4>
          <ul>
            <li><strong>Before/After :</strong> Comparaison pré et post-ajustements</li>
            <li><strong>Player vs Player :</strong> Matchups individuels détaillés</li>
            <li><strong>Meta evolution :</strong> Adaptation aux changements du jeu</li>
            <li><strong>Benchmarking pro :</strong> Comparaison avec équipes professionnelles</li>
          </ul>
        `
      },
      {
        title: "Outils de présentation et partage",
        content: `
          <p>Communiquez vos analyses de manière impactante et professionnelle :</p>
          <h4>Création de clips et highlights :</h4>
          <ul>
            <li><strong>Trimming précis :</strong> Découpe frame-perfect des séquences</li>
            <li><strong>Multi-clip compilation :</strong> Assemblage de plusieurs moments</li>
            <li><strong>Slow motion analysis :</strong> Ralenti pour décortiquer les actions rapides</li>
            <li><strong>Picture-in-picture :</strong> Comparaison de plusieurs POV simultanément</li>
          </ul>
          <h4>Rapports d'analyse automatisés :</h4>
          <ul>
            <li><strong>Executive summaries :</strong> Résumés pour management et sponsors</li>
            <li><strong>Player reports :</strong> Feedback personnalisé par membre</li>
            <li><strong>Tactical breakdowns :</strong> Analyses détaillées pour coaching staff</li>
            <li><strong>Progress tracking :</strong> Évolution des métriques dans le temps</li>
          </ul>
          <h4>Partage et collaboration :</h4>
          <ul>
            <li><strong>Sharing links :</strong> URLs sécurisées pour partage externe</li>
            <li><strong>Embed codes :</strong> Intégration dans sites web ou présentations</li>
            <li><strong>Export formats :</strong> PDF, PowerPoint, vidéo pour présentation</li>
            <li><strong>API access :</strong> Intégration avec outils tiers d'analyse</li>
          </ul>
        `
      },
      {
        title: "Intelligence artificielle et automatisation",
        content: `
          <p>Exploitez l'IA pour accélérer et enrichir vos analyses :</p>
          <h4>Reconnaissance automatique :</h4>
          <ul>
            <li><strong>Action detection :</strong> Identification automatique des kills, abilities, etc.</li>
            <li><strong>Situation classification :</strong> Catégorisation des rounds (eco, force, full buy)</li>
            <li><strong>Performance anomalies :</strong> Détection des performances exceptionnelles</li>
            <li><strong>Pattern discovery :</strong> Identification de tendances non évidentes</li>
          </ul>
          <h4>Analyses prédictives :</h4>
          <ul>
            <li><strong>Win probability :</strong> Calcul en temps réel des chances de victoire</li>
            <li><strong>Performance forecasting :</strong> Prédiction des performances futures</li>
            <li><strong>Optimal strategies :</strong> Suggestions tactiques basées sur data</li>
            <li><strong>Risk assessment :</strong> Évaluation des risques de certaines décisions</li>
          </ul>
          <h4>Workflows automatisés :</h4>
          <ul>
            <li><strong>Auto-tagging :</strong> Classification automatique des VODs</li>
            <li><strong>Smart notifications :</strong> Alertes sur patterns importants détectés</li>
            <li><strong>Batch processing :</strong> Traitement en lot de multiples VODs</li>
            <li><strong>Scheduled analysis :</strong> Analyses récurrentes automatiques</li>
          </ul>
        `
      }
    ]
  },

  // Guides complets pour Analytics
  "dashboard-equipe": {
    title: "Dashboard équipe", 
    description: "Vue d'ensemble complète des statistiques et performances collectives",
    time: "10 min",
    category: "Analytics",
    steps: [
      {
        title: "Métriques clés d'équipe",
        content: `
          <p>Surveillez les indicateurs essentiels de performance collective en temps réel :</p>
          <h4>Performance globale :</h4>
          <ul>
            <li><strong>Win Rate :</strong> Pourcentage de victoires sur différentes périodes</li>
            <li><strong>Round Win Rate :</strong> Efficacité round par round</li>
            <li><strong>Map Pool Strength :</strong> Performance par carte avec heat map</li>
            <li><strong>Side Balance :</strong> Équilibre CT/T side selon les maps</li>
          </ul>
          <h4>Métriques économiques :</h4>
          <ul>
            <li><strong>Eco Round Success :</strong> Taux de réussite en situation économique difficile</li>
            <li><strong>Force Buy Efficiency :</strong> Rentabilité des achats forcés</li>
            <li><strong>Save Rate :</strong> Capacité à préserver l'économie</li>
            <li><strong>Average Damage per Round :</strong> Dégâts moyens infligés par round</li>
          </ul>
          <h4>Indicateurs tactiques :</h4>
          <ul>
            <li><strong>First Kill Impact :</strong> Influence du premier kill sur le round</li>
            <li><strong>Clutch Success Rate :</strong> Réussite en situations de clutch</li>
            <li><strong>Retake Efficiency :</strong> Capacité à reprendre les sites</li>
            <li><strong>Anti-eco Performance :</strong> Solidité face aux équipes en eco</li>
          </ul>
        `
      },
      {
        title: "Visualisations et tableaux de bord",
        content: `
          <p>Exploitez des représentations visuelles sophistiquées pour analyser les tendances :</p>
          <h4>Dashboards personnalisables :</h4>
          <ul>
            <li><strong>Widget système :</strong> Glisser-déposer pour organiser votre vue</li>
            <li><strong>Filtres temporels :</strong> Dernière semaine, mois, saison, ou période custom</li>
            <li><strong>Comparaisons multiples :</strong> Superposition de différentes métriques</li>
            <li><strong>Alertes configurables :</strong> Notifications sur seuils de performance</li>
          </ul>
          <h4>Graphiques avancés :</h4>
          <ul>
            <li><strong>Performance timeline :</strong> Évolution des stats dans le temps</li>
            <li><strong>Radar charts :</strong> Profil multidimensionnel de l'équipe</li>
            <li><strong>Heatmaps tactiques :</strong> Zones de force/faiblesse par map</li>
            <li><strong>Correlation matrices :</strong> Relations entre différentes métriques</li>
          </ul>
          <h4>Rapports automatisés :</h4>
          <ul>
            <li><strong>Weekly summaries :</strong> Résumés hebdomadaires automatiques</li>
            <li><strong>Match reports :</strong> Analyses post-match détaillées</li>
            <li><strong>Progression reports :</strong> Évolution mensuelle/trimestrielle</li>
            <li><strong>Competitive benchmarking :</strong> Comparaison avec autres équipes</li>
          </ul>
        `
      },
      {
        title: "Analyse de la synergie d'équipe",
        content: `
          <p>Comprenez les dynamiques internes et optimisez la coordination :</p>
          <h4>Métriques de coordination :</h4>
          <ul>
            <li><strong>Trade Kill Rate :</strong> Efficacité du trading entre coéquipiers</li>
            <li><strong>Rotation Speed :</strong> Vitesse de rotation entre sites</li>
            <li><strong>Stack Timing :</strong> Synchronisation des regroupements</li>
            <li><strong>Communication Quality :</strong> Analyse des callouts et info sharing</li>
          </ul>
          <h4>Analyses de duo/trio :</h4>
          <ul>
            <li><strong>Player pairing :</strong> Performance des duos les plus fréquents</li>
            <li><strong>Position synergy :</strong> Efficacité des combinaisons de rôles</li>
            <li><strong>Setup success :</strong> Réussite des stratégies coordonnées</li>
            <li><strong>Adaptation speed :</strong> Rapidité d'ajustement tactique</li>
          </ul>
          <h4>Facteurs de performance :</h4>
          <ul>
            <li><strong>Momentum tracking :</strong> Impact des séries de rounds</li>
            <li><strong>Pressure response :</strong> Performance sous pression (overtime, etc.)</li>
            <li><strong>Adaptation capability :</strong> Réponse aux anti-stratégies</li>
            <li><strong>Consistency metrics :</strong> Régularité des performances</li>
          </ul>
        `
      }
    ]
  },

  "stats-individuelles": {
    title: "Statistiques individuelles",
    description: "Analyser en profondeur les performances de chaque joueur",
    time: "8 min", 
    category: "Analytics",
    steps: [
      {
        title: "Profils de performance personnalisés",
        content: `
          <p>Créez des profils détaillés pour chaque membre de l'équipe avec des métriques adaptées à leur rôle :</p>
          <h4>Métriques par rôle - Entry Fragger :</h4>
          <ul>
            <li><strong>Opening Kill Rate :</strong> Pourcentage de first kills réussis</li>
            <li><strong>Entry Success :</strong> Rounds gagnés après opening kill</li>
            <li><strong>Multi-kill Frequency :</strong> Fréquence des 2K/3K en opening</li>
            <li><strong>Risk/Reward Ratio :</strong> Balance entre prises de risque et impact</li>
          </ul>
          <h4>Métriques par rôle - Support :</h4>
          <ul>
            <li><strong>Assist Impact :</strong> Influence des assistances sur les rounds</li>
            <li><strong>Utility Efficiency :</strong> Optimisation de l'usage des utilitaires</li>
            <li><strong>Trade Success :</strong> Capacité à trader les coéquipiers</li>
            <li><strong>Positioning Intelligence :</strong> Qualité du placement tactique</li>
          </ul>
          <h4>Métriques par rôle - IGL :</h4>
          <ul>
            <li><strong>Mid-round Calls :</strong> Qualité des adaptations en cours de round</li>
            <li><strong>Read Accuracy :</strong> Justesse des lectures adverses</li>
            <li><strong>Team Coordination :</strong> Efficacité de la coordination d'équipe</li>
            <li><strong>Clutch Leadership :</strong> Performance en situations critiques</li>
          </ul>
        `
      },
      {
        title: "Analyses de tendances et progression",
        content: `
          <p>Suivez l'évolution de chaque joueur avec des outils d'analyse temporelle avancés :</p>
          <h4>Tracking de progression :</h4>
          <ul>
            <li><strong>Performance curves :</strong> Graphiques d'évolution sur 30/60/90 jours</li>
            <li><strong>Skill development :</strong> Progression par compétence (aim, game sense, etc.)</li>
            <li><strong>Consistency improvement :</strong> Réduction de la variance des performances</li>
            <li><strong>Learning rate :</strong> Vitesse d'acquisition de nouvelles compétences</li>
          </ul>
          <h4>Détection de patterns :</h4>
          <ul>
            <li><strong>Performance cycles :</strong> Identification des périodes hautes/basses</li>
            <li><strong>Map preferences :</strong> Évolution des affinités par carte</li>
            <li><strong>Situational performance :</strong> Réussite selon contexte (eco, force, full)</li>
            <li><strong>Opponent adaptation :</strong> Évolution face à différents types d'adversaires</li>
          </ul>
          <h4>Analyses prédictives :</h4>
          <ul>
            <li><strong>Performance forecasting :</strong> Projection des performances futures</li>
            <li><strong>Plateau detection :</strong> Identification des phases de stagnation</li>
            <li><strong>Breakthrough indicators :</strong> Signaux de progression imminente</li>
            <li><strong>Burnout warnings :</strong> Détection précoce de fatigue/surmenage</li>
          </ul>
        `
      },
      {
        title: "Comparaisons et benchmarking",
        content: `
          <p>Situez chaque joueur par rapport à ses pairs et aux standards de son niveau :</p>
          <h4>Comparaisons internes :</h4>
          <ul>
            <li><strong>Team ranking :</strong> Position relative au sein de l'équipe</li>
            <li><strong>Role comparison :</strong> Performance vs autres joueurs du même rôle</li>
            <li><strong>Historical self :</strong> Évolution vs performances passées</li>
            <li><strong>Potential gap :</strong> Écart entre performance actuelle et potentiel</li>
          </ul>
          <h4>Benchmarking externe :</h4>
          <ul>
            <li><strong>League standards :</strong> Comparaison avec moyennes de ligue</li>
            <li><strong>Peer analysis :</strong> Performance vs joueurs de niveau similaire</li>
            <li><strong>Pro comparisons :</strong> Écart avec joueurs professionnels</li>
            <li><strong>Improvement targets :</strong> Objectifs basés sur benchmarks</li>
          </ul>
          <h4>Outils de visualisation :</h4>
          <ul>
            <li><strong>Performance radar :</strong> Profil multidimensionnel comparatif</li>
            <li><strong>Percentile ranking :</strong> Position percentile sur chaque métrique</li>
            <li><strong>Gap analysis charts :</strong> Visualisation des écarts de performance</li>
            <li><strong>Progress trajectories :</strong> Comparaison des courbes de progression</li>
          </ul>
        `
      }
    ]
  },

  "rapports-progression": {
    title: "Rapports de progression",
    description: "Créer et analyser des rapports détaillés d'évolution dans le temps",
    time: "12 min",
    category: "Analytics", 
    steps: [
      {
        title: "Types de rapports et périodicité",
        content: `
          <p>Établissez une cadence de reporting adaptée aux besoins de chaque stakeholder :</p>
          <h4>Rapports quotidiens (Auto-générés) :</h4>
          <ul>
            <li><strong>Daily performance snapshot :</strong> Résumé des stats de la journée</li>
            <li><strong>Training efficiency :</strong> Qualité et quantité des sessions</li>
            <li><strong>Individual highlights :</strong> Moments marquants de chaque joueur</li>
            <li><strong>Quick wins tracking :</strong> Progrès immédiats identifiés</li>
          </ul>
          <h4>Rapports hebdomadaires :</h4>
          <ul>
            <li><strong>Weekly team review :</strong> Performance collective sur 7 jours</li>
            <li><strong>Individual development :</strong> Progression personnelle de chaque membre</li>
            <li><strong>Goal achievement :</strong> Avancement vers les objectifs fixés</li>
            <li><strong>Next week priorities :</strong> Focus pour la semaine suivante</li>
          </ul>
          <h4>Rapports mensuels approfondis :</h4>
          <ul>
            <li><strong>Comprehensive analysis :</strong> Analyse détaillée sur 30 jours</li>
            <li><strong>Trend identification :</strong> Tendances à long terme détectées</li>
            <li><strong>Strategic recommendations :</strong> Ajustements tactiques suggérés</li>
            <li><strong>Resource allocation :</strong> Optimisation des efforts d'entraînement</li>
          </ul>
          <h4>Rapports trimestriels stratégiques :</h4>
          <ul>
            <li><strong>Season review :</strong> Bilan complet d'une période de compétition</li>
            <li><strong>ROI analysis :</strong> Retour sur investissement des efforts</li>
            <li><strong>Long-term planning :</strong> Stratégie pour les 3 prochains mois</li>
            <li><strong>Organizational changes :</strong> Recommandations structurelles</li>
          </ul>
        `
      },
      {
        title: "Métriques de progression avancées",
        content: `
          <p>Utilisez des indicateurs sophistiqués pour mesurer l'amélioration réelle :</p>
          <h4>Indicateurs de performance :</h4>
          <ul>
            <li><strong>Velocity of improvement :</strong> Vitesse de progression mesurée</li>
            <li><strong>Consistency index :</strong> Régularité des performances (écart-type)</li>
            <li><strong>Peak performance frequency :</strong> Fréquence des pics de forme</li>
            <li><strong>Recovery time :</strong> Rapidité de rebond après contre-performance</li>
          </ul>
          <h4>Métriques de développement :</h4>
          <ul>
            <li><strong>Skill acquisition rate :</strong> Vitesse d'apprentissage nouvelles compétences</li>
            <li><strong>Adaptability quotient :</strong> Capacité d'adaptation aux changements</li>
            <li><strong>Knowledge retention :</strong> Mémorisation des enseignements coaching</li>
            <li><strong>Transfer efficiency :</strong> Application training vers compétition</li>
          </ul>
          <h4>Indicateurs qualitatifs :</h4>
          <ul>
            <li><strong>Decision quality improvement :</strong> Évolution de la prise de décision</li>
            <li><strong>Leadership development :</strong> Progression des capacités de leadership</li>
            <li><strong>Communication enhancement :</strong> Amélioration de la communication</li>
            <li><strong>Mental resilience growth :</strong> Développement de la résilience mentale</li>
          </ul>
        `
      },
      {
        title: "Présentation et communication des insights",
        content: `
          <p>Créez des rapports impactants adaptés à chaque audience :</p>
          <h4>Formats par audience :</h4>
          <ul>
            <li><strong>Executive dashboard :</strong> Vue synthétique pour management/sponsors</li>
            <li><strong>Coaching reports :</strong> Analyse détaillée pour staff technique</li>
            <li><strong>Player feedback :</strong> Rapports personnalisés motivants pour joueurs</li>
            <li><strong>Parent updates :</strong> Communications adaptées pour familles</li>
          </ul>
          <h4>Visualisations impactantes :</h4>
          <ul>
            <li><strong>Interactive dashboards :</strong> Tableaux de bord explorables</li>
            <li><strong>Progression animations :</strong> Visualisations temporelles dynamiques</li>
            <li><strong>Comparison matrices :</strong> Benchmarking visuel sophistiqué</li>
            <li><strong>Achievement celebrations :</strong> Mise en valeur des succès</li>
          </ul>
          <h4>Actionable recommendations :</h4>
          <ul>
            <li><strong>Prioritized action items :</strong> Recommandations hiérarchisées</li>
            <li><strong>Resource requirements :</strong> Besoins identifiés pour progression</li>
            <li><strong>Timeline suggestions :</strong> Planning recommandé pour amélioration</li>
            <li><strong>Success metrics :</strong> KPIs pour mesurer l'efficacité des actions</li>
          </ul>
        `
      },
      {
        title: "Automatisation et distribution",
        content: `
          <p>Optimisez la génération et diffusion des rapports avec des workflows intelligents :</p>
          <h4>Génération automatique :</h4>
          <ul>
            <li><strong>Scheduled reports :</strong> Création automatique selon planning</li>
            <li><strong>Trigger-based reports :</strong> Génération sur événements spécifiques</li>
            <li><strong>Template system :</strong> Modèles réutilisables et personnalisables</li>
            <li><strong>Dynamic content :</strong> Adaptation automatique du contenu selon données</li>
          </ul>
          <h4>Distribution intelligente :</h4>
          <ul>
            <li><strong>Role-based delivery :</strong> Rapports adaptés automatiquement par rôle</li>
            <li><strong>Multi-channel distribution :</strong> Email, Slack, Discord, in-app</li>
            <li><strong>Mobile optimization :</strong> Formats adaptés pour lecture mobile</li>
            <li><strong>Archive system :</strong> Historique complet des rapports générés</li>
          </ul>
          <h4>Feedback loop :</h4>
          <ul>
            <li><strong>Report effectiveness tracking :</strong> Mesure de l'impact des rapports</li>
            <li><strong>User engagement analytics :</strong> Statistiques de consultation</li>
            <li><strong>Continuous improvement :</strong> Évolution des formats selon feedback</li>
            <li><strong>Custom requests :</strong> Génération de rapports sur demande</li>
          </ul>
        `
      }
    ]
  }
};

// Helper function to get guide by ID
export const getGuideById = (id: string) => {
  return guideContents[id as keyof typeof guideContents];
};