import { useMiscStore } from '~/stores/misc'

export function buildHead(
  route,
  runtimeConfig,
  title,
  description,
  image = null,
  bodyAttrs = {}
) {
  // Pain to have to pass in runtimeConfig but you can't use that in a composable.

  // These meta params may or may not supersede or add to the ones in nuxt.config.ts and modtools/nuxt.config.ts
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
  ]

  const retImage =
    image || runtimeConfig.public.MODTOOLS_SITE + '/icon_modtools.png'

  meta.push({
    hid: 'og:image',
    property: 'og:image',
    content: retImage,
  })

  meta.push({
    hid: 'og:url',
    property: 'og:url',
    content: runtimeConfig.public.MODTOOLS_SITE,
  })

  meta.push({
    hid: 'twitter:image',
    property: 'twitter:image',
    content: retImage,
  })

  meta.push({ name: 'msapplication-TileColor', content: '#ffffff' })
  meta.push({
    name: 'msapplication-TileImage',
    content: '/icons/mstile-144x144.png',
  })
  meta.push({
    name: 'msapplication-config',
    content: '/icons/browserconfig.xml',
  })
  meta.push({ name: 'theme-color', content: '#ffffff' })

  // Store the page title in the store so that we can access it later if we need to.
  useMiscStore().pageTitle = title

  return {
    title,
    meta,
    link: [
      {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: '/apple-touch-icon.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        href: '/favicon-32x32.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        href: '/favicon-16x16.png',
      },
      { href: '/icons/safari-pinned-tab.svg', color: '#5bbad5' },
      { rel: 'shortcut icon', href: '/favicon.ico' },
    ],
    bodyAttrs,
  }
}
