<template>
  <div :class="{ 'pl-1': depth === 1 }">
    <div v-if="showEarlierRepliesOption">
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
      :key="'newsfeed-' + reply.id"
      class="lines"
    >
      <NewsRefer
        v-if="reply.type.indexOf('ReferTo') === 0"
        :id="reply.id"
        :type="reply.type"
        :threadhead="threadhead"
        class="content pt-1 pb-1"
      />
      <NewsReply
        v-else
        :id="id"
        :key="'reply-' + reply.id"
        :replyid="reply.id"
        :threadhead="threadhead"
        :scroll-to="scrollTo"
        :class="{
          content: true,
          'pt-1': true,
          'pb-1': true,
          'pl-4': depth === 2,
        }"
        :depth="depth"
        @rendered="rendered"
      />
      <div v-if="depth === 1" class="line" />
    </div>
  </div>
</template>
<script>
import pluralize from 'pluralize'
import { useNewsfeedStore } from '../stores/newsfeed'
import { useAuthStore } from '../stores/auth'
import { useUserStore } from '../stores/user'
import { ref, computed } from '#imports'
import NewsRefer from '~/components/NewsRefer'

const NewsReply = () => import('~/components/NewsReply.vue')

const INITIAL_NUMBER_OF_REPLIES_TO_SHOW = 5

export default {
  name: 'NewsReplies',
  components: { NewsRefer, NewsReply },
  props: {
    id: {
      type: Number,
      required: true,
    },
    replyIds: {
      type: Array,
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
  },
  setup(props) {
    const newsfeedStore = useNewsfeedStore()
    const authStore = useAuthStore()
    const userStore = useUserStore()
    const showAllReplies = ref(false)

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

    const replies = computed(() => {
      const ret = []

      props.replyIds.forEach((id) => {
        ret.push(newsfeedStore.byId(id))
      })

      return ret
    })

    const visiblereplies = computed(() => {
      // These are the replies which are candidates to show, i.e. not deleted or hidden.
      const ret = []

      for (let i = 0; i < replies.value.length; i++) {
        if (!replies.value[i].deleted || mod) {
          ret.push(replies.value[i])
        }
      }

      return ret
    })

    const repliestoshow = computed(() => {
      let ret = []

      if (visiblereplies.value.length) {
        if (
          showAllReplies ||
          scrollTo ||
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
            const reply = visiblereplies.value[i]

            if (reply.id === props.replyTo || seen) {
              seen = true
              ret.push(reply)
            }
          }

          if (!seen) {
            // Probably won't happen.
            ret = visiblereplies.slice(-5)
          }
        }
      }

      return ret
    })

    // Extract unique userids from repliestoshow
    const userids = []

    repliestoshow.value.forEach((reply) => {
      if (
        reply.userid &&
        !userStore.byId(reply.userid) &&
        !userids.includes(reply.userid)
      ) {
        userids.push(reply.userid)
      }
    })

    return {
      newsfeedStore,
      replies,
      visiblereplies,
      repliestoshow,
      showAllReplies,
    }
  },
  computed: {
    showEarlierRepliesOption() {
      return this.visiblereplies.length > INITIAL_NUMBER_OF_REPLIES_TO_SHOW
    },
    numberOfRepliesNotShown() {
      if (
        !this.visiblereplies ||
        this.visiblereplies.length < INITIAL_NUMBER_OF_REPLIES_TO_SHOW
      ) {
        return null
      }

      return pluralize(
        'reply',
        this.visiblereplies.length - INITIAL_NUMBER_OF_REPLIES_TO_SHOW,
        true
      )
    },
  },
  methods: {
    rendered(id) {
      this.$emit('rendered', id)
    },
  },
}
</script>
<style lang="scss">
.lines {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;

  .content {
    grid-column: 1 / 2;
    grid-row: 1 / 2;
    z-index: 1001;
  }

  .line {
    grid-column: 1 / 2;
    grid-row: 1 / 2;
    border-left: 1px solid #e0e0e0;
    margin-left: 21px;
    z-index: 1000;
  }
}
</style>
