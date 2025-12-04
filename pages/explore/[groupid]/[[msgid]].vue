<template>
  <client-only>
    <div>
      <b-row v-if="id && !group" class="m-0">
        <b-col cols="12" md="6" lg="6" class="p-0" offset-md="3" offset-lg="3">
          <NoticeMessage variant="danger" class="mt-2">
            Sorry, we don't recognise that community name.
          </NoticeMessage>
        </b-col>
      </b-row>
      <b-row v-else class="m-0">
        <b-col cols="12" md="6" lg="6" class="p-0" offset-md="3" offset-lg="3">
          <ExploreGroup :id="group.id" :msgid="msgid" :show-give-find="!me" />
        </b-col>
      </b-row>
    </div>
  </client-only>
</template>
<script setup>
import { useRoute } from 'vue-router'
import { computed, useHead, useRuntimeConfig } from '#imports'
import { buildHead } from '~/composables/useBuildHead'
import { useGroupStore } from '~/stores/group'
import ExploreGroup from '~/components/ExploreGroup'
import NoticeMessage from '~/components/NoticeMessage'
import { useMe } from '~/composables/useMe'

const runtimeConfig = useRuntimeConfig()
const route = useRoute()
const id = route.params.groupid
const msgid = parseInt(route.params.msgid)
const { me } = useMe()

const groupStore = useGroupStore()

const group = computed(() => {
  return groupStore.get(id)
})

if (id) {
  // Fetch the specific group.
  try {
    await groupStore.fetch(id, true)
  } catch (e) {
    console.error('Failed to fetch group', e.message)
  }

  if (group.value) {
    const head = buildHead(
      route,
      runtimeConfig,
      'Explore ' + group.value.namedisplay,
      group.value.description
        ? group.value.description
        : "Give and get stuff for free. Offer things you don't need, and ask for things you'd like. Don't just recycle - reuse with Freegle!",
      group.value.profile ? group.value.profile : '/icon.png'
    )

    if (!group.value.publish) {
      head.meta = [{ name: 'robots', content: 'noindex' }]
    }

    useHead(head)
  } else {
    // Make sure it's not indexed.
    useHead({
      title: 'Community not found',
      meta: [{ name: 'robots', content: 'noindex' }],
    })
  }
} else {
  // Fetch all groups for the map.  No need to await - rendering the map is eye candy.
  groupStore.fetch()
  useHead(
    buildHead(
      route,
      runtimeConfig,
      'Explore Freegle',
      "Give and get stuff for free. Offer things you don't need, and ask for things you'd like. Don't just recycle - reuse with Freegle!"
    )
  )
}
</script>
