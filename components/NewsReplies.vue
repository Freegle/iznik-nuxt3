<template>
  <div class="replies-container" :class="'depth-' + depth">
    <div v-if="showEarlierRepliesOption" class="show-earlier">
      <b-button
        v-if="!showAllReplies"
        variant="link"
        size="sm"
        class="pl-0"
        @click.prevent="showAllReplies = true"
      >
        Show earlier {{ numberOfRepliesNotShown }}
      </b-button>
      <b-button
        v-else
        variant="link"
        size="sm"
        class="pl-0"
        @click.prevent="showAllReplies = false"
      >
        Hide earlier replies
      </b-button>
    </div>
    <div
      v-for="reply in repliestoshow"
      :key="'newsfeed-' + reply"
      class="reply-thread"
    >
      <NewsRefer
        v-if="reply.type.indexOf('ReferTo') === 0"
        :id="reply.id"
        :type="reply.type"
        :threadhead="threadhead"
        class="reply-content"
      />
      <NewsReply
        v-else
        :id="reply.id"
        :key="'reply-' + reply.id"
        :reply-data="reply"
        :threadhead="threadhead"
        :scroll-to="scrollTo"
        class="reply-content"
        :depth="depth"
        @rendered="rendered"
        @expand-combined="expandCombined"
      />
    </div>
  </div>
</template>
<script setup>
import pluralize from 'pluralize'
import { ref, computed, defineAsyncComponent } from 'vue'
import { useNewsfeedStore } from '~/stores/newsfeed'
import { useAuthStore } from '~/stores/auth'
import NewsRefer from '~/components/NewsRefer'

const NewsReply = defineAsyncComponent(() =>
  import('~/components/NewsReply.vue')
)

const INITIAL_NUMBER_OF_REPLIES_TO_SHOW = 5

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
  threadhead: {
    type: Number,
    required: true,
  },
  replyTo: {
    type: Number,
    required: false,
    default: null,
  },
  scrollTo: {
    type: String,
    required: false,
    default: '',
  },
  depth: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits(['rendered'])

const newsfeedStore = useNewsfeedStore()
const authStore = useAuthStore()
const showAllReplies = ref(false)
const expandedCombinedIds = ref(new Set())

// We do a lot of things in setup() in this component rather than computed properties via the legacy options API.
//
// This is because it allows us to identify which replies we are going to show, and then fetch the users for them
// in advance.  That avoids the screen flicker that happens if we delay fetching the user until we render each reply.
const me = authStore.user

const mod = computed(() => {
  return (
    me &&
    (me.systemrole === 'Moderator' ||
      me.systemrole === 'Support' ||
      me.systemrole === 'Admin')
  )
})

const newsfeed = computed(() => {
  return newsfeedStore.byId(props.id)
})

const replies = computed(() => {
  return newsfeed.value?.replies || []
})

const visiblereplies = computed(() => {
  // These are the replies which are candidates to show, i.e. not deleted or hidden.
  const ret = []

  for (let i = 0; i < replies.value.length; i++) {
    const reply = newsfeedStore.byId(replies.value[i])

    if (!reply.deleted || mod.value) {
      ret.push(reply)
    }
  }

  return ret
})

