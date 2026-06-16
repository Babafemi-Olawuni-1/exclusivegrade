import { API_URL } from '../config'

export function resolveUrl(url) {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  const base = API_URL.replace(/\/api\/?$/, '')
  return base + (url.startsWith('/') ? url : '/' + url)
}

export default resolveUrl
