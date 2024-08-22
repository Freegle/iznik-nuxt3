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
    >
      <div v-if="isVisible">
        <div class="d-flex w-100 justify-content-around">
          <OurGoogleAd
            v-if="adSense"
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
          <OurPrebidAd
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
  </client-only>
</template>
<script setup>
import { ref, computed, onBeforeUnmount } from '#imports'
import { useConfigStore } from '~/stores/config'

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
    default: false,
  },
})

const emit = defineEmits(['rendered'])

// We can either run with Ad Sense or with Prebid.  Ad Sense is the default.
const adSense = ref(true)
const renderAd = ref(false)
const adShown = ref(true)

let prebidRetry = 0
let tcDataRetry = 0
let visibleAndScriptsLoadedTimer = null
const isVisible = ref(false)
let firstBecomeVisible = false

function visibilityChanged(visible) {
  // The DOM element may have become visible.  But that isn't the end of the story.
  //
  // We need to wait for CookieYes, then the TC data, then prebid being loaded.  This is triggered in nuxt.config.ts.
  // Check the status here rather than on component load, as it might not be available yet.
  visibleAndScriptsLoadedTimer = null

  if (process.client) {
    const runtimeConfig = useRuntimeConfig()

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
            console.log('TC data loaded and TC String set')
            if (!adSense.value && !window.pbjs?.version) {
              // Prebid required but not loaded yet.
              prebidRetry++

              if (prebidRetry > 20) {
                // Give up.  Probably blocked, so we should emit that we've not rendered an ad.  This may trigger
                // a fallback ad.
                console.log('Give up on prebid load')
                emit('rendered', false)
              } else {
                // Try again for prebid later.
                visibleAndScriptsLoadedTimer = setTimeout(() => {
                  visibilityChanged(visible)
                }, 100)
              }
            } else {
              // Prebid has loaded.  We might want to show the ad now, if we stay visible for a little while.
              console.log('Prebid loaded or not required')
              isVisible.value = visible

              if (visible && !firstBecomeVisible) {
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
              // Give up.  Probably blocked, so we should emit that we've not rendered an ad.  This may trigger
              // a fallback ad.
              console.log('Give up on TC data load')
              emit('rendered', false)
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

    if (showingAds?.length && parseInt(showingAds[0].value)) {
      renderAd.value = true
    } else {
      console.log('Ads disabled in server config')
      emit('rendered', false)
    }
  } else {
    emit('rendered', false)
  }
}

function rippleRendered(rendered) {
  adShown.value = rendered
  emit('rendered', rendered)
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
