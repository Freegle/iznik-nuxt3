export default {
  // We have two constants for the API location.  Why?
  // - IZNIK_API is the actual location of the server hosting the API.  It's not used directly by the code.
  // - API is the constant the code uses to make an API call - it's basically just a prefix.
  //
  // How do these get used?
  // - The client code just uses the API prefixes APIv1 and APIv2.
  // - In dev mode, the vite config proxies those to IZNIK_API_V1 and IZNIK_API_V2.
  // - In live mode, the nginx config does the same.
  //
  // This avoids CORS issues (and removes preflight OPTIONS calls for GETs, which hurt client performance).
  APIv1: '/apiv1',
  IZNIK_API_V1:
    process.env.IZNIK_API_V1 || 'https://fdapilive.ilovefreegle.org',

  APIv2: '/apiv2',
  IZNIK_API_V2: process.env.IZNIK_API_V2 || 'http://www.ilovefreegle.org:8192',

  // This is where the user site is.
  USER_SITE: 'https://www.ilovefreegle.org',

  // This is where images are served from.
  IMAGE_SITE: 'https://images.ilovefreegle.org',

  // OpenStreetMap Tile Server
  OSM_TILE:
    process.env.OSM_TILE ||
    'https://tiles.ilovefreegle.org/tile/{z}/{x}/{y}.png',

  // Geocode server
  GEOCODE: process.env.GEOCODE || 'https://geocode.ilovefreegle.org/api',

  // Google keys.
  GOOGLE_MAPS_KEY: 'AIzaSyCdTSJKGWJUOx2pq1Y0f5in5g4kKAO5dgg',
  GOOGLE_API_KEY: 'AIzaSyArVxoX781qdcbmQZi1PKHX-qa0bPbboH4',
  GOOGLE_CLIENT_ID:
    '423761283916-1rpa8120tpudgv4nf44cpmlf8slqbf4f.apps.googleusercontent.com',

  FACEBOOK_APPID: '134980666550322',

  YAHOO_CLIENTID:
    'dj0yJmk9N245WTRqaDd2dnA4JmQ9WVdrOWIzTlZNMU01TjJjbWNHbzlNQS0tJnM9Y29uc3VtZXJzZWNyZXQmc3Y9MCZ4PWRh',

  SENTRY_DSN: 'https://4de62393d60a4d2aae4ccc3519e94878@sentry.io/1868170',
}
