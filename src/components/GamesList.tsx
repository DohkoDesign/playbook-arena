import valorantImg from '../assets/valorant.png';
import leagueOfLegendsImg from '../assets/league-of-legends.png';
import csgoImg from '../assets/cs-go-cs2.png';
import rocketLeagueImg from '../assets/rocket-league.png';
import overwatchImg from '../assets/overwatch-2.png';
import apexLegendsImg from '../assets/apex-legends.png';
import codWarzoneImg from '../assets/call-of-duty-warzone.png';
import codMultiplayerImg from '../assets/call-of-duty-multiplayer.png';

const POPULAR_GAMES = [
  { name: "Valorant", image: valorantImg },
  { name: "League of Legends", image: leagueOfLegendsImg },
  { name: "CS:GO / CS2", image: csgoImg },
  { name: "Rocket League", image: rocketLeagueImg },
  { name: "Overwatch 2", image: overwatchImg },
  { name: "Apex Legends", image: apexLegendsImg },
  { name: "Call of Duty Warzone", image: codWarzoneImg },
  { name: "Call of Duty Multiplayer", image: codMultiplayerImg }
];

export const GamesList = () => {
  return (
    <section id="games" className="py-20 px-6 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            8 jeux compétitifs supportés
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Gérez vos équipes sur tous les jeux eSport majeurs avec des configurations 
            automatiques adaptées à chaque discipline et des rosters spécialisés.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
          {POPULAR_GAMES.map((game, index) => (
            <div 
              key={game.name}
              className="bg-card border border-border rounded-lg p-4 text-center hover:bg-muted/50 transition-colors cursor-pointer group"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="w-16 h-16 rounded-lg mx-auto mb-3 flex items-center justify-center group-hover:scale-110 transition-transform overflow-hidden">
                <img 
                  src={game.image} 
                  alt={game.name} 
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <h3 className="font-medium text-sm">{game.name}</h3>
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