const combinedReplies = computed(() => {
  const TEN_MINUTES = 10 * 60 * 1000
  const combined = []

  for (let i = 0; i < filteredReplies.value.length; i++) {
    const currentReply = filteredReplies.value[i]
    const currentTime = new Date(currentReply.added).getTime()
    const lastCombined = combined[combined.length - 1]

    /* Check if this reply or the last combined group has been expanded */
    const isExpanded =
      expandedCombinedIds.value.has(currentReply.id) ||
      (lastCombined?.combinedIds &&
        lastCombined.combinedIds.some((id) =>
          expandedCombinedIds.value.has(id)
        ))

    const canCombine =
      !isExpanded &&
      lastCombined &&
      lastCombined.userid === currentReply.userid &&
      !currentReply.image &&
      !lastCombined.image &&
      !currentReply.replies?.length &&
      !lastCombined.replies?.length &&
      currentTime -
        new Date(lastCombined.originalAdded || lastCombined.added).getTime() <=
        TEN_MINUTES

    if (canCombine) {
      /* Create a fresh object to avoid mutating store data */
      combined[combined.length - 1] = {
        id: lastCombined.id,
        userid: lastCombined.userid,
        displayname: lastCombined.displayname,
        profile: lastCombined.profile,
        added: currentReply.added,
        originalAdded: lastCombined.originalAdded || lastCombined.added,
        message: lastCombined.message + '\n\n' + currentReply.message,
        isCombined: true,
        combinedIds: [
          ...(lastCombined.combinedIds || [lastCombined.id]),
          currentReply.id,
        ],
        image: null,
        replies: [],
        deleted: lastCombined.deleted,
        hidden: lastCombined.hidden,
        loves: lastCombined.loves,
        loved: lastCombined.loved,
        type: lastCombined.type,
        replyto: lastCombined.replyto,
        threadhead: lastCombined.threadhead,
        previews: lastCombined.previews,
      }
    } else {
      /* Deep clone to avoid reactivity issues with store objects */
      combined.push({
        id: currentReply.id,
        userid: currentReply.userid,
        displayname: currentReply.displayname,
        profile: currentReply.profile,
        added: currentReply.added,
        message: currentReply.message,
        image: currentReply.image,
        replies: currentReply.replies,
        deleted: currentReply.deleted,
        hidden: currentReply.hidden,
        loves: currentReply.loves,
        loved: currentReply.loved,
        type: currentReply.type,
        replyto: currentReply.replyto,
        threadhead: currentReply.threadhead,
        previews: currentReply.previews,
      })
    }
  }

  return combined
})

const filteredReplies = computed(() => {
  let ret = []

  if (visiblereplies.value.length) {
    if (
      showAllReplies.value ||
      props.scrollTo ||
      visiblereplies.value.length <= INITIAL_NUMBER_OF_REPLIES_TO_SHOW
    ) {
      // Return all the replies
      ret = visiblereplies.value
    } else if (!props.replyTo) {
      // Show the last 5
      ret = visiblereplies.value.slice(-5)
    } else {
      // We are need to show what we are replying to and everything after that.
      ret = []
      let seen = false

      for (let i = 0; i < visiblereplies.value.length; i++) {
        const reply = newsfeedStore.byId(visiblereplies.value[i])

        if (reply?.id === props.replyTo || seen) {
          seen = true
          ret.push(reply)
        }
      }

      if (!seen) {
        // Probably won't happen.
        ret = visiblereplies.value.slice(-5)
      }
    }
  }

  // Suppress replies where the message value is the same as the previous one.
  let lastMessage = null

  let i = ret.length

  while (i--) {
    if (!ret[i].message.localeCompare(lastMessage)) {
      // Remove this from the array
      ret.splice(i, 1)
    } else {
      lastMessage = ret[i].message
    }
  }

  return ret
})

const repliestoshow = computed(() => {
  return combinedReplies.value
})

const showEarlierRepliesOption = computed(() => {
  return visiblereplies.value.length > INITIAL_NUMBER_OF_REPLIES_TO_SHOW
})

const numberOfRepliesNotShown = computed(() => {
  if (
    !visiblereplies.value ||
    visiblereplies.value.length < INITIAL_NUMBER_OF_REPLIES_TO_SHOW
  ) {
    return null
  }

  return pluralize(
    'reply',
    visiblereplies.value.length - INITIAL_NUMBER_OF_REPLIES_TO_SHOW,
    true
  )
})

function rendered(id) {
  emit('rendered', id)
}

function expandCombined(combinedIds) {
  /* Add all IDs from this combined group to the expanded set */
  combinedIds.forEach((id) => expandedCombinedIds.value.add(id))
}
</script>
<style lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';
@import 'assets/css/_color-vars.scss';

.replies-container {
  margin-left: 0.5rem;
  padding-left: 0.75rem;
  border-left: 2px solid rgba($colour-success, 0.4);

  @include media-breakpoint-up(md) {
    margin-left: 1rem;
    padding-left: 1rem;
  }

  /* Nested replies get lighter borders */
  &.depth-2 {
    border-left-color: rgba($colour-success, 0.25);
  }

  /* After depth 2, stop indenting further to prevent narrow columns.
     The @mentions in replies show who is replying to whom. */
  &[class*='depth-']:not(.depth-1):not(.depth-2) {
    margin-left: 0;
    padding-left: 0;
    border-left: none;
  }
}

.show-earlier {
  margin-bottom: 0.5rem;
}

.reply-thread {
  padding: 0.5rem 0;

  &:not(:last-child) {
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  }
}

.reply-content {
  /* Content styling handled by NewsReply */
}
</style>
