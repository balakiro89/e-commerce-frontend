const DEFAULT_API_URL = 'https://e-commerce-backend.balakiro89.workers.dev'

/** Backend Workers API base URL (no trailing slash). */
export const API_BASE_URL = (
  import.meta.env.VITE_API_URL?.trim() || DEFAULT_API_URL
).replace(/\/$/, '')
