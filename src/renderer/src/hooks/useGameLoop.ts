import { useEffect, useRef } from 'react'
import { useGameStore } from '../store/useGameStore'

export function useGameLoop(): void {
  const isPaused = useGameStore((s) => s.time.isPaused)
  const speed = useGameStore((s) => s.time.speed)
  const tickRef = useRef<() => void>(() => {})

  // Keep tick reference updated without re-triggering the effect timer
  useEffect(() => {
    tickRef.current = useGameStore.getState().tick
  })

  useEffect(() => {
    if (isPaused || speed <= 0) return

    // 1x = 1000ms (1 second), 2x = 500ms, 5x = 200ms
    const intervalMs = Math.round(1000 / speed)

    const timer = setInterval(() => {
      // Direct call to avoid subscribing this component to high frequency ticks
      tickRef.current()
    }, intervalMs)

    return () => clearInterval(timer)
  }, [isPaused, speed])
}
