<template>
  <client-only>
    <b-col>
      <MicroVolunteering />
      <b-row class="m-0">
        <b-col cols="0" xl="3" class="d-none d-xl-block">
          <VisibleWhen
            :not="['xs', 'sm', 'md', 'lg']"
            class="position-fixed"
            style="width: 300px"
          >
            <ExternalDa
              ad-unit-path="/22794232631/freegle_productemail"
              max-height="600px"
              div-id="div-gpt-ad-1691925773522-0"
              class="mt-2"
              show-logged-out
            />
          </VisibleWhen>
        </b-col>
        <b-col cols="12" xl="6" class="p-0">
          <div
            v-if="
              failed ||
              !message ||
              (message &&
                (message.outcomes?.length > 0 ||
                  message.deleted ||
                  (message.groups &&
                    message.groups.length &&
                    message.groups[0].collection === 'Rejected')))
            "
            class="bg-white p-2"
          >
            <h1>Sorry, that post isn't around any more.</h1>
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
          <div
            v-else-if="
              mountComplete && myid && message && message.fromuser === myid
            "
          >
            <MyMessage :id="id" :show-old="true" expand />
          </div>
          <div v-else class="botpad">
            <GlobalWarning />
            <VisibleWhen :at="['xs', 'sm', 'md', 'lg']">
              <OurMessage
                :id="id"
                class="mt-3"
                :start-expanded="true"
                hide-close
                record-view
                ad-unit-path="/22794232631/freegle_productemail"
                ad-id="div-gpt-ad-1691925773522-0"
                @not-found="error = true"
              />
            </VisibleWhen>
            <VisibleWhen :not="['xs', 'sm', 'md', 'lg']">
              <OurMessage
                :id="id"
                class="mt-3"
                :start-expanded="true"
                hide-close
                record-view
                @not-found="error = true"
              />
            </VisibleWhen>
          </div>
        </b-col>
        <b-col cols="0" xl="3" class="d-none d-xl-flex justify-content-end">
          <VisibleWhen
            :not="['xs', 'sm', 'md', 'lg']"
            class="position-fixed"
            style="width: 300px"
          >
            <ExternalDa
              ad-unit-path="/22794232631/freegle_productemail"
              max-width="300px"
              div-id="div-gpt-ad-1691925773522-0"
              class="mt-2"
              show-logged-out
            />
          </VisibleWhen>
        </b-col>
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
import { ref, onMounted } from '#imports'

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

// We want to delay render of MyMessage until the mount fetch is complete, as it would otherwise not
// contain the reply information correctly.
const mountComplete = ref(false)

onMounted(async () => {
  // We need to fetch again on the client, as the server may have rendered the page with data censored, because
  // it always renders logged out.
  try {
    await messageStore.fetch(id, true)
  } catch (e) {
    console.log('Message fetch on mount failed', e)
  }

  mountComplete.value = true
})
</script>
