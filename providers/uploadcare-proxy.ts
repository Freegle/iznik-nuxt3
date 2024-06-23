import { createOperationsGenerator } from '#image'
import { useRuntimeConfig } from '#app'
const operationsGenerator = createOperationsGenerator({
  joinWith: '',
  formatter: (key, value) =>
    `-/${key}/${Array.isArray(value) ? value.join('/') : value}/`,
})

export const getImage = (src, { modifiers = {}, baseURL = null } = {}) => {
  // Map the modifiers - copied from NuxtImage uploadcare provider.
  if (modifiers?.width || modifiers?.height) {
    modifiers.resize = `${modifiers?.width || ''}x${modifiers?.height || ''}`
    delete modifiers?.width
    delete modifiers?.height
  }

  if (modifiers?.fit) {
    switch (modifiers.fit) {
      case 'cover':
        modifiers.scale_crop = [modifiers.resize, 'center']
        delete modifiers.resize
        break
      case 'contain':
        modifiers.stretch = 'off'
        break
    }

    delete modifiers.fit
  }

  const operations = operationsGenerator(modifiers)

  const runtimeConfig = useRuntimeConfig()
  const userSite = runtimeConfig.public.USER_SITE
  const imageSite = runtimeConfig.public.IMAGE_SITE
  const proxy = runtimeConfig.public.UPLOADCARE_PROXY

  if (!src.startsWith('http')) {
    // Relative URL - point at our own site.
    return { url: proxy + '/' + operations + '/' + userSite + src }
  } else if (src.startsWith(userSite) || src.startsWith(imageSite)) {
    return { url: proxy + '/' + operations + '/' + src }
  } else {
    return { url: src }
  }
}
