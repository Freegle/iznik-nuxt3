<template>
  <div class="security-page">
    <div class="security-page__content">
      <client-only>
        <h1>Security Policy</h1>
        <p class="intro">
          Freegle is a charity run by volunteers who care deeply about our
          community. We take the security of our platform seriously because we
          want everyone to feel safe when they're giving and receiving free
          stuff.
        </p>

        <h2>Reporting Security Issues</h2>
        <p>
          If you've found a security vulnerability, we'd really appreciate you
          letting us know. We're grateful for security researchers who help keep
          Freegle safe for millions of people across the UK.
        </p>
        <p>
          Please email us at
          <ExternalLink href="mailto:geeks@ilovefreegle.org"
            >geeks@ilovefreegle.org</ExternalLink
          >
          with details of what you've found. Include as much information as you
          can - steps to reproduce the issue, screenshots, or anything else that
          helps us understand and fix it.
        </p>

        <h2>What Happens Next</h2>
        <p>
          We're a small volunteer team, so please bear with us. We'll do our
          best to:
        </p>
        <ul>
          <li>Acknowledge your report within a few days</li>
          <li>Keep you updated on our progress</li>
          <li>Let you know when the issue is fixed</li>
          <li>Credit you for the discovery if you'd like (just let us know)</li>
        </ul>

        <h2>Our Promise to You</h2>
        <p>
          If you act in good faith and follow responsible disclosure practices,
          we promise we won't take any legal action against you. We genuinely
          appreciate people who help us improve our security.
        </p>
        <p>Responsible disclosure means:</p>
        <ul>
          <li>Giving us reasonable time to fix issues before going public</li>
          <li>Not accessing or modifying other people's data</li>
          <li>Not disrupting our services or other users' experience</li>
          <li>Not using the vulnerability for personal gain</li>
        </ul>

        <h2>What's In Scope</h2>
        <p>We're interested in hearing about vulnerabilities in:</p>
        <ul>
          <li>
            Our main website at
            <ExternalLink href="https://www.ilovefreegle.org"
              >www.ilovefreegle.org</ExternalLink
            >
          </li>
          <li>
            Our moderator tools at
            <ExternalLink href="https://modtools.org"
              >modtools.org</ExternalLink
            >
          </li>
          <li>Our APIs and backend services</li>
        </ul>

        <h2>Out of Scope</h2>
        <p>Please don't report:</p>
        <ul>
          <li>
            Issues in third-party services we use (report those directly to
            them)
          </li>
          <li>Social engineering attacks on our volunteers</li>
          <li>Physical security issues</li>
          <li>Denial of service attacks</li>
          <li>Spam or content issues (use our normal reporting for those)</li>
        </ul>

        <h2>A Note About Rewards</h2>
        <p>
          As a charity, we don't have a formal bug bounty programme with
          financial rewards. But we're always happy to publicly thank security
          researchers who help us, and your contribution helps millions of
          people give stuff away instead of sending it to landfill. That's
          pretty rewarding too!
        </p>

        <h2>Questions?</h2>
        <p>
          If you're not sure whether something counts as a security issue, or
          you have any questions about this policy, just drop us a line at
          <ExternalLink href="mailto:geeks@ilovefreegle.org"
            >geeks@ilovefreegle.org</ExternalLink
          >. We're friendly, we promise.
        </p>
      </client-only>
    </div>
  </div>
</template>
<script setup>
import { useRoute } from 'vue-router'
import { buildHead } from '~/composables/useBuildHead'
import ExternalLink from '~/components/ExternalLink'

const runtimeConfig = useRuntimeConfig()
const route = useRoute()

useHead(
  buildHead(
    route,
    runtimeConfig,
    'Security Policy',
    'How to report security vulnerabilities to Freegle'
  )
)
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';
@import 'assets/css/_color-vars.scss';

.security-page {
  background: $color-gray--lighter;
  min-height: 100vh;
  padding: 1rem;

  @include media-breakpoint-up(md) {
    padding: 1.5rem;
  }
}

.security-page__content {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  h1 {
    font-size: 1.5rem;
    font-weight: 600;
    color: $color-green--darker;
    margin-bottom: 1rem;
  }

  .intro {
    font-size: 1.05rem;
    line-height: 1.7;
    color: $gray-700;
    margin-bottom: 1.5rem;
  }

  h2 {
    font-size: 1.25rem;
    font-weight: 600;
    color: $color-green--darker;
    margin-top: 1.5rem;
    margin-bottom: 0.75rem;
  }

  p {
    font-size: 0.95rem;
    line-height: 1.6;
    color: $gray-700;
    margin-bottom: 0.75rem;
  }

  ul {
    padding-left: 1.25rem;
    margin-bottom: 1rem;

    li {
      font-size: 0.95rem;
      line-height: 1.6;
      color: $gray-700;
      margin-bottom: 0.5rem;
    }
  }
}
</style>
