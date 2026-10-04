import axios from 'axios'
import { LOCAL_AUTH_TOKEN } from '@/lib/local-auth'
import { useAuthStore } from '@/store/auth.store'

function isLocalSession(): boolean {
  const { localSession, token } = useAuthStore.getState()
  return localSession === true || token === LOCAL_AUTH_TOKEN
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const { token } = useAuthStore.getState()
  if (token && !isLocalSession()) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !isLocalSession()) {
      useAuthStore.getState().logout()
    }
    return Promise.reject(error)
  },
)

export default api
