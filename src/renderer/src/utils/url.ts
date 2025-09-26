/**
 * Sanitizes a URL by ensuring it has a protocol
 */
export function sanitizeUrl(url: string): string {
  if (!url) return ''
  
  // If it already has a protocol, return as is
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('mailto:') || url.startsWith('tel:')) {
    return url
  }
  
  // Add https:// if no protocol
  return `https://${url}`
}
