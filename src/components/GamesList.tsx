const POPULAR_GAMES = [
  { name: "Valorant", image: "/lovable-uploads/234a8bcf-d9df-4c43-8d57-805ff096445b.png" },
  { name: "League of Legends", image: "/lovable-uploads/69cb53dd-46ed-4ba5-89da-e3c6db01d5ac.png" },
  { name: "CS:GO / CS2", image: "/lovable-uploads/86fc46d5-2e9c-441f-bd14-4c3a7493d535.png" },
  { name: "Rocket League", image: "/lovable-uploads/57002cee-29ab-4fd0-a305-3e75b670a26a.png" },
  { name: "Overwatch 2", image: "/lovable-uploads/4d4d44fd-dbbf-4695-9dca-b11e3816cbdc.png" },
  { name: "Apex Legends", image: "/lovable-uploads/e63c3e0d-75c5-42eb-b7c7-616ddb5284cd.png" },
  { name: "Call of Duty Warzone", image: "/lovable-uploads/2c9d630c-6669-4ece-b281-af8ea89a0fc4.png" },
  { name: "Call of Duty Multiplayer", image: "/lovable-uploads/faeae144-09dc-4896-923f-0cafd5148939.png" },
  { name: "Fortnite", image: "/lovable-uploads/453f8e9c-cefc-4b82-8682-20ff96bcb444.png" }
];

export const GamesList = () => {
  return (
    <section id="games" className="py-20 px-6 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            9 jeux compétitifs supportés
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
              className="relative h-32 rounded-lg overflow-hidden cursor-pointer group transition-transform hover:scale-105"
              style={{ 
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url(${game.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                animationDelay: `${index * 50}ms`
              }}
            >
              <div className="absolute inset-0 flex items-end p-4">
                <h3 className="font-semibold text-white text-sm leading-tight">{game.name}</h3>
              </div>
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