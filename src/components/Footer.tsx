export const Footer = () => {
  return (
    <footer className="bg-muted/30 border-t border-border py-12 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 flex items-center justify-center">
                <img src="/lovable-uploads/cec4ef83-50ee-4564-829e-31b5fea55884.png" alt="Shadow Hub Logo" className="w-8 h-8 object-contain" />
              </div>
              <span className="text-lg font-montserrat font-bold tracking-tight uppercase">Shadow Hub</span>
            </div>
            <p className="text-sm text-muted-foreground">
              La plateforme de gestion d'équipes eSport nouvelle génération.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Fonctionnalités</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Gestion d'équipe</li>
              <li>Planning & Calendrier</li>
              <li>Coaching & Formation</li>
              <li>Analyse VOD</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Jeux supportés</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Valorant</li>
              <li>League of Legends</li>
              <li>Counter-Strike 2</li>
              <li>Rocket League</li>
              <li>Overwatch 2</li>
              <li>Apex Legends</li>
              <li>Call of Duty</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">À propos</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Plateforme de gestion</li>
              <li>Équipes eSport</li>
              <li>Outils professionnels</li>
              <li>Interface moderne</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 Shadow Hub. Plateforme de gestion d'équipes eSport.
          </p>
        </div>
      </div>
    </footer>
  );
};