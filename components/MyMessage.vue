<template>
  <div v-if="!hide && message">
    <div v-if="showOld || !message.outcomes || !message.outcomes.length">
      <b-card
        no-body
        class="mb-1 bnuorder"
        :border-variant="expanded ? 'primary' : 'success'"
      >
        <b-card-header header-tag="header" class="p-1" role="tab">
          <div
            :v-b-toggle="'mypost-' + message.id"
            class="bg-white p-2 clickme"
            @click="toggle"
          >
            <div class="d-flex justify-content-between w-100">
              <div class="d-flex flex-column w-100">
                <h3 class="text-wrap flex-shrink-2 mr-2 mb-0">
                  <span v-if="message.isdraft">
                    {{ message.type.toUpperCase() }}: {{ message.subject }} ({{
                      message.area.name
                    }}
                    {{ message.postcode.name }})
                  </span>
                  <span v-else>
                    {{ message.subject }}
                  </span>
                  <b-badge v-if="message.availableinitially > 1" variant="info">
                    {{ message.availablenow ? message.availablenow : '0' }} left
                  </b-badge>
                  <span v-if="rejected" class="text-danger">
                    <v-icon icon="exclamation-triangle" scale="2" />
                  </span>
                </h3>
                <div
                  v-for="group in message.groups"
                  :key="'message-' + message.id + '-' + group.groupid"
                  class="small text-muted text-wrap"
                >
                  {{ timeago(group.arrival) }} on
                  <nuxt-link
                    v-if="group.groupid in groups"
                    no-prefetch
                    :to="'/explore/' + groups[group.groupid].exploreLink"
                    :title="
                      'Click to view ' + groups[group.groupid].namedisplay
                    "
                  >
                    {{ groups[group.groupid].namedisplay }}
                  </nuxt-link>
                  &nbsp;
                  <b-button
                    variant="link"
                    :to="'/message/' + message.id"
                    size="xs"
                    class="text-faded decornone"
                  >
                    #{{ message.id }}
                  </b-button>
                </div>
              </div>
              <span>
                <b-button v-if="!expand" class="ml-1" variant="secondary">
                  <v-icon v-if="!expanded" icon="caret-down" />
                  <v-icon v-else icon="caret-up" />
                  <template #button-content />
                </b-button>
              </span>
            </div>
            <div class="d-flex flex-wrap">
              <div v-if="message.replycount > 0" class="mr-2 mt-1">
                <b-badge variant="info">
                  <v-icon icon="user" class="fa-fw" />
                  {{
                    message.replycount === 1
                      ? '1 reply'
                      : message.replycount + ' replies'
                  }}
                </b-badge>
              </div>
              <div v-if="message.outcomes?.length > 0" class="mr-2 mt-1">
                <b-badge v-if="taken" variant="success">
                  <v-icon icon="check" class="fa-fw" /> Taken
                </b-badge>
                <b-badge v-if="received" variant="success">
                  <v-icon icon="check" class="fa-fw" /> Received
                </b-badge>
                <b-badge v-if="withdrawn" variant="secondary">
                  <v-icon icon="check" class="fa-fw" /> Withdrawn
                </b-badge>
              </div>
              <div v-else-if="message.promisecount > 0" class="mr-2">
                <b-badge
                  v-if="promisedTo?.length === 0"
                  variant="success"
                  class="mt-1"
                >
                  <v-icon icon="handshake" class="fa-fw" /> Promised
                </b-badge>
                <div v-else class="ml-1 text-info">
                  <MyMessagePromisedTo
                    v-for="p in promisedTo"
                    :id="message.id"
                    :key="'promised-' + p.id"
                    :promise="p"
                    :replyusers="replyusers"
                  />
                </div>
              </div>
              <div v-if="unseen > 0" class="mr-2">
                <b-badge variant="danger">
                  <v-icon icon="comments" class="fa-fw" /> {{ unseen }} unread
                </b-badge>
              </div>
            </div>
            <hr class="" />
            <div class="d-flex justify-content-between flex-wrap mt-1">
              <b-button
                v-if="rejected && message.location && message.item"
                variant="warning"
                class="mr-2 mb-1"
                @click="repost"
              >
                <v-icon class="d-none d-sm-inline" icon="pen" /> Edit and Resend
              </b-button>
              <b-button
                v-if="rejected && !withdrawn"
                variant="secondary"
                class="mr-2 mb-1"
                @click="outcome('Withdrawn', $event)"
              >
                <v-icon class="d-none d-sm-inline" icon="trash-alt" /> Withdraw
              </b-button>
              <b-button
                v-if="!rejected && message.type === 'Offer' && !taken"
                variant="primary"
                class="mr-2 mb-1"
                @click="outcome('Taken', $event)"
              >
                <v-icon class="d-none d-sm-inline" icon="check" /> Mark as TAKEN
              </b-button>
              <b-button
                v-if="!rejected && message.type === 'Wanted' && !received"
                variant="primary"
                class="mr-2 mb-1"
                @click="outcome('Received', $event)"
              >
                <v-icon class="d-none d-sm-inline" icon="check" /> Mark as
                RECEIVED
              </b-button>
              <b-button
                v-if="!rejected"
                variant="secondary"
                class="mr-2 mb-1"
                @click="edit"
              >
                <v-icon class="d-none d-sm-inline" icon="pen" /> Edit
              </b-button>
              <b-button
                v-if="!rejected && !taken && !received && !withdrawn"
                variant="secondary"
                class="mr-2 mb-1"
                @click="outcome('Withdrawn', $event)"
              >
                <v-icon class="d-none d-sm-inline" icon="trash-alt" /> Withdraw
              </b-button>
              <b-button
                v-if="
                  !rejected &&
                  message.canrepost &&
                  message.location &&
                  message.item
                "
                variant="secondary"
                class="mr-2 mb-1"
                @click="repost"
              >
                <v-icon class="d-none d-sm-inline" icon="sync" /> Repost
              </b-button>
              <b-button
                v-else-if="
                  !rejected &&
                  !taken &&
                  !received &&
                  message.canrepostat &&
                  message.location &&
                  message.item
                "
                variant="secondary"
                disabled
                class="mr-2 mb-1"
                title="You will be able to repost this soon"
              >
                <v-icon class="d-none d-sm-inline" icon="sync" /> Repost
                <span class="small">{{ timeago(message.canrepostat) }}</span>
              </b-button>
              <b-button
                v-if="!rejected"
                variant="secondary"
                title="Share"
                class="mr-2 mb-1"
                @click="share"
              >
                <v-icon class="d-none d-sm-inline" icon="share-alt" /> Share
              </b-button>
            </div>
          </div>
        </b-card-header>
        <b-collapse
          :id="'mypost-' + message.id"
          v-model="expanded"
          role="tabpanel"
          @show="expanded = true"
          @hidden="expanded = false"
        >
          <div v-if="expanded">
            <b-card-body class="p-2">
              <b-card-text>
                <notice-message v-if="rejected" class="mb-3" variant="warning">
                  <v-icon icon="exclamation-triangle" scale="2" /> This post has
                  not been accepted and is not public yet.
                </notice-message>
                <div class="d-flex justify-content-between">
                  <div>
                    <span class="prewrap">
                      <read-more
                        v-if="message?.textbody"
                        :text="message.textbody"
                        :max-chars="maxChars"
                        class="nopara"
                      />
                    </span>
                  </div>
                  <div>
                    <div
                      v-if="!broken && message.attachments?.length > 0"
                      class="clickme position-relative"
                      @click="showPhotos"
                    >
                      <div class="small">
                        <b-badge
                          v-if="message.attachments.length > 1"
                          class="photobadge"
                          variant="primary"
                        >
                          {{ message.attachments.length }}
                          <v-icon icon="camera" />
                        </b-badge>
                      </div>
                      <b-img
                        lazy
                        rounded
                        thumbnail
                        class="attachment p-0 square mb-1"
                        generator-unable-to-provide-required-alt=""
                        title="Item picture"
                        :src="message.attachments[0].paththumb"
                        @error="brokenImage"
                      />
                    </div>
                  </div>
                </div>
                <hr />
                <table
                  v-if="replies?.length > 0"
                  class="table table-borderless table-striped mb-0"
                >
                  <tbody>
                    <tr v-for="reply in replies" :key="'reply-' + reply.id">
                      <MyMessageReply
                        :reply="reply"
                        :chats="chats"
                        :message="message"
                        :taken="taken"
                        :received="received"
                        :withdrawn="withdrawn"
                        :closest="reply.userid === closestUser"
                        :best="reply.userid === bestRatedUser"
                        :quickest="reply.userid === quickestUser"
                      />
                    </tr>
                  </tbody>
                </table>
                <p v-else class="text-muted">
                  No replies yet.
                  <span v-if="willAutoRepost"
                    >Will auto-repost {{ timeago(message.canrepostat) }}.</span
                  >
                </p>
              </b-card-text>
            </b-card-body>
          </div>
        </b-collapse>
      </b-card>
      <MessagePhotosModal
        v-if="expanded && message.attachments?.length"
        :id="message.id"
        ref="photoModal"
      />
    </div>
    <OutcomeModal
      v-if="showOutcomeModal"
      :id="id"
      ref="outcomeModal"
      @outcome="hide = true"
    />
    <MessageShareModal
      v-if="showShareModal"
      :id="message.id"
      ref="shareModal"
    />
    <MessageEditModal v-if="showEditModal" :id="id" ref="editModal" />
    <PromiseModal
      v-if="showPromiseModal"
      ref="promiseModal"
      :messages="[message]"
      :selected-message="message.id"
      :users="replyusers"
    />
  </div>
