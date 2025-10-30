<template>
  <client-only>
    <b-row v-if="invalid" class="m-0">
      <b-col cols="12" lg="6" class="p-0" offset-lg="3">
        <NoticeMessage variant="danger" class="mt-2">
          Sorry, that community event isn't around any more.
        </NoticeMessage>
      </b-col>
    </b-row>
    <div v-else>
      <b-row class="m-0">
        <b-col cols="0" md="3" class="d-none d-md-block" />
        <b-col cols="12" md="6" class="p-0">
          <CommunityEvent
            v-if="!invalid"
            :id="id"
            :summary="false"
            class="mt-1"
            title-tag="h1"
            @hide="invalid = true"
          />
          <NoticeMessage v-else>
            Sorry, we can't find that volunteer opportunity.
          </NoticeMessage>
        </b-col>
        <b-col cols="0" md="3" class="d-none d-md-block" />
      </b-row>
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
