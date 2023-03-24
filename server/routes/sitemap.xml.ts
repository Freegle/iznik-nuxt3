import { Readable } from 'stream'
import { SitemapStream, streamToPromise } from 'sitemap'

// We want to return a sitemap which has the normal page routes, but also our dynamic routes.
// So far as I can tell Nuxt3 isn't evolved enough for use with a sitemap, so we have to do this
// manually.

// eslint-disable-next-line no-undef
export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig()

  // eslint-disable-next-line no-undef
  appendResponseHeader(event, 'Content-Type', 'text/xml')

  // An array with your links
  const links = [
    { url: '/', changefreq: 'monthly', priority: 1.0 },
    { url: '/give', changefreq: 'monthly', priority: 1.0 },
    { url: '/find', changefreq: 'monthly', priority: 1.0 },
    { url: '/explore', changefreq: 'weekly', priority: 0.8 },
    { url: '/unsubscribe', changefreq: 'monthly', priority: 0.7 },
    { url: '/donate', changefreq: 'monthly', priority: 0.7 },
    { url: '/help', changefreq: 'monthly', priority: 0.5 },
    { url: '/stories', changefreq: 'weekly', priority: 0.5 },
    { url: '/communityevents', changefreq: 'monthly', priority: 0.1 },
    { url: '/volunteerings', changefreq: 'monthly', priority: 0.1 },
    { url: '/about', changefreq: 'monthly', priority: 0.3 },
    { url: '/disclaimer', changefreq: 'monthly', priority: 0.1 },
    { url: '/terms', changefreq: 'monthly', priority: 0.1 },
    { url: '/privacy', changefreq: 'monthly', priority: 0.1 },
    { url: '/forgot', changefreq: 'monthly', priority: 0.1 },
    { url: '/giftaid', changefreq: 'monthly', priority: 0.1 },

    // TODO Councils - separate site?
    // TODO Pages: mobile, shortlinks, stats, merge, mydata, norfolk
  ]

  // Fetch all the groups.
  try {
    const rsp = await fetch(runtimeConfig.public.APIv2 + '/group')
    const groups = await rsp.json()

    // iterate through groups adding to links
    groups.forEach((group) => {
      links.push({
        url: '/explore/' + group.nameshort,
        changefreq: 'daily',
        priority: 0.8,
      })
    })
  } catch (e) {}

  const stream = new SitemapStream({ hostname: runtimeConfig.public.USER_SITE })

  return streamToPromise(Readable.from(links).pipe(stream)).then((data) =>
    data.toString()
  )
})
