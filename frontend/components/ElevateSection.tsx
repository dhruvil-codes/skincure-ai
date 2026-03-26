'use client';

import { motion } from 'framer-motion';

export default function ElevateSection() {
  return (
    <section className="bg-background py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-muted-foreground text-xs font-bold uppercase tracking-[0.2em] mb-4">
            Smart Health
          </p>
          <h2
            className="font-display font-bold text-foreground"
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 4vw, 3.5rem)' }}
          >
            Elevate <span className="italic text-primary">Skin Health</span><br/>
            And Awareness
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {/* Card 1 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-muted/30 border border-border rounded-[2rem] aspect-[4/5] overflow-hidden relative flex flex-col items-center justify-center p-8 group"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-muted/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="w-32 h-32 rounded-[2rem] bg-card text-card-foreground shadow-xl flex items-center justify-center relative z-10 border border-border rotate-12 group-hover:rotate-0 transition-transform duration-500">
               <span className="text-4xl">⌚</span>
            </div>
            <p className="mt-8 text-sm font-bold z-10 text-center text-foreground">Track your progress<br/>over time</p>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-primary/5 border border-primary/10 rounded-[2rem] aspect-[4/5] overflow-hidden relative flex flex-col items-center justify-center p-8 group"
          >
            <div className="w-full h-full bg-primary/5 absolute inset-0 rounded-[2rem]" />
            <div className="w-40 h-40 rounded-full bg-background/60 blur-3xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-700" />
            <div className="z-10 text-center">
              <span className="text-5xl mb-4 block">🧘‍♀️</span>
              <p className="text-lg font-bold text-primary">Holistic Wellness</p>
              <p className="text-primary/70 mt-2 text-sm">Mind and body balance</p>
            </div>
          </motion.div>

          {/* Card 3 */}
          <motion.div
             initial={{ opacity: 0, y: 30 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 0.6, delay: 0.2 }}
             className="bg-muted/30 border border-border rounded-[2rem] aspect-[4/5] overflow-hidden relative flex flex-col items-center justify-center p-8 group"
          >
             <div className="w-32 h-48 bg-black rounded-2xl shadow-2xl relative z-10 flex flex-col pt-4 px-3 border border-gray-800 -rotate-6 group-hover:rotate-0 transition-transform duration-500">
               <div className="flex items-center justify-between mb-4">
                 <div className="text-white text-[10px] font-semibold">SkinCure App</div>
                 <div className="w-4 h-1 bg-gray-600 rounded-full" />
               </div>
               <div className="flex-1 bg-gray-900 rounded-xl p-2 flex flex-col gap-2">
                 <div className="h-2 w-1/2 bg-primary rounded-full" />
                 <div className="h-4 w-full bg-white/10 rounded" />
                 <div className="h-4 w-full bg-white/10 rounded" />
               </div>
             </div>
             <p className="mt-8 text-sm font-bold z-10 text-center text-foreground">Manage appointments<br/>on the go</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
