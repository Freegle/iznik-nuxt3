const ADS_SMALL_BANNER_SIZES = [[320, 50]]
const ADS_MEDIUM_BANNER_SIZES = [[728, 90]]
const ADS_SQUARISH_SIZES = [[300, 250]]

const CONFIG = {
  IS_MT: process.env.MT === 'true', // For MT set in modtools/nuxt.config.ts

  // Legacy API, especially mod ops.
  APIv1: process.env.IZNIK_API_V1 || 'https://fdapilive.ilovefreegle.org/api',

  // New style API, for fast read ops.
  APIv2: process.env.IZNIK_API_V2 || 'https://api.ilovefreegle.org/apiv2',

  // This is where the user site is.
  USER_SITE: 'https://www.ilovefreegle.org',
  USER_DOMAIN: 'ilovefreegle.org',

  // This is where images are served from.
  //
  // Old:
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

  SENTRY_DSN_MT:
    'https://1ab4fc0b56b355f5e794857f8e25d316@o118493.ingest.sentry.io/4506712427855872',

  // Cookie banner for this site.
  COOKIEYES: process.env.COOKIEYES || null,

  TRUSTPILOT_LINK: process.env.TRUSTPILOT_LINK || null,

  GOOGLE_ADSENSE_ID: process.env.GOOGLE_ADSENSE_ID,
  GOOGLE_ADSENSE_TEST_MODE: process.env.GOOGLE_ADSENSE_TEST_MODE,
  STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,

  // Playwire Ad Config
  PLAYWIRE_PUB_ID: process.env.PLAYWIRE_PUB_ID,
  PLAYWIRE_WEBSITE_ID: process.env.PLAYWIRE_WEBSITE_ID,

  AD_PREBID_CONFIG: [
    {
      code: '/22794232631/freegle_sticky',
      mediaTypes: {
        banner: {
          sizes: ADS_SMALL_BANNER_SIZES,
        },
      },
      bids: [
        // {
        //   bidder: 'pubmatic',
        //   params: {
        //     publisherId: '164422',
        //     adSlot: '5753989',
        //   },
        // },
        {
          bidder: 'appnexus',
          params: {
            placementId: '32336192',
          },
        },
        {
          bidder: 'gourmetads',
          params: {
            placementId: '32293691',
          },
        },
        {
          bidder: 'mgnipbs',
          params: {},
        },
      ],
    },
    {
      code: '/22794232631/freegle_sticky_desktop',
      mediaTypes: {
        banner: {
          sizes: ADS_MEDIUM_BANNER_SIZES,
        },
      },
      bids: [
        // {
        //   bidder: 'pubmatic',
        //   params: {
        //     publisherId: '164422',
        //     adSlot: '5753990',
        //   },
        // },
        {
          bidder: 'appnexus',
          params: {
            placementId: '32336193',
          },
        },
        {
          bidder: 'gourmetads',
          params: {
            placementId: '32293692',
          },
        },
        {
          bidder: 'mgnipbs',
          params: {},
        },
      ],
    },
    {
      code: '/22794232631/freegle_product',
      mediaTypes: {
        banner: {
          sizes: ADS_SQUARISH_SIZES,
        },
      },
      bids: [
        // {
        //   bidder: 'pubmatic',
        //   params: {
        //     publisherId: '164422',
        //     adSlot: '5773059',
        //   },
        // },
        {
          bidder: 'appnexus',
          params: {
            placementId: '32336187',
          },
        },
        {
          bidder: 'gourmetads',
          params: {
            placementId: '32293683',
          },
        },
        {
          bidder: 'mgnipbs',
          params: {},
        },
      ],
    },
    {
      code: '/22794232631/freegle_productemail',
      mediaTypes: {
        banner: {
          sizes: ADS_SQUARISH_SIZES,
        },
      },
      bids: [
        // {
        //   bidder: 'pubmatic',
        //   params: {
        //     publisherId: '164422',
        //     adSlot: '5753984',
        //   },
        // },
        {
          bidder: 'appnexus',
          params: {
            placementId: '32336188',
          },
        },
        {
          bidder: 'gourmetads',
          params: {
            placementId: '32293685',
          },
        },
        {
          bidder: 'mgnipbs',
          params: {},
        },
      ],
    },
    {
      code: '/22794232631/freegle_myposts_desktop',
      mediaTypes: {
        banner: {
          sizes: ADS_SQUARISH_SIZES,
        },
      },
      bids: [
        // {
        //   bidder: 'pubmatic',
        //   params: {
        //     publisherId: '164422',
        //     adSlot: '5753988',
        //   },
        // },
        {
          bidder: 'appnexus',
          params: {
            placementId: '32336191',
          },
        },
        {
          bidder: 'gourmetads',
          params: {
            placementId: '32293689',
          },
        },
        {
          bidder: 'mgnipbs',
          params: {},
        },
      ],
    },
    {
      code: '/22794232631/freegle_myposts_desktop_right',
      mediaTypes: {
        banner: {
          sizes: ADS_SQUARISH_SIZES,
        },
      },
      bids: [
        // {
        //   bidder: 'pubmatic',
        //   params: {
        //     publisherId: '164422',
        //     adSlot: '5775938',
        //   },
        // },
        {
          bidder: 'appnexus',
          params: {
            placementId: '32336198',
          },
        },
        {
          bidder: 'gourmetads',
          params: {
            placementId: '32293701',
          },
        },
        {
          bidder: 'mgnipbs',
          params: {},
        },
      ],
    },
    {
      code: '/22794232631/freegle_home_left',
      mediaTypes: {
        banner: {
          sizes: ADS_SQUARISH_SIZES,
        },
      },
      bids: [
        // {
        //   bidder: 'pubmatic',
        //   params: {
        //     publisherId: '164422',
        //     adSlot: '5753983',
        //   },
        // },
        {
          bidder: 'appnexus',
          params: {
            placementId: '32336186',
          },
        },
        {
          bidder: 'gourmetads',
          params: {
            placementId: '32293682',
          },
        },
        {
          bidder: 'mgnipbs',
          params: {},
        },
      ],
    },
    {
      code: '/22794232631/freegle_home',
      mediaTypes: {
        banner: {
          sizes: ADS_SQUARISH_SIZES,
        },
      },
      bids: [
        // {
        //   bidder: 'pubmatic',
        //   params: {
        //     publisherId: '164422',
        //     adSlot: '5753982',
        //   },
        // },
        {
          bidder: 'appnexus',
          params: {
            placementId: '32336185',
          },
        },
        {
          bidder: 'gourmetads',
          params: {
            placementId: '32293670',
          },
        },
        {
          bidder: 'mgnipbs',
          params: {},
        },
      ],
    },
    {
      code: '/22794232631/freegle_chat_app',
      mediaTypes: {
        banner: {
          sizes: ADS_SMALL_BANNER_SIZES,
        },
      },
      bids: [
        // {
        //   bidder: 'pubmatic',
        //   params: {
        //     publisherId: '164422',
        //     adSlot: '5753987',
        //   },
        // },
        {
          bidder: 'appnexus',
          params: {
            placementId: '32336179',
          },
        },
        {
          bidder: 'gourmetads',
          params: {
            placementId: '32293688',
          },
        },
        {
          bidder: 'mgnipbs',
          params: {},
        },
      ],
    },
    {
      code: '/22794232631/freegle_chat_desktop',
      mediaTypes: {
        banner: {
          sizes: ADS_SQUARISH_SIZES,
        },
      },
      bids: [
        // {
        //   bidder: 'pubmatic',
        //   params: {
        //     publisherId: '164422',
        //     adSlot: '5753986',
        //   },
        // },
        {
          bidder: 'appnexus',
          params: {
            placementId: '32336190',
          },
        },
        {
          bidder: 'gourmetads',
          params: {
            placementId: '32293687',
          },
        },
        {
          bidder: 'mgnipbs',
          params: {},
        },
      ],
    },
    {
      code: '/22794232631/freegle_feed_app',
      mediaTypes: {
        banner: {
          sizes: ADS_SQUARISH_SIZES,
        },
      },
      bids: [
        // {
        //   bidder: 'pubmatic',
        //   params: {
        //     publisherId: '164422',
        //     adSlot: '5753981',
        //   },
        // },
        {
          bidder: 'appnexus',
          params: {
            placementId: '32336154',
          },
        },
        {
          bidder: 'gourmetads',
          params: {
            placementId: '32293654',
          },
        },
        {
          bidder: 'mgnipbs',
          params: {},
        },
      ],
    },
    {
      code: '/22794232631/freegle_feed_app_2',
      mediaTypes: {
        banner: {
          sizes: ADS_SQUARISH_SIZES,
        },
      },
      bids: [
        // {
        //   bidder: 'pubmatic',
        //   params: {
        //     publisherId: '164422',
        //     adSlot: '5753991',
        //   },
        // },
        {
          bidder: 'appnexus',
          params: {
            placementId: '32336180',
          },
        },
        {
          bidder: 'gourmetads',
          params: {
            placementId: '32293693',
          },
        },
        {
          bidder: 'mgnipbs',
          params: {},
        },
      ],
    },
    {
      code: '/22794232631/freegle_feed_app_3',
      mediaTypes: {
        banner: {
          sizes: ADS_SQUARISH_SIZES,
        },
      },
      bids: [
        // {
        //   bidder: 'pubmatic',
        //   params: {
        //     publisherId: '164422',
        //     adSlot: '5753992',
        //   },
        // },
        {
          bidder: 'appnexus',
          params: {
            placementId: '32336181',
          },
        },
        {
          bidder: 'gourmetads',
          params: {
            placementId: '32293694',
          },
        },
        {
          bidder: 'mgnipbs',
          params: {},
        },
      ],
    },
    {
      code: '/22794232631/freegle_feed_app_4',
      mediaTypes: {
        banner: {
          sizes: ADS_SQUARISH_SIZES,
        },
      },
      bids: [
        // {
        //   bidder: 'pubmatic',
        //   params: {
        //     publisherId: '164422',
        //     adSlot: '5753993',
        //   },
        // },
        {
          bidder: 'appnexus',
          params: {
            placementId: '32336182',
          },
        },
        {
          bidder: 'gourmetads',
          params: {
            placementId: '32293695',
          },
        },
        {
          bidder: 'mgnipbs',
          params: {},
        },
      ],
    },
    {
      code: '/22794232631/freegle_feed_app_5',
      mediaTypes: {
        banner: {
          sizes: ADS_SQUARISH_SIZES,
        },
      },
      bids: [
        // {
        //   bidder: 'pubmatic',
        //   params: {
        //     publisherId: '164422',
        //     adSlot: '5753994',
        //   },
        // },
        {
          bidder: 'appnexus',
          params: {
            placementId: '32336183',
          },
        },
        {
          bidder: 'gourmetads',
          params: {
            placementId: '32293696',
          },
        },
        {
          bidder: 'mgnipbs',
          params: {},
        },
      ],
    },
    {
      code: '/22794232631/freegle_modal_app',
      mediaTypes: {
        banner: {
          sizes: ADS_SMALL_BANNER_SIZES,
        },
      },
      bids: [
        // {
        //   bidder: 'pubmatic',
        //   params: {
        //     publisherId: '164422',
        //     adSlot: '5893878',
        //   },
        // },
        {
          bidder: 'appnexus',
          params: {
            placementId: '32426827',
          },
        },
        {
          bidder: 'gourmetads',
          params: {
            placementId: '32293696',
          },
        },
        {
          bidder: 'mgnipbs',
          params: {},
        },
      ],
    },
    {
      code: '/22794232631/appnexus_test',
      mediaTypes: {
        banner: {
          sizes: [
            [600, 500],
            [300, 600],
          ],
        },
      },
      bids: [
        {
          bidder: 'appnexus',
          params: {
            placementId: 13144370,
          },
        },
      ],
    },
    {
      code: '/22794232631/freegle_test4',
      mediaTypes: {
        banner: {
          sizes: ADS_SMALL_BANNER_SIZES,
        },
      },
      bids: [
        {
          bidder: 'mgnipbs',
          params: {},
        },
      ],
    },
  ],
}

export default CONFIG
