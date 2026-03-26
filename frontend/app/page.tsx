import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import HowItWorks from '@/components/HowItWorks';
import DarkFeature from '@/components/DarkFeature';
import MarqueeSection from '@/components/MarqueeSection';
import UploadSection from '@/components/UploadSection';
import FAQSection from '@/components/FAQSection';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main className="relative z-10 selection:bg-primary/20 selection:text-primary-foreground min-h-screen w-full overflow-x-hidden bg-background text-foreground">
      <Navbar />
      <HeroSection />
      <HowItWorks />
      <DarkFeature />
      <MarqueeSection />
      <UploadSection />
      <FAQSection />
      <Footer />
    </main>
  );
}
