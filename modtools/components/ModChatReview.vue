<template>
  <div>
    <b-card no-body>
      <b-card-header>
        <div class="d-flex justify-content-between flex-wrap">
          <div class="d-flex justify-content-start flex-wrap">
            <ModChatReviewUser
              :user="message.fromuser"
              class="mr-2"
              tag="From: "
              :groupid="message.group ? message.group.id : 0"
              @reload="reload"
            />
            <v-icon
              icon="arrow-circle-right"
              scale="2"
              class="mt-1 text-info"
            />
            <ModChatReviewUser
              :user="message.touser"
              class="ml-2"
              tag="To: "
              :groupid="message.group ? message.group.id : 0"
              @reload="reload"
            />
          </div>
          <b-button
            v-if="message.bymailid || message.msgid"
            size="lg"
            variant="white"
            class="ml-2"
            @click="showOriginal = true"
          >
            <v-icon icon="info-circle" /> View original email
          </b-button>
        </div>
      </b-card-header>
      <b-card-body>
        <NoticeMessage v-if="message.reviewreason" class="mb-2">
          This is here because: {{ reviewreason }}
        </NoticeMessage>
        <NoticeMessage v-if="message.held" class="mb-2" variant="warning">
          <span v-if="me.id === message.held.id">
            You held this {{ timeago(message.held.timestamp) }}. Others can't
            release it or act on it.
          </span>
          <span v-else>
            Held by
            <strong>
              <ExternalLink :href="'mailto:' + message.held.email">{{
                message.held.name
              }}</ExternalLink>
            </strong>
            {{ timeago(message.held.timestamp) }}. Please check with them if you
            think it should be released.
          </span>
        </NoticeMessage>
        <div
          class="rounded bg-white p-2 font-weight-bold border border-warning mb-2"
        >
          <ChatMessage
            :id="message.id"
            :chatid="message.chatid"
            :pov="message.touser.id"
            last
            highlight-emails
            is-m-t
          />

          <!-- OLD ChatMessage :chatid="message.chatroom.id" :chatmessage="message" :otheruser="message.fromuser" last highlight-emails :id="message.id" /-->
          <!-- :chatusers="chatusers" -->
        </div>
        <ModSpammer v-if="message.touser.spammer" :user="message.touser" />
        <div class="d-flex justify-content-between flex-wrap">
          <span>
            {{ timeago(message.date) }}
          </span>
          <span v-if="message.widerchatreview" class="text-danger">
            <v-icon icon="info-circle" />
            <em>Quicker Chat Review</em>
          </span>
          <span v-if="message.group">
            <v-icon icon="info-circle" /> {{ message.touser.displayname }} is on
            {{ message.group.namedisplay }}
            <span v-if="!message.widerchatreview">
              which you mod.
              <b-button
                :to="
                  '/members/approved/' +
                  message.group.id +
                  '/' +
                  message.touser.id
                "
                variant="link"
                class="p-0 border-0 align-top"
              >
                Go to membership
              </b-button>
            </span>
          </span>
          <span>
            <v-icon icon="hashtag" class="text-muted" scale="0.75" />{{
              message.id
            }}
          </span>
        </div>
        <ModSpammer v-if="message.fromuser.spammer" :user="message.fromuser" />
        <div class="d-flex justify-content-around">
          <div v-if="!message.widerchatreview">
            <span>
              <!-- eslint-disable-next-line -->
              <v-icon icon="info-circle" /> {{ message.fromuser.displayname }} is
              <span>
                <span v-if="message.groupfrom"
                  >on {{ message.groupfrom.namedisplay }}, which you mod. </span
                ><span v-else>not on any groups which you actively mod. </span>
                <b-button
                  v-if="message.groupfrom"
                  :to="
                    '/members/approved/' +
                    message.groupfrom.id +
                    '/' +
                    message.fromuser.id
                  "
                  variant="link"
                  class="p-0 border-0 align-top"
                >
                  Go to membership
                </b-button>
              </span>
            </span>
          </div>
        </div>
      </b-card-body>
      <b-card-footer>
        <div class="d-flex flex-wrap justify-content-start">
          <template v-if="!message.widerchatreview">
            <ModChatViewButton :id="message.chatid" :pov="message.touser.id" />
            <b-button
              v-if="message.held && me.id === message.held.id"
              variant="warning"
              class="mr-2 mb-1"
              @click="release"
            >
              <v-icon icon="play" /> Release
            </b-button>
            <SpinButton
              v-if="!message.held || me.id === message.held.id"
              icon-name="exclamation-triangle"
              label="Add Mod Message"
              variant="warning"
              class="mr-2 mb-1"
              @handle="modnote"
            />
            <SpinButton
              v-if="!message.held || me.id === message.held.id"
              icon-name="eraser"
              label="Remove highlighted emails"
              variant="warning"
              class="mr-2 mb-1"
              @handle="redactEmails"
            />
          </template>
          <SpinButton
            v-if="!message.held || me.id === message.held.id"
            icon-name="check"
            label="Approve - Not Spam"
            spinclass="text-white"
            variant="primary"
            class="mr-2 mb-1"
            @handle="approve"
          />
          <template v-if="!message.widerchatreview">
            <SpinButton
              v-if="!message.held"
              icon-name="check"
              label="Approve and whitelist"
              spinclass="text-white"
              variant="primary"
              class="mr-2 mb-1"
              confirm
              @handle="whitelist"
            />
            <SpinButton
              v-if="!message.held || me.id === message.held.id"
              icon-name="pause"
              label="Hold"
              variant="warning"
              class="mr-2 mb-1"
              @handle="hold"
            />
            <SpinButton
              v-if="!message.held || me.id === message.held.id"
              icon-name="trash-alt"
              label="Delete"
              variant="danger"
              class="mr-2 mb-1"
              confirm
              @handle="reject"
            />
            <SpinButton
              v-if="!message.held || me.id === message.held.id"
              icon-name="ban"
              label="Spam"
              variant="danger"
              class="mr-2 mb-1"
              confirm
              @handle="reject"
            />
          </template>
        </div>
      </b-card-footer>
    </b-card>
    <ModChatNoteModal
      v-if="showModChatNoteModal && message"
      ref="modnote"
      :chatid="message.chatid"
      @hidden="showModChatNoteModal = false"
    />
    <ModMessageEmailModal
      v-if="showOriginal"
      :id="message.bymailid || message.msgid"
      @hidden="showOriginal = false"
    />
  </div>
