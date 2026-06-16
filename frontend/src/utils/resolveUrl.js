// Resolve URL helper 
export function resolveUrl(url) { 
  if (!url) return ''; 
  if (url.startsWith('http')) return url; 
  return API_BASE_URL.replace('/api', '') + url; 
} 
