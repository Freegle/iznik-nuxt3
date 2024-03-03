<template>
  <div>
    <b-modal ref="modal" :id="'modLogsModal-' + userid + '-' + modmailsonly" :title="title" size="xl" no-stacking>
      <template #default>
        <NoticeMessage v-if="!busy && !logs.length" variant="info">
          There are no logs to show.
        </NoticeMessage>
        <div v-else>
          <p class="text-muted">
            Some old logs are removed to save space: login/logout after 1 year, bounces over 90 days, logs about deleted messages,
            deleted users.
          </p>
          <ModLog v-for="log in logs" :key="'log-' + log.id" :log="log" />
        </div>
        <infinite-loading :key="'infinite-' + userid" @infinite="fetchChunk">
          <span slot="no-results" />
          <span slot="no-more" />
          <span slot="spinner">
            <b-img-lazy src="~/static/loader.gif" alt="Loading" />
          </span>
        </infinite-loading>
      </template>

      <template #footer>
        <b-button variant="primary" @click="hide">
          Close
        </b-button>
      </template>
    </b-modal>
  </div>
</template>

<script>
import { useModal } from '~/composables/useModal'
import InfiniteLoading from '~/components/InfiniteLoading'
import { useLogsStore } from '../stores/logs'
import { useAuthStore } from '../../stores/auth'
import { useMembersStore } from '../stores/members'

export default {
  components: { InfiniteLoading },
  setup() {
    const authStore = useAuthStore()
    const logsStore = useLogsStore()
    const membersStore = useMembersStore()
    const { modal, hide } = useModal()
    return { authStore, logsStore, membersStore, modal, hide }
  },
  props: {
    userid: {
      type: Number,
      required: true
    },
    modmailsonly: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  data: function () {
    return {
      busy: false,
      context: null
    }
  },
  computed: {
    logs() {
      return this.logsStore.list
    },
    user() {
      let ret = null
      let user = this.authStore.get(this.userid)

      if (user && user.info) {
        ret = user
      } else {
        user = this.membersStore.getByUserId(this.userid)

        if (user && user.info) {
          ret = user
        }
      }

      return ret
    },
    title() {
      let ret

      if (this.modmailsonly) {
        ret = 'Modmails '
      } else {
        ret = 'Logs '
      }

      ret += this.user ? 'for ' + this.user.displayname : ''

      return ret
    }
  },
  methods: {
    show() {
      // Clear the log context - otherwise if we open another modal for this user then it will get confused and
      // fetch from a previous context and show no logs.
      this.logsStore.clear()
      this.showModal = true
    },
    async fetchChunk($state) {
      this.busy = true
      const currentCount = this.logs.length

      this.context = await this.logsStore.fetch({
        logtype: 'user',
        userid: this.userid,
        context: this.context,
        modmailsonly: this.modmailsonly
      })

      if (this.logs.length === currentCount) {
        // We've returned less than a chunk, so we must be done.
        $state.complete()
      } else {
        $state.loaded()
      }

      this.busy = false
    }
  }
}
</script>
