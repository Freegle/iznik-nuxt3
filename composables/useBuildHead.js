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

  let retImage = image || runtimeConfig.public.USER_SITE + '/icon.png'

  if (
    typeof retImage === 'string' &&
    retImage?.includes(runtimeConfig.public.IMAGE_DELIVERY) + '/?url='
  ) {
    // We've seen problems with Facebook preview failing to fetch images from weserv, so strip this back to the
    // original image URL.
    const p = retImage.indexOf('=')
    retImage = retImage.slice(p + 1)

    // Need to remove URL parameters as those are for the transforms.  This might lead to preview being
    // rotated incorrectly, but there we go.
    let q = retImage.indexOf('?')
    if (q > -1) {
      retImage = retImage.slice(0, q)
    }

    q = retImage.indexOf('&')
    if (q > -1) {
      retImage = retImage.slice(0, q)
    }

    retImage = decodeURIComponent(retImage)
  }

  meta.push({
    hid: 'og:image',
    property: 'og:image',
    content: retImage,
  })

  meta.push({
    hid: 'og:url',
    property: 'og:url',
    content: runtimeConfig.public.USER_SITE + (route ? route.fullPath : ''),
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
        href: '/icons/apple-touch-icon.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        href: '/icons/favicon-32x32.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        href: '/icons/favicon-16x16.png',
      },
      { href: '/icons/safari-pinned-tab.svg', color: '#5bbad5' },
      { rel: 'shortcut icon', href: '/icons/favicon.ico' },
    ],
    bodyAttrs,
  }
}
