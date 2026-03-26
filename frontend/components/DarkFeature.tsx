'use client';

import { motion } from 'framer-motion';

const features = [
  { t: 'Acne Analysis', n: '200+ Cases' },
  { t: 'Eczema Detection', n: '150+ Cases' },
  { t: 'Full Body Screening', n: 'Trusted by 100K+' },
];

export default function DarkFeature() {
  return (
    <section className="bg-background py-24 sm:py-32 overflow-hidden border-t border-border">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left: Typography */}
        <div className="flex flex-col">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-widest inline-block mb-8">
              Core Feature
            </span>
            <h2
              className="font-display font-bold text-foreground leading-tight"
              style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(3.5rem, 6vw, 5.5rem)' }}
            >
              Endless<br />
              <span className="text-muted-foreground">Skin Insights</span>
            </h2>
            <p className="text-muted-foreground mt-6 text-lg max-w-md leading-relaxed">
              Explore countless training options for condition tracking, maintenance, or managing your best skin health.
            </p>
          </motion.div>

          {/* Cards below text */}
          <div className="flex items-center gap-4 mt-12 flex-wrap">
            {features.map((f, i) => (
              <motion.div
                key={f.t}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                            className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-2 min-w-[160px] shadow-sm"
              >
                {/* Abstract shape */}
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <div className="w-4 h-4 bg-primary rounded-sm rotate-45" />
                </div>
                <div className="mt-2">
                  <p className="text-sm font-bold text-foreground leading-tight">{f.t}</p>
                  <p className="text-xs text-muted-foreground mt-1">{f.n}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right: Abstract graphic / photo area */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="relative h-[600px] w-full rounded-3xl overflow-hidden bg-muted/50 border border-border flex items-center justify-center p-8"
        >
          {/* Abstract light/blur flares */}
          <div className="absolute top-1/4 -right-1/4 w-[120%] h-[120%] bg-primary rounded-full blur-[120px] opacity-20" />
          <div className="absolute bottom-1/4 -left-1/4 w-[100%] h-[100%] bg-secondary rounded-full blur-[100px] opacity-50" />

          {/* Chart Mockup Container */}
          <div className="relative w-full max-w-sm bg-card/80 backdrop-blur-xl border border-border shadow-2xl rounded-2xl p-6 z-10">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Weekly Scan Data</p>
                <p className="font-display text-2xl font-bold text-foreground" style={{ fontFamily: 'var(--font-display)' }}>Condition Track</p>
              </div>
              <div className="flex items-center gap-1 bg-green-500/10 text-green-500 text-xs font-bold px-2 py-1 rounded">
                +14%
              </div>
            </div>

            {/* Mock bar chart */}
            <div className="flex items-end justify-between h-40 gap-3">
              {[30, 45, 25, 60, 80, 50, 95].map((getHeight, i) => (
                <div key={i} className="flex-1 bg-muted rounded-t-sm relative group h-full">
                  <motion.div 
                    initial={{ height: 0 }}
                    whileInView={{ height: `${getHeight}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.2 + (i * 0.1), ease: "easeOut" }}
                    className={`absolute bottom-0 w-full rounded-t-sm ${i === 6 ? 'bg-primary' : 'bg-primary/40 group-hover:bg-primary/60 transition-colors'}`}
                  />
                </div>
              ))}
            </div>
            
            <div className="flex justify-between mt-4 text-[10px] text-muted-foreground font-medium">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
          </div>

          {/* Minimal UI overlay inside the "photo" */}
          <div className="absolute bottom-8 right-8 bg-background/80 backdrop-blur-md border border-border rounded-2xl p-5 shadow-xl transition-all hover:scale-105 z-20">
            <p className="text-muted-foreground text-xs mb-1 uppercase tracking-wider">Analysis Active</p>
            <p className="text-foreground font-semibold flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shadow-[0_0_10px_var(--color-primary)]" /> Real-time Sync
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
