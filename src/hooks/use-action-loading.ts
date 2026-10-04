import { useCallback, useState } from 'react'

export function useActionLoading() {
  const [loading, setLoading] = useState(false)

  const run = useCallback(async (action: () => void | Promise<void>) => {
    setLoading(true)
    try {
      await action()
    } finally {
      setLoading(false)
    }
  }, [])

  return { loading, run }
}
