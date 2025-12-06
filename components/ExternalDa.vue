<template>
  <client-only>
    <!--
    If you don't like ads, then you can use an ad blocker.  Plus you could donate to us
    at https://www.ilovefreegle.org/donate - if we got enough donations we would be delighted not to show ads.
     -->
    <div
      v-if="me || showLoggedOut"
      v-observe-visibility="visibilityChanged"
      class="pointer"
      :class="{
        'bg-white': adShown,
      }"
    >
      <div
        v-if="fallbackAdVisible && !video"
        class="d-flex w-100 justify-content-md-around"
        :style="maxWidth ? `max-width: ${maxWidth}` : ''"
      >
        <!-- Use job ads as fallback when main ads fail to load -->
        <JobsDaSlot
          v-if="jobs"
          :min-width="minWidth"
          :max-width="maxWidth"
          :min-height="minHeight"
          :max-height="maxHeight"
          :hide-header="hideJobsHeader"
          :class="{
            'text-center': maxWidth === '100vw',
          }"
          @rendered="rippleRendered"
        />
        <!-- Final fallback: donate ad if job ads not enabled -->
        <nuxt-link v-else to="/adsoff" style="display: block; max-width: 100%">
          <img
            src="/donate/SupportFreegle_970x250px_20May20215.png"
            alt="Please donate to help keep Freegle running"
            style="width: 100%; height: auto; display: block"
          />
        </nuxt-link>
      </div>
      <div v-else>
        <div
          v-if="isVisible || video"
          :class="{
            boredWithJobs,
            jobs,
          }"
        >
          <div class="d-flex w-100 justify-content-md-around">
            <JobsDaSlot
              v-if="renderAd && !boredWithJobs"
              :min-width="minWidth"
              :max-width="maxWidth"
              :min-height="minHeight"
              :max-height="maxHeight"
              :hide-header="hideJobsHeader"
              :class="{
                'text-center': maxWidth === '100vw',
              }"
              @rendered="rippleRendered"
              @borednow="setBored"
            />
            <OurPlaywireDa
              v-else-if="playWire"
              ref="playwiread"
              :ad-unit-path="adUnitPath"
              :min-width="minWidth"
              :max-width="maxWidth"
              :min-height="minHeight"
              :max-height="maxHeight"
              :div-id="divId"
              :render-ad="renderAd"
              :video="video"
              @rendered="rippleRendered"
            />
            <OurGoogleDa
              v-else-if="adSense"
              ref="googlead"
              :ad-unit-path="adUnitPath"
              :min-width="minWidth"
              :max-width="maxWidth"
              :min-height="minHeight"
              :max-height="maxHeight"
              :div-id="divId"
              :render-ad="renderAd"
              @rendered="rippleRendered"
            />
            <OurPrebidDa
              v-else
              ref="prebidad"
              :ad-unit-path="adUnitPath"
              :min-width="minWidth"
              :max-width="maxWidth"
              :min-height="minHeight"
              :max-height="maxHeight"
              :div-id="divId"
              :render-ad="renderAd"
              @rendered="rippleRendered"
            />
          </div>
        </div>
      </div>
    </div>
  </client-only>
</template>
<script setup>
import { ref, computed, onBeforeUnmount } from '#imports'
import { useConfigStore } from '~/stores/config'
import { useMiscStore } from '~/stores/misc'
import { useAuthStore } from '~/stores/auth'

const miscStore = useMiscStore()

