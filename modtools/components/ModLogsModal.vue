<template>
  <div>
    <b-modal
      :id="'modLogsModal-' + userid + '-' + modmailsonly"
      ref="modal"
      :title="title"
      size="xl"
      no-stacking
    >
      <template #default>
        <NoticeMessage v-if="!busy && !logs.length" variant="info">
          There are no logs to show.
        </NoticeMessage>
        <div v-else>
          <p class="text-muted">
            Some old logs are removed to save space: login/logout after 1 year,
            bounces over 90 days, logs about deleted messages, deleted users.
          </p>
          {{ logs.length }}
          <ModLog v-for="log in logs" :key="'log-' + log.id" :log="log" />
        </div>
        <infinite-loading :distance="200" @infinite="fetchChunk">
          <template #no-results />
          <template #no-more />
          <template #spinner>
            <b-img src="/loader.gif" alt="Loading" width="100px" />
          </template>
        </infinite-loading>
      </template>

      <template #footer>
        <b-button variant="primary" @click="hide"> Close </b-button>
      </template>
    </b-modal>
  </div>
</template>

<script>
import { useLogsStore } from '~/stores/logs'
import { useUserStore } from '../../stores/user'
import { useMemberStore } from '~/stores/member'
import InfiniteLoading from '~/components/InfiniteLoading'
import { useOurModal } from '~/composables/useOurModal'

export default {
  components: { InfiniteLoading },
  props: {
    userid: {
      type: Number,
      required: true,
    },
    modmailsonly: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  setup() {
    const userStore = useUserStore()
    const logsStore = useLogsStore()
    const memberStore = useMemberStore()
    const { modal, hide } = useOurModal(227)
    return { logsStore, memberStore, userStore, modal, hide }
  },
  data: function () {
    return {
      busy: false,
      context: null,
    }
  },
  computed: {
    logs() {
      return this.logsStore.list
    },
    user() {
      let ret = null
      let user = this.userStore?.byId(this.userid)

      if (user) {
        if (user && user.info) {
          ret = user
        } else {
          user = this.memberStore.getByUserId(this.userid)

          if (user && user.info) {
            ret = user
          }
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
    },
  },
  mounted() {
    this.logsStore.clear()
  },
  methods: {
    show() {
      // Clear the log context - otherwise if we open another modal for this user then it will get confused and
      // fetch from a previous context and show no logs.
      this.logsStore.clear()
      this.modal.show()
    },
    async fetchChunk($state) {
      this.busy = true
      const currentCount = this.logs.length

      this.context = await this.logsStore.fetch({
        logtype: 'user',
        userid: this.userid,
        context: this.context,
        modmailsonly: this.modmailsonly,
      })

      if (this.logs.length === currentCount) {
        // We've returned less than a chunk, so we must be done.
        $state.complete()
      } else {
        $state.loaded()
      }

      this.busy = false
    },
  },
}
</script>
