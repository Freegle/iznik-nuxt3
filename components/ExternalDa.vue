<template>
  <!--
  If you don't like ads, then you can use an ad blocker.  Plus you could donate to us
  at https://www.ilovefreegle.org/donate - if we got enough donations we would be delighted not to show ads.
   -->
  <div v-observe-visibility="visibilityChanged">
    <div v-if="isVisible" class="d-flex w-100 justify-content-around">
      <div
        :id="divId"
        :ref="adUnitPath"
        :key="'breakpoint-' + adUnitPath + '-' + breakpoint"
        :style="{
          width: dimensions[0] + 'px',
          height: dimensions[1] + 'px',
        }"
      />
    </div>
    <p v-if="isVisible && adShown" class="text-center textsize">
      Advertisement. These help Freegle keep going.
    </p>
    <!--    <div class="bg-white">-->
    <!--      Path {{ adUnitPath }} id {{ divId }} dimensions {{ dimensions }}-->
    <!--    </div>-->
  </div>
</template>
<script setup>
import * as Sentry from '@sentry/vue'
import { nextTick } from 'vue'
import { useMiscStore } from '../stores/misc'
import { ref, computed, onBeforeUnmount } from '#imports'

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
})

const breakpoint = computed(() => {
  const miscStore = useMiscStore()
  return miscStore.breakpoint
})

const uniqueid = ref(props.adUnitPath)

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
        reject(new Error('Google ad script blocked'))
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

const adShown = ref(true)

const timer = ref(null)

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
  try {
    if (visible && !shownFirst) {
      isVisible.value = visible
      shownFirst = true

      await nextTick()

      window.googletag = window.googletag || { cmd: [] }
      window.googletag.cmd.push(function () {
        window.googletag.pubads().collapseEmptyDivs()
        slot = window.googletag
          .defineSlot(uniqueid.value, [props.dimensions], props.divId)
          .addService(window.googletag.pubads())

        window.googletag
          .pubads()
          .addEventListener('slotRenderEnded', (event) => {
            if (event?.slot === slot && event?.isEmpty) {
              adShown.value = false
            }

            emit('rendered', adShown.value)

            // We refresh the ad slot.  This increases views.  Google doesn't like it if this is more frequent than
            // every 30s.
            if (!timer.value) {
              timer.value = setTimeout(() => {
                if (
                  window.googletag?.pubads &&
                  typeof window.googletag?.pubads === 'function' &&
                  typeof window.googletag?.pubads().refresh === 'function'
                ) {
                  window.googletag.pubads().refresh([slot])
                }
              }, 45000)
            }
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

        window.googletag.enableServices()
      })

      window.googletag.cmd.push(function () {
        window.googletag.display(props.divId)
      })
    }
  } catch (e) {
    console.log('Exception in visibilityChanged', e)
  }
}
</script>
<style scoped lang="scss">
.textsize {
  font-size: 0.75rem;
}
</style>
