import { Link, useNavigate } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";

interface HeaderProps {}

export const Header = ({}: HeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/15 backdrop-blur-sm border-b border-white/10">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-12 h-12 flex items-center justify-center">
            <img src="/lovable-uploads/3f92459b-2800-40a4-a192-9ee96017f233.png" alt="Link Logo" className="w-12 h-12 object-contain" />
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <ThemeToggle />
          <Button 
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => navigate("/auth")}
          >
            Connexion / Inscription
          </Button>
        </div>
      </div>
    </header>
  );
};