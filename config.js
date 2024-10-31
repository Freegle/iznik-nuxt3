export default {
  // Legacy API, especially mod ops.
  APIv1: process.env.IZNIK_API_V1 || 'https://fdapilive.ilovefreegle.org/api',

  // New style API, for fast read ops.
  APIv2: process.env.IZNIK_API_V2 || 'https://api.ilovefreegle.org/apiv2',

  // This is where the user site is.
  USER_SITE: 'https://www.ilovefreegle.org',

  // This is where images are served from.
  IMAGE_SITE: 'https://images.ilovefreegle.org',

  // Very new.  Our own uploader, and delivery of those images via a cached use of wsrl.nl.
  TUS_UPLOADER: 'https://uploads.ilovefreegle.org:8080',
  IMAGE_DELIVERY: 'https://delivery.ilovefreegle.org',

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
    'https://1ab4fc0b56b355f5e794857f8e25d316@o118493.ingest.sentry.io/4506712427855872', // modtools

  // Cookie banner for this site.
  COOKIEYES: process.env.COOKIEYES || null,

  TRUSTPILOT_LINK: process.env.TRUSTPILOT_LINK || null,

  GOOGLE_ADSENSE_ID: process.env.GOOGLE_ADSENSE_ID,
  GOOGLE_ADSENSE_TEST_MODE: process.env.GOOGLE_ADSENSE_TEST_MODE,
}
