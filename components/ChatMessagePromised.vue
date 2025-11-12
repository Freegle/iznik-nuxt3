<template>
  <div class="clearfix">
    <div v-if="chatmessage?.userid != myid" class="media">
      <div v-if="!refmsg">
        This chat message refers to a post (<v-icon
          icon="hashtag"
          class="text-muted fa-0-8x"
        />{{ chatmessage.refmsgid }}) which has been deleted.
      </div>
      <b-card v-else border-variant="success" class="ml-2">
        <b-card-title>
          <nuxt-link
            no-prefetch
            :to="
              (messageIsFromCurrentUser ? '/mypost/' : '/message/') + refmsgid
            "
          >
            <b-img
              v-if="refmsg?.attachments?.length > 0"
              class="float-end ml-1"
              rounded
              thumbnail
              generator-unable-to-provide-required-alt=""
              lazy
              :src="refmsg.attachments[0].paththumb"
              width="70px"
              @error="brokenImage"
            />
          </nuxt-link>
          <ProfileImage
            :image="otheruser.profile.paththumb"
            class="mr-1 mb-1 mt-1 inline"
            is-thumbnail
            size="sm"
          />
          <span class="small black">Good news! You've been promised this:</span>
          <br />
          <nuxt-link
            no-prefetch
            :to="
              (messageIsFromCurrentUser ? '/mypost/' : '/message/') + refmsgid
            "
          >
            <h4>
              {{ refmsg?.subject }}
            </h4>
          </nuxt-link>
          <AddToCalendar
            v-if="tryst?.calendarLink"
            :calendar-link="tryst.calendarLink"
            class="mr-2"
          />
          <notice-message
            v-if="refmsg.outcomes?.length || refmsg.deleted"
            class="mt-2 mb-2"
          >
            <v-icon icon="info-circle" />
            <span v-if="refmsg.type === 'Offer'">
              This is no longer available.
            </span>
            <span v-else> They are no longer looking for this. </span>
          </notice-message>
        </b-card-title>
        <b-card-text>
          <div :class="emessage ? 'media-body chatMessage' : 'media-body'">
            <span>
              <span
                v-if="
                  chatmessage.secondsago < 60 ||
                  chatmessage.id > chat.lastmsgseen
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
          </div>
        </b-card-text>
      </b-card>
    </div>
    <div v-else class="media float-end">
      <div v-if="!refmsg">
        This chat message refers to a post (<v-icon
          icon="hashtag"
          class="text-muted fa-0-8x"
        />{{ chatmessage.refmsgid }}) which has been deleted.
      </div>
      <b-card v-else border-variant="success">
        <b-card-title>
          <nuxt-link
            no-prefetch
            :to="
              (messageIsFromCurrentUser ? '/mypost/' : '/message/') + refmsgid
            "
          >
            <b-img
              v-if="refmsg && refmsg.attachments?.length > 0"
              class="float-end"
              rounded
              thumbnail
              generator-unable-to-provide-required-alt=""
              lazy
              :src="refmsg.attachments[0].paththumb"
              width="70px"
              @error="brokenImage"
            />
          </nuxt-link>
          <div class="d-flex justify-content-start align-items-center">
            <ProfileImage
              :image="me.profile.path"
              class="mr-1 inline"
              is-thumbnail
              size="sm"
            />
            <div class="small black">
              You promised <strong>{{ otheruser.displayname }}</strong
              >:
            </div>
          </div>
          <nuxt-link
            no-prefetch
            :to="
              (messageIsFromCurrentUser ? '/mypost/' : '/message/') + refmsgid
            "
            class="nodecor"
          >
            <h4>
              {{ refmsg?.subject }}
            </h4>
          </nuxt-link>
          <p v-if="tryst?.arrangedfor" class="small text-info">
            Handover arranged for
            <strong
              ><DateFormatted :value="tryst.arrangedfor" format="weekdaytime"
            /></strong>
          </p>
          <div
            v-if="refmsg"
            class="d-flex mt-1 flex-wrap justify-content-between"
          >
            <template v-if="tryst">
              <AddToCalendar
                v-if="tryst?.calendarLink"
                :calendar-link="tryst.calendarLink"
                class="mr-2 mb-1"
              />
              <b-button
                v-if="refmsg.promisecount && refmsg.availablenow"
                variant="secondary"
                class="mr-2 mb-1"
                @click="changeTime"
              >
                <v-icon icon="pen" />
                Change time
              </b-button>
            </template>
            <template v-else-if="refmsg.promisecount && refmsg.availablenow">
              <b-button
                variant="secondary"
                class="mr-2 mb-1"
                @click="changeTime"
              >
                <v-icon icon="pen" />
                Set time
              </b-button>
            </template>
            <b-button
              v-if="refmsg.promisecount && refmsg.availablenow"
              variant="warning"
              class="align-middle mr-2 mb-1"
              @click="unpromise"
            >
              Unpromise
            </b-button>
            <b-button
              v-if="refmsg.availablenow"
              variant="primary"
              class="mr-1 mb-1"
              @click="outcome('Taken')"
            >
              Mark as TAKEN
            </b-button>
          </div>
          <PromiseModal
            v-if="showPromise"
            :messages="[refmsg]"
            :selected-message="refmsgid"
            :users="otheruser ? [otheruser] : []"
            :selected-user="otheruser ? otheruser.id : null"
            @hidden="showPromise = false"
          />
        </b-card-title>
        <b-card-text>
          <div :class="emessage ? 'media-body chatMessage' : 'media-body'">
            <span>
              <span
                v-if="
                  chatmessage.secondsago < 60 ||
                  chatmessage.id > chat.lastmsgseen
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
          </div>
          <p v-if="!refmsg?.availablenow" class="text-muted">
            This has now been taken.
          </p>
        </b-card-text>
      </b-card>
    </div>
    <RenegeModal
      v-if="showRenege && refmsgid"
      :messages="[refmsgid]"
      :selected-message="refmsgid"
      :users="[otheruser]"
      :selected-user="otheruser.id"
      @hide="fetchMessages"
      @hidden="showRenege = false"
    />
    <OutcomeModal
      v-if="showOutcome && refmsgid"
      :id="refmsgid"
      :taken-by="takenBy"
      :type="outcomeType"
      @outcome="fetchMessage"
      @hidden="showOutcome = false"
    />
  </div>
