<template>
  <div>
    <main class="ml-0 ps-0 pe-0 pageContent">
      <div class="aboveSticky">
        <slot ref="pageContent" />
      </div>
      <VisibleWhen :at="['xs', 'sm', 'md', 'lg']">
        <div
          v-if="allowAd"
          class="d-flex justify-content-around w-100 sticky"
          style="height: 52px"
        >
          <ExternalDa
            ad-unit-path="/22794232631/freegle_sticky"
            :dimensions="[320, 50]"
            div-id="div-gpt-ad-1699973618906-0"
            class="sticky"
            style="width: 320px; height: 50px; margin-top: 2px"
            pixel
          />
        </div>
        <div
          v-else
          class="sticky ourBack w-100 text-center d-flex flex-column justify-content-center"
          style="height: 52px"
        >
          <nuxt-link to="/donate" class="text-white nodecor">
            Keep Freegle running. Click to donate.
          </nuxt-link>
        </div>
      </VisibleWhen>
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
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import SomethingWentWrong from './SomethingWentWrong'
import { useNotificationStore } from '~/stores/notification'
import { useMessageStore } from '~/stores/message'
import { useMiscStore } from '~/stores/misc'
import { useChatStore } from '~/stores/chat'
import replyToPost from '@/mixins/replyToPost'
import ChatButton from '~/components/ChatButton'
import VisibleWhen from '~/components/VisibleWhen'
const SupportLink = () => import('~/components/SupportLink')
const BouncingEmail = () => import('~/components/BouncingEmail')
const BreakpointFettler = () => import('~/components/BreakpointFettler')
const ExternalDa = () => import('~/components/ExternalDa')

export default {
  components: {
    BouncingEmail,
    SupportLink,
    BreakpointFettler,
    SomethingWentWrong,
    ChatButton,
    ExternalDa,
    VisibleWhen,
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
    routePath() {
      const route = useRoute()
      return route?.path
    },
    allowAd() {
      // We don't want to show the ad on the landing page when logged out - looks tacky.
      return this.routePath !== '/' || this.loggedIn
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

      // Start online checker
      const miscStore = useMiscStore()
      miscStore.startOnlineCheck()
    }

    if (this.me) {
      // Get chats and poll regularly for new ones
      const chatStore = useChatStore()
      chatStore.pollForChatUpdates()
    } else if (process.client) {
      // We only add the cookie banner for logged out users.  This reduces costs.  For logged-in users, we assume
      // they have already seen the banner and specified a preference if they care.
      const runtimeConfig = useRuntimeConfig()

      console.log(
        'Consider adding cookie banner',
        runtimeConfig.public.COOKIEYES
      )

      if (runtimeConfig.public.COOKIEYES) {
        console.log('Add it')
        const cookieScript = document.getElementById('cookieyes')

        if (!cookieScript) {
          const script = document.createElement('script')
          script.id = 'cookieyes'
          script.setAttribute('src', runtimeConfig.public.COOKIEYES)

          document.head.appendChild(script)
        }
      } else {
        console.log('No cookie banner')
      }
    }

    try {
      // Set the build date.  This may get superceded by Sentry releases, but it does little harm to add it in.
      const runtimeConfig = useRuntimeConfig()
      const { $sentrySetContext, $sentrySetUser } = useNuxtApp()

      $sentrySetContext('builddate', {
        buildDate: runtimeConfig.public.BUILD_DATE,
        deployId: runtimeConfig.public.DEPLOY_ID,
      })

      if (this.me) {
        // Set the context for sentry so that we know which users are having errors.
        $sentrySetUser({ id: this.myid })

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

      this.haveMounted = true
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
      if (process.client) {
        document.addEventListener('visibilitychange', async () => {
          const miscStore = useMiscStore()
          miscStore.visible = !document.hidden

          if (this.me && !document.hidden) {
            try {
              // We have become visible.  Refetch our notification count and chat count, which are the two key things which
              // produce red badges people should click on.
              const notificationStore = useNotificationStore()
              notificationStore.fetchCount()

              const chatStore = useChatStore()

              // Don't log as we might have been logged out since we were last active.
              await chatStore.fetchChats(null, false)
            } catch (e) {
              // If we failed to fetch the chats, double-check we're logged in by fetching the user. If that
              // fails it'll log us out, which reduces our ability to start doing stuff in the mean time.
              const authStore = useAuthStore()
              authStore.fetchUser()
            }
          }
        })
      }
    },
  },
}
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';

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
  display: flex;
  flex-direction: column;
  max-height: 100vh;
  transition: padding-top 1s;
}

.sticky {
  position: fixed;
  bottom: 0;
  background-color: $color-green-background;
  z-index: 10000;

  @include media-breakpoint-up(md) {
    display: none !important;
  }
}

.aboveSticky {
  padding-bottom: 52px;

  @include media-breakpoint-up(md) {
    padding-bottom: unset;
  }
}
</style>
