<template>
  <client-only>
    <!--
    If you don't like ads, then you can use an ad blocker.  Plus you could donate to us
    at https://www.ilovefreegle.org/donate - if we got enough donations we would be delighted not to show ads.
     -->
    <div v-observe-visibility="visibilityChanged" class="pointer">
      <div v-if="isVisible" class="d-flex w-100 justify-content-around">
        <div
          :id="divId"
          :ref="adUnitPath"
          :key="'adUnit-' + adUnitPath"
          :style="{
            'max-width': dimensions[0] + 'px',
            'max-height': dimensions[1] + 'px',
          }"
        />
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
import { nextTick } from 'vue'
import { ref, computed, onBeforeUnmount } from '#imports'
import { useMiscStore } from '~/stores/misc'

const miscStore = useMiscStore()

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
let blocked = false

const p = new Promise((resolve, reject) => {
  try {
    const already = document.getElementById('gpt-script')
    if (already) {
      resolve()
    } else {
      const s = document.createElement('script')
      s.setAttribute(
        'src',
        'https://securepubads.g.doubleclick.net/tag/js/gpt.js'
      )
      s.id = 'gpt-script'
      s.onload = () => resolve()
      s.onerror = () => {
        console.log('Google ad script blocked')
        blocked = true
        resolve()
      }
      document.head.appendChild(s)
    }
  } catch (e) {
    console.log('Load of Google ad script failed', e)
    resolve()
  }
})

await p

let slot = null

const timer = ref(null)

const AD_REFRESH_TIMEOUT = 45000

function refreshAd() {
  if (
    window.googletag?.pubads &&
    typeof window.googletag?.pubads === 'function' &&
    typeof window.googletag?.pubads().refresh === 'function'
  ) {
    // Don't fresh if the ad is not visible or tab is not active.
    if (isVisible.value && miscStore.visible) {
      window.googletag.pubads().refresh([slot])
    }

    timer.value = setTimeout(refreshAd, AD_REFRESH_TIMEOUT)
  }
}

onBeforeUnmount(() => {
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

const isVisible = ref(false)
let shownFirst = false

const emit = defineEmits(['rendered'])

async function visibilityChanged(visible) {
  if (!blocked) {
    try {
      isVisible.value = visible

      if (visible && !shownFirst) {
        shownFirst = true

        await nextTick()

        window.googletag = window.googletag || { cmd: [] }
        window.googletag.cmd.push(function () {
          const dims = [props.dimensions]

          if (props.pixel) {
            dims.push([1, 1])
          }

          window.googletag.pubads().collapseEmptyDivs()
          slot = window.googletag
            .defineSlot(uniqueid.value, dims, props.divId)
            .addService(window.googletag.pubads())

          window.googletag
            .pubads()
            .addEventListener('slotRenderEnded', (event) => {
              if (event?.slot === slot && event?.isEmpty) {
                adShown.value = false
              }
              emit('rendered', adShown.value)
            })
            .addEventListener('slotVisibilityChanged', (event) => {
              if (event.inViewPercentage < 51) {
                console.log(
                  `Visibility of slot ${event.slot.getSlotElementId()} changed. New visibility: ${
                    event.inViewPercentage
                  }%.Viewport size: ${window.innerWidth}x${window.innerHeight}`
                )
              }
            })
            .addEventListener('impressionViewable', (event) => {
              // We refresh the ad slot.  This increases views.  Google doesn't like it if this is more frequent than
              // every 30s.
              if (!timer.value) {
                timer.value = setTimeout(refreshAd, AD_REFRESH_TIMEOUT)
              }
            })

          window.googletag.enableServices()
        })

        window.googletag.cmd.push(function () {
          try {
            window.googletag.display(props.divId)
          } catch (e) {
            console.log('Exception in ad display', e)
            emit('rendered', false)
          }
        })
      }
    } catch (e) {
      console.log('Exception in visibilityChanged', e)
    }
  }
}
</script>
<style scoped lang="scss">
.textsize {
  font-size: 0.75rem;
}

.pointer {
  pointer-events: v-bind(passClicks);
}
</style>
