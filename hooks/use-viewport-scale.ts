"use client"

import { useState, useEffect } from "react"

export function useViewportScale() {
  const [scale, setScale] = useState(1)
  const [viewportWidth, setViewportWidth] = useState(0)

  useEffect(() => {
    // Initial setup
    const updateViewport = () => {
      const vw = window.innerWidth
      setViewportWidth(vw)

      // Set CSS variables for viewport dimensions
      document.documentElement.style.setProperty("--viewport-width", `${vw}px`)
      document.documentElement.style.setProperty("--viewport-height", `${window.innerHeight}px`)

      // Calculate and set scale factor for very small screens
      if (vw < 360) {
        const scaleFactor = vw / 360
        setScale(scaleFactor)
        document.documentElement.style.setProperty("--content-scale", scaleFactor.toString())
      } else {
        setScale(1)
        document.documentElement.style.setProperty("--content-scale", "1")
      }
    }

    // Run on mount
    updateViewport()

    // Add event listener for resize
    window.addEventListener("resize", updateViewport)

    // Cleanup
    return () => window.removeEventListener("resize", updateViewport)
  }, [])

  return { scale, viewportWidth }
}
