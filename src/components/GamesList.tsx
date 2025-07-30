const POPULAR_GAMES = [
  "Valorant", "League of Legends", "Counter-Strike 2", "Rocket League", 
  "Overwatch 2", "Apex Legends", "Fortnite", "Call of Duty", 
  "Rainbow Six Siege", "Dota 2", "Street Fighter 6", "Tekken 8",
  "Mortal Kombat", "FIFA", "Hearthstone", "Teamfight Tactics",
  "Clash Royale", "PUBG", "Free Fire", "Starcraft II",
  "Age of Empires", "Warcraft III", "Smash Bros", "Genshin Impact", "Halo"
];

export const GamesList = () => {
  return (
    <section id="games" className="py-20 px-6 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            25 jeux compétitifs supportés
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Gérez vos équipes sur tous les jeux eSport majeurs avec des configurations 
            automatiques adaptées à chaque discipline.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {POPULAR_GAMES.map((game, index) => (
            <div 
              key={game}
              className="bg-card border border-border rounded-lg p-4 text-center hover:bg-muted/50 transition-colors cursor-pointer group"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="w-12 h-12 bg-gradient-brand rounded-lg mx-auto mb-3 flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-primary-foreground font-bold text-sm">
                  {game.charAt(0)}
                </span>
              </div>
              <h3 className="font-medium text-sm">{game}</h3>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground">
            Configuration automatique des rosters selon le jeu sélectionné
          </p>
        </div>
      </div>
    </section>
  );
};