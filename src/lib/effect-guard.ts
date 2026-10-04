/** Tracks whether an async effect is still current (avoids stale state updates). */
export function createEffectGuard() {
  let active = true
  return {
    isActive: () => active,
    cancel: () => {
      active = false
    },
  }
}
