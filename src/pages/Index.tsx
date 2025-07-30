import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { FeaturesList } from "@/components/FeaturesList";
import { GamesList } from "@/components/GamesList";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <FeaturesList />
        <GamesList />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
