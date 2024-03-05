<template>
  <client-only>
    <!--
    If you don't like ads, then you can use an ad blocker.  Plus you could donate to us
    at https://www.ilovefreegle.org/donate - if we got enough donations we would be delighted not to show ads.
     -->
    <div v-observe-visibility="visibilityChanged" class="pointer">
      <AdvertisingProvider v-if="isVisible" :config="adConfig" is-prebid>
        <div
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
      </AdvertisingProvider>
    </div>
  </client-only>
</template>
<script setup>
import {
  AdvertisingProvider,
  AdvertisingSlot,
} from '@storipress/vue-advertising'
import { nextTick } from 'vue'
import { ref, computed, onBeforeUnmount, AD_GPT_CONFIG } from '#imports'
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
const blocked = false

const maxWidth = ref(Math.max(...props.dimensions.map((d) => d[0])))
const maxHeight = ref(Math.max(...props.dimensions.map((d) => d[1])))

const slot = ref(null)

const timer = ref(null)
const PREBID_TIMEOUT = 1000
const AD_REFRESH_TIMEOUT = 45000

// Filter AD_GPT_CONFIG to pick out the matching divId and adUnitPath
const adConfig = JSON.parse(JSON.stringify(AD_GPT_CONFIG))

adConfig.slots = adConfig.slots.filter((slot) => {
  return slot.id === props.divId && slot.path === props.adUnitPath
})

if (!adConfig.slots.length) {
  console.error('Ad config not found', props.divId, props.adUnitPath, adConfig)
}

console.log('Set up ad', JSON.stringify(adConfig))
function refreshAd() {
  if (
    window.googletag?.pubads &&
    typeof window.googletag?.pubads === 'function' &&
    typeof window.googletag?.pubads().refresh === 'function' &&
    !unmounted.value
  ) {
    // Don't refresh if the ad is not visible or tab is not active.
    if (isVisible.value && miscStore.visible) {
      console.log('Refresh ad', slot.value.getAdUnitPath())

      window.pbjs.que.push(function () {
        window.pbjs.requestBids({
          timeout: PREBID_TIMEOUT,
          adUnitCodes: [props.divId],
          bidsBackHandler: function (bids, timedOut, auctionId) {
            console.log('Got bids back', bids, timedOut, auctionId)
            window.pbjs.setTargetingForGPTAsync([props.adUnitPath])

            if (slot.value) {
              console.log('Refresh slot', props.adUnitPath)
              window.googletag.pubads().refresh([slot.value])
            } else {
              console.log('No slot to refresh found for', props.adUnitPath)
            }
          },
        })
      })
      console.log('Refresh ad', slot.value.getAdUnitPath())
    }

    timer.value = setTimeout(refreshAd, AD_REFRESH_TIMEOUT)
  }
}

const isVisible = ref(false)
let shownFirst = false
const emit = defineEmits(['rendered'])

async function visibilityChanged(visible) {
  if (!blocked) {
    try {
      isVisible.value = visible

      if (visible && !shownFirst) {
        console.log('Queue create ad', props.adUnitPath, props.divId)
        await nextTick()
        shownFirst = true

        window.googletag.cmd.push(function () {
          window.googletag
            .pubads()
            .addEventListener('slotRenderEnded', (event) => {
              if (event?.slot.getAdUnitPath() === props.adUnitPath) {
                // Save off slot for refresh later.
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
                  console.log('Set refresh timer for ', props.adUnitPath)
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
