<template>
  <div>
    <div
      v-for="group in message.groups"
      :key="'message-' + message.id + '-' + group.id"
      class="text--small"
    >
      <span class="time" :title="group.arrival"
        >{{ arrival(group.arrival) }} on
      </span>
      <nuxt-link :to="'/explore/' + exploreLink(group)">
        {{ groupName(group) }}
      </nuxt-link>
      &nbsp;
      <nuxt-link
        v-if="displayMessageLink"
        :to="'/message/' + message.id"
        class="text-faded text-decoration-none"
      >
        #{{ message.id }}
      </nuxt-link>
    </div>
  </div>
</template>
<script>
import dayjs from 'dayjs'
import { useMessageStore } from '../stores/message'
import { useGroupStore } from '~/stores/group'

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
  setup(props) {
    const me = useMe()
    const groupStore = useGroupStore()
    const messageStore = useMessageStore()

    return { me, groupStore, messageStore }
  },
  computed: {
    message() {
      return this.messageStore.byId(this.id)
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
  methods: {
    groupName(group) {
      const thegroup = this.groupStore.get(group.groupid)

      if (thegroup) {
        return thegroup.nameshort
      } else {
        return null
      }
    },
    exploreLink(group) {
      // Better to link to the group by name if possible to avoid nuxt generate creating explore pages for the
      // id variants.
      const thegroup = this.groupStore.get(group.id)

      if (thegroup) {
        return thegroup.nameshort
      } else {
        return group.id
      }
    },
    arrival(time) {
      // If we're logged out, just show the time.  This avoids screen flicker where we show an older date from a
      // version of a page which we've rendered earlier and then update on the client.
      if (this.me) {
        return dayjs(time).fromNow()
      } else {
        return dayjs(time).format('Do MMMM, YYYY HH:mm')
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
