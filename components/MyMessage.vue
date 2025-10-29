<template>
  <div v-observe-visibility="visibilityChanged">
    <div v-if="visible && message?.id">
      <div v-if="showOld || !message.outcomes?.length">
        <b-card
          no-body
          class="mb-1 bnuorder"
          :border-variant="expanded ? 'success' : 'secondary'"
        >
          <b-card-header header-tag="header" class="p-0" role="tab">
            <div class="bg-white clickme">
              <notice-message v-if="rejected" class="mb-3" variant="warning">
                <v-icon icon="exclamation-triangle" scale="2" /> This post has
                been returned to you by the volunteers, as it is not yet
                suitable. It is not public yet.
              </notice-message>
              <MessageSummary
                :id="message.id"
                :key="'summary-' + bump"
                :replyable="false"
                @attachments="showPhotos"
              />
              <div
                v-if="
                  message.outcomes?.length === 0 && message.promisecount > 0
                "
              >
                <div class="text-info">
                  <MyMessagePromisedTo
                    v-for="p in promisedTo"
                    :id="message.id"
                    :key="'promised-' + p.id"
                    class="mt-1 border border-info p-2"
                    :promise="p"
                    :replyusers="replyusers"
                  />
                </div>
              </div>
              <div
                class="d-flex justify-content-between flex-wrap mt-2 ps-2 neartop"
              >
                <b-button
                  v-if="rejected && message.location && message.item"
                  variant="warning"
                  class="mr-1 mb-1"
                  @click="repost"
                >
                  <v-icon class="d-none d-sm-inline" icon="pen" /> Edit and
                  Resend
                </b-button>
                <b-button
                  v-if="rejected && !withdrawn"
                  variant="secondary"
                  class="mr-1 mb-1"
                  @click="outcome('Withdrawn', $event)"
                >
                  <v-icon class="d-none d-sm-inline" icon="trash-alt" />
                  Withdraw
                </b-button>
                <b-button
                  v-if="!rejected && message.type === 'Offer' && !taken"
                  variant="primary"
                  class="mr-1 mb-1"
                  @click="outcome('Taken', $event)"
                >
                  <v-icon class="d-none d-sm-inline" icon="check" /> Mark as
                  TAKEN
                </b-button>
                <b-button
                  v-if="!rejected && message.type === 'Wanted' && !received"
                  variant="primary"
                  class="mr-1 mb-1"
                  @click="outcome('Received', $event)"
                >
                  <v-icon class="d-none d-sm-inline" icon="check" /> Mark as
                  RECEIVED
                </b-button>
                <b-button
                  v-if="!rejected && message.type === 'Offer' && !taken"
                  variant="primary"
                  class="mr-1 mb-1"
                  @click="showPromiseModal = true"
                >
                  <v-icon class="d-none d-sm-inline" icon="handshake" />
                  Promise
                </b-button>
                <b-button
                  v-if="!rejected && !message.outcomes?.length"
                  variant="secondary"
                  class="mr-1 mb-1"
                  @click="edit"
                >
                  <v-icon class="d-none d-sm-inline" icon="pen" /> Edit
                </b-button>
                <b-button
                  v-if="!rejected && !taken && !received && !withdrawn"
                  variant="secondary"
                  class="mr-1 mb-1"
                  @click="outcome('Withdrawn', $event)"
                >
                  <v-icon class="d-none d-sm-inline" icon="trash-alt" />
                  Withdraw
                </b-button>
                <b-button
                  v-if="
                    !rejected &&
                    message.deadline &&
                    new Date(message.deadline).getTime() <
                      new Date().getTime() &&
                    message.location &&
                    message.item
                  "
                  variant="primary"
                  class="mr-1 mb-1"
                  @click="extendDeadline"
                >
                  <v-icon class="d-none d-sm-inline" icon="sync" /> Extend
                  deadline
                </b-button>
                <b-button
                  v-else-if="
                    !rejected &&
                    message.canrepost &&
                    message.location &&
                    message.item
                  "
                  variant="secondary"
                  class="mr-1 mb-1"
                  @click="repost"
                >
                  <v-icon class="d-none d-sm-inline" icon="sync" /> Repost
                </b-button>
                <div
                  v-else-if="
                    !rejected &&
                    message.repostat &&
                    message.location &&
                    message.item
                  "
                  class="position-relative"
                >
                  <b-button
                    variant="secondary"
                    class="mr-1 mb-1"
                    title="You will be able to repost this soon"
                    @click.stop="repostWhenUnavailable"
                  >
                    <v-icon class="d-none d-sm-inline" icon="sync" /> Repost
                    <span class="repostsmall">{{ repostatago }}</span>
                  </b-button>
                  <p
                    class="invalid-feedback position-absolute bg-white text-center"
                    :class="triedToRepost ? 'd-block' : 'd-none'"
                  >
                    You can't repost until {{ datetimeshort(message.repostat) }}
                  </p>
                </div>
                <b-button
                  v-if="!rejected"
                  variant="secondary"
                  title="Share"
                  class="mr-1 mb-1"
                  @click="share"
                >
                  <v-icon class="d-none d-sm-inline" icon="share-alt" /> Share
                </b-button>
              </div>
            </div>
          </b-card-header>
          <MyMessageReplySummary
            v-if="!expanded"
            :id="id"
            @expand="expanded = true"
          />
          <b-collapse
            :id="'mypost-' + message.id"
            v-model="expanded"
            role="tabpanel"
            @show="expanded = true"
            @hidden="expanded = false"
          >
            <div v-if="expanded">
              <b-card-body
                v-if="replies?.length > 0 || willAutoRepost"
                class="p-2"
              >
                <b-card-text>
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
                      >Will auto-repost {{ canrepostatago }}.</span
                    >
                  </p>
                </b-card-text>
              </b-card-body>
            </div>
          </b-collapse>
        </b-card>
        <MessagePhotosModal
          v-if="showMessagePhotosModal && message.attachments?.length"
          :id="message.id"
          @hidden="showMessagePhotosModal = false"
        />
      </div>
      <OutcomeModal
        v-if="showOutcomeModal"
        :id="id"
        :type="outcomeType"
        @outcome="bump++"
        @hidden="showOutcomeModal = false"
      />
      <MessageShareModal
        v-if="showShareModal"
        :id="message.id"
        @hidden="showShareModal = false"
      />
      <MessageEditModal v-if="showEditModal" :id="id" @hidden="hidden" />
      <PromiseModal
        v-if="showPromiseModal"
        :messages="[message]"
        :selected-message="message.id"
        :users="replyusers"
        @hidden="showPromiseModal = false"
      />
      <DeadlineAskModal
        v-if="askDeadline"
        :ids="[id]"
        :set="message.deadline?.substring(0, 10)"
      />
    </div>
  </div>
