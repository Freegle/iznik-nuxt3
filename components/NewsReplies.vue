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
        :id="id"
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
      />
      <div v-if="depth === 1" class="line" />
    </div>
  </div>
</template>
<script>
import pluralize from 'pluralize'
import { useNewsfeedStore } from '../stores/newsfeed'
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
      type: Object,
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

    return {
      newsfeedStore,
    }
  },
  data() {
    return {
      showAllReplies: false,
    }
  },
  computed: {
    replies() {
      const ret = []

      this.replyIds.forEach((id) => {
        ret.push(this.newsfeedStore.byId(id))
      })

      return ret
    },
    visiblereplies() {
      // These are the replies which are candidates to show, i.e. not deleted or hidden.
      const ret = []

      for (let i = 0; i < this.replies.length; i++) {
        if (!this.replies[i].deleted || this.mod) {
          ret.push(this.replies[i])
        }
      }

      return ret
    },
    repliestoshow() {
      let ret = []

      if (this.visiblereplies.length) {
        if (
          this.showAllReplies ||
          this.scrollTo ||
          this.visiblereplies.length <= INITIAL_NUMBER_OF_REPLIES_TO_SHOW
        ) {
          // Return all the replies
          ret = this.visiblereplies
        } else if (!this.replyTo) {
          // Show the last 5
          ret = this.visiblereplies.slice(-5)
        } else {
          // We are need to show what we are replying to and everything after that.
          ret = []
          let seen = false

          for (let i = 0; i < this.visiblereplies.length; i++) {
            const reply = this.visiblereplies[i]

            if (reply.id === this.replyTo || seen) {
              seen = true
              ret.push(reply)
            }
          }

          if (!seen) {
            // Probably won't happen.
            ret = this.visiblereplies.slice(-5)
          }
        }
      }

      return ret
    },
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
