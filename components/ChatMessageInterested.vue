<template>
  <div
    class="chatMessageWrapper pb-1"
    :class="{ myChatMessage: messageIsFromCurrentUser }"
  >
    <div class="chatMessage forcebreak chatMessage__owner">
      <div v-if="chatmessage.userid != myid">
        <ChatMessageSummary v-if="refmsgid" :id="refmsgid" class="mt-1 mb-2" />
        <div>
          <!-- eslint-disable-next-line -->
          <span v-if="(chatmessage.secondsago < 60) || (chatmessage.id > chat.lastmsgseen)" class="prewrap font-weight-bold" v-html="emessage" />
          <!-- eslint-disable-next-line -->
          <span v-else class="preline forcebreak" v-html="emessage" />
          <b-img
            v-if="chatmessage.image"
            fluid
            :src="chatmessage.image.path"
            lazy
            rounded
          />
        </div>
        <div
          v-if="
            refmsg &&
            refmsg.type === 'Offer' &&
            (!refmsg.outcomes || !refmsg.outcomes.length)
          "
        >
          <hr class="mb-0" />
          <div class="d-flex justify-content-between flex-wrap mb-2">
            <div
              v-if="!refmsg.promisecount"
              class="mr-2 border-light border-right flex-grow-1 text-center"
            >
              <div class="text-center small text-muted mb-2">
                Still available?
              </div>
              <b-button variant="primary" size="sm" @click="promise">
                <v-icon icon="handshake" /> Promise
              </b-button>
            </div>
            <div class="flex-grow-1">
              <div class="text-center small text-muted mb-2">
                No longer available?
              </div>
              <div class="d-flex justify-content-between ml-2 mr-2">
                <b-button
                  variant="secondary"
                  size="sm"
                  class="mr-1"
                  @click="outcome('Taken')"
                >
                  Mark as TAKEN
                </b-button>
                <b-button
                  variant="secondary"
                  size="sm"
                  @click="outcome('Withdrawn')"
                >
                  Withdraw
                </b-button>
              </div>
            </div>
          </div>
          <OutcomeModal
            v-if="refmsgid"
            :id="refmsgid"
            ref="outcomeModal"
            @outcome="refetch"
          />
          <PromiseModal
            ref="promise"
            :messages="[refmsg]"
            :selected-message="refmsg.id"
            :users="otheruser ? [otheruser] : []"
            :selected-user="otheruser ? otheruser.id : null"
          />
        </div>
      </div>
      <div v-else>
        <ChatMessageSummary v-if="refmsgid" :id="refmsgid" class="mt-1 mb-2" />
        <div>
          <span v-if="!highlightEmails">
            <span
              v-if="
                chatmessage.secondsago < 60 || chatmessage.id > chat.lastmsgseen
              "
              class="prewrap font-weight-bold"
              >{{ emessage }}</span
            >
            <span v-else class="preline forcebreak">{{ emessage }}</span>
            <b-img
              v-if="chatmessage.image"
              fluid
              :src="chatmessage.image.path"
              lazy
              rounded
            />
          </span>
          <span v-else>
            <span
              v-if="
                chatmessage.secondsago < 60 || chatmessage.id > chat.lastmsgseen
              "
              class="font-weight-bold"
            >
              <Highlighter
                :text-to-highlight="emessage"
                :search-words="[regexEmail]"
                highlight-class-name="highlight"
                class="prewrap"
              />
            </span>
            <span v-else>
              <Highlighter
                :text-to-highlight="emessage"
                :search-words="[regexEmail]"
                highlight-class-name="highlight"
                class="preline forcebreak"
              />
            </span>
            <b-img
              v-if="chatmessage.image"
              fluid
              :src="chatmessage.image.path"
              lazy
              rounded
            />
          </span>
        </div>
      </div>
    </div>
    <div class="chatMessageProfilePic">
      <ProfileImage
        :image="chatMessageProfileImage"
        class="ml-1 mb-1 mt-1 inline"
        is-thumbnail
        size="sm"
      />
    </div>
  </div>
</template>

<script>
import ChatBase from '~/components/ChatBase'
import ProfileImage from '~/components/ProfileImage'
const OutcomeModal = () => import('~/components/OutcomeModal')
const PromiseModal = () => import('~/components/PromiseModal')
const ChatMessageSummary = () => import('~/components/ChatMessageSummary')
const Highlighter = () => import('vue-highlight-words')

export default {
  components: {
    ProfileImage,
    OutcomeModal,
    PromiseModal,
    ChatMessageSummary,
    Highlighter,
  },
  extends: ChatBase,

  computed: {
    replyusers() {
      const ret = []
      const retids = []

      const message = this.$store.getters['messages/get'](this.refmsg.id)

      if (message) {
        if (this.refmsg && message.replies) {
          for (const reply of message.replies) {
            if (!retids.includes(reply.user.id)) {
              ret.push(reply.user)
              retids[reply.userid] = true
            }
          }
        }
      }

      return ret
    },
  },
  methods: {
    promise() {
      this.waitForRef('promise', () => {
        this.$refs.promise.show()
      })
    },
    async outcome(type) {
      await this.$store.dispatch('messages/fetch', {
        id: this.refmsg.id,
      })

      this.waitForRef('outcomeModal', () => {
        this.$refs.outcomeModal.show(type)
      })
    },
  },
}
</script>