</template>
<script setup>
import dayjs from 'dayjs'
import { useComposeStore } from '~/stores/compose'
import { useMessageStore } from '~/stores/message'
import { useChatStore } from '~/stores/chat'
import { useUserStore } from '~/stores/user'
import { useTrystStore } from '~/stores/tryst'
import { useLocationStore } from '~/stores/location'
import { milesAway } from '~/composables/useDistance'
import { datetimeshort, timeago } from '~/composables/useTimeFormat'
import { onMounted, ref, computed, watch, useRouter } from '#imports'
import MyMessagePromisedTo from '~/components/MyMessagePromisedTo'
import { useMe } from '~/composables/useMe'

const MyMessageReply = defineAsyncComponent(() =>
  import('./MyMessageReply.vue')
)
const MessagePhotosModal = defineAsyncComponent(() =>
  import('~/components/MessagePhotosModal')
)
const MessageShareModal = defineAsyncComponent(() =>
  import('./MessageShareModal')
)
const NoticeMessage = defineAsyncComponent(() =>
  import('~/components/NoticeMessage')
)
const PromiseModal = defineAsyncComponent(() =>
  import('~/components/PromiseModal')
)
const OutcomeModal = defineAsyncComponent(() => import('./OutcomeModal'))
const MessageEditModal = defineAsyncComponent(() =>
  import('./MessageEditModal')
)

const props = defineProps({
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
})

const messageStore = useMessageStore()
const chatStore = useChatStore()
const userStore = useUserStore()
const trystStore = useTrystStore()
const composeStore = useComposeStore()
const locationStore = useLocationStore()
const router = useRouter()

// Store refs - access me from the user store
const { me } = useMe()

// Data properties as refs
const visible = ref(false)
const expanded = ref(false)
const showOutcomeModal = ref(false)
const outcomeType = ref(null)
const showEditModal = ref(false)
const showShareModal = ref(false)
const showPromiseModal = ref(false)
const showMessagePhotosModal = ref(false)
const triedToRepost = ref(false)
const bump = ref(0)
const askDeadline = ref(false)

// Computed properties
const message = computed(() => messageStore?.byId(props.id))

const hasOutcome = (val) => {
  let ret = false

  if (message.value?.outcomes?.length) {
    for (const outcome of message.value.outcomes) {
      if (outcome.outcome === val) {
        ret = true
      }
    }
  }

  return ret
}

