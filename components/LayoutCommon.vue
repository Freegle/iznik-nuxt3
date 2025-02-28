<template>
  <div>
    <main class="ml-0 ps-0 pe-0 pageContent">
      <div
        class="aboveSticky"
        :class="{
          allowAd,
          stickyAdRendered,
        }"
      >
        <!--        Breakpoint {{ breakpoint }}-->
        <slot ref="pageContent" />
      </div>
      <client-only>
        <div v-if="allowAd">
          <div
            class="sticky w-100 d-flex flex-column"
            :class="{
              allowClicks: !stickyAdRendered,
              'bg-white': stickyAdRendered,
            }"
          >
            <DaDisableCTA v-if="!adRendering && stickyAdRendered" />
            <div
              class="d-flex justify-content-around w-100"
              :class="{
                adRendering: adRendering && !firstRender,
              }"
            >
              <KeepAlive>
                <VisibleWhen :at="['xs', 'sm']">
                  <ExternalDa
                    ad-unit-path="/22794232631/freegle_sticky"
                    max-height="50px"
                    max-width="100vw"
                    min-width="100vw"
                    div-id="div-gpt-ad-1699973618906-0"
                    @rendered="adRendered"
                    @failed="adFailed"
                  />
                </VisibleWhen>
              </KeepAlive>
              <KeepAlive>
                <VisibleWhen :at="['md', 'lg', 'xl', 'xxl']">
                  <ExternalDa
                    ad-unit-path="/22794232631/freegle_sticky_desktop"
                    max-height="90px"
                    max-width="100vw"
                    min-width="100vw"
                    div-id="div-gpt-ad-1707999304775-0"
                    @rendered="adRendered"
                  />
                </VisibleWhen>
              </KeepAlive>
            </div>
          </div>
        </div>
      </client-only>
    </main>
    <client-only>
      <DeletedRestore />
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
        <img src="/loader.gif" loading="lazy" alt="Loading..." width="100px" />
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
          @sent="replySent"
        />
        <InterestedInOthersModal
          v-if="showInterestedModal"
          :msgid="interestedInOthersMsgid"
          :userid="interestedInOthersUserId"
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
import { mapState } from 'pinia'
import { useAuthStore } from '../stores/auth'
import SomethingWentWrong from './SomethingWentWrong'
import { useNotificationStore } from '~/stores/notification'
import { useMessageStore } from '~/stores/message'
import { useMiscStore } from '~/stores/misc'
import { useChatStore } from '~/stores/chat'
import replyToPost from '@/mixins/replyToPost'
import ChatButton from '~/components/ChatButton'
import { navBarHidden } from '~/composables/useNavbar'
import VisibleWhen from '~/components/VisibleWhen.vue'
import InterestedInOthersModal from '~/components/InterestedInOthersModal.vue'

const SupportLink = defineAsyncComponent(() =>
  import('~/components/SupportLink')
)
const BouncingEmail = defineAsyncComponent(() =>
  import('~/components/BouncingEmail')
)
const BreakpointFettler = defineAsyncComponent(() =>
  import('~/components/BreakpointFettler')
)

const ExternalDa = defineAsyncComponent(() => import('~/components/ExternalDa'))

export default {
  components: {
    InterestedInOthersModal,
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
      adRendering: true,
      firstRender: true,
      interestedInOthersMsgid: null,
      interestedInOthersUserId: null,
      showInterestedModal: false,
    }
  },
  computed: {
    ...mapState(useMiscStore, ['breakpoint', 'adsDisabled']),
    stickyAdRendered() {
      return useMiscStore().stickyAdRendered
    },
    routePath() {
      const route = useRoute()
      return route?.path
    },
    allowAd() {
      // We don't want to show the ad on the landing page when logged out - looks tacky.
      return this.routePath !== '/' || this.loggedIn
    },
    marginTop() {
      return navBarHidden.value ? '0px' : '60px'
    },
  },
  async mounted() {
    if (process.client) {
      // Start our timer.  Holding the time in the store allows us to update the time regularly and have reactivity
      // cause displayed fromNow() values to change, rather than starting a timer for each of them.
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
      if (this.replyToSend?.replyMsgId) {
        // We have loaded the site with a reply that needs sending.  This happens if we force login in a way that
        // causes us to navigate away and back again.  Fetch the relevant message.
        const messageStore = useMessageStore()
        await messageStore.fetch(this.replyToSend.replyMsgId, true)
        this.interestedInOthersUserId = this.replyToUser
        this.interestedInOthersMsgid = this.replyToSend.replyMsgId
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
    adRendered(adShown) {
      console.log('Layout ad rendered', adShown, adShown ? 1 : 0)
      this.adRendering = false
      this.firstRender = false
      const store = useMiscStore()
      store.stickyAdRendered = adShown ? 1 : 0
    },
    adFailed() {
      console.log('Layout ad failed, not rendered')
      this.adRendering = false
      this.firstRender = false
      const store = useMiscStore()
      store.stickyAdRendered = 0
    },
    replySent() {
      this.showInterestedModal = true
    },
  },
}
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';
@import 'assets/css/sticky-banner.scss';

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
  display: flex;
  flex-direction: column;
  max-height: 100vh;

  @supports (height: 100dvh) {
    max-height: 100dvh;
  }

  margin-top: v-bind(marginTop);
  transition: margin-top 1s;

  @include media-breakpoint-up(md) {
    margin-top: 75px;
  }
}

.sticky {
  position: fixed;
  bottom: 0;

  &.allowClicks {
    pointer-events: none;
  }

  .adRendering {
    background-color: $color-gray--dark;
  }

  @include media-breakpoint-up(lg) {
    background-color: transparent;
  }

  z-index: 10000;

  margin-top: 2px;
  width: 320px;
  height: $sticky-banner-height-mobile;

  @include media-breakpoint-up(md) {
    height: $sticky-banner-height-desktop;
  }
}

.aboveSticky {
  &.allowAd.stickyAdRendered {
    padding-bottom: calc($sticky-banner-height-mobile + 2px);

    @include media-breakpoint-up(md) {
      padding-bottom: calc($sticky-banner-height-desktop + 2px);
    }
  }
}
</style>
