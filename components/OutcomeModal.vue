<template>
  <b-modal
    ref="modal"
    scrollable
    size="lg"
    no-stacking
    dialog-class="maxWidth"
    @hidden="onHide"
  >
    <template #title>
      <h3 class="d-flex justify-content-between">
        {{ message.subject }}
        <div>
          <b-badge
            v-if="message.availablenow > 1"
            variant="info"
            class="lg ml-2"
          >
            {{ left }} left
          </b-badge>
        </div>
      </h3>
    </template>
    <template #default>
      <NoticeMessage v-if="type === 'Withdrawn'" variant="info">
        <p>
          If everything worked out OK, then use
          <strong
            >Mark as <span v-if="message.type === 'Offer'">TAKEN</span
            ><span v-else>RECEIVED</span></strong
          >
          to let us know.
        </p>
        <div v-if="message.type === 'Offer'">
          <p>
            Only use <strong>Withdraw</strong> if you didn't manage to pass on
            this item on Freegle, and it's no longer available.
          </p>
        </div>
        <div v-else>
          <p>
            Only use <strong>Withdraw</strong> if you are no longer looking for
            this item.
          </p>
        </div>
      </NoticeMessage>
      <div v-if="type === 'Taken'">
        <OutcomeBy
          :availablenow="
            typeof message.availablenow === 'number' ? message.availablenow : 1
          "
          :type="type"
          :msgid="message.id"
          :left="left"
          :taken-by="takenBy"
          :choose-error="chooseError"
          @took-users="tookUsers = $event"
        />
      </div>
      <div v-if="showCompletion">
        <div
          v-if="type === 'Taken' && tookUsers?.length && otherRepliers?.length"
        >
          <label class="strong">
            Message for other people who replied (optional):
          </label>
          <b-form-textarea
            v-model="completionMessage"
            :rows="3"
            :max-rows="6"
            class="mt-1"
            placeholder="e.g. Thanks for the interest. Sorry, this went to someone else."
          />
          <p class="mt-1 text-muted small">
            <v-icon icon="lock" /> We'll send this same message privately in
            Chat to each other freegler who replied to your post.
          </p>
        </div>
        <hr class="mb-0" />
        <div>
          <label class="mt-3 strong">
            How do you feel about freegling just now?
          </label>
          <b-button-group class="d-none d-md-block mt-1">
            <b-button
              :pressed="happiness === 'Happy'"
              :variant="happiness === 'Happy' ? 'info' : 'primary'"
              size="lg"
              class="shadow-none"
              @click="happiness = 'Happy'"
            >
              <v-icon icon="smile" scale="2" /> Happy
            </b-button>
            <b-button
              :pressed="happiness === 'Fine'"
              :variant="happiness === 'Fine' ? 'info' : 'white'"
              size="lg"
              class="shadow-none"
              @click="happiness = 'Fine'"
            >
              <v-icon icon="meh" scale="2" color="grey" /> Fine
            </b-button>
            <b-button
              :pressed="happiness === 'Unhappy'"
              :variant="happiness === 'Unhappy' ? 'info' : 'danger'"
              size="lg"
              class="shadow-none"
              @click="happiness = 'Unhappy'"
            >
              <v-icon icon="frown" scale="2" /> Sad
            </b-button>
          </b-button-group>
          <b-button-group class="d-block d-md-none">
            <b-button
              :pressed="happiness === 'Happy'"
              :variant="happiness === 'Happy' ? 'info' : 'primary'"
              size="md"
              class="shadow-none"
              @click="happiness = 'Happy'"
            >
              <v-icon icon="smile" scale="2" /> Happy
            </b-button>
            <b-button
              :pressed="happiness === 'Fine'"
              :variant="happiness === 'Fine' ? 'info' : 'white'"
              size="md"
              class="shadow-none"
              @click="happiness = 'Fine'"
            >
              <v-icon icon="meh" scale="2" color="grey" /> Fine
            </b-button>
            <b-button
              :pressed="happiness === 'Unhappy'"
              :variant="happiness === 'Unhappy' ? 'info' : 'danger'"
              size="md"
              class="shadow-none"
              @click="happiness = 'Unhappy'"
            >
              <v-icon icon="frown" scale="2" /> Sad
            </b-button>
          </b-button-group>
        </div>
        <NoticeMessage
          v-if="happiness !== null && type === 'Taken'"
          class="mt-2"
        >
          You can use the thumbs up/down buttons above to say how things went
          with other freeglers.
        </NoticeMessage>
        <div>
          <label class="mt-4 strong"> It went well/badly because: </label>
          <b-form-textarea
            v-model="comments"
            rows="3"
            max-rows="6"
            class="border-primary mt-1"
          />
          <div class="text-muted small mt-2">
            <span
              v-if="
                happiness === null ||
                happiness === 'Happy' ||
                happiness === 'Fine'
              "
            >
              <v-icon icon="globe-europe" /> Your comments may be public
            </span>
            <span v-if="happiness === 'Unhappy'">
              <v-icon icon="lock" /> Your comments will only go to our
              volunteers
            </span>
          </div>
        </div>
      </div>
      <NoticeMessage
        v-if="message.availableinitially > 1 && left > 0"
        variant="warning"
      >
        There will still be some left. If you're giving them all away now,
        please adjust the numbers above.
      </NoticeMessage>
    </template>
    <template #footer>
      <div>
        <div class="d-flex flex-wrap justify-content-end">
          <b-button variant="secondary" @click="cancel"> Cancel </b-button>
          <SpinButton
            variant="primary"
            name="save"
            :label="buttonLabel"
            class="ml-2"
            spinclass="text-white"
            :disabled="type === 'Taken' && !tookUsers.length"
            @handle="submit"
          />
        </div>
      </div>
    </template>
  </b-modal>
