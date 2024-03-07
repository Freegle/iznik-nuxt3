const ADS_SMALL_BANNER_SIZES = [[320, 50]]
const ADS_MEDIUM_BANNER_SIZES = [[728, 90]]
const ADS_SQUARISH_SIZES = [[300, 250]]

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

  // Google keys from scenic-oxygen-849 project accessed from Freegle Geeks.
  GOOGLE_MAPS_KEY: 'AIzaSyCdTSJKGWJUOx2pq1Y0f5in5g4kKAO5dgg',
  GOOGLE_API_KEY: 'AIzaSyArVxoX781qdcbmQZi1PKHX-qa0bPbboH4',
  GOOGLE_CLIENT_ID:
    '423761283916-1rpa8120tpudgv4nf44cpmlf8slqbf4f.apps.googleusercontent.com',

  FACEBOOK_APPID: '134980666550322',

  YAHOO_CLIENTID:
    'dj0yJmk9N245WTRqaDd2dnA4JmQ9WVdrOWIzTlZNMU01TjJjbWNHbzlNQS0tJnM9Y29uc3VtZXJzZWNyZXQmc3Y9MCZ4PWRh',

  SENTRY_DSN:
    'https://63f870e6c729477ebca4098a0b07fd3a@o118493.ingest.sentry.io/4504083802226688',

  // Cookie banner for this site.
  COOKIEYES: process.env.COOKIEYES || null,

  AD_GPT_CONFIG: {
    slots: [
      {
        id: 'div-gpt-ad-1699973618906-0',
        path: '/22794232631/freegle_sticky',
        sizes: ADS_SMALL_BANNER_SIZES,
        bids: [
          {
            bidder: 'pubmatic',
            params: {
              publisherId: '164422',
              adSlot: '5753989',
            },
          },
        ],
      },
      {
        id: 'div-gpt-ad-1707999304775-0',
        path: '/22794232631/freegle_sticky_desktop',
        sizes: ADS_MEDIUM_BANNER_SIZES,
        bids: [
          {
            bidder: 'pubmatic',
            params: {
              publisherId: '164422',
              adSlot: '5753990',
            },
          },
        ],
      },
      {
        id: 'div-gpt-ad-1691925699378-0',
        path: '/22794232631/freegle_product',
        sizes: ADS_SQUARISH_SIZES,
        bids: [
          {
            bidder: 'pubmatic',
            params: {
              publisherId: '164422',
              adSlot: '5773059',
            },
          },
        ],
      },
      {
        id: 'div-gpt-ad-1691925773522-0',
        path: '/22794232631/freegle_productemail',
        sizes: ADS_SQUARISH_SIZES,
        bids: [
          {
            bidder: 'pubmatic',
            params: {
              publisherId: '164422',
              adSlot: '5753984',
            },
          },
        ],
      },
      {
        id: 'div-gpt-ad-1692868003771-0',
        path: '/22794232631/freegle_myposts_desktop',
        sizes: ADS_SQUARISH_SIZES,
        bids: [
          {
            bidder: 'pubmatic',
            params: {
              publisherId: '164422',
              adSlot: '5753988',
            },
          },
        ],
      },
      {
        id: 'div-gpt-ad-1709056727559-0',
        path: '/22794232631/freegle_myposts_desktop_right',
        sizes: ADS_SQUARISH_SIZES,
        bids: [
          {
            bidder: 'pubmatic',
            params: {
              publisherId: '164422',
              adSlot: '5753988',
            },
          },
        ],
      },
      {
        id: 'div-gpt-ad-1691925450433-0',
        path: '/22794232631/freegle_home_left',
        sizes: ADS_SQUARISH_SIZES,
        bids: [
          {
            bidder: 'pubmatic',
            params: {
              publisherId: '164422',
              adSlot: '5753983',
            },
          },
        ],
      },
      {
        id: 'div-gpt-ad-1691925450433-1',
        path: '/22794232631/freegle_home',
        sizes: ADS_SQUARISH_SIZES,
        bids: [
          {
            bidder: 'pubmatic',
            params: {
              publisherId: '164422',
              adSlot: '5753982',
            },
          },
        ],
      },
      {
        id: 'div-gpt-ad-1691925773522-0',
        path: '/22794232631/freegle_chat_app',
        sizes: ADS_SMALL_BANNER_SIZES,
        bids: [
          {
            bidder: 'pubmatic',
            params: {
              publisherId: '164422',
              adSlot: '5753987',
            },
          },
        ],
      },
      {
        id: 'div-gpt-ad-1692867596111-0',
        path: '/22794232631/freegle_chat_desktop',
        sizes: ADS_SQUARISH_SIZES,
        bids: [
          {
            bidder: 'pubmatic',
            params: {
              publisherId: '164422',
              adSlot: '5753986',
            },
          },
        ],
      },
      {
        id: 'div-gpt-ad-1692867324381-0',
        path: '/22794232631/freegle_feed_app',
        sizes: ADS_SQUARISH_SIZES,
        bids: [
          {
            bidder: 'pubmatic',
            params: {
              publisherId: '164422',
              adSlot: '5753986',
            },
          },
        ],
      },
      {
        id: 'div-gpt-ad-1707999616879-0',
        path: '/22794232631/freegle_feed_app_2',
        sizes: ADS_SQUARISH_SIZES,
        bids: [
          {
            bidder: 'pubmatic',
            params: {
              publisherId: '164422',
              adSlot: '5753986',
            },
          },
        ],
      },
      {
        id: 'div-gpt-ad-1707999845886-0',
        path: '/22794232631/freegle_feed_app_3',
        sizes: ADS_SQUARISH_SIZES,
        bids: [
          {
            bidder: 'pubmatic',
            params: {
              publisherId: '164422',
              adSlot: '5753986',
            },
          },
        ],
      },
      {
        id: 'div-gpt-ad-1707999962593-0',
        path: '/22794232631/freegle_feed_app_4',
        sizes: ADS_SQUARISH_SIZES,
        bids: [
          {
            bidder: 'pubmatic',
            params: {
              publisherId: '164422',
              adSlot: '5753986',
            },
          },
        ],
      },
      {
        id: 'div-gpt-ad-1708000097990-0',
        path: '/22794232631/freegle_feed_app_5',
        sizes: ADS_SQUARISH_SIZES,
        bids: [
          {
            bidder: 'pubmatic',
            params: {
              publisherId: '164422',
              adSlot: '5753986',
            },
          },
        ],
      },
    ],
    usePrebid: true,
    useAPS: false,
  },
  ADS_SMALL_BANNER_SIZES,
  ADS_MEDIUM_BANNER_SIZES,
  ADS_SQUARISH_SIZES,
}
