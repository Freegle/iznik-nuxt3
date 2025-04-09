<template>
  <div>
    <div
      v-for="group in message?.groups"
      :key="'message-' + message.id + '-' + group.id"
      class="text--small"
    >
      <client-only>
        <span :title="group.arrival" class="time"
          >{{ timeago(group.arrival, true) }}
          <span v-if="showSummaryDetails">on </span>
        </span>
      </client-only>
      <nuxt-link
        v-if="group.groupid in groups && showSummaryDetails"
        no-prefetch
        :to="'/explore/' + groups[group.groupid].exploreLink + '?noguard=true'"
        :title="'Click to view ' + groups[group.groupid].namedisplay"
      >
        {{ groups[group.groupid].namedisplay }}
      </nuxt-link>
      &nbsp;
      <client-only>
        <b-button
          v-if="showSummaryDetails"
          variant="link"
          :to="'/message/' + message.id"
          class="text-faded text-decoration-none"
          size="xs"
        >
          #{{ message.id }}
        </b-button>
      </client-only>
      <span v-if="modinfo">
        via {{ source }},
        <span v-if="message.fromip">
          from IP
          <span v-if="message.fromip.length > 16">
            hash {{ message.fromip }}
          </span>
          <span v-else>
            address {{ message.fromip }}
          </span>
          <span v-if="message.fromcountry">
            in
            <span :class="message.fromcountry === 'United Kingdom' ? '' : 'text-danger'">{{ message.fromcountry }}.</span>
          </span>
        </span>
        <span v-else>
          IP unavailable.
        </span>
      </span>
      <div v-if="approvedby && showSummaryDetails" class="text-faded small">
        Approved by {{ approvedby }}
      </div>
    </div>
    <div v-if="modinfo && message.postings && message.postings.length && message.postings[0].date !== message.date" class="small">
      <span v-if="!today">
        First posted on {{ message.postings[0].namedisplay }} on {{ datetime(message.postings[0].date) }}
      </span>
    </div>
  </div>
</template>
<script>
import { mapState } from 'pinia'
import dayjs from 'dayjs'
import { useAuthStore } from '~/stores/auth'
import { useUserStore } from '~/stores/user'
import { useMessageStore } from '~/stores/message'
import { useGroupStore } from '~/stores/group'
import { timeago } from '~/composables/useTimeFormat'
import { useMiscStore } from '~/stores/misc'

export default {
  name: 'MessageHistory',
  props: {
    id: {
      type: Number,
      required: true,
    },
    summary: {
      type: Boolean,
      required: false,
      default: false,
    },
    displayMessageLink: {
      type: Boolean,
      default: false
    },
    modinfo: {
      type: Boolean,
      default: false
    },
  },
  setup(props) {
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
          if (group?.approvedby) {
            const approver = Number.isInteger(group.approvedby) ? group.approvedby : group.approvedby.id
            userStore.fetch(approver)
          }
        }
      }
    }

    return { groupStore, messageStore, authStore, userStore, timeago }
  },
  computed: {
    ...mapState(useMiscStore, ['breakpoint']),
    showSummaryDetails() {
      return (
        !this.summary || (this.breakpoint !== 'xs' && this.breakpoint !== 'sm')
      )
    },
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
@import 'bootstrap/scss/_functions';
@import 'bootstrap/scss/_variables';
@import 'bootstrap/scss/mixins/_breakpoints';

.time {
  font-size: 0.75rem;

  @include media-breakpoint-up(md) {
    font-size: 1rem;
  }
}
</style>
