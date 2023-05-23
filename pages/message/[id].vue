<template>
  <client-only>
    <b-col>
      <MicroVolunteering />
      <b-row class="m-0">
        <b-col cols="0" xl="3" class="d-none d-xl-block" />
        <b-col cols="12" xl="6" class="p-0">
          <div
            v-if="
              failed ||
              (message &&
                ((message.outcomes && message.outcomes.length > 0) ||
                  message.deleted ||
                  (message.groups &&
                    message.groups.length &&
                    message.groups[0].collection === 'Rejected')))
            "
            class="bg-white p-2"
          >
            <h1>Sorry, that message isn't around any more.</h1>
            <div>
              <p>
                If it was an OFFER, it's probably been TAKEN. If it was a
                WANTED, it's probably been RECEIVED.
              </p>
              <p>Why not look for something else?</p>
            </div>
            <b-row>
              <b-col cols="5" class="mt-1">
                <b-button
                  to="/give"
                  class="mt-1"
                  size="lg"
                  block
                  variant="primary"
                >
                  <v-icon icon="gift" />&nbsp;Give stuff
                </b-button>
              </b-col>
              <b-col cols="2" />
              <b-col cols="5">
                <b-button
                  to="/find"
                  class="mt-1"
                  size="lg"
                  block
                  variant="secondary"
                >
                  <v-icon icon="shopping-cart" />
                  &nbsp;Ask for stuff
                </b-button>
              </b-col>
            </b-row>
          </div>
          <div v-else-if="myid && message && message.fromuser === myid">
            <MyMessage :id="id" :show-old="true" expand />
          </div>
          <div v-else class="botpad">
            <GlobalWarning />
            <OurMessage
              :id="id"
              :start-expanded="true"
              hide-close
              record-view
              @not-found="error = true"
            />
          </div>
        </b-col>
        <b-col cols="0" xl="3" class="d-none d-xl-block" />
      </b-row>
    </b-col>
  </client-only>
</template>
<script setup>
import { useRoute } from 'vue-router'
import { buildHead } from '../../composables/useBuildHead'
import { useMessageStore } from '~/stores/message'
import { twem } from '~/composables/useTwem'
import MyMessage from '~/components/MyMessage'
import { ref } from '#imports'

const runtimeConfig = useRuntimeConfig()
const route = useRoute()
const messageStore = useMessageStore()

// We don't use lazy because we want the page to be rendered for SEO.
const id = parseInt(route.params.id)

const failed = ref(false)

try {
  await messageStore.fetch(id)
} catch (e) {
  // Likely to be because the message doesn't exist.
  console.log('Message fetch failed', e)
  failed.value = true
}

const message = computed(() => {
  return messageStore.byId(id)
})

if (message.value) {
  let snip = null

  if (message.value.snippet) {
    snip = twem(message.value.snippet) + '...'
  } else {
    snip = 'Click for more details'
  }

  useHead(
    buildHead(
      route,
      runtimeConfig,
      message.value.subject,
      snip,
      message.value.attachments && message.value.attachments?.length > 0
        ? message.value.attachments[0].path
        : null
    )
  )
}
</script>
