<template>
  <nav class="footer-nav">
    <div class="footer-social">
      <ExternalLink
        href="https://www.facebook.com/Freegle/"
        title="Facebook"
        class="footer-social-link"
      >
        <v-icon :icon="['fab', 'facebook']" />
      </ExternalLink>
      <ExternalLink
        href="https://www.instagram.com/thisisfreegle"
        title="Instagram"
        class="footer-social-link"
      >
        <v-icon :icon="['fab', 'instagram']" />
      </ExternalLink>
      <ExternalLink
        href="https://twitter.com/thisisfreegle"
        title="X"
        class="footer-social-link"
      >
        <v-icon :icon="['fab', 'twitter']" />
      </ExternalLink>
      <ExternalLink
        href="https://github.com/Freegle/iznik-nuxt3"
        title="We're open source - find us on GitHub"
        class="footer-social-link"
      >
        <v-icon :icon="['fab', 'github']" />
      </ExternalLink>
      <nuxt-link to="/donate" title="Donate" class="footer-social-link">
        <v-icon icon="heart" />
      </nuxt-link>
      <nuxt-link to="/help" title="Contact" class="footer-social-link">
        <v-icon icon="envelope" />
      </nuxt-link>
    </div>
    <div class="footer-links">
      <nuxt-link no-prefetch to="/about">About</nuxt-link>
      <nuxt-link no-prefetch to="/terms">Terms</nuxt-link>
      <nuxt-link no-prefetch to="/privacy">Privacy</nuxt-link>
      <nuxt-link no-prefetch to="/disclaimer">Disclaimer</nuxt-link>
      <nuxt-link to="/donate" class="footer-link--icon">
        <v-icon icon="heart" />Donate
      </nuxt-link>
      <nuxt-link to="/help" class="footer-link--icon">
        <v-icon icon="envelope" />Contact
      </nuxt-link>
    </div>
  </nav>
</template>
<script setup>
import ExternalLink from './ExternalLink'
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';

.footer-nav {
  padding: 0.5rem;
  background: $white;
  border-top: 1px solid $gray-200;
}

.footer-social {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.footer-social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  color: $gray-600;
  transition: color 0.15s ease;

  &:hover {
    color: $gray-800;
  }

  :deep(.fa) {
    font-size: 1.1rem;
  }
}

.footer-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 0.75rem;
  font-size: 0.75rem;

  a {
    color: $gray-600;
    text-decoration: none;

    &:hover {
      color: $gray-800;
      text-decoration: underline;
    }
  }

  .footer-link--icon {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
  }
}
</style>
