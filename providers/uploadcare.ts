import { joinURL, hasProtocol, withTrailingSlash } from 'ufo'
import { createOperationsGenerator } from '#image'
import { useRuntimeConfig } from '#app'

const operationsGenerator = createOperationsGenerator({
  joinWith: '',
  formatter: (key, value) =>
    `-/${key}/${Array.isArray(value) ? value.join('/') : value}/`,
})

export const getImage = (uuid, { modifiers, cdnURL = '' } = {}) => {
  const runtimeConfig = useRuntimeConfig()
  cdnURL = runtimeConfig.public.UPLOADCARE_CDN

  // NuxtImage does responsive images, which sounds lovely and can be used to
  // reduce the size of a fetched image and therefore improve performance.
  //
  // But this results in us fetching all sorts of different sizes of images
  // from Uploadcare, and each resize has a cost that we can't always afford.
  //
  // This provider allows us to always return the original image size, which
  // avoids those costs.
  //
  // This relies on the parent having appropriate CSS to ensure that the image displays
  // correctly, e.g. object-fit: cover.
  //
  // We still get value from Nuxt Image because of the image format conversion and
  // fallback from webp to jpeg.  That may still involve a performance cost.
  //
  // At some point this may change - for example if we have our own image scaler
  // using nginx modules.
  delete modifiers.width
  delete modifiers.height
  delete modifiers.resize

  const operations = operationsGenerator(modifiers)
  const base = hasProtocol(uuid) ? '' : cdnURL || 'https://ucarecdn.com'
  const url = withTrailingSlash(joinURL(base, uuid, operations))

  return { url }
}
