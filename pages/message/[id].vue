<template>
  <b-col>
    <!--    TODO Microvolunteering-->
    <!--    <client-only v-if="me">-->
    <!--      <MicroVolunteering />-->
    <!--    </client-only>-->
    <b-row class="m-0">
      <b-col cols="0" xl="3" class="d-none d-xl-block" />
      <b-col cols="12" xl="6" class="p-0">
        <div
          v-if="
            error ||
            (message &&
              ((message.outcomes && message.outcomes.length > 0) ||
                message.deleted ||
                (message.groups &&
                  message.groups.length &&
                  message.groups[0].collection === 'Rejected')))
          "
          class="bg-white p-2"
        >
          <h1>Sorry, that message isn't around any more.</h1>
          <div>
            <p>
              If it was an OFFER, it's probably been TAKEN. If it was a WANTED,
              it's probably been RECEIVED.
            </p>
            <p>Why not look for something else?</p>
          </div>
          <b-row>
            <b-col cols="5" class="mt-1">
              <b-button
                to="/give"
                class="mt-1"
                size="lg"
                block
                variant="primary"
              >
                <v-icon icon="gift" />&nbsp;Give stuff
              </b-button>
            </b-col>
            <b-col cols="2" />
            <b-col cols="5">
              <b-button
                to="/find"
                class="mt-1"
                size="lg"
                block
                variant="secondary"
              >
                <v-icon icon="shopping-cart" />
                >&nbsp;Ask for stuff
              </b-button>
            </b-col>
          </b-row>
        </div>
        <div v-else-if="myid && message && message.fromuser === myid">
          <MyMessage
              :message="message"
              :show-old="true"
              expand
          />
        </div>
        <div v-else>
          <GlobalWarning />
          <OurMessage
            :id="id"
            ref="message"
            :start-expanded="true"
            hide-close
            class="botpad"
            record-view
            @not-found="error = true"
          />
        </div>
      </b-col>
      <b-col cols="0" xl="3" class="d-none d-xl-block" />
    </b-row>
  </b-col>
</template>
<script>
import { useRoute } from 'vue-router'
import { buildHead } from '../../composables/useBuildHead'
import { useMessageStore } from '~/stores/message'
import { useGroupStore } from '~/stores/group'
import { twem } from '~/composables/useTwem'
import MyMessage from '~/components/MyMessage'

definePageMeta({
  layout: 'default',
})

export default {
  components: {
    MyMessage,
  },
  async setup(props) {
    const messageStore = useMessageStore()
    const groupStore = useGroupStore()

    // We don't use lazy because we want the page to be rendered for SEO.
    const route = useRoute()
    const id = parseInt(route.params.id)

    const message = await messageStore.fetch(id)

    if (message) {
      let snip = null

      if (message.snippet) {
        snip = twem(message.snippet) + '...'
      } else {
        snip = 'Click for more details'
      }

      useHead(
        buildHead(
          message.subject,
          snip,
          message.attachments && message.attachments.length > 0
            ? message.attachments[0].path
            : null
        )
      )
    }

    return { id, messageStore, groupStore }
  },
  data() {
    return {
      error: false,
    }
  },
  computed: {
    message() {
      return this.messageStore.byId(this.id)
    },
  },
}
</script>
