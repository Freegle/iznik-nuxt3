<template>
  <div :id="divId" />
</template>
<script setup>
// TODO Needs reworking for responsive ads a la OurGoogleDa
import { ref, onBeforeUnmount } from '#imports'
import { useMiscStore } from '~/stores/misc'
import { action } from '~/composables/useClientLog'

const miscStore = useMiscStore()
const unmounted = ref(false)

const props = defineProps({
  adUnitPath: {
    type: String,
    required: true,
  },
  dimensions: {
    type: Array,
    required: false,
    default: null,
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
  renderAd: {
    type: Boolean,
    required: true,
  },
})

const adShown = ref(true)

const uniqueid = ref(props.adUnitPath)

let slot = null

let refreshTimer = null
const PREBID_TIMEOUT = 2000
const AD_REFRESH_TIMEOUT = 31000

function refreshAd() {
  if (
    window.googletag?.pubads &&
    typeof window.googletag?.pubads === 'function' &&
    typeof window.googletag?.pubads().refresh === 'function' &&
    !unmounted.value
  ) {
    // Don't refresh if the ad is not visible or tab is not active.
    if (miscStore.visible) {
      // Refreshing an ad is a bit more complex because we're using prebid.  That means we have to request the
      // bids, and then once we've got those, refresh the ad slot to kick Google to render the ad.
      console.log('Request bids for ad', props.adUnitPath)

      window.pbjs.que.push(function () {
        window.pbjs.requestBids({
          timeout: PREBID_TIMEOUT,
          adUnitCodes: [props.adUnitPath],
          bidsBackHandler: function (bids, timedOut, auctionId) {
            if (timedOut) {
              action('Prebid timeout', { adUnitPath: props.adUnitPath })
            } else if (bids?.length) {
              console.log(
                'Got bids back',
                props.adUnitPath,
                bids,
                timedOut,
                auctionId
              )

              action('Prebid bids received', {
                adUnitPath: props.adUnitPath,
                bidCount: bids.length,
              })
            } else {
              console.log(
                'Got no bids back',
                props.adUnitPath,
                bids,
                timedOut,
                auctionId
              )

              action('Prebid no bids', { adUnitPath: props.adUnitPath })
            }

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
      // console.log('Not refreshing ad', props.adUnitPath)
    }

    refreshTimer = setTimeout(refreshAd, AD_REFRESH_TIMEOUT)
  }
}

const emit = defineEmits(['rendered'])

// We want to wait until an ad has been viewable for 100ms.  That reduces the impact of fast scrolling or
// redirects.
let GPTTimer = null
let GPTFailed = false

watch(
  () => props.renderAd,
  (newVal) => {
    if (newVal) {
      console.log('Queue GPT commands', props.divId)

      // Sometimes GPT is blocked, so we push the command but it never runs.
      // Start a fallback timer for that.
      if (!GPTTimer) {
        GPTTimer = setTimeout(() => {
          console.log("GPT didn't run", props.divId)
          GPTTimer = null
          GPTFailed = true
          emit('rendered', false)
        }, 1000)
      }

      window.googletag.cmd.push(function () {
        if (GPTFailed) {
          console.log('GPT already timed out')
        } else {
          clearTimeout(GPTTimer)
          console.log('Execute GPT define slot', props.divId)
          slot = window.googletag
            .defineSlot(props.adUnitPath, props.dimensions, props.divId)
            .addService(window.googletag.pubads())

          console.log('Add event listeners', props.adUnitPath)
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
                  console.log('Rendered empty', props.adUnitPath, adShown)
                  // Sentry.captureMessage('Ad rendered empty ' + props.adUnitPath)
                  // TODO
                  // maxWidth.value = 0
                  // maxHeight.value = 0
                } else {
                  console.log(
                    'Rendered',
                    props.adUnitPath,
                    event.size[0],
                    event.size[1]
                  )

                  // Sometimes we are returned silly values like 1,1, so make sure that we leave at least enough
                  // space for the minimum sized ad which we could plausibly have shown.
                  // TODO
                  // maxWidth.value = Math.max(event.size[0], minWidth.value)
                  // maxHeight.value = Math.max(event.size[1], minHeight.value)
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

          console.log('Excute GPT display', props.divId)
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
        }
      })
    }
  },
  {
    immediate: true,
  }
)

onBeforeUnmount(() => {
  unmounted.value = true

  try {
    if (refreshTimer) {
      clearTimeout(refreshTimer)
    }

    if (window.googletag?.destroySlots) {
      window.googletag.destroySlots([slot])
    }
  } catch (e) {
    console.log('Exception in onBeforeUnmount', e)
  }
})
</script>