</template>
<script>
import ReadMore from 'vue-read-more3/src/ReadMoreComponent'
import axios from 'axios'
import dayjs from 'dayjs'
import { useComposeStore } from '../stores/compose'
import { useMessageStore } from '../stores/message'
import { useChatStore } from '../stores/chat'
import { useGroupStore } from '../stores/group'
import { useUserStore } from '../stores/user'
import { useTrystStore } from '../stores/tryst'
import { useRouter } from '#imports'
import MessagePhotosModal from '~/components/MessagePhotosModal'
import MyMessagePromisedTo from '~/components/MyMessagePromisedTo'
import PromiseModal from '~/components/PromiseModal'
const MyMessageReply = () => import('./MyMessageReply.vue')
const MessageShareModal = () => import('./MessageShareModal')
const OutcomeModal = () => import('./OutcomeModal')
const MessageEditModal = () => import('./MessageEditModal')
const NoticeMessage = () => import('~/components/NoticeMessage')

export default {
  components: {
    MyMessagePromisedTo,
    MessagePhotosModal,
    PromiseModal,
    OutcomeModal,
    MessageShareModal,
    MyMessageReply,
    MessageEditModal,
    NoticeMessage,
    ReadMore,
  },

  props: {
    id: {
      type: Number,
      required: true,
    },
    showOld: {
      type: Boolean,
      required: true,
    },
    expand: {
      type: Boolean,
      required: false,
      default: false,
    },
    action: {
      type: String,
      required: false,
      default: null,
    },
  },
  async setup(props) {
    const messageStore = useMessageStore()
    const chatStore = useChatStore()
    const groupStore = useGroupStore()
    const userStore = useUserStore()
    const trystStore = useTrystStore()
    const composeStore = useComposeStore()

    await messageStore.fetch(props.id)

    return {
      messageStore,
      chatStore,
      groupStore,
      userStore,
      trystStore,
      composeStore,
    }
  },
  data() {
    return {
      maxChars: 60,
      expanded: false,
      hide: false,
      showOutcomeModal: false,
      showEditModal: false,
      showShareModal: false,
      showPromiseModal: false,
      broken: false,
    }
  },
  computed: {
    message() {
      return this.messageStore.byId(this.id)
    },
    groups() {
      const ret = {}

      if (this.message) {
        this.message.groups.forEach((g) => {
          const thegroup = this.groupStore.get(g.groupid)

          if (thegroup) {
            ret[g.groupid] = thegroup

            // Better to link to the group by name if possible to avoid nuxt generate creating explore pages for the
            // id variants.
            ret[g.groupid].exploreLink = thegroup
              ? thegroup.nameshort
              : g.groupid
          }
        })
      }

      return ret
    },
    unseen() {
      // We want all the chats from replies.  We fetch them in default.vue, here we only need to
      // get them from the store
      const chats = this.chatStore.list ? this.chatStore.list : []

      let unseen = 0

      if (this.message?.replies) {
        for (const reply of this.message.replies) {
          for (const chat of chats) {
            if (chat.id === reply.chatid) {
              unseen += chat.unseen
            }
          }
        }
      }

      return unseen
    },
    taken() {
      return this.hasOutcome('Taken')
    },
    received() {
      return this.hasOutcome('Received')
    },
    withdrawn() {
      return this.hasOutcome('Withdrawn')
    },
    rejected() {
      let rejected = false

      for (const group of this.message.groups) {
        if (group.collection === 'Rejected') {
          rejected = true
        }
      }

      return rejected
    },
    replies() {
      // Show the replies with unseen messages first, then most recent
      // console.log('Sort replies', this.message.replies, this)
      const self = this

      if (this.message?.replies) {
        return [...this.message?.replies].sort((a, b) => {
          const aunseen = self.countUnseen(a)
          const bunseen = self.countUnseen(b)
          const adate = new Date(a.date).getTime()
          const bdate = new Date(b.date).getTime()

          if (aunseen !== bunseen) {
            return bunseen - aunseen
          } else {
            return bdate - adate
          }
        })
      }

      return []
    },
    closestUser() {
      let ret = null
      let dist = null

      if (this.replyusers?.length > 1) {
        this.replyusers.forEach((uid) => {
          const u = this.userStore.byId(uid)

          if (u && (dist === null || (u.info && u?.info.milesaway < dist))) {
            dist = u.info.milesaway
            ret = u.id
          }
        })
      }

      return ret
    },
    bestRatedUser() {
      let ret = null
      let rating = null

      if (this.replyusers?.length > 1) {
        this.replyusers.forEach((uid) => {
          const u = this.userStore.byId(uid)

          if (u && u.info?.ratings?.Up + u.info?.ratings?.Down > 2) {
            const thisrating =
              u.info.ratings.Up / (u.info.ratings.Up + u.info.ratings.Down)

            if (
              u.info.ratings.Up > u.info.ratings.Down &&
              u.info.ratings.Up > 2 &&
              (rating === null || thisrating > rating)
            ) {
              rating = thisrating
              ret = u.id
            }
          }
        })
      }

      return ret
    },
    quickestUser() {
      let ret = null
      let replytime = null

      if (this.replyusers?.length > 1) {
        this.replyusers.forEach((uid) => {
          const u = this.userStore.byId(uid)

          if (
            u &&
            u.info?.replytime &&
            (replytime === null ||
              (u.info.replytime && u.info.replytime < replytime))
          ) {
            replytime = u.info.replytime
            ret = u.id
          }
        })
      }

      return ret
    },
    replyusers() {
      const ret = []
      const retids = []

      if (this.message?.replies) {
        for (const reply of this.message.replies) {
          if (!retids.includes(reply.userid)) {
            ret.push(reply.userid)
            retids[reply.userid] = true
          }
        }
      }

      // Also add anyone who the message has been promised to.  It is possible to manually promise to someone who
      // hasn't replied, during the course of a chat.
      if (this.message?.promises) {
        for (const promise of this.message.promises) {
          if (!retids.includes(promise.userid)) {
            ret.push(promise.userid)
            retids[promise.userid] = true
          }
        }
      }

      return ret
    },
    chats() {
      // We want all the chats which reference this message.  We fetch them in myposts, here we only need to
      // get them from the store
      const chats = this.chatStore.list ? this.chatStore.list : []
      const ret = chats.filter((c) => {
        return this.message.refchatids.includes(c.id)
      })

      return ret
    },
    promisedTo() {
      const ret = []

      if (this.expanded && this.message.promises?.length) {
        this.message.promises.forEach((p) => {
          const user = this.userStore.byId(p.userid)

          if (user) {
            const tryst = this.trystStore.getByUser(p.userid)
            const date = tryst
              ? dayjs(tryst.arrangedfor).format('dddd Do HH:mm a')
              : null

            ret.push({
              id: p.userid,
              name: user.displayname,
              tryst,
              trystdate: date,
            })
          }
        })
      }

      return ret
    },
    willAutoRepost() {
      if (this.taken || this.received || !this.message.canrepostat) {
        return false
      }

      const d = dayjs(this.message.canrepostat)
      const now = dayjs()

      return d.isAfter(now)
    },
  },
  watch: {
    message: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          // We may need to fetch user info for promises.
          if (newVal.promises) {
            newVal.promises.forEach((p) => {
              this.userStore.fetch(p.userid)
            })
          }
        }
      },
    },
  },
  mounted() {
    this.expanded = this.expand

    if (this.me) {
      switch (this.action) {
        case 'repost':
          if (this.message.canrepost) {
            this.repost()
          }
          break
        case 'withdraw':
          this.outcome('Withdrawn')
          break
        case 'taken':
          this.outcome('Taken')
          break
        case 'received':
          this.outcome('Received')
          break
        case 'promise':
          this.showPromiseModal = true
          this.waitForRef('promiseModal', () => {
            this.$refs.promiseModal.show()
          })
          break
      }
    }
  },
  methods: {
    toggle() {
      this.expanded = !this.expanded
    },
    showPhotos() {
      this.waitForRef('photoModal', () => {
        this.$refs.photoModal.show()
      })
    },
    countUnseen(reply) {
      let unseen = 0

      for (const chat of this.chats) {
        if (chat.id === reply.chatid) {
          unseen = chat.unseen
        }
      }

      return unseen
    },
    outcome(type) {
      this.showOutcomeModal = true
      this.waitForRef('outcomeModal', () => {
        this.$refs.outcomeModal.show(type)
      })
    },
    share(e) {
      if (e) {
        e.preventDefault()
        e.stopPropagation()
        e.stopImmediatePropagation()
      }

      this.showShareModal = true
      this.waitForRef('shareModal', () => {
        this.$refs.shareModal.show()
      })
    },
    edit(e) {
      if (e) {
        e.preventDefault()
        e.stopPropagation()
        e.stopImmediatePropagation()
      }

      this.showEditModal = true
      this.waitForRef('editModal', () => {
        this.$refs.editModal.show()
      })
    },
    async repost(e) {
      if (e) {
        e.preventDefault()
        e.stopPropagation()
        e.stopImmediatePropagation()
      }

      // Remove any partially composed messages we currently have, because they'll be confusing.
      await this.composeStore.clearMessages()

      // Add this message to the compose store so that it will show up on the compose page.
      await this.composeStore.setMessage(
        0,
        {
          id: this.message.id,
          savedBy: this.message.fromuser,
          item: this.message.item.name.trim(),
          description: this.message.textbody
            ? this.message.textbody.trim()
            : null,
          availablenow: this.message.availablenow,
          type: this.message.type,
        },
        this.me
      )

      // Set the current location and nearby groups, too, since we're about to use them
      if (this.message.location) {
        const runtimeConfig = useRuntimeConfig()

        const loc = await axios.get(runtimeConfig.public.APIv1 + '/locations', {
          params: {
            typeahead: this.message.location.name,
          },
        })

        await this.composeStore.setPostcode(loc.data.locations[0])
      }

      await this.composeStore.setAttachmentsForMessage(
        this.message.id,
        this.message.attachments
      )

      const router = useRouter()
      router.push(this.message.type === 'Offer' ? '/give' : '/find')
    },
    hasOutcome(val) {
      let ret = false

      if (this.message.outcomes?.length) {
        for (const outcome of this.message.outcomes) {
          if (outcome.outcome === val) {
            ret = true
          }
        }
      }

      return ret
    },
    brokenImage() {
      this.broken = true
    },
  },
}
</script>
<style scoped lang="scss">
.square {
  object-fit: cover;
  width: 75px;
  height: 75px;
}

img.attachment {
  max-height: 75px !important;
  max-width: 75px !important;
}

.photobadge {
  right: 5px;
  position: absolute;
  top: 5px;
}

.noborder {
  border: none !important;
  border-color: $color-white !important;
}

.hover:hover {
  color: initial;
  background-color: $colour-success-bg !important;
}

:deep(.btn-content) {
  width: 100%;
}
</style>
