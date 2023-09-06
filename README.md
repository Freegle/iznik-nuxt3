# iznik-nuxt3

Iznik is a platform for online reuse of unwanted items.  This is the front-end client.  

The old  version is [here](https://github.com/Freegle/iznik-nuxt).

The development has been funded by [Freegle](https://www.ilovefreegle.org) for use in the UK,
but it is an open source platform which can be used or adapted by others.  Other contributors very welcome,
especially those with design/UX expertise.

**It would be very lovely if you sponsored us.**

[:heart: Sponsor](https://github.com/sponsors/Freegle)

License
=======

This code is licensed under the GPL v2 (see LICENSE file).  If you intend to use it, Freegle would be interested to
hear about it; you can mail <geeks@ilovefreegle.org>.

# Development

Currently only tested on node v17.9.1 and npm v9.4.0.  Requires node v17 or later because it relies on fetch()
which hasn't yet been fully backported to v16.  Node v18 is not yet available on Cloudflare (shockingly).

Then install all the dependencies:
```
npm install --legacy-peer-deps
```

Set some environment variables:
```
IZNIK_API_V1=https://fdapidbg.ilovefreegle.org/api
IZNIK_API_V2=https://api.ilovefreegle.org/apiv2
```

(if running the Go Server locally then http://localhost:8192/api)

Then start the dev server:
```
npm run dev
```

This will serve up the site at [localhost:3002](http://localhost:3002).

It will watch for changes and do hot module reloading.  Occasionally you'll need to restart Vite when it doesn't 
pick up a change.

# Technologies

Briefly:
* [Nuxt 3](https://v3.nuxtjs.org/), which is [Vue 3](https://vuejs.org/) (so we get all
  that nice reactive stuff), with a standard folder layout, SSR/static site generation and Pinia as a replacement 
  for Vuex.
* [Bootstrap Vue Next](https://github.com/bootstrap-vue/bootstrap-vue-next/), which is Bootstrap v5 for Vue 3 / Nuxt 3.
* Continuous Delivery via Netlify.
* Capacitor app.

<img src="http://www.browserstack.com/images/layout/browserstack-logo-600x315.png" width="280"/>

[BrowserStack](http://www.browserstack.com) is supporting Freegle, allowing us to use their service and infrastructure to test the code in this repository. Thank you for supporting the open source community!
 