const taken = computed(() => hasOutcome('Taken'))
const received = computed(() => hasOutcome('Received'))
const withdrawn = computed(() => hasOutcome('Withdrawn'))

const rejected = computed(() => {
  let rejected = false

  if (message.value?.groups) {
    for (const group of message.value.groups) {
      if (group.collection === 'Rejected') {
        rejected = true
      }
    }
  }

  return rejected
})

const promisedUserids = computed(() => {
  const ret = []

  if (message.value?.promisecount && message.value.promises?.length) {
    for (const promise of message.value.promises) {
      ret.push(promise.userid)
    }
  }

  return ret
})

const countUnseen = (reply) => {
  let unseen = 0

  for (const chat of chats.value) {
    if (chat.id === reply.chatid) {
      unseen = chat.unseen
    }
  }

  return unseen
}

const replies = computed(() => {
  // Show the replies with unseen messages first, then most recent
  if (message.value?.replies) {
    return [...message.value?.replies].sort((a, b) => {
      const aunseen = countUnseen(a)
      const bunseen = countUnseen(b)
      const adate = new Date(a.date).getTime()
      const bdate = new Date(b.date).getTime()
      const promisea = promisedUserids.value.includes(a.userid)
      const promiseb = promisedUserids.value.includes(b.userid)

      if (promisea && !promiseb) {
        return -1
      } else if (promiseb && !promisea) {
        return 1
      } else if (aunseen !== bunseen) {
        return bunseen - aunseen
      } else {
        return bdate - adate
      }
    })
  }

  return []
})

const replyuserids = computed(() => {
  const ret = []
  const retids = {}

  if (message.value?.replies) {
    for (const reply of message.value.replies) {
      if (!retids[reply.userid]) {
        ret.push(reply.userid)
        retids[reply.userid] = true
      }
    }
  }

  // Also add anyone who the message has been promised to.  It is possible to manually promise to someone who
  // hasn't replied, during the course of a chat.
  if (message.value?.promises) {
    for (const promise of message.value.promises) {
      if (!retids[promise.userid]) {
        ret.push(promise.userid)
        retids[promise.userid] = true
      }
    }
  }

  // We want to add all the recent chat users.  This allows us to promise to
  // people who reply in a chat asking informally for multiple items.
  const chats = chatStore?.list ? chatStore.list : []
  const visibleChats = scanChats(chats)

  visibleChats.forEach((chat) => {
    if (
      chat.chattype === 'User2User' &&
      chat.otheruid &&
      !retids[chat.otheruid]
    ) {
      ret.push(chat.otheruid)
      retids[chat.otheruid] = true
    }
  })

  return ret
})

const replyusers = computed(() => {
  // Get the users in replyuserids from store
  const ret = []

  replyuserids.value.forEach((uid) => {
    const u = userStore?.byId(uid)

    if (u) {
      ret.push(u)
    }
  })

  return ret
})

const closestUser = computed(() => {
  let ret = null
  let dist = null

  if (replyusers.value?.length > 1 && me) {
    replyusers.value.forEach((u) => {
      if (u) {
        const milesaway = milesAway(u.lat, u.lng, me.lat, me.lng)

        if (dist === null || milesaway < dist) {
          dist = milesaway
          ret = u.id
        }
      }
    })
  }

  return ret
})

