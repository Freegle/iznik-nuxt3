<template>
  <client-only>
    <b-container fluid>
      <b-row class="m-0">
        <b-col cols="12" lg="6" offset-lg="3" class="p-0">
          <div>
            <GlobalWarning />
            <MyMessage
              v-if="message?.fromuser === myid"
              :id="id"
              :show-old="true"
              :expand="true"
              :action="action"
            />
            <b-alert v-else variant="warning" class="mt-2" show>
              <h3>That post wasn't made from {{ me.email }}.</h3>
              <h5>{{ message.subject }}</h5>
              <p>
                Please change your email from
                <!-- eslint-disable-next-line-->
              <nuxt-link to="/settings">Settings</nuxt-link>
                if necessary - we'll merge your accounts.
              </p>
            </b-alert>
          </div>
          <div v-if="missing">
            <NoticeMessage variant="danger" class="mt-1">
              Sorry, we couldn't find that message. Perhaps it's been deleted,
              or perhaps the link you clicked on is wrong?
            </NoticeMessage>
            <div class="text-center">
              <b-button variant="primary" size="lg" class="mt-2" to="/myposts">
                Go to My Posts <v-icon icon="angle-double-right" />
              </b-button>
            </div>
          </div>
        </b-col>
      </b-row>
      <DonationAskModal ref="askmodal" :groupid="donationGroup" />
    </b-container>
  </client-only>
</template>
<script>
import { useRoute } from 'vue-router'
import { useGroupStore } from '../../../stores/group'
import { buildHead } from '~/composables/useBuildHead'
import { useMessageStore } from '~/stores/message'
import { useAuthStore } from '~/stores/auth'
import NoticeMessage from '~/components/NoticeMessage'
import GlobalWarning from '~/components/GlobalWarning'
const MyMessage = () => import('~/components/MyMessage.vue')
const DonationAskModal = () => import('~/components/DonationAskModal')

definePageMeta({
  layout: 'login',
})

export default {
  components: {
    NoticeMessage,
    MyMessage,
    GlobalWarning,
    DonationAskModal,
  },
  async setup() {
    const runtimeConfig = useRuntimeConfig()
    const route = useRoute()
    const id = parseInt(route.params.id)
    const action = route.params.action

    useHead(buildHead(route, runtimeConfig, 'My Posts', null))

    const authStore = useAuthStore()
    const messageStore = useMessageStore()
    const groupStore = useGroupStore()
    const myid = authStore.user?.id

    let message = null
    let missing = false

    try {
      message = await messageStore.fetch(id, true)

      // Get the groups into store too.
      const promises = []
      message.groups.forEach((g) => {
        if (!groupStore.get(g.groupid)) {
          try {
            promises.push(groupStore.fetch(g.groupid))
          } catch (e) {
            console.log('Fetch fail', e)
          }
        }
      })

      await Promise.all(promises)

      if (myid) {
        if (message?.fromuser !== myid) {
          // Message was from a different user.  Probably logged in as the wrong user.  Let the server know.
          authStore.addRelatedUser(message.fromuser)
        } else if (action) {
          // If they have an intended outcome, then we save that to the server now.  This means that if they never
          // get round to doing anything else on this page we'll assume that's what they wanted.  We do this because
          // we've seen people click the button in the email a lot and then bail out.
          let outcome = null

          if (this.action === 'repost') {
            outcome = 'Repost'
          } else if (this.action === 'withdraw') {
            outcome = 'Withdrawn'
          } else if (this.action === 'completed') {
            outcome = this.message.type === 'Offer' ? 'Taken' : 'Received'
          }

          if (outcome) {
            messageStore.intend(id, outcome)
          }
        }
      }
    } catch (e) {
      // Failed to fetch.
      console.log('Failed', e)
      missing = true
    }

    return {
      authStore,
      groupStore,
      messageStore,
      missing,
      id,
      action,
    }
  },
  data() {
    return {
      donationGroup: null,
      contactGroup: null,
    }
  },
  computed: {
    message() {
      return this.messageStore.byId(this.id)
    },
  },
  mounted() {
    this.$bus.$on('outcome', (params) => {
      const { groupid, outcome } = params

      if (outcome === 'Taken' || outcome === 'Received') {
        this.donationGroup = groupid
        this.ask()
      }
    })
  },
  methods: {
    ask(groupid) {
      this.waitForRef('askmodal', () => {
        this.$refs.askmodal.show()
      })
    },
    setGroup() {
      if (this.message?.groups?.length) {
        this.contactGroup = this.message.groups[0].id
      }
    },
  },
}
</script>
