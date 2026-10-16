import axios from 'axios'
import { appPath } from '../basePath.js'

// THE http transport. Only files under src/api/ and src/features/*/api.js import it;
// components call TanStack Query hooks, never axios/fetch directly.
export const api = axios.create({ baseURL: appPath('/api'), withCredentials: true })
