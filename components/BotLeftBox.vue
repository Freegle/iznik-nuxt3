<template>
  <nav class="bg-transparent pr-2 botleft">
    <div
      class="flex-wrap d-flex flex-row justify-content-between text-muted small list-unstyled"
    >
      <nuxt-link to="/about" class="p-1"> About </nuxt-link>
      <nuxt-link to="/terms" class="p-1"> Terms </nuxt-link>
      <nuxt-link to="/privacy" class="p-1"> Privacy </nuxt-link>
      <nuxt-link to="/disclaimer" class="p-1"> Disclaimer </nuxt-link>
      <nuxt-link to="/donate" class="p-1"> Donate </nuxt-link>
      <nuxt-link to="/help" class="p-1"> Contact </nuxt-link>
    </div>
    <div class="d-flex justify-content-between">
      <div class="d-flex">
        <ExternalLink href="https://www.facebook.com/Freegle/" title="Facebook">
          <b-img-lazy alt="Facebook" src="/botleft/facebook.png" width="40" />
        </ExternalLink>
        <ExternalLink
          href="https://twitter.com/thisisfreegle"
          title="Twitter"
          class="pl-1"
        >
          <b-img-lazy alt="Twitter" src="/botleft/twitter.png" width="40" />
        </ExternalLink>
      </div>
      <ExternalLink
        href="https://github.com/Freegle/iznik-nuxt"
        title="We're open source - find us on GitHub"
      >
        <b-img
          lazy
          alt="GitHub"
          src="/botleft/github.svg"
          width="40"
          class="mr-1"
        />
      </ExternalLink>
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

.botleft {
  position: fixed;
  bottom: 10px;
}
</style>
