"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { motion, AnimatePresence } from "framer-motion"
import { flushSync } from "react-dom"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button className="relative flex items-center justify-center w-9 h-9 rounded-full bg-background border border-border/50 text-muted-foreground focus:outline-none">
        <span className="w-4 h-4" />
      </button>
    )
  }

  const isDark = theme === 'dark'

  const toggleTheme = async (e: React.MouseEvent) => {
    const nextTheme = isDark ? 'light' : 'dark'
    
    if (!document.startViewTransition) {
      setTheme(nextTheme)
      return
    }

    const x = e.clientX
    const y = e.clientY
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    )

    const transition = document.startViewTransition(() => {
      flushSync(() => {
        setTheme(nextTheme)
      })
      // Ensure physical DOM change happens immediately for the transition snapshot
      document.documentElement.classList.remove('light', 'dark')
      document.documentElement.classList.add(nextTheme)
    })

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`,
      ]
      
      document.documentElement.animate(
        {
          clipPath: isDark ? [...clipPath].reverse() : clipPath,
        },
        {
          duration: 500,
          easing: "ease-in-out",
          fill: "forwards",
          pseudoElement: isDark
            ? "::view-transition-old(root)"
            : "::view-transition-new(root)",
        },
      )
    })
  }

  return (
    <button
      onClick={toggleTheme}
      className="relative flex items-center justify-center w-9 h-9 rounded-full bg-background border border-border/50 text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors focus:outline-none overflow-hidden group"
      aria-label="Toggle theme"
    >
      <div className="absolute inset-0 rounded-full bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={isDark ? 'dark' : 'light'}
          initial={{ y: -20, opacity: 0, rotate: isDark ? -90 : 90 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: 20, opacity: 0, rotate: isDark ? 90 : -90 }}
          transition={{ duration: 0.25, type: 'spring', stiffness: 300, damping: 20 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          {isDark ? (
            <Moon className="w-4 h-4 fill-current drop-shadow-sm" />
          ) : (
            <Sun className="w-4 h-4 fill-current drop-shadow-sm" />
          )}
        </motion.div>
      </AnimatePresence>
    </button>
  )
}
