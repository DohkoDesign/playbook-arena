import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { FeaturesList } from "@/components/FeaturesList";
import { FeaturesShowcase } from "@/components/FeaturesShowcase";
import { GamesList } from "@/components/GamesList";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <FeaturesShowcase />
        <GamesList />
        {/* <TestimonialsSection /> */}
      </main>
      <Footer />
    </div>
  );
};

export default Index;
