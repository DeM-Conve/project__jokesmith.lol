import { vi } from 'vitest'
import { api } from '../api/client.js'

// Tiny axios stub for tests: http.get('/path', data) / http.post('/path', data | fn).
// Unmatched requests reject, so a test notices a call it didn't expect.
const routes = new Map()
const key = (method, url) => `${method} ${url.split('?')[0]}`

function respond(method) {
  return vi.fn(async (url, body) => {
    const handler = routes.get(key(method, url))
    if (handler === undefined) throw new Error(`unstubbed ${method.toUpperCase()} ${url}`)
    return { data: typeof handler === 'function' ? handler(body, url) : handler }
  })
}

api.get = respond('get')
api.post = respond('post')
api.put = respond('put')
api.delete = respond('delete')

export const http = {
  get: (url, h) => routes.set(key('get', url), h),
  post: (url, h) => routes.set(key('post', url), h),
  put: (url, h) => routes.set(key('put', url), h),
  delete: (url, h) => routes.set(key('delete', url), h),
  reset: () => routes.clear(),
}
