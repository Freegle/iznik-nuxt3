<template>
  <b-row>
    <b-col cols="12" lg="6" offset-lg="3" class="bg-white">
      <div class="text-center">
        <h1>Freegle</h1>
        <h2>Don't throw it away, give it away!</h2>
        <h5>
          Got stuff you don't need? We'll find someone to come and take it.
        </h5>
        <h5>
          Looking for something? We'll pair you with someone giving it away.
        </h5>
        <h5>
          All completely free. Freegle: it's like online dating for stuff.
        </h5>
        <p>
          Freegling is easy on mobiles and tablets, and you get notifications of
          replies so you don't have to rely on email. Download using these links
          or search for Freegle in your app store - it's free!
        </p>
        <div class="d-flex justify-content-between">
          <ExternalLink
            href="https://play.google.com/store/apps/details?id=org.ilovefreegle.direct"
            class="mt-2"
          >
            <img
              alt="Freegle Android app on Google Play"
              title="Freegle Android app on Google Play"
              class="img-responsive"
              src="/en-play-badge.png"
            />
          </ExternalLink>
          <ExternalLink
            href="https://itunes.apple.com/gb/app/freegle/id970045029?ls=1&amp;mt=8"
            class="mt-2"
          >
            <img
              alt="Freegle app for iPhone, iPad, and iPod touch"
              title="Freegle app for iPhone, iPad, and iPod touch"
              class="img-responsive"
              src="/app-store-black-sm.png"
            />
          </ExternalLink>
        </div>
        <p class="mt-2">We support Android 8.0/iOS 13 or later.</p>
        <p>
          <!-- eslint-disable-next-line -->
          Please report any issues to <SupportLink />.
        </p>
      </div>
    </b-col>
  </b-row>
</template>
<script>
import { useRoute } from 'vue-router'
import { buildHead } from '~/composables/useBuildHead'
const ExternalLink = defineAsyncComponent(() =>
  import('~/components/ExternalLink')
)
const SupportLink = defineAsyncComponent(() =>
  import('~/components/SupportLink')
)

export default {
  components: { ExternalLink, SupportLink },
  setup() {
    const runtimeConfig = useRuntimeConfig()
    const route = useRoute()

    useHead(
      buildHead(
        route,
        runtimeConfig,
        'Our mobile app',
        'Find out about our mobile app and how to install it.'
      )
    )
  },
}
</script>
