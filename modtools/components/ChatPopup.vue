<template>
  <div>TODO ChatPopup.vue NOT USED NOW</div>
</template>
<script>
/*
import { TooltipPlugin } from 'bootstrap-vue'
import Vue from 'vue'
import InfiniteLoading from '~/components/InfiniteLoading'
import VueDraggableResizable from 'vue-draggable-resizable/src/components/vue-draggable-resizable'
import chat from '@/mixins/chat.js'

// Don't use dynamic imports because it stops us being able to scroll to the bottom after render.
import chatCollate from '@/mixins/chatCollate.js'
import ModComments from './ModComments'
import ChatMessage from '~/components/ChatMessage.vue'

Vue.use(TooltipPlugin)
const Ratings = () => import('~/components/Ratings')
const PromiseModal = () => import('./PromiseModal')
const ProfileModal = () => import('./ProfileModal')
const AddressModal = () => import('~/components/AddressModal')
const NudgeWarningModal = () => import('~/components/NudgeWarningModal')
const NudgeTooSoonWarningModal = () =>
  import('~/components/NudgeTooSoonWarningModal')

const HEIGHT = 400

export default {
  components: {
    ModComments,
    InfiniteLoading,
    VueDraggableResizable,
    Ratings,
    ChatMessage,
    PromiseModal,
    ProfileModal,
    AddressModal,
    NudgeTooSoonWarningModal,
    NudgeWarningModal
  },
  mixins: [chatCollate, chat],
  computed: {
    minheight() {
      return Math.min(this.maxheight, HEIGHT)
    },
    maxheight() {
      // We should not exceed the height of the navbar
      let ret = null

      if (process.client) {
        ret = window.innerHeight - 68 - 50
      }

      return ret
    },
    width() {
      return this.chat && this.chat.remember && this.chat.remember.width
        ? this.chat.remember.width
        : 320
    },
    height() {
      return this.chat && this.chat.remember && this.chat.remember.height
        ? Math.min(this.maxheight, this.chat.remember.height)
        : HEIGHT
    },
    right() {
      let right = 0
      const popups = Object.values(this.$store.getters['popupchats/list'])

      if (popups) {
        for (const popup of popups) {
          const width = popup.width ? parseInt(popup.width) : 320
          right += width

          if (parseInt(popup.id) === this.id) {
            break
          }
        }
      }
      return right
    }
  },
  mounted() {
    if (this.notVisible) {
      // This is an invalid chatid.  Remove it to stop it causing problems.
      this.hide()
    }

    if (process.client) {
      // Slightly clunky way to spot if a chat popup is too large for the screen.
      setTimeout(() => {
        const els = document.getElementsByClassName('resizable')
        for (let i = 0; i < els.length; i++) {
          const el = els[i]
          const height = el.style.height

          if (height) {
            if (parseInt(el.style.height.replace('px', '')) > this.maxheight) {
              el.style.height = this.maxheight + 'px'
            }
          }
        }
      }, 5000)
    }
  },
  methods: {
    hide() {
      this.$store.dispatch('popupchats/hide', { id: this.chat.id })
    },
    maximise() {
      const modtools = this.$store.getters['misc/get']('modtools')
      this.$store.dispatch('popupchats/hide', { id: this.chat.id })
      this.$router.push(
        (modtools ? '/modtools' : '') + '/chats/' + this.chat.id
      )
    },
    onResize: function(x, y, width, height) {
      this.$store.dispatch('popupchats/popup', {
        id: this.id,
        width: width,
        height: height
      })
    }
  }
}
*/
</script>
<style scoped lang="scss">
.vdr {
  position: absolute;
  top: initial !important;
  left: initial !important;
  bottom: 0;
  z-index: 900;
  animation: chatIn 2s;
  transform-origin: right bottom;
  background-color: transparent !important;
  display: flex;
}

.chatHolder {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border: 1px solid $color-gray--dark;
}

.chatname {
  display: inline-block;
  max-width: 100px;
  font-weight: bold;
  color: $color-white;
}

.shadow {
  box-shadow: 1px 3px 5px 3px $color-black-opacity-60 !important;
}

@keyframes chatIn {
  0% {
    transform: scale(0.1);
    opacity: 0;
  }

  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.chatTitle {
  background-color: $color-blue--light;
  color: $color-white;
  font-weight: bold;
  order: 1;
  flex-shrink: 0;
}

.chatContent {
  order: 3;
  justify-content: flex-start;
  flex-grow: 1;
  overflow-y: auto;
  background-color: $color-yellow--base;
}

.chatFooter {
  order: 4;
  justify-content: flex-end;
  background-color: $color-white;
  flex-shrink: 0;
}
</style>
