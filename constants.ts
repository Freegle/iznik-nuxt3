// We have two constants for the API location.  Why?
// - IZNIK_API is the actual location of the server hosting the API.  It's not used directly by the code.
// - API is the constant the code uses to make an API call - it's basically just a prefix.
//
// How do these get used?
// - In axios-baseurl:
//   - On the server we set the base URL to IZNIK_API.  We make calls to the API and don't have to worry about CORS.
//   - On the client we don't set a base URL, so it goes to the server the client was served up from.  That then proxies
//     it on to IZNIK_API via the proxy: directive below.
// - The rest of the client code just uses the API prefix.  The base URL kicks in (or doesn't) as described above.
const API = '/api'

// IZNIK_API is where we send it to.  This avoids CORS issues (and removes preflight OPTIONS calls for GETs, which
// hurt client performance).
const IZNIK_API = process.env.IZNIK_API || 'https://fdapilive.ilovefreegle.org'

// This is where the user site is.
const USER_SITE = 'https://www.ilovefreegle.org'

// This is where images are served from.
const IMAGE_SITE = 'https://images.ilovefreegle.org'

// Long polls interact badly with per-host connection limits so send to here instead.
const CHAT_HOST = 'https://users.ilovefreegle.org:555'

// OpenStreetMap Tile Server
const OSM_TILE =
  process.env.OSM_TILE || 'https://tiles.ilovefreegle.org/tile/{z}/{x}/{y}.png'

// Geocode server
const GEOCODE = process.env.GEOCODE || 'https://geocode.ilovefreegle.org/api'

// Google keys.
// TODO Should be in process.env
const GOOGLE_MAPS_KEY = 'AIzaSyCdTSJKGWJUOx2pq1Y0f5in5g4kKAO5dgg'
const GOOGLE_API_KEY = 'AIzaSyArVxoX781qdcbmQZi1PKHX-qa0bPbboH4'
const GOOGLE_CLIENT_ID = '423761283916-1rpa8120tpudgv4nf44cpmlf8slqbf4f.apps.googleusercontent.com'