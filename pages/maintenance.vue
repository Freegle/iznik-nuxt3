<template>
  <div class="d-flex justify-content-center">
    <div class="maintenance__container px-3 bg-white">
      <h1 class="mt-4">
        <v-icon icon="cog" scale="4" />
        Sorry - we're doing some maintenance
      </h1>
      <NoticeMessage variant="danger">
        You might see this page if you are using an old version of the app or
        website. Please update your app or clear your browser cache.
      </NoticeMessage>
      <p>
        We're doing some maintenance work just now - one on't cross beams gone
        owt askew on treadle, the dilithium crystals need polishing, the server
        pie has a soggy bottom, that kind of thing.
      </p>
      <p>
        Usually this doesn't take more than an hour or two. Please
        <nuxt-link no-prefetch to="/">try again</nuxt-link>
        later.
      </p>
      <p>
        P.S. We know this is a bit of a pain, and we try really hard to avoid
        taking the whole site down where we can. Very occasionally we need to do
        it. If you want to
        <ExternalLink href="https://www.paypal.com/gb/fundraiser/charity/55681"
          >donate a quid</ExternalLink
        >, that'll help it happen less often.
      </p>
    </div>
  </div>
</template>
<script setup>
import { useRoute } from 'vue-router'
import NoticeMessage from '~/components/NoticeMessage'
import { useHead, useRuntimeConfig } from '#imports'
import { buildHead } from '~/composables/useBuildHead'
import ExternalLink from '~/components/ExternalLink'

const route = useRoute()
const runtimeConfig = useRuntimeConfig()

useHead(buildHead(route, runtimeConfig, 'Maintenance', "We're down just now."))
</script>
