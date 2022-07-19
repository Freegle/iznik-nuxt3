import { useRoute } from 'vue-router'

export function buildHead(title, description, image = null, bodyAttrs = {}) {
  const runtimeConfig = useRuntimeConfig()

  const meta = [
    {
      hid: 'description',
      name: 'description',
      content: description,
    },
    { hid: 'og:title', property: 'og:title', content: title },
    {
      hid: 'og:description',
      property: 'og:description',
      content: description,
    },

    {
      hid: 'twitter:title',
      name: 'twitter:title',
      content: title,
    },
    {
      hid: 'twitter:description',
      name: 'twitter:description',
      content: description,
    },
  ]

  const retImage = image || runtimeConfig.public.USER_SITE + '/icon.png'
  console.log('retImage', retImage, image, runtimeConfig.public.USER_SITE)

  meta.push({
    hid: 'og:image',
    property: 'og:image',
    content: retImage,
  })

  const route = useRoute()

  meta.push({
    hid: 'og:url',
    property: 'og:url',
    content: runtimeConfig.public.USER_SITE + route.fullPath,
  })

  meta.push({
    hid: 'twitter:image',
    property: 'twitter:image',
    content: retImage,
  })

  return {
    title,
    meta,
  }
}
