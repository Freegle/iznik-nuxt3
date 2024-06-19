import { useRuntimeConfig } from '#app'

// This allows us to get images from our codebase or servers, but use Uploadcare's caching/resizing options.

export function imageProxy(img, modifiers = '') {
  const runtimeConfig = useRuntimeConfig()
  const userSite = runtimeConfig.public.USER_SITE
  const imageSite = runtimeConfig.public.IMAGE_SITE
  const proxy = runtimeConfig.public.UPLOADCARE_PROXY

  if (img.startsWith(userSite) || img.startsWith(imageSite)) {
    return proxy + modifiers + img
  } else {
    return img
  }
}
