import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";

export const Header = () => {
  return (
    <header className="fixed top-0 w-full bg-background/80 backdrop-blur-lg border-b border-primary/20 z-50">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img 
              src="/lovable-uploads/cec4ef83-50ee-4564-829e-31b5fea55884.png" 
              alt="Shadow Hub Logo" 
              className="w-10 h-10 object-contain gaming-glow" 
            />
          </div>
          <span className="text-xl font-orbitron font-bold tracking-tight text-transparent bg-gradient-gaming bg-clip-text">
            SHADOW HUB
          </span>
        </div>
        
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-muted-foreground hover:text-primary transition-colors">
            Fonctionnalités
          </a>
          <a href="#games" className="text-muted-foreground hover:text-primary transition-colors">
            Jeux supportés
          </a>
          <a href="#pricing" className="text-muted-foreground hover:text-primary transition-colors">
            Tarifs
          </a>
        </nav>

        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <Button 
            variant="ghost" 
            className="hidden md:inline-flex hover:bg-primary/10"
            onClick={() => window.location.href = '/auth'}
          >
            Connexion
          </Button>
          <Button 
            className="btn-gaming"
            onClick={() => window.location.href = '/auth'}
          >
            Commencer
          </Button>
        </div>
      </div>
    </header>
  );
};