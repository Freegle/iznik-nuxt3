<template>
  <div>
    <div v-if="!message" class="text-muted small">
      This chat message refers to a post (<v-icon
        icon="hashtag"
        class="text-muted fa-0-8x"
      />{{ id }}) that no longer exists.
    </div>
    <div v-else>
      <div class="clickme" @click="click">
        <div class="messagecard p-2">
          <div class="image-wrapper">
            <OurUploadedImage
              v-if="attachment?.ouruid"
              :src="attachment.ouruid"
              :modifiers="attachment.externalmods"
              alt="Item Photo"
              :width="100"
              @error="brokenImage"
            />
            <ProxyImage
              v-else-if="attachment?.paththumb"
              class-name="p-0 rounded"
              alt="Item picture"
              title="Item picture"
              :src="attachment.paththumb"
              :width="200"
              fit="cover"
              @error="brokenImage"
            />
          </div>
          <div class="rest">
            <div class="header--size4 item">
              {{ message.subject }}
            </div>
            <MessageHistory :id="id" class="mb-1 header-history" />
          </div>
        </div>
        <notice-message
          v-if="message.outcomes?.length || message.deleted"
          class="mt-2 mb-2"
        >
          <v-icon icon="info-circle" />
          <span v-if="message.type === 'Offer'">
            This is no longer available.
          </span>
          <span v-else> They are no longer looking for this. </span>
        </notice-message>
        <div v-else-if="message.promised">
          <div v-if="message.fromuser === myid">
            <notice-message>
              <div v-if="promisedToThem">
                You've promised it to this freegler.
              </div>
              <div v-else>You've promised it to someone else.</div>
            </notice-message>
          </div>
          <div v-else>
            <notice-message>
              <div v-if="message.promisedtoyou">This is promised to you.</div>
              <div v-else>This is promised to someone else at the moment.</div>
            </notice-message>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
// Need to import rather than async otherwise the render doesn't happen and ref isn't set.
import { useMessageStore } from '../stores/message'
import { useGroupStore } from '../stores/group'
import { useChatStore } from '../stores/chat'
import { useMiscStore } from '~/stores/misc'

const MessageHistory = defineAsyncComponent(() =>
  import('~/components/MessageHistory')
)
const NoticeMessage = defineAsyncComponent(() =>
  import('~/components/NoticeMessage')
)

export default {
  components: {
    MessageHistory,
    NoticeMessage,
  },
  props: {
    id: {
      type: Number,
      required: true,
    },
    chatid: {
      type: Number,
      required: false,
      default: null,
    },
  },
  async setup(props) {
    const miscStore = useMiscStore()
    const messageStore = useMessageStore()
    const groupStore = useGroupStore()

    // Fetch the message info.
    try {
      await messageStore.fetch(props.id)

      const message = messageStore.byId(props.id)

      if (message) {
        message.groups.forEach(async (g) => {
          await groupStore.fetch(g.groupid)
        })
      }
    } catch (e) {
      console.log('Message fetch failed', props.id, e)
    }

    return {
      miscStore,
      messageStore,
    }
  },
  data() {
    return {
      imageBroken: false,
    }
  },
  computed: {
    message() {
      return this.messageStore?.byId(this.id)
    },
    attachment() {
      return this.message?.attachments?.length
        ? this.message.attachments[0]
        : null
    },
    sm() {
      return this.miscStore?.breakpoint === 'sm'
    },
    chat() {
      const chatStore = useChatStore()
      return this.chatid ? chatStore?.byChatId(this.chatid) : null
    },
    promisedToThem() {
      let ret = false

      if (this.message?.promises) {
        for (const p of this.message?.promises) {
          if (this.chat?.otheruid === p.userid) {
            ret = true
          }
        }
      }

      return ret
    },
  },
  methods: {
    brokenImage() {
      this.imageBroken = true
    },
    click() {
      if (this.myid && this.message.fromuser === this.myid) {
        this.$router.push('/mypost/' + this.id)
      } else {
        this.$router.push('/message/' + this.id)
      }
    },
  },
}
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';

.messagecard {
  border-radius: 4px;
  box-shadow: 0 0 6px 0 rgba(0, 0, 0, 0.2);
  border: solid 1px $color-gray--light;
  background-color: $color-gray--lighter;

  display: grid;
  align-items: start;

  grid-template-columns: max-content minmax(0, 1fr);
  grid-column-gap: 1rem;
  grid-template-rows: max-content auto;

  .image-wrapper {
    grid-row: 1 / 2;
    grid-column: 1 / 2;
  }

  .rest {
    grid-row: 1 / 3;
    grid-column: 2 / 3;
  }
}

:deep(label) {
  font-weight: bold;
}

.attachment {
  object-fit: cover;
  height: 100px;
  width: 100px;
  box-shadow: 0 0 1 $color-gray--dark;
}

.item {
  color: $colour-info-fg !important;
  font-weight: bold !important;
  text-overflow: ellipsis;
  overflow: hidden;
  display: block;
}
</style>
