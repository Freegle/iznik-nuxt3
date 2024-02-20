<template>
  <div>
    <h1><HomeIcon /> ModTools!</h1>
    <p>
      Here's an <ExternalLink href="https://ilovefreegle.org">ExternalLink to the Freegle website</ExternalLink>
    </p>
    <NoticeMessage>
      Here's a notice.
      Does changing this show online?
    </NoticeMessage>
    <button @click="throwError">Throw error</button>
  </div>
</template>

<script setup>
import { buildHead } from '~/composables/useMTBuildHead'

const runtimeConfig = useRuntimeConfig()
const route = useRoute()

useHead(
      buildHead(
        route,
        runtimeConfig,
        'ModTools',
        'Moderation tool for Freegle volunteers'
      )
    )

/*const version = computed(() => {
  return runtimeConfig.public.VERSION
})

const buildDate = computed(() => {
  return runtimeConfig.public.BUILD_DATE
})*/


function throwError() {
  throw new Error('Sentry Error2')
}
</script>
