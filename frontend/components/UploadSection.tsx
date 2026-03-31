'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload,
  Loader2,
  AlertTriangle,
  AlertCircle,
  RefreshCw,
  MapPin,
  Star,
  ExternalLink,
  Eye,
  CheckCircle,
  Clock,
  Navigation,
} from 'lucide-react'
import { Button } from './ui/button'
import { Card } from './ui/card'

import { AppState, PredictResponse, Doctor, AppError } from '@/lib/types'
import { analyzeImage } from '@/lib/analyzeImage'
import { getNearbyDoctors } from '@/lib/getDoctors'
import { useImageUpload } from '@/hooks/useImageUpload'
import { useGeolocation } from '@/hooks/useGeolocation'
import { PhotoTips } from '@/components/PhotoTips'

// ─── Animation helpers ────────────────────────────────────────────────────────

const STAGGER_DELAY = 0.08
const BLOCK_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * STAGGER_DELAY, ease: [0.16, 1, 0.3, 1] as const },
  }),
}

// ─── Dermatologist CTA (Change 8) ────────────────────────────────────────────

type DoctorState = 'idle' | 'locating' | 'loading' | 'done' | 'error'

function DermatologistCTA() {
  const [doctorState, setDoctorState] = useState<DoctorState>('idle')
  const [doctors, setDoctors]         = useState<Doctor[]>([])
  const [radius, setRadius]           = useState(5000)
  const { status, error: geoError, requestLocation } = useGeolocation()

  const handleFindDoctors = async (searchRadius = radius) => {
    setDoctorState('locating')
    try {
      const loc = await requestLocation()
      setDoctorState('loading')
      const results = await getNearbyDoctors(loc.lat, loc.lng, searchRadius)
      setDoctors(results)
      setDoctorState('done')
    } catch {
      setDoctorState('error')
    }
  }

  const handleRadiusChange = (newRadius: number) => {
    setRadius(newRadius)
    if (doctorState === 'done') handleFindDoctors(newRadius)
  }

  return (
    <section className="bg-brand-teal-dark py-16 px-6">
      <div className="max-w-lg mx-auto text-center">

        {/* Heading */}
        <h2 className="font-display text-3xl text-white font-bold mb-2">
          Ready to talk to a specialist?
        </h2>
        <p className="text-white/70 text-base mb-8">
          Find dermatologists near you for a professional consultation.
        </p>

        {/* ── Idle ─────────────────────────────────────────── */}
        {doctorState === 'idle' && (
          <Button
            size="lg"
            className="bg-white text-brand-teal hover:bg-white/90
                       font-semibold px-8 rounded-xl"
            onClick={() => handleFindDoctors()}
          >
            <MapPin className="w-4 h-4 mr-2" />
            Find Dermatologists Near You
          </Button>
        )}

        {/* ── Locating ─────────────────────────────────────── */}
        {doctorState === 'locating' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-white"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Navigation className="w-5 h-5 animate-pulse" />
              <span className="font-medium">Requesting your location...</span>
            </div>
            <p className="text-white/60 text-sm">
              Please allow location access when your browser asks
            </p>
          </motion.div>
        )}

        {/* ── Loading ───────────────────────────────────────── */}
        {doctorState === 'loading' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-white"
          >
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
            <p className="font-medium">Finding dermatologists near you...</p>
          </motion.div>
        )}

        {/* ── Error ────────────────────────────────────────── */}
        {doctorState === 'error' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="bg-white/10 border border-white/20
                            rounded-xl p-4 mb-4 text-left">
              <AlertCircle className="w-5 h-5 text-white mx-auto mb-2" />
              <p className="text-white font-medium text-sm mb-1 text-center">
                {geoError || 'Could not find your location.'}
              </p>
              {status === 'denied' && (
                <p className="text-white/60 text-xs text-center mt-2">
                  To enable: click the 🔒 lock icon in your browser address bar
                  → Site settings → Location → Allow
                </p>
              )}
            </div>
            <Button
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
              onClick={() => handleFindDoctors()}
            >
              Try Again
            </Button>
          </motion.div>
        )}

        {/* ── Done — doctor list ───────────────────────────── */}
        <AnimatePresence>
          {doctorState === 'done' && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 text-left"
            >
              {/* Radius filter */}
              <div className="flex items-center gap-2 mb-4 justify-center flex-wrap">
                <span className="text-white/70 text-sm">Radius:</span>
                {[2000, 5000, 10000, 20000].map((r) => (
                  <button
                    key={r}
                    onClick={() => handleRadiusChange(r)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium
                                transition-all ${
                      radius === r
                        ? 'bg-white text-brand-teal'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    {r >= 1000 ? `${r / 1000}km` : `${r}m`}
                  </button>
                ))}
              </div>

              {/* No results */}
              {doctors.length === 0 && (
                <div className="text-center text-white/70 py-8">
                  <p>No dermatologists found in this area.</p>
                  <p className="text-sm mt-1">Try increasing the radius.</p>
                </div>
              )}

              {/* Doctor cards */}
              <div className="space-y-3">
                {doctors.map((doc, i) => (
                  <motion.div
                    key={doc.maps_url}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="bg-white/10 backdrop-blur-sm border border-white/15
                               rounded-xl p-4 hover:bg-white/15 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-sm truncate">
                          {doc.name}
                        </p>
                        <p className="text-white/60 text-xs mt-0.5 truncate">
                          {doc.address}
                        </p>
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                          {doc.rating && (
                            <span className="flex items-center gap-1 text-xs text-white/70">
                              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                              {doc.rating}
                              {doc.total_ratings && (
                                <span className="text-white/40">({doc.total_ratings})</span>
                              )}
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-xs text-white/70">
                            <Navigation className="w-3 h-3" />
                            {doc.distance_km} km away
                          </span>
                          {doc.open_now !== null && (
                            <span className={`text-xs font-semibold ${
                              doc.open_now ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {doc.open_now ? 'Open now' : 'Closed'}
                            </span>
                          )}
                        </div>
                      </div>

                      <a
                        href={doc.maps_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-shrink-0 flex items-center gap-1.5
                                   bg-white text-brand-teal text-xs font-semibold
                                   px-3 py-2 rounded-lg hover:bg-white/90
                                   transition-colors whitespace-nowrap"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Directions
                      </a>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Search again */}
              <div className="text-center mt-5">
                <button
                  onClick={() => handleFindDoctors()}
                  className="text-white/60 text-sm hover:text-white
                             transition-colors underline"
                >
                  Search again
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}

// ─── Main UploadSection ───────────────────────────────────────────────────────

export default function UploadSection() {
  const [appState, setAppState]   = useState<AppState>('idle')
  const [result, setResult]       = useState<PredictResponse | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const {
    selectedFile,
    previewURL,
    error,
    setError,
    fileInputRef,
    handleFileSelect,
    reset: resetUpload,
  } = useImageUpload()

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFileSelect(file)
    },
    [handleFileSelect]
  )

  // Change 6c — handleAnalyze using AppError
  const handleAnalyze = async () => {
    if (!selectedFile) return
    setAppState('processing')
    setError(null)
    try {
      const data = await analyzeImage(selectedFile)
      setResult(data)
      setAppState('results')
    } catch (err) {
      if (err instanceof AppError) {
        setError(err)
      } else {
        setError(new AppError('unknown', 'Something went wrong.', 'Please try again.'))
      }
      setAppState('error')
    }
  }

  const handleReset = () => {
    setAppState('idle')
    setResult(null)
    resetUpload()
  }

  return (
    <>
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

            {/* ── IDLE / ERROR STATE ─────────────────────────────── */}
            {(appState === 'idle' || appState === 'error') && (
              <motion.div
                key="idle"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                {/* Change 6a — PhotoTips above the Card */}
                <PhotoTips />

                <Card className="border border-border rounded-2xl shadow-sm p-8">
                  {/* Drop zone */}
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative rounded-xl p-10 flex flex-col items-center
                               justify-center gap-4 cursor-pointer border-2 border-dashed
                               transition-all duration-300
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
                        const f = e.target.files?.[0]
                        if (f) handleFileSelect(f)
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

                  {/* Change 6b — error Alert with userMessage + suggestion */}
                  {error && (
                    <div className="mt-4 bg-destructive/10 text-destructive rounded-xl px-4 py-3">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">{error.userMessage}</p>
                          {error.suggestion && (
                            <p className="text-sm mt-1 opacity-80">{error.suggestion}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleAnalyze}
                    disabled={!selectedFile}
                    className="mt-6 w-full rounded-full h-14 text-sm shadow-sm"
                  >
                    Analyse Image
                  </Button>
                </Card>
              </motion.div>
            )}

            {/* ── PROCESSING STATE ───────────────────────────────── */}
            {appState === 'processing' && (
              <motion.div
                key="processing"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.4 }}
                className="bg-card border border-border rounded-2xl shadow-sm
                           p-12 flex flex-col items-center gap-4"
                aria-live="polite"
              >
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="text-lg font-medium text-foreground">Analysing your skin condition…</p>
                <p className="text-sm text-muted-foreground">This usually takes a few seconds</p>
              </motion.div>
            )}

            {/* ── RESULTS STATE ──────────────────────────────────── */}
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
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <span className="inline-flex items-center gap-1.5 bg-amber-500/10
                                     text-amber-600 dark:text-amber-500 text-xs font-medium
                                     px-3 py-1.5 rounded-full border border-amber-500/20">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Not a medical diagnosis — consult a dermatologist
                    </span>
                    {previewURL && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={previewURL}
                        alt="Your upload"
                        className="w-16 h-16 rounded-lg object-cover shadow-sm flex-shrink-0"
                      />
                    )}
                  </div>

                  {/* Change 7b — Low confidence warning banner */}
                  {result.low_confidence_warning && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-amber-50 border border-amber-200 rounded-xl
                                 p-3 mb-4 flex items-start gap-2"
                    >
                      <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      <p className="text-amber-800 text-sm leading-relaxed">
                        {result.low_confidence_warning}
                      </p>
                    </motion.div>
                  )}

                  {/* Change 7a — Disease name (disease_label) + confidence */}
                  <motion.div custom={0} variants={BLOCK_VARIANTS} initial="hidden" animate="visible">
                    <div className="flex items-center gap-3 flex-wrap mb-2">
                      <h3
                        className="font-display text-2xl font-bold text-foreground"
                        style={{ fontFamily: 'var(--font-display)' }}
                      >
                        {result.top_prediction.disease_label}
                      </h3>
                      <span className="bg-primary/10 text-primary text-sm font-semibold px-3 py-1 rounded-full">
                        {result.top_prediction.confidence}% confident
                      </span>
                    </div>
                  </motion.div>

                  {/* Change 7c — Severity pill using API colour */}
                  <motion.div custom={1} variants={BLOCK_VARIANTS} initial="hidden" animate="visible" className="mb-4">
                    <span
                      className="inline-flex items-center gap-1.5 px-3 py-1
                                 rounded-full text-xs font-semibold"
                      style={{
                        backgroundColor: `${result.top_prediction.severity_color}18`,
                        color:            result.top_prediction.severity_color,
                        border:          `1px solid ${result.top_prediction.severity_color}40`,
                      }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: result.top_prediction.severity_color }}
                      />
                      {result.top_prediction.severity_label}
                    </span>
                  </motion.div>

                  <div className="h-px bg-border my-4" />

                  {/* Description */}
                  <motion.div custom={2} variants={BLOCK_VARIANTS} initial="hidden" animate="visible" className="mb-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {result.top_prediction.description}
                    </p>
                  </motion.div>

                  {/* Change 7d — Visual Analysis block */}
                  {result.top_prediction.visual_analysis && (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <div className="h-px bg-border my-4" />

                      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
                        What the AI Observed
                      </p>

                      {/* Observed */}
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-3">
                        <p className="text-xs uppercase tracking-widest text-slate-400
                                      mb-2 flex items-center gap-1.5">
                          <Eye className="w-3 h-3" />
                          Observed in your photo
                        </p>
                        <p className="text-sm text-slate-700 leading-relaxed">
                          {result.top_prediction.visual_analysis.observed}
                        </p>
                      </div>

                      {/* Comparison */}
                      <div className="bg-brand-teal-light border border-brand-teal/20 rounded-xl p-4">
                        <p className="text-xs uppercase tracking-widest text-brand-teal/60
                                      mb-2 flex items-center gap-1.5">
                          <CheckCircle className="w-3 h-3 text-brand-teal" />
                          Compared to known symptoms
                        </p>
                        <p className="text-sm text-teal-800 leading-relaxed">
                          {result.top_prediction.visual_analysis.comparison}
                        </p>
                      </div>
                    </motion.div>
                  )}

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

                  {/* Causes */}
                  {result.top_prediction.causes && result.top_prediction.causes.length > 0 && (
                    <>
                      <div className="h-px bg-border my-4" />
                      <motion.div custom={4} variants={BLOCK_VARIANTS} initial="hidden" animate="visible" className="mb-4">
                        <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                          Common Causes
                        </h4>
                        <ul className="flex flex-col gap-1.5">
                          {result.top_prediction.causes.map((c, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                              {c}
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    </>
                  )}

                  {/* Change 7e — Urgency callout */}
                  <div className="h-px bg-border my-4" />
                  <div
                    className="flex items-start gap-3 p-4 rounded-xl"
                    style={{
                      backgroundColor: `${result.top_prediction.severity_color}10`,
                      borderLeft:      `3px solid ${result.top_prediction.severity_color}`,
                    }}
                  >
                    <Clock
                      className="w-4 h-4 mt-0.5 flex-shrink-0"
                      style={{ color: result.top_prediction.severity_color }}
                    />
                    <div>
                      <p
                        className="text-xs uppercase tracking-widest mb-1 font-semibold"
                        style={{ color: result.top_prediction.severity_color }}
                      >
                        Recommended Action
                      </p>
                      <p className="text-sm font-medium text-slate-800">
                        {result.top_prediction.urgency}
                      </p>
                    </div>
                  </div>

                  {/* Change 7f — Secondary predictions with disease_label + severity dots */}
                  {result.all_predictions && result.all_predictions.length > 1 && (
                    <div className="space-y-2 mt-4">
                      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
                        Other Possibilities
                      </p>
                      {result.all_predictions.slice(1).map((pred, i) => (
                        <motion.div
                          key={pred.disease}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.06 }}
                          className="flex items-center justify-between py-2
                                     border-b border-slate-100 last:border-0"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{
                                backgroundColor:
                                  pred.severity === 'high'   ? '#EF4444' :
                                  pred.severity === 'medium' ? '#F59E0B' : '#22C55E',
                              }}
                            />
                            <span className="text-sm text-slate-700">
                              {pred.disease_label}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-slate-500 tabular-nums">
                            {pred.confidence}%
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Try Again */}
                <div className="text-center mt-4">
                  <Button
                    variant="ghost"
                    onClick={handleReset}
                    className="inline-flex items-center gap-2 text-sm
                               text-muted-foreground hover:text-primary transition-colors py-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Try another image
                  </Button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </section>

      {/* Change 8 — DermatologistCTA shown below results */}
      <AnimatePresence>
        {appState === 'results' && (
          <motion.div
            key="derm-cta"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <DermatologistCTA />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
