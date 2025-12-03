<template>
  <client-only>
    <div class="event-page">
      <div class="event-page__content">
        <NoticeMessage v-if="invalid" variant="danger">
          Sorry, that community event isn't around any more.
        </NoticeMessage>
        <CommunityEvent
          v-else
          :id="id"
          :summary="false"
          title-tag="h1"
          @hide="invalid = true"
        />
      </div>
    </div>
  </client-only>
</template>
<script setup>
import { useRoute } from 'vue-router'
import { buildHead } from '~/composables/useBuildHead'
import { useCommunityEventStore } from '~/stores/communityevent'
import NoticeMessage from '~/components/NoticeMessage'
import CommunityEvent from '~/components/CommunityEvent'
import { useRouter } from '#imports'

const runtimeConfig = useRuntimeConfig()
const eventStore = useCommunityEventStore()
const route = useRoute()
const router = useRouter()
const id = parseInt(route.params.id)

if (!id) {
  // Probably here by mistake - send to the list of all of them.
  router.push('/communityevents')
}

let invalid = false

try {
  await eventStore.fetch(id)
  const event = computed(() => {
    return eventStore.byId(id)
  })

  useHead(
    buildHead(
      route,
      runtimeConfig,
      event.value.title,
      event.value.description,
      event.value.image ? event.value.image.path : null
    )
  )
} catch (e) {
  invalid = true
  console.log('Build head', e)
  useHead(
    buildHead(
      route,
      runtimeConfig,
      'Community Event ' + id,
      "Sorry, that community event isn't around any more."
    )
  )
}
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';
@import 'assets/css/_color-vars.scss';

.event-page {
  background: $color-gray--lighter;
  min-height: 100vh;
  padding: 1rem;

  @include media-breakpoint-up(md) {
    padding: 1.5rem;
  }
}

.event-page__content {
  max-width: 800px;
  margin: 0 auto;
}
</style>
