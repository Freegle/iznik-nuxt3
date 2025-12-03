<template>
  <div class="privacy-page">
    <div class="privacy-page__content">
      <client-only>
        <h2>1. What data we process</h2>
        <p>
          We process your email address, name, approximate location, and profile
          picture. If you log in using a social login (Facebook/Google/Yahoo)
          then we will obtain these details from them.
        </p>
        <p>
          All OFFER/WANTED posts are public, so if you put phone numbers, email
          addresses or postal addresses into them, other people will be able to
          see them. If you're concerned about this, don't do it!
        </p>
        <h2>2. How we process data</h2>
        <p>
          We use your email address to send you various emails about your posts
          and posts from other freeglers. You can change the emails you receive
          or turn them off from
          <!-- eslint-disable-next-line-->
          <nuxt-link  no-prefetch to="/settings">Settings</nuxt-link>.
          <!-- eslint-disable-next-line-->
          We won't show your email address to any organisation outside Freegle,
          and other freeglers won't see it (unless your community leaves Freegle
          - see below).
        </p>
        <p>
          We show your name, profile picture and approximate location to other
          freeglers to make the site more engaging and show that freeglers are
          real people. If you don't want that, you can change it in
          <!-- eslint-disable-next-line-->
          <nuxt-link  no-prefetch to="/settings">Settings</nuxt-link>.
        </p>
        <p>
          We try to protect you from spammers and fraudsters. Sometimes our
          volunteers may read what you write in Chat to other freeglers to check
          that it's not spam, phishing or fraud. If we happen to find something
          which is against Freegle rules, we may take further action.
        </p>
        <p>
          So that potential new users can see what is being offered on Freegle,
          we make some details of posts public, i.e. the item name, approximate
          location, the description and any photos. No personal details are made
          public unless in this information.
        </p>
        <h2>3. Cookies and Tracking</h2>
        <p>
          You'll have seen lots of irritating popups on websites about consent
          for cookies. We have one of those too. Sorry, but it's the law. Here
          are some technical details.
        </p>
        <h3>3.1 Necessary function</h3>
        <p>
          We store some things which are strictly necessary to make the site
          work.
        </p>
        <ul>
          <li>
            We store cookies for sessions and for your cookie preferences. Those
            are needed for the site to work.
          </li>
          <li>
            We store some information in your browser's local storage. This
            contains a few settings and is also used when you're replying to a
            post. That's like the "shopping cart" example in the Information
            Commissioner's
            <!-- eslint-disable-next-line -->
            <ExternalLink href="https://ico.org.uk/for-organisations/guide-to-pecr/cookies-and-similar-technologies/">advice</ExternalLink>
            and does not require consent.
          </li>
          <li>
            We use Google and Facebook's buttons to allow you to log in. They
            store a few third-party cookies of their own, which are strictly
            necessary to make those buttons work.
          </li>
          <li>
            We use
            <ExternalLink href="https://matomo.org">Matomo</ExternalLink> to
            collect information about how people use the site. This is similar
            to Google Analytics, but more privacy-safe. We have configured this
            not to use any cookies.
          </li>
        </ul>
        <h3>3.2 Optional function</h3>
        <p>We store some other things which help make the site better.</p>
        <ul>
          <li>
            When something goes wrong on the website, we log it to a third party
            site called
            <!-- eslint-disable-next-line -->
            <ExternalLink href="https://sentry.io">Sentry</ExternalLink>.  They help organise the logs and make it easier for us to identify
            problems. This
            <!-- eslint-disable-next-line -->
            <ExternalLink href="https://docs.sentry.io/data-management/sensitive-data/">should not include</ExternalLink>
            any of your personal data. You can read their privacy policy
            <!-- eslint-disable-next-line -->
            <ExternalLink href="https://sentry.io/privacy/">here</ExternalLink>.
          </li>
          <li>
            We show job ads from
            <ExternalLink href="https://uk.whatjobs.com/">WhatJobs</ExternalLink
            >, both on the site and in emails. We'd prefer not to, but we don't
            raise enough from
            <nuxt-link no-prefetch to="/donate">donations</nuxt-link> alone to
            keep going. We don't pass them any information at all unless you
            click on one of the job links, not even your IP address.
          </li>
          <li>
            We also show ads from selected partners, using Google's advertising
            service. You can read more about which cookies Google uses
            <ExternalLink href="https://business.safety.google/adscookies/"
              >here</ExternalLink
            >.
          </li>
          <li>
            All or partial advertising on this Website or App is managed by
            Playwire LLC. If Playwire publisher advertising services are used,
            Playwire LLC may collect and use certain aggregated and anonymized
            data for advertising purposes. To learn more about the types of data
            collected, how data is used and your choices as a user, please visit
            <ExternalLink href="https://www.playwire.com/privacy-policy"
              >https://www.playwire.com/privacy-policy</ExternalLink
            >.
          </li>
        </ul>
        <p>
          If you are concerned about these, you can also install a privacy
          blocker such as
          <!-- eslint-disable-next-line -->
          <ExternalLink href="https://getadblock.com/en/">AdBlock</ExternalLink>
          <!-- eslint-disable-next-line -->
          or
          <ExternalLink href="https://www.ghostery.com/">Ghostery</ExternalLink>
          and still use the site. Please remember that while Freegle is free to
          use, it's not free to run, so it helps if you
          <nuxt-link no-prefetch to="/donate">donate</nuxt-link>.
        </p>
        <h2>4. Deleting your data</h2>
        <p>
          We'll delete your data automatically if you're inactive for six
          months. If you want to leave Freegle, please go
          <!-- eslint-disable-next-line -->
        <nuxt-link  no-prefetch to="/unsubscribe">here</nuxt-link>.
        </p>
        <p>
          Once you leave, this will delete all your personal data within 14
          days. If you change your mind before then, or left by mistake, you can
          log back in to reactivate your account.
        </p>
        <h2>5. Communities leaving Freegle</h2>
        <p>
          Freegle communities may in theory choose to leave Freegle and move
          somewhere else. This has never actually happened, but it's possible in
          theory. If this happens then we will be in touch with you to discuss
          what should happen to your details.
        </p>
        <h2>6. Legal Basis</h2>
        <p>We operate under the legal basis of Legitimate Interest.</p>
        <h2>Got questions?</h2>
        <p>
          Privacy is a complicated and important area, which we take seriously.
          If you have questions or concerns, please
          <nuxt-link no-prefetch to="/help"> contact us</nuxt-link>. Our
          registered address is Weaver's Field, Loud Bridge, Chipping PR3 2NX.
        </p>
        <p>
          If you're unhappy, you can also contact the Information Commissioner's
          Office
          <ExternalLink href="https://ico.org.uk/make-a-complain"
            >here</ExternalLink
          >.
        </p>
        <h3>Change History</h3>
        <p>Here are the changes to this page.</p>
        <ul class>
          <li>26/02/2025: Add Playwire information for advertising.</li>
          <li>
            19/11/2024: Update after Facebook request to clarify what data we
            store and how we process it.
          </li>
          <li>
            24/08/2024: Update to mention legal basis, retention period,
            complain to ICO.
          </li>
          <li>
            15/04/2024: Update to mention case where a community leaves Freegle.
          </li>
          <li>
            04/01/2024: Remove mention of Norfolk Freegle, which is no longer a
            separate entity.
          </li>
          <li>20/09/2023: Various clarifications and typos.</li>
          <li>
            19/09/2023: We now have a cookie consent banner. Reinstate session
            coookie, which is in fact used sometimes.
          </li>
          <li>03/08/2023: Remove session cookie, which is no longer used.</li>
          <li>31/07/2023: Remove Inspectlet, which we no longer use.</li>
          <li>
            04/02/2023: Removed Google Analytics, which we no longer use. Add
            mention of cookies.
          </li>
          <li>
            04/10/2021: Added section on data deletion as per Facebook request.
          </li>
          <li>05/02/2021: Updated to remove PixFuture.</li>
          <li>04/02/2021: Updated to include PixFuture.</li>
          <li>
            01/03/2020: Updated for Norfolk Freegle, which is now hosted on the
            main site.
          </li>
          <li>06/01/2020: Add use of Inspectlet.</li>
          <li>31/12/2019: Explain why we don't have or need a cookie popup.</li>
          <li>29/12/2019: Add use of Sentry.</li>
        </ul>
      </client-only>
    </div>
  </div>
</template>
<script setup>
import { useRoute } from 'vue-router'
import { buildHead } from '~/composables/useBuildHead'
import ExternalLink from '~/components/ExternalLink'

// Setup page head
const runtimeConfig = useRuntimeConfig()
const route = useRoute()

useHead(
  buildHead(
    route,
    runtimeConfig,
    'Privacy',
    'What data we keep and how we protect it'
  )
)
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';
@import 'assets/css/_color-vars.scss';

.privacy-page {
  background: $color-gray--lighter;
  min-height: 100vh;
  padding: 1rem;

  @include media-breakpoint-up(md) {
    padding: 1.5rem;
  }
}

.privacy-page__content {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  h2 {
    font-size: 1.25rem;
    font-weight: 600;
    color: $color-green--darker;
    margin-top: 1.5rem;
    margin-bottom: 0.75rem;

    &:first-child {
      margin-top: 0;
    }
  }

  h3 {
    font-size: 1.1rem;
    font-weight: 600;
    color: $gray-700;
    margin-top: 1.25rem;
    margin-bottom: 0.5rem;
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
