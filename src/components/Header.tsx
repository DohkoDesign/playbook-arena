import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onOpenSignup: () => void;
  onOpenLogin: () => void;
}

export const Header = ({ onOpenSignup, onOpenLogin }: HeaderProps) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/15 backdrop-blur-sm border-b border-white/10">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 flex items-center justify-center">
            <img src="/lovable-uploads/cec4ef83-50ee-4564-829e-31b5fea55884.png" alt="Core.gg Logo" className="w-8 h-8 object-contain" />
          </div>
          <span className="text-xl font-montserrat font-black tracking-tight text-white">Core.gg</span>
        </div>

        <div className="flex items-center space-x-3">
          <ThemeToggle />
          <Button variant="ghost" className="hidden sm:inline-flex text-white hover:bg-white/10" onClick={onOpenLogin}>
            Connexion
          </Button>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={onOpenSignup}>
            Créer un compte
          </Button>
        </div>
      </div>
    </header>
  );
};