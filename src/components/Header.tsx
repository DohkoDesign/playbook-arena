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
        <div className="flex items-center">
          <div className="w-12 h-12 flex items-center justify-center">
            <img src="/lovable-uploads/e8d1c2c5-491c-4cc6-81d7-47e510fc040d.png" alt="Core Link Logo" className="w-12 h-12 object-contain" />
          </div>
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