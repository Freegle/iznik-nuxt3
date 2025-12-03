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
              <VisibleWhen :at="['xs', 'sm']">
                <ExternalDa
                  ad-unit-path="/22794232631/freegle_sticky"
                  :max-height="mobileMaxHeight"
                  max-width="100vw"
                  min-width="100vw"
                  div-id="div-gpt-ad-1699973618906-0"
                  :jobs="false"
                  @rendered="adRendered"
                  @failed="adFailed"
                />
              </VisibleWhen>
              <VisibleWhen :at="['md', 'lg', 'xl', 'xxl']">
                <ExternalDa
                  ad-unit-path="/22794232631/freegle_sticky_desktop"
                  :max-height="desktopMaxHeight"
                  max-width="100vw"
                  min-width="100vw"
                  div-id="div-gpt-ad-1707999304775-0"
                  :jobs="false"
                  @rendered="adRendered"
                />
              </VisibleWhen>
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
        <!-- Height detection divs -->
        <div ref="mobileTallDetector" class="mobile-tall-detector" />
        <div ref="desktopTallDetector" class="desktop-tall-detector" />
      </div>
      <BreakpointFettler />
      <div id="here" />
      <SomethingWentWrong />
      <div id="videoda">
        <ExternalDa
          v-if="videoAd"
          video
          :jobs="false"
          ad-unit-path="video"
          div-id="div-da-video"
        />
      </div>
    </client-only>
  </div>
</template>
<script setup>
import {
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
  defineAsyncComponent,
} from 'vue'
import { useRoute } from 'vue-router'
import SomethingWentWrong from './SomethingWentWrong'
import { useAuthStore } from '~/stores/auth'
import { useNuxtApp, useRuntimeConfig } from '#app'
import { useNotificationStore } from '~/stores/notification'
import { useMessageStore } from '~/stores/message'
import { useMiscStore } from '~/stores/misc'
import { useChatStore } from '~/stores/chat'
import ChatButton from '~/components/ChatButton'
import VisibleWhen from '~/components/VisibleWhen.vue'
import InterestedInOthersModal from '~/components/InterestedInOthersModal.vue'
import DeletedRestore from '~/components/DeletedRestore.vue'
import DaDisableCTA from '~/components/DaDisableCTA.vue'
import { useReplyToPost } from '~/composables/useReplyToPost'
import { useMe } from '~/composables/useMe'
import { useMobileStore } from '@/stores/mobile' // APP

const { replyToSend, replyToUser, replyToPost } = useReplyToPost()

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

// Local state
const showLoader = ref(true)
let timeTimer = null
const adRendering = ref(true)
const firstRender = ref(true)
const interestedInOthersMsgid = ref(null)
const interestedInOthersUserId = ref(null)
const showInterestedModal = ref(false)
const videoAd = ref(true)

// Store access
const miscStore = useMiscStore()
const authStore = useAuthStore()
const { me, myid, loggedIn } = useMe()
const route = useRoute()

// Computed properties
const stickyAdRendered = computed(() => miscStore.stickyAdRendered)
const routePath = computed(() => route?.path)
const allowAd = computed(() => {
  // We don't want to show the ad on the landing page when logged out - looks tacky.
  return routePath.value !== '/' || loggedIn.value
})
// Keep constant margin - navbar is fixed position so content shouldn't shift when it hides/shows
const marginTop = computed(() => '60px')

// Methods
function updateTime() {
  miscStore.setTime()
  timeTimer = setTimeout(updateTime, 1000)
}

function monitorTabVisibility() {
  if (process.client) {
    document.addEventListener('visibilitychange', async () => {
      miscStore.visible = !document.hidden

      if (me && !document.hidden) {
        try {
          // We have become visible. Refetch our notification count and chat count, which are the two key things which
          // produce red badges people should click on.
          const notificationStore = useNotificationStore()
          notificationStore.fetchCount()

          const chatStore = useChatStore()

          // Don't log as we might have been logged out since we were last active.
          await chatStore.fetchChats(null, false)
        } catch (e) {
          // If we failed to fetch the chats, double-check we're logged in by fetching the user. If that
          // fails it'll log us out, which reduces our ability to start doing stuff in the mean time.
          authStore.fetchUser()
        }
      }
    })
  }
}

function adRendered(adShown) {
  console.log('Layout ad rendered', adShown, adShown ? 1 : 0)
  adRendering.value = false
  firstRender.value = false
  miscStore.stickyAdRendered = adShown ? 1 : 0
}

function adFailed() {
  console.log('Layout ad failed, not rendered')
  adRendering.value = false
  firstRender.value = false
  miscStore.stickyAdRendered = 0
}

function replySent() {
  showInterestedModal.value = true
}

const replyToPostChatButton = ref(null)

const windowHeight = ref(0)

function updateWindowHeight() {
  if (process.client) {
    windowHeight.value = window.innerHeight
  }
}

