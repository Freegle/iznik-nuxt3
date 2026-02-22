<template>
  <div class="footer w-100 test-main-footer thefooter">
    <!-- Sponsors section -->
    <div class="sponsors-section test-footer-sponsors">
      <p class="sponsors-label">Kindly supported by</p>
      <div class="sponsors-logos">
        <a
          target="_blank"
          rel="noopener"
          href="/shortlink/krystalaffiliate"
          class="sponsor-link test-sponsor-krystal"
        >
          <ProxyImage
            src="/krystal.png"
            alt="Krystal Logo"
            class="sponsor-logo"
            sizes="75px md:100px lg:165px"
          />
        </a>
        <a
          target="_blank"
          rel="noopener"
          href="https://www.mythic-beasts.com"
          class="sponsor-link test-sponsor-mythic"
        >
          <ProxyImage
            src="/mythic-beasts.png"
            alt="Mythic Beasts Logo"
            class="sponsor-logo"
            sizes="75px md:100px lg:165px"
          />
        </a>
      </div>
    </div>

    <!-- Charity info -->
    <p class="charity-text test-footer-charity-text">
      Freegle is registered as a charity with HMRC (ref. XT32865).
    </p>

    <!-- Navigation links -->
    <div class="nav-links test-footer-links">
      <nuxt-link no-prefetch to="/about" class="nav-link test-footer-about">
        About
      </nuxt-link>
      <span class="nav-divider">·</span>
      <nuxt-link no-prefetch to="/terms" class="nav-link test-footer-terms">
        Terms
      </nuxt-link>
      <span class="nav-divider">·</span>
      <nuxt-link no-prefetch to="/privacy" class="nav-link test-footer-privacy">
        Privacy
      </nuxt-link>
      <span class="nav-divider">·</span>
      <nuxt-link no-prefetch to="/donate" class="nav-link test-footer-donate">
        Donate
      </nuxt-link>
      <span class="nav-divider">·</span>
      <nuxt-link no-prefetch to="/help" class="nav-link test-footer-contact">
        Help
      </nuxt-link>
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
@import 'assets/css/_color-vars.scss';

.footer {
  margin: 0 auto;
  padding: 1rem;
  text-align: center;
}

.sponsors-section {
  background: $color-gray--lighter;
  border-radius: 12px;
  padding: 1rem 1.5rem;
  margin-bottom: 1rem;
}

.sponsors-label {
  font-size: 0.8rem;
  color: $color-gray--dark;
  margin-bottom: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.sponsors-logos {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
}

.sponsor-link {
  display: block;
  opacity: 0.8;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }
}

.sponsor-logo {
  width: 120px;
  height: auto;

  @include media-breakpoint-down(sm) {
    width: 90px;
  }
}

.charity-text {
  font-size: 0.8rem;
  color: $color-gray--dark;
  margin-bottom: 0.75rem;
}

.nav-links {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.nav-link {
  color: $color-gray--darker;
  text-decoration: none;
  font-size: 0.85rem;
  padding: 0.25rem 0.5rem;

  &:hover {
    color: $colour-success;
  }
}

.nav-divider {
  color: $color-gray--light;
}
</style>
