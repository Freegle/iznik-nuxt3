**This is a WIP rewrite of the front-end client into Nuxt v3.  It's not ready yet, by a long chalk.**

# iznik-nuxt3

Iznik is a platform for online reuse of unwanted items.  The old  version is [here](https://github.com/Freegle/iznik-nuxt).

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

Currently only tested on node v16.13.2 and npm v8.1.2.  Other versions cause issues on Windows builds.

Then install all the dependencies:
```
npm install
```

Then start the dev server:
```
npm run dev
```

This will serve up the site at [localhost:4000](http://localhost:4000).

It will watch for changes and do hot module reloading.  Occasionally you'll need to restart Vite when it doesn't 
pick up a change.

# Technologies

Briefly:
* [Nuxt](https://v3.nuxtjs.org/), which is [Vue 3](https://vuejs.org/) (so we get all
  that nice reactive stuff), with a standard layout and SSR/static site generation.
* [BootstrapVue 3](https://cdmoro.github.io/bootstrap-vue-3/), which is Bootstrap v5 for Vue 3 / Nuxt 3.

<img src="http://www.browserstack.com/images/layout/browserstack-logo-600x315.png" width="280"/>

[BrowserStack](http://www.browserstack.com) is supporting Freegle, allowing us to use their service and infrastructure to test the code in this repository. Thank you for supporting the open source community!
 
