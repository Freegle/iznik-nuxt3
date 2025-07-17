<template>
  <div class="footer w-100 mt-4 test-main-footer thefooter">
    <div class="d-flex flex-column">
      <div class="d-flex justify-content-center mb-2 test-footer-sponsors">
        <a
          target="_blank"
          rel="noopener"
          href="/shortlink/krystalaffiliate"
          class="d-flex justify-content-start flex-column mr-4 test-sponsor-krystal"
        >
          <ProxyImage
            preload
            src="/krystal.png"
            alt="Krystal Logo"
            class="sponsor"
            sizes="75px md:100px lg:165px"
          />
        </a>
        <a
          target="_blank"
          rel="noopener"
          href="https://www.mythic-beasts.com"
          class="d-flex justify-content-start flex-column ml-4 test-sponsor-mythic"
        >
          <ProxyImage
            preload
            src="/mythic-beasts.png"
            alt="Mythic Beasts Logo"
            class="sponsor"
            sizes="75px md:100px lg:165px"
          />
        </a>
      </div>
      <div class="d-flex flex-column justify-content-end small mb-2">
        <div class="text-muted text-center mb-1 test-footer-charity-text">
          Freegle is registered as a charity with HMRC (ref. XT32865). Kind
          support from Krystal & Mythic Beasts.
        </div>
      </div>
      <div class="d-flex justify-content-between navlinks test-footer-links">
        <!-- eslint-disable-next-line -->
        <nuxt-link no-prefetch to="/about" class="menu__link test-footer-about">
          <client-only>
            <v-icon icon="info-circle" class="link__icon" />
          </client-only>
          About
        </nuxt-link>
        <nuxt-link no-prefetch to="/terms" class="menu__link test-footer-terms">
          <client-only>
            <v-icon icon="book-open" class="link__icon" />
          </client-only>
          Terms
        </nuxt-link>
        <nuxt-link
          no-prefetch
          to="/privacy"
          class="menu__link test-footer-privacy"
        >
          <client-only>
            <v-icon icon="lock" class="link__icon" />
          </client-only>
          Privacy
        </nuxt-link>
        <nuxt-link
          no-prefetch
          to="/disclaimer"
          class="menu__link test-footer-disclaimer"
        >
          <client-only>
            <v-icon icon="gavel" class="link__icon" />
          </client-only>
          Disclaimer
        </nuxt-link>
        <nuxt-link
          no-prefetch
          to="/donate"
          class="menu__link test-footer-donate"
        >
          <client-only>
            <v-icon icon="hand-holding-heart" class="link__icon" />
          </client-only>
          Donate
        </nuxt-link>
        <nuxt-link
          no-prefetch
          to="/help"
          class="menu__link test-footer-contact"
        >
          <client-only>
            <v-icon icon="envelope" class="link__icon" />
          </client-only>
          Contact
        </nuxt-link>
      </div>
    </div>
  </div>
</template>
<script setup>
// This component has no script logic
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';

.footer {
  //max-width: map-get($grid-breakpoints, 'md');
  margin: 0 auto;
}

.menu__link {
  color: $color-black;
  text-decoration: none;
}

.link__icon {
  display: none;
}

@include media-breakpoint-up(lg) {
  .link__icon {
    display: inline-block;
  }
}

.sponsor {
  width: 165px;

  @include media-breakpoint-down(md) {
    width: 99px;
  }
}

.navlinks {
  @include media-breakpoint-down(xs) {
    font-size: 0.8rem;
  }
}
</style>
