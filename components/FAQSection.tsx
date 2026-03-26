'use client';

import { motion } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: 'Is this a medical diagnosis?',
    a: 'No. Skin Cure uses AI to provide preliminary insights only. Always consult a qualified dermatologist for an accurate diagnosis and treatment plan.',
  },
  {
    q: 'How accurate is the AI?',
    a: 'Our model is trained on 28,000+ images across 24 skin conditions and achieves ~84% accuracy. It is a helpful first step, not a replacement for professional medical advice.',
  },
  {
    q: 'What types of images work best?',
    a: 'Clear, well-lit photos taken close to the affected area work best. Avoid blurry or low-light images for the most accurate results.',
  },
  {
    q: 'Is my image stored?',
    a: 'No. Your uploaded image is processed in real time and is not stored on our servers after analysis.',
  },
  {
    q: 'Which skin conditions can it detect?',
    a: 'The model covers 24 conditions including Acne, Eczema, Psoriasis, Melanoma, Ringworm, Nail Fungus, and more.',
  },
  {
    q: 'What should I do after getting results?',
    a: 'Use the results as a starting point. If the condition is flagged as moderate or high severity, we strongly recommend booking a consultation with a dermatologist.',
  },
];

export default function FAQSection() {
  return (
    <section id="faq" className="bg-background py-24 sm:py-32 border-t border-border">
      <div className="max-w-3xl mx-auto px-6 flex flex-col items-center">
        {/* Top: Heading */}
        <div className="flex flex-col items-center text-center mb-12">
          <p className="text-primary text-xs font-bold uppercase tracking-[0.2em] mb-4">
            Support
          </p>
          <h2
            className="font-display text-4xl md:text-5xl font-bold text-foreground leading-[1.1]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Common Questions
          </h2>
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-md">
            Everything you need to know about the product and billing.
          </p>
        </div>

        {/* Bottom: Accordion */}
        <div className="w-full flex flex-col">
          <Accordion type="single" collapsible className="w-full flex flex-col gap-3" defaultValue="item-0">
            {faqs.map(({ q, a }, i) => (
              <AccordionItem
                value={`item-${i}`}
                key={i}
                className="bg-card border border-border rounded-xl px-2 data-[state=open]:shadow-sm transition-all"
              >
                <AccordionTrigger className="hover:no-underline px-4 py-5 font-bold text-foreground text-left">
                  {q}
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-5 text-muted-foreground leading-relaxed text-left">
                  {a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