const props = defineProps({
  adUnitPath: {
    type: String,
    required: true,
  },
  minWidth: {
    type: String,
    required: false,
    default: null,
  },
  maxWidth: {
    type: String,
    required: false,
    default: null,
  },
  minHeight: {
    type: String,
    required: false,
    default: null,
  },
  maxHeight: {
    type: String,
    required: false,
    default: null,
  },
  divId: {
    type: String,
    required: true,
  },
  inModal: {
    type: Boolean,
    default: false,
  },
  showLoggedOut: {
    type: Boolean,
    default: true,
  },
  jobs: {
    type: Boolean,
    default: true,
  },
  video: {
    type: Boolean,
    default: false,
  },
  hideJobsHeader: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['rendered', 'disabled'])

// We can run with Playwire, Ad Sense or with Prebid.  Playwire is the default.
const playWire = ref(true)
const adSense = ref(false)
const renderAd = ref(false)
const adShown = ref(true)
const boredWithJobs = computed(() => !props.jobs || miscStore.boredWithJobs)

function setBored() {
  // Using the store, but non-persisted, means that we'll show job ads on initial page load, but then other ads
  // thereafter, including after page transition.
  //
  // This means that if they're not interested in job ads we'll get more ad views.
  miscStore.boredWithJobs = true
}

let prebidRetry = 0
let tcDataRetry = 0
let visibleAndScriptsLoadedTimer = null
const isVisible = ref(false)
const fallbackAdVisible = ref(false)
let firstBecomeVisible = false

function visibilityChanged(visible) {
  // The DOM element may have become visible.  But that isn't the end of the story.
  //
  // We need to wait for CookieYes, then the TC data, then prebid being loaded.  This is triggered in nuxt.config.ts.
  // Check the status here rather than on component load, as it might not be available yet.
  visibleAndScriptsLoadedTimer = null

  if (process.client) {
    const runtimeConfig = useRuntimeConfig()

    if (
      runtimeConfig.public.ISAPP &&
      !runtimeConfig.public.USE_COOKIES &&
      !props.video
    ) {
      // App without cookies - show fallback donation ad unless recent donor (but not for video ads)
      console.log('Running in app with no cookies - using fallback ad')
      const me = useAuthStore().user
      const recentDonor =
        me &&
        me.donated &&
        new Date(me.donated) > new Date(Date.now() - 45 * 24 * 60 * 60 * 1000)
      if (recentDonor) {
        console.log('Ads disabled in app as recent donor')
        emit('rendered', false)
      } else {
        fallbackAdVisible.value = true
        adShown.value = true
        emit('rendered', true)
      }
      return
    }

    if (!runtimeConfig.public.COOKIEYES) {
      // Not using CookieYes, e.g. in dev.
      console.log('No CookieYes in ad')
      isVisible.value = visible

      if (visible && !firstBecomeVisible) {
        // We might want to show the ad now, if we stay visible for a little while.
        firstBecomeVisible = true

        if (!checkStillVisibleTimer) {
          checkStillVisibleTimer = setTimeout(checkStillVisible, 100)
        }
      }
    } else if (!window.__tcfapi) {
      // CookieYes not yet loaded - retry.
      console.log('CookieYes not yet loaded in ad')
      visibleAndScriptsLoadedTimer = window.setTimeout(() => {
        visibilityChanged(visible)
      }, 100)
    } else {
      // CookieYes is loaded.  Now we have to wait until they've given consent.
      window.__tcfapi(
        'getTCData',
        2,
        (tcData, success) => {
          if (success && tcData && tcData.tcString) {
            // The user has responded to the cookie banner.
            console.log('TC data loaded and TC String set', tcData.tcString)

            if (!playWire.value && !adSense.value && !window.pbjs?.version) {
              // Prebid required but not loaded yet.
              prebidRetry++

              if (prebidRetry > 20) {
                // Give up.  Probably blocked - show fallback donation ad.
                console.log('Give up on prebid load - showing fallback')
                fallbackAdVisible.value = true
                adShown.value = true
                emit('rendered', true)
              } else {
                // Try again for prebid later.
                visibleAndScriptsLoadedTimer = setTimeout(() => {
                  visibilityChanged(visible)
                }, 100)
              }
            } else {
              // Prebid has loaded if required.  We might want to show the ad now, if we stay visible for a little while.
              // Video ads are always visible because they float.
              console.log('Prebid loaded or not required')
              isVisible.value = visible || props.video

              if (isVisible.value && !firstBecomeVisible) {
                if (!checkStillVisibleTimer) {
                  checkStillVisibleTimer = setTimeout(checkStillVisible, 100)
                }
              }
            }
          } else {
            // TC data not yet ready - the user hasn't yet responded to the cookie banner.
            // Try again later.
            console.log('TC data not yet available in ad')
            tcDataRetry++

            if (tcDataRetry > 50) {
              // Give up.  Probably blocked - show fallback donation ad.
              console.log('Give up on TC data load - showing fallback')
              fallbackAdVisible.value = true
              adShown.value = true
              emit('rendered', true)
            } else {
              visibleAndScriptsLoadedTimer = window.setTimeout(() => {
                visibilityChanged(visible)
              }, 100)
            }
          }
        },
        [1, 2, 3]
      )
    }
  }
}

// We want to wait until an ad has been viewable for 100ms.  That reduces the impact of fast scrolling or
// redirects.
let checkStillVisibleTimer = null

async function checkStillVisible() {
  // Check if the ad is still visible after this delay, and no modal is open.
  console.log(
    'Check if ad still visible',
    isVisible.value,
    props.inModal,
    document.body.classList.contains('modal-open')
  )

  if (
    isVisible.value &&
    (props.inModal || !document.body.classList.contains('modal-open'))
  ) {
    // Check if we are showing ads.
    const configStore = useConfigStore()
    const showingAds = await configStore.fetch('ads_enabled')
    const me = useAuthStore().user

    // Add grace period for donations - technically we want it to be 31 days, but for people who have a direct
    // debit set up we might not have manually processed those donations for a while.
    const recentDonor =
      me &&
      me.donated &&
      new Date(me.donated) > new Date(Date.now() - 45 * 24 * 60 * 60 * 1000)

    const myEmail = me?.email

    const runtimeConfig = useRuntimeConfig()
    const userSite = runtimeConfig.public.USER_SITE
    const userSite2 = userSite.replace('www.', '')
    console.log('Consider system', myEmail, userSite, userSite2)

    if (
      myEmail &&
      (myEmail.includes(userSite) || myEmail.includes(userSite2))
    ) {
      console.log('Ads disabled as system account')
      emit('rendered', false)
    } else if (recentDonor) {
      console.log('Ads disabled as recent donor')
      emit('rendered', false)
    } else if (showingAds?.length && parseInt(showingAds[0].value)) {
      renderAd.value = true
    } else {
      console.log(
        'Ads disabled in server config - showing fallback',
        showingAds
      )
      useMiscStore().adsDisabled = true
      // Show fallback donation ad instead of empty space
      fallbackAdVisible.value = true
      adShown.value = true
      emit('rendered', true)
    }
  } else {
    emit('rendered', false)
  }
}

function rippleRendered(rendered) {
  if (rendered) {
    adShown.value = true
    emit('rendered', true)
  } else {
    // Ad failed to render - show fallback donation ad
    console.log('Ad failed to render - showing fallback')
    useMiscStore().adsDisabled = true
    fallbackAdVisible.value = true
    adShown.value = true
    emit('rendered', true)
  }
}

const passClicks = computed(() => {
  return !adShown.value
})

onBeforeUnmount(() => {
  try {
    if (visibleAndScriptsLoadedTimer) {
      clearTimeout(visibleAndScriptsLoadedTimer)
    }
  } catch (e) {
    console.log('Exception in onBeforeUnmount', e)
  }
})
</script>
<style scoped lang="scss">
.pointer {
  pointer-events: v-bind(passClicks);
}
</style>
