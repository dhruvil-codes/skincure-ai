'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  Loader2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  MapPin,
  Star,
  ExternalLink,
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { AppState, AnalysisResult, Doctor } from '@/lib/types';
import { analyzeImage } from '@/lib/analyzeImage';
import { getDoctors } from '@/lib/getDoctors';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function SeverityPill({ severity }: { severity: 'low' | 'medium' | 'high' }) {
  const config = {
    low: { bg: 'bg-green-100', text: 'text-green-700', label: 'Safe to monitor at home' },
    medium: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Consider consulting a dermatologist' },
    high: { bg: 'bg-red-100', text: 'text-red-700', label: 'Please see a doctor soon' },
  }[severity];

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
      {severity === 'low' && <CheckCircle className="w-3.5 h-3.5" />}
      {severity === 'medium' && <AlertTriangle className="w-3.5 h-3.5" />}
      {severity === 'high' && <XCircle className="w-3.5 h-3.5" />}
      {config.label}
    </span>
  );
}

function DoctorCard({ doctor }: { doctor: Doctor }) {
  return (
    <Card className="p-4 flex flex-col gap-2 rounded-2xl shadow-sm border-border bg-card">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h4 className="font-semibold text-foreground text-sm">{doctor.name}</h4>
          <p className="text-muted-foreground text-xs leading-relaxed">{doctor.address}</p>
        </div>
        <Button
          variant="secondary"
          size="icon"
          className="flex-shrink-0 w-8 h-8 rounded-full text-primary bg-primary/10 hover:bg-primary/20"
          asChild
        >
          <a href={doctor.maps_url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4" />
          </a>
        </Button>
      </div>
      <div className="flex items-center gap-3 text-xs mt-1">
        <div className="flex items-center gap-1 text-amber-500 font-medium">
          <Star className="w-3.5 h-3.5 fill-current" />
          <span>{doctor.rating.toFixed(1)}</span>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <MapPin className="w-3 h-3" />
          <span>{doctor.distance_km.toFixed(1)} km</span>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
          doctor.open_now ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
        }`}>
          {doctor.open_now ? 'Open' : 'Closed'}
        </span>
      </div>
    </Card>
  );
}

const STAGGER_DELAY = 0.08;
const BLOCK_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * STAGGER_DELAY, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

export default function UploadSection() {
  const [appState, setAppState] = useState<AppState>('idle');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[] | null>(null);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [doctorsError, setDoctorsError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) return 'Please upload a JPG, PNG, or WEBP image.';
    if (file.size > MAX_FILE_SIZE) return 'File size must be under 10MB.';
    return null;
  };

  const handleFileSelect = useCallback((file: File) => {
    const err = validateFile(file);
    if (err) { setError(err); return; }
    setError(null);
    setSelectedFile(file);
    setPreviewURL(URL.createObjectURL(file));
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect]
  );

  const handleSubmit = async () => {
    if (!selectedFile) return;
    setAppState('processing');
    setError(null);
    try {
      // Mocking the backend call to hardcode the report as per the PRD
      await new Promise(r => setTimeout(r, 2000));
      const mockedData: AnalysisResult = {
        top_prediction: {
          disease: 'Eczema Detected',
          confidence: 87,
          severity: 'medium',
          description: 'The image shows signs consistent with eczema (atopic dermatitis), characterized by dry, itchy, and inflamed skin patches.',
          symptoms: ['Red or brownish-gray patches', 'Severe itching, especially at night', 'Small, raised bumps which may leak fluid'],
          what_we_saw: 'Algorithm detected irregular border scaling and high redness concentration typical of atopic dermatitis patterns in our training set.'
        },
        all_predictions: []
      };
      setResult(mockedData);
      setAppState('results');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Analysis failed. Please try again.';
      setError(message);
      setAppState('error');
    }
  };

  const handleReset = () => {
    setAppState('idle');
    setSelectedFile(null);
    setPreviewURL(null);
    setResult(null);
    setError(null);
    setDoctors(null);
    setDoctorsError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFindDoctors = async () => {
    setDoctorsLoading(true);
    setDoctorsError(null);
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject)
      );
      const data = await getDoctors(pos.coords.latitude, pos.coords.longitude);
      setDoctors(data.doctors);
    } catch {
      setDoctorsError('Could not get your location or find doctors nearby.');
    } finally {
      setDoctorsLoading(false);
    }
  };

  return (
    <section id="upload" className="bg-background py-24 border-t border-border">
      <div className="max-w-lg mx-auto px-6">
        {/* Section heading */}
        <div className="text-center mb-10">
          <p className="text-primary text-xs font-bold uppercase tracking-[0.2em] mb-4">
            Skin Analysis
          </p>
          <h2
            className="font-display text-4xl font-bold text-foreground"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Analyse Your Skin
          </h2>
          <p className="text-muted-foreground text-base mt-4 max-w-sm mx-auto leading-relaxed">
            Upload a photo and our AI will identify the condition with clinical precision.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {/* IDLE STATE */}
          {(appState === 'idle' || appState === 'error') && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="bg-card border border-border rounded-2xl shadow-sm p-8"
            >
              {/* Drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative rounded-xl p-10 flex flex-col items-center justify-center gap-4 cursor-pointer
                           border-2 border-dashed transition-all duration-300
                           ${isDragging
                             ? 'border-primary bg-primary/5'
                             : 'border-border hover:border-primary hover:bg-primary/5'
                           }
                           ${previewURL ? 'p-4' : ''}`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFileSelect(f);
                  }}
                />

                {previewURL ? (
                  <div className="flex flex-col items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewURL}
                      alt="Preview"
                      className="w-32 h-32 rounded-xl object-cover shadow-sm"
                    />
                    <p className="text-sm font-medium text-foreground">{selectedFile?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {((selectedFile?.size ?? 0) / 1024 / 1024).toFixed(2)} MB — click to change
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Upload className="w-7 h-7 text-primary" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-foreground">
                        Drop your image here or{' '}
                        <span className="text-primary underline underline-offset-2">click to browse</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WEBP · Max 10MB</p>
                    </div>
                  </>
                )}
              </div>

              {/* Error */}
              {error && (
                <div className="mt-4 flex items-center gap-2 bg-destructive/10 text-destructive rounded-xl px-4 py-3 text-sm">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* Submit */}
              <Button
                onClick={handleSubmit}
                disabled={!selectedFile}
                className="mt-6 w-full rounded-full h-14 text-sm shadow-sm"
              >
                Analyse Image
              </Button>
            </motion.div>
          )}

          {/* PROCESSING STATE */}
          {appState === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.4 }}
              className="bg-card border border-border rounded-2xl shadow-sm p-12 flex flex-col items-center gap-4"
              aria-live="polite"
            >
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <p className="text-lg font-medium text-foreground">Analysing your skin condition…</p>
              <p className="text-sm text-muted-foreground">This usually takes a few seconds</p>
            </motion.div>
          )}

          {/* RESULTS STATE */}
          {appState === 'results' && result && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <div className="bg-card border border-border rounded-2xl shadow-sm p-8">
                {/* Disclaimer + thumbnail row */}
                <div className="flex items-start justify-between gap-4 mb-6">
                  <span className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-500 text-xs font-medium px-3 py-1.5 rounded-full border border-amber-500/20">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Not a medical diagnosis — consult a dermatologist
                  </span>
                  {previewURL && (
                    <img
                      src={previewURL}
                      alt="Your upload"
                      className="w-16 h-16 rounded-lg object-cover shadow-sm flex-shrink-0"
                    />
                  )}
                </div>

                {/* Condition + confidence */}
                <motion.div custom={0} variants={BLOCK_VARIANTS} initial="hidden" animate="visible">
                  <div className="flex items-center gap-3 flex-wrap mb-2">
                    <h3
                      className="font-display text-2xl font-bold text-foreground"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      {result.top_prediction.disease}
                    </h3>
                    <span className="bg-primary/10 text-primary text-sm font-semibold px-3 py-1 rounded-full">
                      {result.top_prediction.confidence}% confident
                    </span>
                  </div>
                </motion.div>

                {/* Safety status */}
                <motion.div custom={1} variants={BLOCK_VARIANTS} initial="hidden" animate="visible" className="mb-4">
                  <SeverityPill severity={result.top_prediction.severity} />
                </motion.div>

                <div className="h-px bg-border my-4" />

                {/* Description */}
                <motion.div custom={2} variants={BLOCK_VARIANTS} initial="hidden" animate="visible" className="mb-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">{result.top_prediction.description}</p>
                </motion.div>

                {/* Symptoms */}
                {result.top_prediction.symptoms && result.top_prediction.symptoms.length > 0 && (
                  <>
                    <div className="h-px bg-border my-4" />
                    <motion.div custom={3} variants={BLOCK_VARIANTS} initial="hidden" animate="visible" className="mb-4">
                      <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                        Common Symptoms
                      </h4>
                      <ul className="flex flex-col gap-1.5">
                        {result.top_prediction.symptoms.map((s, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                            {s}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  </>
                )}

                {/* What we saw */}
                {result.top_prediction.what_we_saw && (
                  <>
                    <div className="h-px bg-border my-4" />
                    <motion.div custom={4} variants={BLOCK_VARIANTS} initial="hidden" animate="visible">
                      <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                        What We Saw
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{result.top_prediction.what_we_saw}</p>
                    </motion.div>
                  </>
                )}
              </div>

              {/* Try Again */}
              <div className="text-center mt-4">
                <Button
                  variant="ghost"
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors py-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try another image
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Dermatologist CTA — shown below results */}
      <AnimatePresence>
        {appState === 'results' && (
          <motion.div
            key="derm-cta"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-16 bg-muted/30 border border-border rounded-[2.5rem] py-16 px-6 max-w-4xl mx-auto text-center shadow-sm"
          >
            <div>
              <h2
                className="font-display text-4xl font-bold text-foreground mb-4"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Ready to talk to a <span className="italic text-primary">specialist?</span>
              </h2>
              <p className="text-muted-foreground text-base mb-8 max-w-md mx-auto leading-relaxed">
                Find dermatologists near you for a professional consultation and definitive diagnosis.
              </p>
              <Button
                onClick={handleFindDoctors}
                disabled={doctorsLoading}
                className="rounded-full shadow-sm text-sm h-14 px-8 inline-flex items-center gap-2"
              >
                {doctorsLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Finding doctors…</>
                ) : (
                  <><MapPin className="w-4 h-4" /> Find Dermatologists Near You</>
                )}
              </Button>

              {doctorsError && (
                <p className="text-destructive text-sm mt-4 flex items-center justify-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> {doctorsError}
                </p>
              )}

              {doctors && doctors.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 grid gap-4 max-w-lg mx-auto text-left"
                >
                  <p className="text-muted-foreground text-sm text-center mb-2">{doctors.length} doctors found near you</p>
                  {doctors.map((doc, i) => (
                    <DoctorCard key={i} doctor={doc} />
                  ))}
                </motion.div>
              )}

              {doctors && doctors.length === 0 && (
                <p className="text-muted-foreground text-sm mt-4 text-center">No doctors found in your area. Try expanding the search.</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
