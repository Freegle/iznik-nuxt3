<template>
  <nav class="footer-nav">
    <div class="footer-links">
      <nuxt-link no-prefetch to="/about">About</nuxt-link>
      <nuxt-link no-prefetch to="/terms">Terms</nuxt-link>
      <nuxt-link no-prefetch to="/privacy">Privacy</nuxt-link>
      <nuxt-link no-prefetch to="/disclaimer">Disclaimer</nuxt-link>
      <nuxt-link to="/donate">Donate</nuxt-link>
      <nuxt-link to="/help">Contact</nuxt-link>
    </div>
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.4rem 0.5rem;
  background: $white;
  border-top: 1px solid $gray-200;
  gap: 0.5rem;
}

.footer-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.2rem 0.5rem;
  font-size: 0.7rem;

  a {
    color: $gray-600;
    text-decoration: none;
    white-space: nowrap;

    &:hover {
      color: $gray-800;
      text-decoration: underline;
    }
  }
}

.footer-social {
  display: flex;
  gap: 0.25rem;
  flex-shrink: 0;
}

.footer-social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  color: $gray-500;
  transition: color 0.15s ease;

  &:hover {
    color: $gray-700;
  }

  :deep(.fa) {
    font-size: 0.9rem;
  }
}
</style>
