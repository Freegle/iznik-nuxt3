<template>
  <div>
    <MainHeader
      v-model:chat-count="chatCount"
      v-model:unread-notification-count="unreadNotificationCount"
    />
    complete {{ complete }}
    <main v-if="complete">
      <slot ref="pageContent" class="ml-0 ps-0 pe-0 pageContent" />
    </main>
    <!--  TODO  <BouncingEmail />-->
    <div class="navbar-toggle" style="display: none" />
    <div id="serverloader" class="bg-white">
      <b-img src="/loader.gif" alt="Loading..." />
      <!-- Don't allow this to format neatly, otherwise SSR doesn't match and we get a client-side re-render -->
      <!-- eslint-disable-next-line -->
      <p><span>Loading...</span><br><span class="font-weight-bold">Stuck here?  Try refreshing.  Or Chrome.</span><br><SupportLink text="No luck? Contact us" /></p>
    </div>
    <client-only>
      <span ref="breakpoint" class="d-inline d-sm-none" />
      <div class="d-none">
        <!--  TODO      <ChatButton v-if="replyToSend" ref="replyToPostChatButton" :userid="replyToUser" />-->
      </div>
      <BreakpointFettler />
      <GoogleOneTap @complete="complete = true" />
    </client-only>
  </div>
</template>
<script>
import { useMiscStore } from '../stores/misc'
import MainHeader from '../components/MainHeader'
import { useChatStore } from '../stores/chat'
import GoogleOneTap from '../components/GoogleOneTap'
import SupportLink from '../components/SupportLink'
const { $sentrySetContext, $sentrySetUser } = useNuxtApp()

export default {
  components: {
    // BouncingEmail,
    GoogleOneTap,
    SupportLink,
    MainHeader,
  },
  data() {
    return {
      complete: false,
      timeTimer: null,
      unreadNotificationCount: 0,
      chatCount: 0,
    }
  },
  // mixins: [replyToPost],
  computed: {
    breakpoint() {
      const store = useMiscStore()
      return store.getBreakpoint
    },
  },
  // watch: {
  //   $route(newVal) {
  // TODO Google Analytics
  //     // Automatic route tracking doesn't seem to be working.
  //     this.$ga.page(newVal.fullPath)
  //   }
  // },
  // async mounted() {
  mounted() {
    // Start our timer.  Holding the time in the store allows us to update the time regularly and have reactivity
    // cause displayed fromNow() values to change, rather than starting a timer for each of them.
    this.updateTime()

    if (document) {
      // We added a basic loader into the HTML.  This helps if we are loaded on an old browser where our JS bombs
      // out - at least we display something, with a link to support.  But now we're up and running, remove that.
      //
      // We have an animation on the loader so that it only becomes visible after ~10s.  That prevents page flicker
      // if we manage to get up and running rapidly.
      const l = document.getElementById('serverloader')
      l.style.display = 'none'
    }

    if (this.me) {
      // Get chats and poll regularly for new ones
      const chatStore = useChatStore()
      chatStore.pollForChatUpdates()
    }

    try {
      // Set the build date.  This may get superceded by Sentry releases, but it does little harm to add it in.
      const runtimeConfig = useRuntimeConfig()

      $sentrySetContext('builddate', {
        buildDate: runtimeConfig.public.BUILD_DATE,
      })

      if (this.me) {
        // Set the context for sentry so that we know which users are having errors.
        $sentrySetUser({ userid: this.myid })

        // eslint-disable-next-line no-undef
        if (typeof __insp !== 'undefined') {
          // eslint-disable-next-line no-undef
          __insp.push([
            'tagSession',
            {
              userid: this.myid,
              builddate: process.env.BUILD_DATE,
            },
          ])
        }
      } else {
        // eslint-disable-next-line no-undef,no-lonely-if
        if (typeof __insp !== 'undefined') {
          // eslint-disable-next-line no-undef
          __insp.push([
            'tagSession',
            {
              userid: 'Logged out',
              builddate: process.env.BUILD_DATE,
            },
          ])
        }
      }
    } catch (e) {
      console.log('Failed to set context', e)
    }
    //
    //   if (process.client) {
    //     if (this.replyToSend) {
    //       // We have loaded the site with a reply that needs sending.  This happens if we force login in a way that
    //       // causes us to navigate away and back again.  Fetch the relevant message.
    // TODO Loaded with reply to send
    //       await this.$store.dispatch('messages/fetch', {
    //         id: this.replyToSend.replyMsgId
    //       })
    //
    //       this.replyToPost()
    //     }
    //   }
  },
  beforeDestroy() {
    clearTimeout(this.timeTimer)
  },
  methods: {
    updateTime() {
      const miscStore = useMiscStore()
      miscStore.setTime()
      this.timeTimer = setTimeout(this.updateTime, 1000)
    },
  },
}
// TODO Look for v-icon name = and replace with v-icon icon=
// TODO Look for b-btn and replace with b-button
</script>
<style scoped lang="scss">
@import '~bootstrap/scss/functions';
@import '~bootstrap/scss/variables';
@import '~bootstrap/scss/mixins/_breakpoints';

html {
  box-sizing: border-box;
}

.pageContent {
  padding-top: 68px;
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

#serverloader {
  z-index: 1000;
  text-align: center;
  position: fixed; /* or absolute */
  top: calc(50% - 44px);
  left: calc(50% - 44px);
  font-size: 12px;
  padding: 5px;
  border: 1px black;
  border-radius: 5px;
  animation: 15s fadeIn;
}

@keyframes fadeIn {
  0% {
    opacity: 0;
  }
  90% {
    opacity: 0;
  }
  100% {
    visibility: visible;
    opacity: 1;
  }
}

body:not(.landing) {
  main {
    margin-top: 66px;
  }
}

body.landing {
  main {
    margin-top: 0px;

    @include media-breakpoint-up(md) {
      margin-top: 66px;
    }
  }
}
</style>
