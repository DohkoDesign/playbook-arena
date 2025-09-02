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
          <p>Depuis votre dashboard principal, commencez la création de votre équipe.</p>
          <ul>
            <li>Cliquez sur "Créer une équipe" dans le menu principal</li>
            <li>Ou utilisez le bouton "+" dans la barre de navigation</li>
            <li>Sélectionnez "Nouvelle équipe eSport"</li>
          </ul>
        `
      },
      {
        title: "Informations de base",
        content: `
          <p>Renseignez les informations essentielles de votre équipe.</p>
          <ul>
            <li><strong>Nom de l'équipe :</strong> Choisissez un nom unique et mémorable</li>
            <li><strong>Tag/Sigle :</strong> Acronyme de 2-5 caractères (ex: "SHB")</li>
            <li><strong>Jeu principal :</strong> Sélectionnez parmi les 9 jeux supportés</li>
            <li><strong>Région :</strong> Votre zone géographique de compétition</li>
          </ul>
        `,
        tip: "Le nom de votre équipe sera visible publiquement, choisissez-le avec soin !"
      },
      {
        title: "Personnalisation visuelle", 
        content: `
          <p>Donnez une identité visuelle à votre équipe.</p>
          <ul>
            <li>Uploadez un logo (format PNG/JPG, max 2MB)</li>
            <li>Choisissez les couleurs principales de votre équipe</li>
            <li>Ajoutez une bannière pour le profil public</li>
            <li>Rédigez une description courte de votre équipe</li>
          </ul>
        `
      },
      {
        title: "Configuration avancée",
        content: `
          <p>Configurez les paramètres spécifiques à votre organisation.</p>
          <ul>
            <li><strong>Niveau de compétition :</strong> Amateur, Semi-pro, Professionnel</li>
            <li><strong>Objectifs :</strong> Définissez vos ambitions (tournois, classement)</li>
            <li><strong>Visibilité :</strong> Équipe privée ou publique</li>
            <li><strong>Recrutement :</strong> Activez si vous cherchez des joueurs</li>
          </ul>
        `,
        warning: "Une équipe publique sera visible dans le répertoire et pourra recevoir des candidatures."
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
        title: "Navigation principale",
        content: `
          <p>Familiarisez-vous avec la structure du dashboard.</p>
          <ul>
            <li><strong>Sidebar :</strong> Menu principal avec toutes les sections</li>
            <li><strong>Header :</strong> Notifications, profil, et changement d'équipe</li>
            <li><strong>Zone centrale :</strong> Contenu principal de la section active</li>
            <li><strong>Panel de droite :</strong> Informations contextuelles et raccourcis</li>
          </ul>
        `
      },
      {
        title: "Sections principales",
        content: `
          <p>Chaque section a un rôle spécifique dans la gestion de votre équipe.</p>
          <ul>
            <li><strong>Dashboard :</strong> Vue d'ensemble et métriques importantes</li>
            <li><strong>Équipe :</strong> Gestion des membres et rosters</li>
            <li><strong>Calendrier :</strong> Planification des événements et matchs</li>
            <li><strong>VOD Analysis :</strong> Analyse des replays et sessions de coaching</li>
            <li><strong>Analytics :</strong> Statistiques et rapports de performance</li>
          </ul>
        `
      },
      {
        title: "Widgets du dashboard",
        content: `
          <p>La page d'accueil présente les informations les plus importantes.</p>
          <ul>
            <li>Prochains matchs et entraînements</li>
            <li>Disponibilités de l'équipe en temps réel</li>
            <li>Dernières VODs analysées</li>
            <li>Objectifs en cours et progression</li>
            <li>Notifications et rappels importants</li>
          </ul>
        `,
        tip: "Vous pouvez personnaliser l'ordre et la visibilité des widgets selon vos besoins."
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
  }
};

// Helper function to get guide by ID
export const getGuideById = (id: string) => {
  return guideContents[id as keyof typeof guideContents];
};