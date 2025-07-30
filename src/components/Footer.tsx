export const Footer = () => {
  return (
    <footer className="bg-muted/30 border-t border-border py-12 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-brand rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">E</span>
              </div>
              <span className="text-lg font-semibold">eSport Manager</span>
            </div>
            <p className="text-sm text-muted-foreground">
              La plateforme professionnelle pour gérer vos équipes eSport sur 25 jeux compétitifs.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Fonctionnalités</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Gestion d'équipe</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Planning & Calendrier</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Stratégies & Playbook</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Suivi performance</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Jeux populaires</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Valorant</li>
              <li>League of Legends</li>
              <li>Counter-Strike 2</li>
              <li>Rocket League</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Status</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 eSport Manager. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
};