import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";

export const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 flex items-center justify-center">
            <img src="/lovable-uploads/cec4ef83-50ee-4564-829e-31b5fea55884.png" alt="Shadow Hub Logo" className="w-8 h-8 object-contain" />
          </div>
          <span className="text-xl font-montserrat font-black tracking-tight uppercase">Shadow Hub</span>
        </div>
        
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
            Fonctionnalités
          </a>
          <a href="#games" className="text-muted-foreground hover:text-foreground transition-colors">
            Jeux supportés
          </a>
          <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
            Tarifs
          </a>
        </nav>

        <div className="flex items-center space-x-3">
          <ThemeToggle />
          <Button variant="ghost" className="hidden sm:inline-flex" onClick={() => window.location.href = '/auth'}>
            Connexion
          </Button>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => window.location.href = '/auth'}>
            Créer un compte
          </Button>
        </div>
      </div>
    </header>
  );
};