onMounted(async () => {
  if (process.client) {
    // Start our timer. Holding the time in the store allows us to update the time regularly and have reactivity
    // cause displayed fromNow() values to change, rather than starting a timer for each of them.
    updateTime()

    // We added a basic loader into the HTML. This helps if we are loaded on an old browser where our JS bombs
    // out - at least we display something, with a link to support. But now we're up and running, remove that.
    //
    // We have an animation on the loader so that it only becomes visible after ~10s. That prevents page flicker
    // if we manage to get up and running rapidly.
    showLoader.value = false

    // Start online checker
    miscStore.startOnlineCheck()
  }

  if (me.value) {
    // Get chats and poll regularly for new ones
    const chatStore = useChatStore()
    chatStore.pollForChatUpdates()
  }

  try {
    // Set the build date. This may get superceded by Sentry releases, but it does little harm to add it in.
    const runtimeConfig = useRuntimeConfig()
    const nuxtApp = useNuxtApp()
    const { $sentrySetContext, $sentrySetUser } = nuxtApp

    const sentryParams = {
      // APP
      buildDate: runtimeConfig.public.BUILD_DATE,
      deployId: runtimeConfig.public.DEPLOY_ID,
    }
    if (runtimeConfig.public.ISAPP) {
      console.log('LAYOUT mobileVersion', runtimeConfig.public.MOBILE_VERSION)
      sentryParams.mobileVersion = runtimeConfig.public.MOBILE_VERSION
      const mobileStore = useMobileStore()
      sentryParams.deviceuserinfo = mobileStore.deviceuserinfo
    }

    $sentrySetContext('builddate', sentryParams)

    if (me.value) {
      // Set the context for sentry so that we know which users are having errors.
      $sentrySetUser({ id: myid.value })

      if (typeof __insp !== 'undefined') {
        // eslint-disable-next-line no-undef
        __insp.push([
          'tagSession',
          {
            userid: myid.value,
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
    if (replyToSend.value?.replyMsgId) {
      // We have loaded the site with a reply that needs sending. This happens if we force login in a way that
      // causes us to navigate away and back again. Fetch the relevant message.
      interestedInOthersUserId.value = replyToUser.value
      interestedInOthersMsgid.value = replyToSend.value.replyMsgId
      const messageStore = useMessageStore()
      await messageStore.fetch(replyToSend.value.replyMsgId, true)
      console.log('Reply to post chat button', replyToPostChatButton.value)
      const replyResult = await replyToPost(replyToPostChatButton.value)
      if (replyResult) {
        replySent()
      }
    }

    monitorTabVisibility()

    // Track window resize for height detection
    updateWindowHeight()
    window.addEventListener('resize', updateWindowHeight)
  }
})

const mobileTallDetector = ref(null)
const desktopTallDetector = ref(null)

const desktopMaxHeight = computed(() => {
  // Use windowHeight to trigger reactivity on resize
  // Check if desktop tall detector is visible (using CSS media queries)
  if (windowHeight.value && process.client && desktopTallDetector.value) {
    const computed = window.getComputedStyle(desktopTallDetector.value)
    return computed.display === 'block' ? '250px' : '90px'
  }
  return '90px'
})

const mobileMaxHeight = computed(() => {
  // Use windowHeight to trigger reactivity on resize
  // Check if mobile tall detector is visible (using CSS media queries)
  if (windowHeight.value && process.client && mobileTallDetector.value) {
    const computed = window.getComputedStyle(mobileTallDetector.value)
    return computed.display === 'block' ? '100px' : '50px'
  }
  return '50px'
})

onBeforeUnmount(() => {
  if (process.client) {
    clearTimeout(timeTimer)
    window.removeEventListener('resize', updateWindowHeight)
  }
})
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

  @media (min-height: $mobile-tall) {
    height: $sticky-banner-height-mobile-tall;
  }

  @include media-breakpoint-up(md) {
    height: $sticky-banner-height-desktop;

    @media (min-height: $desktop-tall) {
      height: $sticky-banner-height-desktop-tall;
    }
  }
}

.aboveSticky {
  &.allowAd.stickyAdRendered {
    padding-bottom: calc($sticky-banner-height-mobile + 2px);

    @media (min-height: $mobile-tall) {
      padding-bottom: calc($sticky-banner-height-mobile-tall + 2px);
    }

    @include media-breakpoint-up(md) {
      padding-bottom: calc($sticky-banner-height-desktop + 2px);

      @media (min-height: $desktop-tall) {
        padding-bottom: calc($sticky-banner-height-desktop-tall + 2px);
      }
    }
  }
}

// Height detection divs - hidden but used to detect screen height breakpoints
.mobile-tall-detector {
  display: none;

  @media (min-height: $mobile-tall) {
    display: block;
  }
}

.desktop-tall-detector {
  display: none;

  @media (min-height: $desktop-tall) {
    display: block;
  }
}
</style>
