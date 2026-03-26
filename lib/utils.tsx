import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

const customTwMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      fontFamily: ["font-display", "font-body", "font-sans"],
      colors: ["bg-background", "text-foreground", "bg-primary", "text-primary-foreground"],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return customTwMerge(clsx(inputs))
}
