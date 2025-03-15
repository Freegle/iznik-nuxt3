<template>
  <div>
    <div class="error__wrapper">
      <div class="error__image" />
      <div class="error">
        <div v-if="maintenance" class="maintenance__container px-3 bg-white">
          <h1 class="mt-4">Sorry - we're doing some maintenance</h1>
          <p>
            We're doing some maintenance work just now - one on't cross beams
            gone owt askew on treadle, the dilithium crystals need polishing,
            the server pie has a soggy bottom, that kind of thing.
          </p>
          <p>
            Usually this doesn't take more than an hour or two. Please
            <nuxt-link no-prefetch to="/">try again</nuxt-link>
            later.
          </p>
          <p>
            P.S. We know this is a bit of a pain, and we try really hard to
            avoid taking the whole site down where we can. Very occasionally we
            need to do it. If you want to
            <ExternalLink
              href="https://www.paypal.com/gb/fundraiser/charity/55681"
              >donate a quid</ExternalLink
            >, that'll help it happen less often.
          </p>
        </div>
        <div v-else>
          <h1 v-if="error?.statusCode === 404">
            <div class="error__heading--main">
              Oh no! That page doesn't seem to exist...
            </div>
            <div class="error__heading--sub">Maybe it's been freegled?</div>
          </h1>
          <div v-else>
            <h1 class="error__heading--main">
              Oh dear! Something went wrong...
            </h1>
            <p v-if="error && JSON.stringify(error).length > 2">
              Error was: {{ JSON.stringify(error) }}
            </p>
          </div>
          <p>
            <a href="/" no-prefetch>Click here</a> to go back to the home page
          </p>
          <p>
            <!-- eslint-disable-next-line -->
            Having problems? <SupportLink text="Contact us" />
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import SupportLink from '~/components/SupportLink'
import ExternalLink from '~/components/ExternalLink'
import { useError } from '#imports'

const error = useError()
const maintenance = error?.value?.message === 'Maintenance error'

const importError =
  error?.value?.message.includes(
    'Failed to fetch dynamically imported module'
  ) || error?.value?.message.includes('Importing a module script failed')

if (importError) {
  // This can happen when a page load is cancelled by the user, sometimes.  Reload.
  console.log('Import of module error - reload')
  window.location.reload()
}
</script>
