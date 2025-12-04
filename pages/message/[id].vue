<template>
  <b-col>
    <client-only>
      <MicroVolunteering />
    </client-only>
    <b-row class="m-0">
      <b-col cols="0" xl="3" class="d-none d-xl-block">
        <client-only>
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
        </client-only>
      </b-col>
      <b-col cols="12" xl="6" class="p-0">
        <div
          v-if="
            !showtaken &&
            (failed ||
              !message ||
              (message &&
                (message.outcomes?.length > 0 ||
                  message.deleted ||
                  (message.groups &&
                    message.groups.length &&
                    message.groups[0]?.collection === 'Rejected'))))
          "
          class="error-page"
        >
          <div class="error-content">
            <div class="error-card">
              <v-icon icon="heart" class="error-icon" />
              <h1 class="error-title">This post isn't available</h1>
              <p
                v-if="
                  message?.outcomes?.length &&
                  message?.outcomes[0].outcome === 'Taken'
                "
                class="error-message"
              >
                Great news - it was successfully taken!
              </p>
              <p
                v-else-if="
                  message?.outcomes?.length &&
                  message?.outcomes[0].outcome === 'Received'
                "
                class="error-message"
              >
                Great news - it was successfully received!
              </p>
              <p
                v-else-if="
                  message?.outcomes?.length &&
                  message?.outcomes[0].outcome === 'Withdrawn'
                "
                class="error-message"
              >
                This post was withdrawn by the poster.
              </p>
              <p v-else-if="message?.deadline" class="error-message">
                This post had a deadline of
                {{ dateonlyNoYear(message.deadline) }}.
              </p>
              <p v-else class="error-message">
                If it was an OFFER, it's probably been TAKEN. If it was a
                WANTED, it's probably been RECEIVED.
              </p>
              <div class="error-buttons">
                <b-button to="/give" variant="primary">
                  <v-icon icon="gift" class="me-1" />Give stuff
                </b-button>
                <b-button to="/find" variant="secondary">
                  <v-icon icon="search" class="me-1" />Find stuff
                </b-button>
              </div>
            </div>
          </div>
        </div>
        <div
          v-else-if="
            mountComplete && myid && message && message.fromuser === myid
          "
        >
          <client-only>
            <MyMessage :id="id" :show-old="true" expand />
          </client-only>
        </div>
        <div v-else class="botpad">
          <client-only>
            <template #fallback>
              <OurMessage
                :id="id"
                class="mt-3"
                :start-expanded="true"
                hide-close
                :record-view="false"
                @not-found="error = true"
              />
            </template>
            <GlobalMessage />
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
          </client-only>
        </div>
      </b-col>
      <b-col cols="0" xl="3" class="d-none d-xl-flex justify-content-end">
        <client-only>
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
              :jobs="false"
            />
          </VisibleWhen>
        </client-only>
      </b-col>
    </b-row>
  </b-col>
</template>
<script setup>
import { useRoute } from 'vue-router'
import { buildHead } from '~/composables/useBuildHead'
import { ref, computed, onMounted, useHead, useRuntimeConfig } from '#imports'
import { useMessageStore } from '~/stores/message'
import { useAuthStore } from '~/stores/auth'
import { twem } from '~/composables/useTwem'
import { dateonlyNoYear } from '~/composables/useTimeFormat'
import MyMessage from '~/components/MyMessage'
import OurMessage from '~/components/OurMessage'
import GlobalMessage from '~/components/GlobalMessage'
import VisibleWhen from '~/components/VisibleWhen'
import ExternalDa from '~/components/ExternalDa'
import MicroVolunteering from '~/components/MicroVolunteering'

const runtimeConfig = useRuntimeConfig()
const route = useRoute()
const messageStore = useMessageStore()
const authStore = useAuthStore()

// We don't use lazy because we want the page to be rendered for SEO.
const id = parseInt(route.params.id)

// Get showtaken query parameter
const showtaken = route.query.showtaken

const failed = ref(false)
const error = ref(false)
const mountComplete = ref(false)

const myid = computed(() => authStore.user?.id)

let ret = null

try {
  ret = await messageStore.fetch(id)
} catch (e) {
  // Likely to be because the message doesn't exist.
  console.log('Message fetch failed', e)
  failed.value = true
}

if (!ret) {
  failed.value = true
}

const message = computed(() => {
  return messageStore.byId(id)
})

if (message.value) {
  let snip = null

  try {
    if (message.value.snippet) {
      snip = twem(message.value.snippet) + '...'
    } else {
      snip = 'Click for more details'
    }

    const headData = buildHead(
      route,
      runtimeConfig,
      message.value.subject,
      snip,
      message.value.attachments && message.value.attachments?.length > 0
        ? message.value.attachments[0].path
        : null
    )
    useHead(headData)
  } catch (e) {
    console.error('Error in head setup', e)
    // Fallback to basic head
    useHead({ title: message.value.subject || 'Message' })
  }
}

// We want to delay render of MyMessage until the mount fetch is complete, as it would otherwise not
// contain the reply information correctly.

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

<style scoped lang="scss">
@import 'assets/css/_color-vars.scss';

.error-page {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.error-content {
  max-width: 400px;
  width: 100%;
}

.error-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  padding: 2rem;
  text-align: center;
}

.error-icon {
  font-size: 3rem;
  color: $colour-success;
  margin-bottom: 1rem;
}

.error-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: $color-gray--darker;
  margin-bottom: 0.75rem;
}

.error-message {
  color: $color-gray--dark;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.error-buttons {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  flex-wrap: wrap;
}
</style>
