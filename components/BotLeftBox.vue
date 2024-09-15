<template>
  <nav class="bg-transparent pr-2">
    <div class="d-flex justify-content-between">
      <div class="d-none">
        <ExternalLink href="https://www.facebook.com/Freegle/" title="Facebook">
          <b-img lazy alt="Facebook" src="/botleft/facebook.png" width="40" />
        </ExternalLink>
        <ExternalLink
          href="https://www.instagram.com/thisisfreegle"
          title="Instagram"
        >
          <b-img
            lazy
            alt="Instagram"
            src="/botleft/instagram.png"
            width="40"
            class="ml-1"
          />
        </ExternalLink>
        <ExternalLink
          href="https://twitter.com/thisisfreegle"
          title="Twitter"
          class="pl-1"
        >
          <b-img lazy alt="Twitter" src="/botleft/twitter.png" width="40" />
        </ExternalLink>
      </div>
      <ExternalLink
        href="https://github.com/Freegle/iznik-nuxt3"
        title="We're open source - find us on GitHub"
      >
        <b-img
          lazy
          alt="GitHub"
          src="/botleft/github.svg"
          width="40"
          class="ml-1 mr-1"
        />
      </ExternalLink>
    </div>
    <div
      class="flex-wrap d-flex flex-row justify-content-between text-muted small list-unstyled"
    >
      <nuxt-link no-prefetch to="/about" class="p-1"> About </nuxt-link>
      <nuxt-link no-prefetch to="/terms" class="p-1"> Terms </nuxt-link>
      <nuxt-link no-prefetch to="/privacy" class="p-1"> Privacy </nuxt-link>
      <nuxt-link no-prefetch to="/disclaimer" class="p-1">
        Disclaimer
      </nuxt-link>
      <nuxt-link no-prefetch to="/donate" class="p-1"> Donate </nuxt-link>
      <nuxt-link no-prefetch to="/help" class="p-1"> Contact </nuxt-link>
    </div>
  </nav>
</template>
<script>
import ExternalLink from './ExternalLink'

export default {
  components: {
    ExternalLink,
  },
}
</script>
<style scoped lang="scss">
a {
  color: $color-black !important;
}
</style>
