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
        no-prefetch
        :to="'/explore/' + groups[group.groupid].exploreLink + '?noguard=true'"
        :title="'Click to view ' + groups[group.groupid].namedisplay"
      >
        {{ groups[group.groupid].namedisplay }}
      </nuxt-link>
      &nbsp;
      <b-button
        v-if="displayMessageLink"
        variant="link"
        :to="'/message/' + message.id"
        class="text-faded text-decoration-none"
        size="xs"
      >
        #{{ message.id }}
      </b-button>
      <span v-if="approvedby" class="text-muted small">
        Approved by {{ approvedby }}
      </span>
    </div>
  </div>
</template>
<script>
import dayjs from 'dayjs'
import { useAuthStore } from '~/stores/auth'
import { useUserStore } from '~/stores/user'
import { useMessageStore } from '~/stores/message'
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
  async setup(props) {
    const groupStore = useGroupStore()
    const messageStore = useMessageStore()
    const authStore = useAuthStore()
    const userStore = useUserStore()

    const me = authStore.user

    if (
      me &&
      (me.systemrole === 'Moderator' ||
        me.systemrole === 'Support' ||
        me.systemrole === 'Admin')
    ) {
      // Fetch any approving mod.  No need to wait.
      const message = messageStore.byId(props.id)

      if (message?.groups) {
        // Might fail, e.g. network, but we don't much mind if it does - we'd just not show the approving mod.
        for (const group of message.groups) {
          await groupStore.fetch(group.id)
          if (group?.approvedby) {
            userStore.fetch(group.approvedby.id)
          }
        }
      }
    }

    return { groupStore, messageStore, authStore, userStore, timeago }
  },
  computed: {
    approvedby() {
      let approvedby = ''

      if (this.mod) {
        for (const group of this.message?.groups) {
          if (group?.approvedby) {
            const mod = this.userStore?.byId(group.approvedby.id)
            approvedby = mod?.displayname
          }
        }
      }

      return approvedby
    },
    message() {
      return this.messageStore?.byId(this.id)
    },
    groups() {
      const ret = {}

      this.message?.groups.forEach((g) => {
        const thegroup = this.groupStore?.get(g.groupid)

        if (thegroup) {
          ret[g.groupid] = thegroup

          // Better to link to the group by name if possible to avoid nuxt generate creating explore pages for the
          // id variants.
          ret[g.groupid].exploreLink = thegroup ? thegroup.nameshort : g.groupid
        }
      })

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