</template>
<script setup>
import { ref, defineAsyncComponent } from 'vue'
import DateFormatted from './DateFormatted'
import { useTrystStore } from '~/stores/tryst'
import { fetchOurOffers } from '~/composables/useThrottle'
import { useChatStore } from '~/stores/chat'
import {
  fetchReferencedMessage,
  useChatMessageBase,
} from '~/composables/useChat'
import { useMessageStore } from '~/stores/message'
import AddToCalendar from '~/components/AddToCalendar'
import ProfileImage from '~/components/ProfileImage'

const OutcomeModal = defineAsyncComponent(() =>
  import('~/components/OutcomeModal')
)

const RenegeModal = defineAsyncComponent(() => import('./RenegeModal'))
const PromiseModal = defineAsyncComponent(() =>
  import('~/components/PromiseModal')
)

const props = defineProps({
  chatid: {
    type: Number,
    required: true,
  },
  id: {
    type: Number,
    required: true,
  },
  last: {
    type: Boolean,
    required: false,
    default: false,
  },
  pov: {
    type: Number,
    required: false,
    default: null,
  },
  highlightEmails: {
    type: Boolean,
    required: false,
    default: false,
  },
})

// Data properties
const showRenege = ref(false)
const showOutcome = ref(false)
const outcomeType = ref(null)
const showPromise = ref(false)

// Stores
const trystStore = useTrystStore()
const chatStore = useChatStore()
const messageStore = useMessageStore()

// Setup
await trystStore.fetch()
await fetchReferencedMessage(props.chatid, props.id)

// Use the chat base composable
const {
  chat,
  chatmessage,
  emessage,
  messageIsFromCurrentUser,
  refmsgid,
  refmsg,
  me,
  myid,
  otheruser,
  brokenImage,
  fetchMessage,
} = useChatMessageBase(props.chatid, props.id, props.pov)

if (refmsgid.value) {
  useMessageStore().fetch(refmsgid.value)
}

// Component-specific computed properties
const tryst = computed(() => {
  return otheruser.value ? trystStore?.getByUser(otheruser.value.id) : null
})

const takenBy = computed(() => {
  let ret = null

  if (otheruser.value) {
    ret = otheruser.value
    ret.userid = otheruser.value.id
    ret.count = 1
  }

  return ret
})

// Methods
function unpromise() {
  showRenege.value = true
  fetchOurOffers()
}

function changeTime() {
  showPromise.value = true
}

function fetchMessages() {
  chatStore.fetchMessages(chatmessage.value.chatid)
}

async function outcome(type) {
  await messageStore.fetch(refmsgid.value)

  showOutcome.value = true
  outcomeType.value = type
}
</script>
<style scoped lang="scss">
.chatMessage {
  border: 1px solid $color-gray--light;
  border-radius: 10px;
  padding-top: 2px;
  padding-bottom: 2px;
  padding-left: 4px;
  padding-right: 2px;
  word-wrap: break-word;
  line-height: 1.5;
}
</style>