</template>
<script>
import { useChatStore } from '~/stores/chat'
import { useMe } from '~/composables/useMe'

// We need an id for the store.  The null value is a special case used just for retrieving chat review messages.
// const REVIEWCHAT = null

export default {
  props: {
    id: {
      type: Number,
      required: true,
    },
    message: {
      type: Object,
      required: true,
    },
  },
  emits: ['reload'],
  setup() {
    const chatStore = useChatStore()
    const { me } = useMe()
    return {
      me,
      chatStore,
    }
  },
  data: function () {
    return {
      showOriginal: false,
      showModChatNoteModal: false,
    }
  },
  computed: {
    chatusers() {
      // This is a bit expensive in the store, so it's better to get it here and pass it down than potentially to
      // get it in each message we render.
      return this.chatStore.getUsers(this.id)
    },
    reviewreason() {
      let ret = null

      if (this.message && this.message.reviewreason) {
        switch (this.message.reviewreason) {
          case 'Last': {
            ret = 'Earlier message was held for review, so this one is too.'
            break
          }
          case 'Force': {
            ret = 'Possible spam.'
            break
          }
          case 'Fully': {
            ret = 'This member is set to have all chat messages reviewed.'
            break
          }
          case 'TooMany': {
            ret =
              'This member has sent a lot of chat messages recently, which can indicate scammers/spammers.'
            break
          }
          case 'User': {
            ret =
              'The member has been flagged for review, so this message was flagged too.  Please check the member logs for more info.'
            break
          }
          case 'UnknownMessage': {
            ret =
              'This is a reply to a post we cannot find.  Sometimes that is a spammer using old data.'
            break
          }
          case 'Spam': {
            ret =
              "This message failed spam checks, but we don't have any more information about why."
            break
          }
          case 'CountryBlocked': {
            ret = 'It comes from a country we are blocking.'
            break
          }
          case 'IPUsedForDifferentUsers': {
            ret =
              'The same IP address has been used for a lot of different users.'
            break
          }
          case 'IPUsedForDifferentGroups': {
            ret =
              ' The same IP address has been used for a lot of different groups.'
            break
          }
          case 'SubjectUsedForDifferentGroups': {
            ret =
              'The same subject line has been used on a lot of different groups.'
            break
          }
          case 'SpamAssassin': {
            ret = 'The SpamAssassin filter thinks it might be spam.'
            break
          }
          case 'Greetings spam': {
            ret = 'It looks like a particular kind of greetings spam.'
            break
          }
          case 'Referenced known spammer': {
            ret = 'It refers to a known spammer.'
            break
          }
          case 'Known spam keyword': {
            ret = 'It uses a known spam keyword.'
            break
          }
          case 'URL on DBL': {
            ret = 'It refers to a suspicious website.'
            break
          }
          case 'BulkVolunteerMail': {
            ret = 'They have mailed many volunteer@ emails.'
            break
          }
          case 'UsedOurDomain': {
            ret = 'They have used our web domain in a suspicious way.'
            break
          }
          case 'WorryWord': {
            ret = 'It uses a known Worry Word.'
            break
          }
          case 'Script': {
            ret = 'It contains a suspicious <script> tag.'
            break
          }
          case 'Link': {
            ret = 'It contains a link.'
            break
          }
          case 'Money': {
            ret = 'It looks like it refers to money.'
            break
          }
          case 'Email': {
            ret = 'It contains an email address.'
            break
          }
          case 'Language': {
            ret =
              'It might not be in English, so needs checking via Google Translate.'
            break
          }
          case 'SameImage': {
            ret =
              'Same image sent many times recently, which sometimes indicates spam.'
            break
          }
          case 'DodgyImage': {
            ret = 'Suspect text or email found in image, so needs checking.'
            break
          }
          default: {
            ret = this.message.reviewreason
          }
        }
      }

      return ret
    },
  },
  methods: {
    reload() {
      this.$emit('reload')
    },
    async release() {
      await this.$api.chat.sendMT({ id: this.message.id, action: 'Release' })
      this.$emit('reload')
    },
    async hold(callback) {
      await this.$api.chat.sendMT({ id: this.message.id, action: 'Hold' })
      this.$emit('reload')
      callback()
    },
    async approve(callback) {
      await this.$api.chat.sendMT({ id: this.message.id, action: 'Approve' })
      this.$emit('reload')
      callback()
    },
    async reject(callback) {
      await this.$api.chat.sendMT({ id: this.message.id, action: 'Reject' })
      // this.chatStore.removeMessageMT(REVIEWCHAT,this.message.id)
      // console.log('reject',this.message.id, this.chatStore.messages[REVIEWCHAT])
      this.$emit('reload')
      callback()
    },
    async whitelist(callback) {
      await this.$api.chat.sendMT({
        id: this.message.id,
        action: 'ApproveAllFuture',
      })
      this.$emit('reload')
      callback()
    },
    modnote(callback) {
      this.showModChatNoteModal = true
      this.$refs.modnote?.show()
      callback()
    },
    async redactEmails(callback) {
      await this.$api.chat.sendMT({ id: this.message.id, action: 'Redact' })
      this.$emit('reload')
      callback()
    },
  },
}
</script>
<style scoped lang="scss">
//@import 'color-vars';

.highlight {
  color: $color-blue--base;
  background-color: initial;
}
</style>
