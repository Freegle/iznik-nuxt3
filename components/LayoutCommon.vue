<template>
  <div>
    <main class="ml-0 ps-0 pe-0 pageContent">
      <slot ref="pageContent" />
    </main>
    <client-only>
      <BouncingEmail />
      <div class="navbar-toggle" style="display: none" />
    </client-only>
    <div
      v-if="showLoader"
      id="serverloader"
      class="bg-none justify-content-around w-100"
      style="display: none"
    >
      <div class="text-center bg-white p-2">
        <img src="/loader.gif" alt="Loading..." width="100px" />
        <p>
          <span>Loading...</span><br /><span class="font-weight-bold"
            >Stuck here? We couldn't load our Javascript. Try refreshing. Or
            Chrome.</span
          ><br /><SupportLink text="No luck? Contact us" />
        </p>
      </div>
    </div>
    <client-only>
      <div class="d-none">
        <ChatButton
          v-if="replyToSend"
          ref="replyToPostChatButton"
          :userid="replyToUser"
        />
      </div>
      <BreakpointFettler />
      <div id="here" />
      <SomethingWentWrong />
    </client-only>
  </div>
</template>
<script>
import SomethingWentWrong from './SomethingWentWrong'
import { useNotificationStore } from '~/stores/notification'
import { useMessageStore } from '~/stores/message'
import { useMiscStore } from '~/stores/misc'
import { useChatStore } from '~/stores/chat'
import replyToPost from '@/mixins/replyToPost'
const SupportLink = () => import('~/components/SupportLink')
const BouncingEmail = () => import('~/components/BouncingEmail')
const BreakpointFettler = () => import('~/components/BreakpointFettler')

export default {
  components: {
    BouncingEmail,
    SupportLink,
    BreakpointFettler,
    SomethingWentWrong,
  },
  mixins: [replyToPost],
  data() {
    return {
      showLoader: true,
      timeTimer: null,
    }
  },
  computed: {
    breakpoint() {
      const store = useMiscStore()
      return store.getBreakpoint
    },
  },
  async mounted() {
    // Start our timer.  Holding the time in the store allows us to update the time regularly and have reactivity
    // cause displayed fromNow() values to change, rather than starting a timer for each of them.
    if (process.client) {
      this.updateTime()

      // We added a basic loader into the HTML.  This helps if we are loaded on an old browser where our JS bombs
      // out - at least we display something, with a link to support.  But now we're up and running, remove that.
      //
      // We have an animation on the loader so that it only becomes visible after ~10s.  That prevents page flicker
      // if we manage to get up and running rapidly.
      this.showLoader = false
    }

    if (this.me) {
      // Get chats and poll regularly for new ones
      const chatStore = useChatStore()
      chatStore.pollForChatUpdates()
    }

    try {
      // Set the build date.  This may get superceded by Sentry releases, but it does little harm to add it in.
      const runtimeConfig = useRuntimeConfig()
      const { $sentrySetContext, $sentrySetUser } = useNuxtApp()

      $sentrySetContext('builddate', {
        buildDate: runtimeConfig.public.BUILD_DATE,
      })

      if (this.me) {
        // Set the context for sentry so that we know which users are having errors.
        $sentrySetUser({ userid: this.myid })

        if (typeof __insp !== 'undefined') {
          // eslint-disable-next-line no-undef
          __insp.push([
            'tagSession',
            {
              userid: this.myid,
              builddate: runtimeConfig.public.BUILD_DATE,
            },
          ])
        }
      } else {
        // eslint-disable-next-line no-lonely-if
        if (typeof __insp !== 'undefined') {
          // eslint-disable-next-line no-undef
          __insp.push([
            'tagSession',
            {
              userid: 'Logged out',
              builddate: runtimeConfig.public.BUILD_DATE,
            },
          ])
        }
      }
    } catch (e) {
      console.log('Failed to set context', e)
    }

    if (process.client) {
      if (this.replyToSend) {
        // We have loaded the site with a reply that needs sending.  This happens if we force login in a way that
        // causes us to navigate away and back again.  Fetch the relevant message.
        const messageStore = useMessageStore()
        await messageStore.fetch(this.replyToSend.replyMsgId, true)
        this.replyToPost()
      }

      this.monitorTabVisibility()
    }
  },
  beforeUnmount() {
    if (process.client) {
      clearTimeout(this.timeTimer)
    }
  },
  methods: {
    updateTime() {
      const miscStore = useMiscStore()
      miscStore.setTime()
      this.timeTimer = setTimeout(this.updateTime, 1000)
    },
    monitorTabVisibility() {
      document.addEventListener('visibilitychange', () => {
        const miscStore = useMiscStore()
        miscStore.visible = !document.hidden

        if (this.me && !document.hidden) {
          // We have become visible.  Refetch our notification count and chat count, which are the two key things which
          // produce red badges people should click on.
          const notificationStore = useNotificationStore()
          notificationStore.fetchCount()

          const chatStore = useChatStore()
          chatStore.fetchChats()
        }
      })
    },
  },
}
</script>
<style scoped lang="scss">
@import '~bootstrap/scss/functions';
@import '~bootstrap/scss/variables';
@import '~bootstrap/scss/mixins/_breakpoints';

html {
  box-sizing: border-box;
}

*,
*:before,
*:after {
  box-sizing: border-box;
  margin: 0;
}

body.modal-open {
  padding-right: 0px !important;
}

.pageContent {
  margin-top: 75px;
}
</style>
