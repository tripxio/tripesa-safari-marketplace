import HeroSection from "@/components/home/HeroSection";
import PopularTours from "@/components/home/PopularTours";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <PopularTours />
    </div>
  );
}
