import axios from 'axios'

// THE http transport. Only files under src/api/ and src/features/*/api.js import it;
// components call TanStack Query hooks, never axios/fetch directly.
export const api = axios.create({ baseURL: '/api', withCredentials: true })
