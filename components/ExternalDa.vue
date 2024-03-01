<template>
  <client-only>
    <!--
    If you don't like ads, then you can use an ad blocker.  Plus you could donate to us
    at https://www.ilovefreegle.org/donate - if we got enough donations we would be delighted not to show ads.
     -->
    <div v-observe-visibility="visibilityChanged" class="pointer">
      <div
        v-if="isVisible"
        class="d-flex w-100 justify-content-around"
        :style="{
          width: maxWidth + 'px',
          height: maxHeight + 'px',
        }"
      >
        <AdvertisingSlot :id="divId" />
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
  </client-only>
</template>
<script setup>
import { AdvertisingSlot } from '@storipress/vue-advertising'
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
// const adConfig = ref(AD_GPT_CONFIG)

const passClicks = computed(() => {
  return !adShown.value
})

const uniqueid = ref(props.adUnitPath)
const blocked = false

const maxWidth = ref(Math.max(...props.dimensions.map((d) => d[0])))
const maxHeight = ref(Math.max(...props.dimensions.map((d) => d[1])))

const slot = ref(null)

const timer = ref(null)

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
      window.googletag.pubads().refresh([slot.value])
    }

    timer.value = setTimeout(refreshAd, AD_REFRESH_TIMEOUT)
  }
}

// const PREBID_TIMEOUT = 1000

// function runBids() {
//   console.log('Request bids')
//
//   window.ihowpbjs.que.push(function () {
//     // Find slot in AD_GPT_CONFIG
//     const slotConfig = AD_GPT_CONFIG.slots.find(
//       (item) => item.path === props.adUnitPath && item.id === props.divId
//     )
//     console.log('Slot config', slotConfig)
//     slot.value.bids = slotConfig.bids
//
//     window.ihowpbjs.requestBids({
//       bidsBackHandler: function (bids, timedOut, auctionId) {
//         console.log('Bids back', bids, timedOut, auctionId)
//         window.googletag.pubads().refresh([slot.value])
//       },
//       timeout: PREBID_TIMEOUT,
//     })
//   })
//
//   console.log('Process queue')
//   window.ihowpbjs.processQueue()
//   console.log('Process queue')
// }

const isVisible = ref(false)
let shownFirst = false
// const loadedScripts = ref(false)
const emit = defineEmits(['rendered'])

function visibilityChanged(visible) {
  if (!blocked) {
    try {
      isVisible.value = visible

      if (visible && !shownFirst) {
        console.log('Queue create ad', props.adUnitPath, props.divId)
        shownFirst = true

        // await loadGPT()
        // await loadPubmatic()
        // loadedScripts.value = true
        //
        // if (!loadedScripts.value) {
        //   runBids()
        // }

        window.googletag.cmd.push(function () {
          window.googletag
            .pubads()
            .addEventListener('slotRenderEnded', (event) => {
              if (event?.slot.getAdUnitPath() === props.adUnitPath) {
                // Save off the slot for when we run the prebids later.
                slot.value = event.slot

                console.log(
                  'Rendered',
                  uniqueid.value,
                  'empty',
                  event?.isEmpty,
                  event
                )

                if (event?.isEmpty) {
                  adShown.value = false
                  console.log('Rendered empty', adShown)
                } else {
                  maxWidth.value = event.size[0]
                  maxHeight.value = event.size[1]
                }

                if (event?.isEmpty) {
                  adShown.value = false
                  console.log('Rendered empty', adShown)
                } else {
                  maxWidth.value = event.size[0]
                  maxHeight.value = event.size[1]
                }

                emit('rendered', adShown.value)
              }
            })
            .addEventListener('slotVisibilityChanged', (event) => {
              if (event?.slot.getAdUnitPath() === props.adUnitPath) {
                if (event.inViewPercentage < 51) {
                  // console.log(
                  //   `Visibility of slot ${event.slot.getSlotElementId()} changed. New visibility: ${
                  //     event.inViewPercentage
                  //   }%.Viewport size: ${window.innerWidth}x${
                  //     window.innerHeight
                  //   }`
                  // )
                }
              }
            })
            .addEventListener('impressionViewable', (event) => {
              if (event?.slot.getAdUnitPath() === props.adUnitPath) {
                // We refresh the ad slot.  This increases views.  Google doesn't like it if this is more frequent than
                // every 30s.
                if (!timer.value) {
                  timer.value = setTimeout(refreshAd, AD_REFRESH_TIMEOUT)
                }
              }
            })
        })
      }
    } catch (e) {
      console.log('Exception in visibilityChanged', e)
    }
  }
}

onBeforeUnmount(() => {
  unmounted.value = true

  try {
    if (timer.value) {
      clearTimeout(timer)
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
