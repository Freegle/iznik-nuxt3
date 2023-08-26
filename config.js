export default {
  // Legacy API, especially mod ops.
  APIv1: process.env.IZNIK_API_V1 || 'https://fdapilive.ilovefreegle.org/api',

  // New style API, for fast read ops.
  APIv2: process.env.IZNIK_API_V2 || 'https://api.ilovefreegle.org/apiv2',

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

  // Google keys from scenic-oxygen-849 project.
  GOOGLE_MAPS_KEY: 'AIzaSyCdTSJKGWJUOx2pq1Y0f5in5g4kKAO5dgg',
  GOOGLE_API_KEY: 'AIzaSyArVxoX781qdcbmQZi1PKHX-qa0bPbboH4',
  GOOGLE_CLIENT_ID:
    '423761283916-1rpa8120tpudgv4nf44cpmlf8slqbf4f.apps.googleusercontent.com',

  FACEBOOK_APPID: '134980666550322',

  YAHOO_CLIENTID:
    'dj0yJmk9N245WTRqaDd2dnA4JmQ9WVdrOWIzTlZNMU01TjJjbWNHbzlNQS0tJnM9Y29uc3VtZXJzZWNyZXQmc3Y9MCZ4PWRh',

  SENTRY_DSN:
    'https://63f870e6c729477ebca4098a0b07fd3a@o118493.ingest.sentry.io/4504083802226688',

  ISAPP: process.env.IZNIK_NUXT3_IS_APP === 'true',
  MOBILE_VERSION: '3.0.14',
}
