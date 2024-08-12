import { useRuntimeConfig } from '#app'

// This allows us to get images from our codebase or servers, but use Uploadcare's caching/resizing options.

export function imageProxy(img, modifiers = {}) {
  const runtimeConfig = useRuntimeConfig()
  const userSite = runtimeConfig.public.USER_SITE
  const imageSite = runtimeConfig.public.IMAGE_SITE
  const proxy = runtimeConfig.public.UPLOADCARE_PROXY

  if (!img.startsWith('http')) {
    // Relative URL - point at our own site.
    img = userSite + img
    console.log('now', img, userSite)
  }

  let url = ''

  if (img.startsWith(userSite) || img.startsWith(imageSite)) {
    // Can proxy these.
    url = proxy + '/'

    // Scan each modifier and add to the URL.
    for (const key in modifiers) {
      if (modifiers[key]) {
        url += `-/${key}/${modifiers[key]}`
      }
    }

    url += '/' + img
  }

  console.log('Proxy', url)
  return url
}
