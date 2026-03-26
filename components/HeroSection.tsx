'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { CheckCircle, BarChart2, MapPin, Loader2 } from 'lucide-react';

const EASE = [0.16, 1, 0.3, 1] as const;

const BLOCK_VARIANTS = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

export default function HeroSection() {
  const { scrollY } = useScroll();
  const bgOpacity = useTransform(scrollY, [0, 400], [1, 0]);

  return (
    <section className="relative min-h-[100dvh] w-full flex flex-col items-center justify-center overflow-hidden pt-32 pb-16">
      
      {/* Animated Aceternity-style Dot Background */}
      <motion.div 
        style={{ opacity: bgOpacity }}
        className="absolute inset-0 pointer-events-none overflow-hidden z-[-1]"
      >
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle, #2D9B8A 2px, transparent 2px)',
            backgroundSize: '32px 32px',
            opacity: 0.35
          }}
        />
        
        {/* Fade out bottom */}
        <div 
          className="absolute inset-0 bg-background"
          style={{
            maskImage: 'linear-gradient(to bottom, transparent 60%, black 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 60%, black 100%)'
          }}
        />

        {/* Fade out left side to protect text readability */}
        <div 
          className="absolute inset-0 bg-background hidden lg:block"
          style={{
            maskImage: 'linear-gradient(to right, black 0%, transparent 50%)',
            WebkitMaskImage: 'linear-gradient(to right, black 0%, transparent 50%)'
          }}
        />
      </motion.div>

      <div className="w-full max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 lg:gap-8 items-center relative z-10 pt-4">
        {/* Left: copy */}
        <div className="flex flex-col max-w-xl">
          <motion.div variants={BLOCK_VARIANTS}>
            <p className="text-primary text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ fontFamily: 'var(--font-body)' }}>
              Smart Skin. Smarter Care.
            </p>
            <h1
              className="text-foreground font-display font-bold leading-[1.05] tracking-tight mb-5"
              style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(3.5rem, 8vw, 5.5rem)' }}
            >
              The Skin<br /> Analysis<br />
              <span className="text-primary italic font-normal">Journey</span> Starts<br /> Here
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-lg leading-relaxed mb-6" style={{ fontFamily: 'var(--font-body)' }}>
              Upload a photo of your skin condition and get an AI-powered diagnosis in seconds. Covering 24 conditions trained on 28,000+ images.
            </p>
            
            <div className="flex items-center gap-2 mb-8 px-4 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-500 text-sm font-medium w-fit" style={{ fontFamily: 'var(--font-body)' }}>
               ⚠️ Not a medical diagnosis. A smart first step.
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <Button asChild size="lg" className="rounded-full px-8 h-14 text-base shadow-lg">
                <a href="#upload">Start Analysis</a>
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Right: floating mockup cards */}
        <div className="relative h-[450px] lg:h-[550px] w-full max-w-[500px] mx-auto lg:ml-auto perspective-1000">
             
             {/* Center visual core */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[400px] bg-primary/10 rounded-[3rem] blur-xl" />

             {/* Floating Card 1: Main Status */}
             <motion.div
               animate={{ y: [0, -10, 0] }}
               transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
               className="absolute top-10 right-0 z-20"
             >
               <Card className="px-6 py-5 rounded-[1.5rem] bg-card border border-border shadow-md rotate-3 flex flex-col gap-3 min-w-[220px]">
                 <div className="flex items-center gap-2 text-primary font-semibold text-xs mb-1">
                   ✓ Analysis Complete
                 </div>
                 <div className="text-lg font-bold text-foreground">Eczema Detected</div>
                 <div className="flex gap-2">
                   <span className="bg-primary/10 text-primary px-2 py-1 rounded text-[10px] font-bold">87% confident</span>
                   <span className="bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 px-2 py-1 rounded text-[10px] font-bold">Safe to monitor</span>
                 </div>
               </Card>
             </motion.div>

             {/* Floating Card 2: Stats */}
             <motion.div
               animate={{ y: [0, 10, 0] }}
               transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
               className="absolute top-1/4 left-0 z-10"
             >
               <Card className="px-5 py-4 rounded-[1.5rem] bg-card border border-border shadow-md -rotate-6 flex items-center gap-3 min-w-[180px]">
                 <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                   <BarChart2 className="w-5 h-5 text-primary" />
                 </div>
                 <div>
                   <div className="text-lg font-bold text-foreground">28K+</div>
                   <div className="text-xs text-muted-foreground">Images Trained</div>
                 </div>
               </Card>
             </motion.div>

             {/* Floating Card 3: Model */}
             <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                className="absolute bottom-20 lg:bottom-24 right-16 z-30"
             >
                <Card className="px-5 py-4 rounded-full bg-card shadow-md border border-border flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-200 to-pink-200 flex items-center justify-center" />
                   <div>
                     <div className="text-xs font-bold text-foreground">Processing…</div>
                     <div className="w-24 h-1.5 bg-secondary rounded-full mt-1 overflow-hidden">
                       <div className="w-1/2 h-full bg-primary rounded-full animate-pulse" />
                     </div>
                   </div>
                </Card>
             </motion.div>

             {/* Floating Card 4: Doctor */}
             <motion.div
               animate={{ y: [0, 8, 0] }}
               transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
               className="absolute bottom-4 left-10 z-20"
             >
               <Card className="px-5 py-4 rounded-[1.5rem] bg-card border border-border shadow-md rotate-3 flex items-center gap-3 min-w-[190px]">
                 <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                   <MapPin className="w-5 h-5 text-primary" />
                 </div>
                 <div>
                   <div className="text-sm font-bold text-foreground">Find a Specialist</div>
                   <div className="text-xs text-muted-foreground">4.8 ★ · 2 km away</div>
                 </div>
               </Card>
             </motion.div>

             {/* Center hero image / placeholder */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-80 rounded-3xl bg-background border border-border flex flex-col items-center justify-center gap-3 shadow-2xl z-0">
               <div className="text-5xl">🔬</div>
               <span className="text-primary font-semibold text-sm">AI Analysis</span>
               <div className="w-32 h-1.5 bg-secondary rounded-full overflow-hidden">
                 <div className="h-full w-2/3 bg-primary rounded-full animate-pulse" />
               </div>
             </div>
        </div>
      </div>
    </section>
  );
}
