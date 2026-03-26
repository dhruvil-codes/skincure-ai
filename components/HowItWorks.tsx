'use client';

import { motion } from 'framer-motion';
import { Button } from './ui/button';

const steps = [
  {
    num: '01',
    title: 'Upload Your Photo',
    desc: 'Take or upload a clear photo of your skin condition. JPG, PNG or WEBP, up to 10MB. Ensure good lighting for the most accurate results.',
  },
  {
    num: '02',
    title: 'AI Analyses It',
    desc: 'Our SwinV2 model trained on 28,000+ skin images identifies the condition in seconds, giving you a confidence score and severity assessment.',
  },
  {
    num: '03',
    title: 'Find a Specialist',
    desc: 'Get matched with dermatologists near you for a professional consultation. Use the results as your starting conversation.',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-background py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left: Text & Steps */}
        <div className="flex flex-col gap-10">
          <div>
            <p className="text-primary text-xs font-bold uppercase tracking-[0.2em] mb-4">
              Your Health
            </p>
            <h2
              className="font-display text-4xl sm:text-5xl font-bold text-foreground"
              style={{ fontFamily: 'var(--font-display)', lineHeight: '1.1' }}
            >
              Customized Analysis <span className="text-muted-foreground font-normal italic">for You</span>
            </h2>
            <p className="text-muted-foreground mt-6 text-lg max-w-md leading-relaxed">
              Individualized programs are tailored specifically to your skin concerns and goals, ensuring precise care.
            </p>
            <Button asChild className="mt-8 rounded-full px-8 py-6">
              <a href="#upload">
                Start Now
              </a>
            </Button>
          </div>

          <div className="flex flex-col gap-8">
            {steps.map((s, i) => (
              <motion.div
                key={s.num}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="flex gap-6"
              >
                <div className="text-3xl font-display font-bold text-primary/30 pt-1" style={{ fontFamily: 'var(--font-display)' }}>
                  {s.num}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed pr-8">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right: Phone mockup (abstract) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative h-[650px] bg-background rounded-[2.5rem] p-4 shadow-2xl border-[8px] border-border/50 flex flex-col mx-auto w-full max-w-[340px]"
        >
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-border/50 rounded-b-2xl z-10" />

          {/* App UI inside mockup */}
          <div className="bg-muted/30 flex-1 rounded-2xl p-6 flex flex-col pt-12">
             <h4 className="font-display text-2xl font-bold mb-4" style={{ fontFamily: 'var(--font-display)' }}>
               Analysis<br/>Program
             </h4>

             <div className="flex-1 flex flex-col gap-3">
               {[
                 { t: 'Eczema Detected', s: 'High confidence', icon: '🔬', active: true },
                 { t: 'Rosacea', s: 'Low confidence', icon: '🔥', active: false },
                 { t: 'Acne', s: 'Medium severity', icon: '🧴', active: false },
               ].map((item, i) => (
                 <div key={i} className={`p-4 rounded-2xl flex items-center gap-4 transition-colors ${item.active ? 'bg-background shadow-sm ring-1 ring-border' : 'opacity-60'}`}>
                   <div className="text-xl">{item.icon}</div>
                   <div>
                     <p className="text-sm font-bold text-foreground">{item.t}</p>
                     <p className="text-xs text-muted-foreground">{item.s}</p>
                   </div>
                   {item.active && <div className="ml-auto w-2 h-2 rounded-full bg-primary" />}
                 </div>
               ))}
             </div>

             {/* Bottom pill */}
             <div className="bg-background rounded-full p-4 mt-auto shadow-sm flex items-center justify-between border border-border/50">
               <span className="text-sm font-bold ml-2">Accuracy:</span>
               <span className="bg-foreground text-background text-xs px-3 py-1.5 rounded-full font-medium">87%</span>
             </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
