<template>
  <div>
    <div
      v-for="group in message?.groups"
      :key="'message-' + message.id + '-' + group.id"
      class="text--small"
    >
      <span :title="group.arrival">{{ timeago(group.arrival) }} on </span>
      <nuxt-link
        v-if="group.groupid in groups"
        :to="'/explore/' + groups[group.groupid].exploreLink"
        :title="'Click to view ' + groups[group.groupid].namedisplay"
      >
        {{ groups[group.groupid].namedisplay }}
      </nuxt-link>
      &nbsp;
      <span
        v-if="displayMessageLink"
        :to="'/message/' + message.id"
        class="text-faded text-decoration-none"
      >
        #{{ message.id }}
      </span>
    </div>
  </div>
</template>
<script>
import dayjs from 'dayjs'
import { useMessageStore } from '../stores/message'
import { useGroupStore } from '~/stores/group'
import { timeago } from '~/composables/useTimeFormat'

export default {
  name: 'MessageHistory',
  props: {
    id: {
      type: Number,
      required: true,
    },
    displayMessageLink: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    const groupStore = useGroupStore()
    const messageStore = useMessageStore()

    return { groupStore, messageStore, timeago }
  },
  computed: {
    message() {
      return this.messageStore.byId(this.id)
    },
    groups() {
      const ret = {}

      if (this.message) {
        this.message.groups.forEach((g) => {
          const thegroup = this.groupStore.get(g.groupid)

          if (thegroup) {
            ret[g.groupid] = thegroup

            // Better to link to the group by name if possible to avoid nuxt generate creating explore pages for the
            // id variants.
            ret[g.groupid].exploreLink = thegroup
              ? thegroup.nameshort
              : g.groupid
          }
        })
      }

      return ret
    },
    today() {
      return dayjs(this.message.date).isSame(dayjs(), 'day')
    },
    source() {
      if (
        this.message.source === 'Email' &&
        this.message.fromaddr &&
        this.message.fromaddr.includes('trashnothing.com')
      ) {
        return 'TrashNothing'
      } else if (this.message.sourceheader === 'Freegle App') {
        return 'Freegle Mobile App'
      } else if (this.message.source === 'Platform') {
        return 'Freegle website'
      } else {
        return this.message.source
      }
    },
  },
}
</script>
<style scoped lang="scss">
.time {
  color: $colour-success-fg;
}
</style>
