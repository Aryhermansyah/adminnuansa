"use client"

import { useState, useEffect } from "react"

export function useResponsiveScale(baseWidth = 375, minScale = 0.85, maxScale = 1): number {
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const updateScale = () => {
      const windowWidth = window.innerWidth
      if (windowWidth < baseWidth) {
        // Calculate scale based on screen width
        const newScale = Math.max(minScale, Math.min(maxScale, windowWidth / baseWidth))
        setScale(newScale)
        // Apply scale to root element for global access
        document.documentElement.style.setProperty("--scale-factor", newScale.toString())
      } else {
        setScale(1)
        document.documentElement.style.setProperty("--scale-factor", "1")
      }
    }

    // Initial calculation
    updateScale()

    // Update on resize
    window.addEventListener("resize", updateScale)
    return () => window.removeEventListener("resize", updateScale)
  }, [baseWidth, minScale, maxScale])

  return scale
}
