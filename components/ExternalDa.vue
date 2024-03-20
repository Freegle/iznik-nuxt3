<template>
  <client-only>
    <!--
    If you don't like ads, then you can use an ad blocker.  Plus you could donate to us
    at https://www.ilovefreegle.org/donate - if we got enough donations we would be delighted not to show ads.
     -->
    <div v-if="me" v-observe-visibility="visibilityChanged" class="pointer">
      <div v-if="isVisible">
        <div
          class="d-flex w-100 justify-content-around"
          :style="{
            width: maxWidth + 'px',
            height: maxHeight + 'px',
          }"
        >
          <div :id="divId" />
        </div>
        <p
          v-if="isVisible && adShown"
          class="text-center textsize d-none d-md-block"
        >
          Advertisement. These help Freegle keep going.
        </p>
        <!--    <div class="bg-white">-->
        <!--      Path {{ adUnitPath }} id {{ divId }} dimensions {{ dimensions }}-->
        <!--    </div>-->
      </div>
    </div>
  </client-only>
</template>
<script setup>
import { ref, computed, onBeforeUnmount } from '#imports'
import { useMiscStore } from '~/stores/misc'

const miscStore = useMiscStore()
const unmounted = ref(false)

const props = defineProps({
  adUnitPath: {
    type: String,
    required: true,
  },
  dimensions: {
    type: Array,
    required: true,
  },
  divId: {
    type: String,
    required: true,
  },
  pixel: {
    type: Boolean,
    default: false,
  },
})

const adShown = ref(true)

const passClicks = computed(() => {
  return !adShown.value
})

const uniqueid = ref(props.adUnitPath)

const maxWidth = ref(Math.max(...props.dimensions.map((d) => d[0])))
const maxHeight = ref(Math.max(...props.dimensions.map((d) => d[1])))

let slot = null

let refreshTimer = null
let visibleTimer = null
const PREBID_TIMEOUT = 1000
const AD_REFRESH_TIMEOUT = 45000

function refreshAd() {
  if (
    window.googletag?.pubads &&
    typeof window.googletag?.pubads === 'function' &&
    typeof window.googletag?.pubads().refresh === 'function' &&
    !unmounted.value
  ) {
    // Don't refresh if the ad is not visible or tab is not active.
    if (isVisible.value && miscStore.visible) {
      // Refreshing an ad is a bit more complex because we're using prebid.  That means we have to request the
      // bids, and then once we've got those, refresh the ad slot to kick Google to render the ad.
      console.log('Request bids for ad', props.adUnitPath)

      window.pbjs.que.push(function () {
        window.pbjs.requestBids({
          timeout: PREBID_TIMEOUT,
          adUnitCodes: [props.adUnitPath],
          bidsBackHandler: function (bids, timedOut, auctionId) {
            console.log('Got bids back', bids, timedOut, auctionId)
            window.pbjs.setTargetingForGPTAsync([props.adUnitPath])

            if (slot) {
              window.googletag.pubads().refresh([slot])

              console.log('Refreshed slot', props.adUnitPath)
            } else {
              console.error(
                'No slot found to refresh found for',
                props.adUnitPath
              )
            }
          },
        })
      })
    } else {
      // console.log('Not refreshing ad', props.adUnitPath, isVisible.value)
    }

    refreshTimer = setTimeout(refreshAd, AD_REFRESH_TIMEOUT)
  }
}

const isVisible = ref(false)
let shownFirst = false
const emit = defineEmits(['rendered'])

// We want to wait until an ad has been viewable for 100ms.  That reduces the impact of fast scrolling or
// redirects.
let initialTimer = null

function handleVisible() {
  // Check if the ad is still visible after this delay, and no modal is open.
  if (isVisible.value && !document.body.classList.contains('modal-open')) {
    window.googletag.cmd.push(function () {
      slot = window.googletag
        .defineSlot(props.adUnitPath, props.dimensions, props.divId)
        .addService(window.googletag.pubads())

      window.googletag.cmd.push(function () {
        window.googletag.display(props.divId)

        if (window.googletag.pubads().isInitialLoadDisabled()) {
          // We need to refresh the ad because we called disableInitialLoad.  That's what you do when
          // using prebid.
          console.log('Displayed, now trigger refresh', props.adUnitPath)
          refreshAd()
        } else {
          console.log('Displayed and rendered, refresh timer')

          if (!refreshTimer) {
            refreshTimer = setTimeout(refreshAd, AD_REFRESH_TIMEOUT)
          }
        }

        shownFirst = true
      })
    })

    window.googletag.cmd.push(function () {
      window.googletag
        .pubads()
        .addEventListener('slotRenderEnded', (event) => {
          if (event?.slot.getAdUnitPath() === props.adUnitPath) {
            console.log(
              'Rendered',
              uniqueid.value,
              'empty',
              event?.isEmpty,
              event
            )

            if (event?.isEmpty) {
              adShown.value = false
              maxWidth.value = 0
              maxHeight.value = 0
            } else {
              maxWidth.value = event.size[0]
              maxHeight.value = event.size[1]
            }

            if (event?.isEmpty) {
              adShown.value = false
              console.log('Rendered empty', props.adUnitPath, adShown)
              // Sentry.captureMessage('Ad rendered empty ' + props.adUnitPath)
            } else {
              maxWidth.value = event.size[0]
              maxHeight.value = event.size[1]
            }

            emit('rendered', adShown.value)
          }
        })
        .addEventListener('slotVisibilityChanged', (event) => {
          if (event?.slot.getAdUnitPath() === props.adUnitPath) {
            if (event.inViewPercentage < 51 && miscStore.visible) {
              // const msg =
              //   'Visibility of slot ' +
              //   props.adUnitPath +
              //   ' changed. New visibility: ' +
              //   event.inViewPercentage +
              //   '%.Viewport size: ' +
              //   window.innerWidth +
              //   'x' +
              //   window.innerHeight
              //
              // console.log(msg)
              // Sentry.captureMessage(msg)
            }
          }
        })
    })
  }
}
function visibilityChanged(visible) {
  // Check the pbjs status here rather than on component load, as it might not be available yet.
  if (process.client) {
    if (!window.pbjs?.version) {
      console.log('Prebid not loaded yet')
      visibleTimer = window.setTimeout(() => {
        visibilityChanged(visible)
      }, 100)
    } else {
      visibleTimer = null

      try {
        isVisible.value = visible

        if (visible && !shownFirst) {
          console.log('Queue create ad', props.adUnitPath, props.divId)

          if (!initialTimer) {
            initialTimer = setTimeout(handleVisible, 100)
          }
        }
      } catch (e) {
        console.log('Exception in visibilityChanged', e)
      }
    }
  }
}

onBeforeUnmount(() => {
  unmounted.value = true

  try {
    if (refreshTimer) {
      clearTimeout(refreshTimer)
    }

    if (visibleTimer) {
      clearTimeout(visibleTimer)
    }

    if (window.googletag?.destroySlots) {
      window.googletag.destroySlots([slot])
    }
  } catch (e) {
    console.log('Exception in onBeforeUnmount', e)
  }
})
</script>
<style scoped lang="scss">
.textsize {
  font-size: 0.75rem;
}

.pointer {
  pointer-events: v-bind(passClicks);
}
</style>
