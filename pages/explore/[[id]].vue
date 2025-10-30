<template>
  <client-only>
    <div>
      <b-row v-if="id && !group" class="m-0">
        <b-col cols="12" lg="6" class="p-0" offset-lg="3">
          <NoticeMessage variant="danger" class="mt-2">
            Sorry, we don't recognise that community name.
          </NoticeMessage>
        </b-col>
      </b-row>
      <b-row v-else class="m-0">
        <b-col cols="12" lg="6" class="p-0" offset-lg="3">
          <ExploreGroup v-if="group?.id" :id="group.id" />
          <PostMapAndList
            v-else
            class="mt-2"
            show-start-message
            :initial-bounds="[
              [49.959999905, -7.57216793459],
              [58.6350001085, 1.68153079591],
            ]"
            start-on-groups
            show-many
          />
        </b-col>
      </b-row>
    </div>
  </client-only>
</template>
<script setup>
import { useRoute } from 'vue-router'
import { buildHead } from '~/composables/useBuildHead'
import PostMapAndList from '~/components/PostMapAndList'
import { computed, useHead, useRuntimeConfig } from '#imports'
import NoticeMessage from '~/components/NoticeMessage'
import ExploreGroup from '~/components/ExploreGroup'
import { useGroupStore } from '~/stores/group'

const runtimeConfig = useRuntimeConfig()
const groupStore = useGroupStore()
const route = useRoute()
const id = route.params.id

const group = computed(() => {
  return groupStore.get(id)
})

if (id) {
  // Fetch the specific group.
  await groupStore.fetch(route.params.id)
} else {
  // Fetch all groups for the map.  No need to await - rendering the map is eye candy.
  groupStore.fetch()
}

useHead(
  buildHead(
    route,
    runtimeConfig,
    group.value ? 'Explore ' + group.value.namedisplay : 'Explore Freegle',
    'Freegle - like online dating for stuff. Find a community near you...',
    group.value?.profile ? group.value.profile : '/icon.png',
    {
      class: 'overflow-y-scroll',
    }
  )
)
</script>
