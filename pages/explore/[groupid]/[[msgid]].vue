<template>
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
        <ExploreGroup :id="group.id" :msgid="msgid" />
      </b-col>
    </b-row>
  </div>
</template>
<script>
import { useRoute } from 'vue-router'
import { buildHead } from '~/composables/useBuildHead'
import { useGroupStore } from '~/stores/group'

definePageMeta({
  layout: 'default',
})

export default {
  async setup() {
    const groupStore = useGroupStore()
    const route = useRoute()
    const id = route.params.groupid
    const msgid = parseInt(route.params.msgid)

    let group = null

    if (id) {
      // Fetch the specific group.
      group = await groupStore.fetch(route.params.id)
    } else {
      // Fetch all groups for the map.  No need to await - rendering the map is eye candy.
      groupStore.fetch()
    }

    useHead(
      buildHead(
        route,
        group ? 'Explore ' + group.namedisplay : 'Explore Freegle'
      )
    )

    return { id, msgid, groupStore }
  },
  computed: {
    group() {
      return this.groupStore.get(this.id)
    },
  },
}
</script>
