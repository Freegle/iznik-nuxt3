<template>
  <div class="small">
    <span class="text-danger">
      Crosspost
      <v-icon icon="hashtag" class="text-muted" scale="0.5" />
      {{ message.id }}
      <nuxt-link :to="'/message/' + message.id">
        <em>{{ message.subject }}</em>
        {{ timeago(message.arrival) }} on <em>{{ groupname }}</em>
      </nuxt-link>
    </span>
    <span v-if="message.collection != 'Approved'">
      <span class="text-muted">in</span>
      <span class="text-danger">
        {{ message.collection }}
      </span>
    </span>
    <span v-else-if="message.outcome">, now {{ message.outcome }}</span
    ><span v-else class="text-normal">, still open</span>
  </div>
</template>
<script>
import { useGroupStore } from '~/stores/group'
export default {
  props: {
    message: {
      type: Object,
      required: true,
    },
  },
  setup() {
    const groupStore = useGroupStore()
    return { groupStore }
  },
  computed: {
    group() {
      return this.groupStore.get(this.message.groupid)
    },
    groupname() {
      return this.group ? this.group.namedisplay : null
    },
  },
  mounted() {
    const group = this.groupStore.get(this.message.groupid)

    if (!group) {
      this.groupStore.fetch(this.message.groupid)
    }
  },
}
</script>