const bestRatedUser = computed(() => {
  let ret = null
  let rating = null

  if (replyusers.value?.length > 1) {
    replyusers.value.forEach((u) => {
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
})

const quickestUser = computed(() => {
  let ret = null
  let replytime = null

  if (replyusers.value?.length > 1) {
    replyusers.value.forEach((u) => {
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
})

const chats = computed(() => {
  // We want all the chats which reference this message.  We fetch them in myposts, here we only need to
  // get them from the store
  const chatsList = chatStore?.list ? chatStore.list : []
  const ret = chatsList.filter((c) => {
    return message.value?.refchatids?.includes(c.id)
  })

  return ret
})

const promisedTo = computed(() => {
  const ret = []

  if (message.value?.promises?.length) {
    message.value.promises.forEach((p) => {
      const user = userStore?.byId(p.userid)

      if (user) {
        const tryst = trystStore?.getByUser(p.userid)
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
})

const willAutoRepost = computed(() => {
  if (taken.value || received.value || !message.value?.canrepostat) {
    return false
  }

  const d = dayjs(message.value.canrepostat)
  const now = dayjs()

  return d.isAfter(now)
})

const repostatago = computed(() => {
  if (message.value?.repostat) {
    return timeago(message.value.repostat)
  }

  return null
})

const canrepostatago = computed(() => {
  if (message.value?.canrepostat) {
    return timeago(message.value.canrepostat)
  }

  return null
})

// Methods
const visibilityChanged = async (isVisible) => {
  if (isVisible) {
    await messageStore.fetch(props.id)
    visible.value = isVisible
  }
}

const showPhotos = () => {
  console.log('Show photos')
  showMessagePhotosModal.value = true
}

const outcome = (type) => {
  showOutcomeModal.value = true
  outcomeType.value = type
}

const share = (e) => {
  if (e) {
    e.preventDefault()
    e.stopPropagation()
    e.stopImmediatePropagation()
  }

  showShareModal.value = true
}

const edit = async (e) => {
  if (e) {
    e.preventDefault()
    e.stopPropagation()
    e.stopImmediatePropagation()
  }

  await messageStore.fetch(props.id, true)
  showEditModal.value = true
}

const repost = async (e) => {
  if (e) {
    e.preventDefault()
    e.stopPropagation()
    e.stopImmediatePropagation()
  }

  // Remove any partially composed messages we currently have, because they'll be confusing.
  await composeStore.clearMessages()

  // Add this message to the compose store so that it will show up on the compose page.
  console.log('repost', props.id)
  await composeStore.setMessage(
    0,
    {
      id: message.value.id,
      savedBy: message.value.fromuser,
      item: message.value.item?.name.trim(),
      description: message.value.textbody
        ? message.value.textbody.trim()
        : null,
      availablenow: message.value.availablenow,
      type: message.value.type,
      repostof: props.id,
      deadline: null,
    },
    me
  )

  // Set the current location and nearby groups, too, since we're about to use them
  if (message.value.location) {
    console.log('Fetch location for', message.value.location.name)
    const locs = await locationStore.typeahead(message.value.location.name)

    console.log('Returned', locs)
    composeStore.postcode = locs[0]
  }

  await composeStore.setAttachmentsForMessage(0, message.value.attachments)

  router.push(message.value.type === 'Offer' ? '/give' : '/find')
}

const repostWhenUnavailable = async () => {
  triedToRepost.value = true

  await messageStore.fetch(props.id, true)

  if (message.value.canrepost) {
    // when trying to repost when it's forbidden, the fetch above would update the post, and if the post is allowed
    // to be reposted now, we reset the blocking flag and reposting. This can happen if time passes while you stay
    // on the page without refreshing it
    triedToRepost.value = false
    await repost()
  }
}

const hidden = () => {
  showEditModal.value = false
  messageStore.fetch(props.id)
}

const extendDeadline = () => {
  askDeadline.value = true
}

const scanChats = (chats) => {
  chats = chats.filter((chat) => {
    if (chat.status === 'Blocked' || chat.status === 'Closed') {
      return false
    }

    return true
  })

  // Sort by last date.
  chats.sort((a, b) => {
    if (a.lastdate && b.lastdate) {
      return dayjs(b.lastdate).diff(dayjs(a.lastdate))
    } else if (a.lastdate) {
      return -1
    } else if (b.lastdate) {
      return 1
    } else {
      return 0
    }
  })

  return chats
}

// Watchers
watch(
  message,
  (newVal) => {
    if (newVal) {
      // We may need to fetch user info for promises.
      if (newVal.promises) {
        newVal.promises.forEach((p) => {
          userStore.fetch(p.userid)
        })
      }

      if (newVal.replycount === 1) {
        expanded.value = true
      }
    }
  },
  { immediate: true }
)

watch(
  replies,
  (newVal) => {
    if (newVal?.length === 1) {
      expanded.value = true
    }
  },
  { immediate: true }
)

watch(replyuserids, (newVal) => {
  // Make sure we have them in store.
  newVal.forEach((uid) => {
    userStore.fetch(uid)
  })
})

// Lifecycle hooks
onMounted(() => {
  expanded.value = props.expand

  if (me.value) {
    switch (props.action) {
      case 'repost':
        if (message.value?.canrepost) {
          repost()
        }
        break
      case 'withdraw':
        outcome('Withdrawn')
        break
      case 'taken':
        outcome('Taken')
        break
      case 'received':
        outcome('Received')
        break
      case 'promise':
        showPromiseModal.value = true
        break
      case 'extend':
        askDeadline.value = true
    }
  }
})
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

.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

:deep(.messagecard) {
  border-radius: 0px !important;
}

.repostsmall {
  font-size: 0.5rem;
}
</style>