</template>

<script>
import { useMessageStore } from '../stores/message'
import { useChatStore } from '../stores/chat'
import OutcomeBy from './OutcomeBy'
import SpinButton from './SpinButton'
import NoticeMessage from '~/components/NoticeMessage'
import { useModal } from '~/composables/useModal'

export default {
  components: { NoticeMessage, SpinButton, OutcomeBy },
  props: {
    id: {
      type: Number,
      required: true,
    },
    takenBy: {
      type: Object,
      required: false,
      default: null,
    },
    type: {
      type: String,
      required: false,
      default: null,
    },
  },
  emit: ['hidden'],
  setup() {
    const messageStore = useMessageStore()
    const chatStore = useChatStore()

    const { modal, hide } = useModal()

    return { messageStore, chatStore, modal, hide }
  },
  data() {
    return {
      happiness: null,
      comments: null,
      tookUsers: [],
      selectedUser: null,
      chooseError: false,
      completionMessage: null,
    }
  },
  computed: {
    message() {
      return this.messageStore?.byId(this.id)
    },
    left() {
      let left = this.message.availablenow ? this.message.availablenow : 1

      for (const u of this.tookUsers) {
        if (u.userid >= 0) {
          left -= u.count
        }
      }

      return left
    },
    showCompletion() {
      // We show for taken/received only when there are none left.
      return (
        this.type === 'Withdrawn' ||
        this.message.availableinitially === 1 ||
        this.left === 0
      )
    },
    otherRepliers() {
      const ret = []

      if (this.message?.replies) {
        this.message.replies.forEach((u) => {
          if (u.userid > 0) {
            let found = false

            for (const t of this.tookUsers) {
              if (t.userid === u.userid) {
                found = true
                break
              }
            }

            if (!found) {
              ret.push({
                userid: u.userid,
                displayname: u.displayname,
              })
            }
          }
        })
      }

      return ret
    },
    submitDisabled() {
      const ret =
        this.type === 'Taken' &&
        this.message.availableinitially === 1 &&
        this.left === 1
      return ret
    },
    groupid() {
      let ret = null

      if (this.message && this.message.groups && this.message.groups.length) {
        ret = this.message.groups[0].groupid
      }

      return ret
    },
    buttonLabel() {
      if (!this.type) {
        return 'Submit'
      } else if (this.type === 'Withdrawn') {
        return 'Withdraw'
      } else {
        return 'Mark as ' + this.type.toUpperCase()
      }
    },
  },
  methods: {
    async submit() {
      let complete = false
      this.chooseError = false

      if (this.submitDisabled) {
        this.chooseError = true
      } else {
        if (this.type === 'Withdrawn' || this.type === 'Received') {
          complete = true
        } else {
          complete = this.left === 0

          for (const u of this.tookUsers) {
            if (u.count > 0) {
              await this.messageStore.addBy(
                this.message.id,
                u.userid > 0 ? u.userid : null,
                u.count
              )
            } else {
              await this.messageStore.removeBy(
                this.message.id,
                u.userid > 0 ? u.userid : null
              )
            }
          }
        }

        if (complete) {
          // The post is being taken/received.
          await this.messageStore.update({
            action: 'Outcome',
            id: this.id,
            outcome: this.type,
            happiness: this.happiness,
            comment: this.comments,
            message: this.completionMessage,
          })

          this.hide()
        }
      }
    },
    onHide() {
      // We're having trouble capturing events from this modal, so use root as a bus.
      this.$bus.$emit('outcome', {
        groupid: this.groupid,
        outcome: this.type,
      })

      this.tookUsers = []
      this.happiness = null
      this.$emit('hidden')
    },
    cancel() {
      this.tookUsers = []
      this.happiness = null
      this.hide()
    },
  },
}
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';

@include media-breakpoint-down(md) {
  :deep(.maxWidth) {
    max-width: calc(100vw - 16px);
  }
}

:deep(.btn-group .btn) {
  border: 1px solid black;
}
</style>
