<template>
  <!--
  If you don't like ads, then you can use an ad blocker.  Plus you could donate to us
  at https://www.ilovefreegle.org/donate - if we got enough donations we would be delighted not to show ads.
   -->
  <div>
    <div class="d-flex w-100 justify-content-around">
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
    <p v-if="adShown" class="text-center textsize">
      Advertisement. These help Freegle keep going.
    </p>
  </div>
</template>
<script setup>
import { useMiscStore } from '../stores/misc'
import { ref, computed, onMounted, onBeforeUnmount } from '#imports'
import { waitForRef } from '~/composables/useWaitForRef'

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
    document.head.appendChild(s)
  }
})

await p

let slot = null

onMounted(async () => {
  await waitForRef(uniqueid)

  window.googletag = window.googletag || { cmd: [] }
  window.googletag.cmd.push(function () {
    window.googletag.pubads().collapseEmptyDivs()
    console.log('Define slot', uniqueid.value, [props.dimensions], props.divId)
    slot = window.googletag
      .defineSlot(uniqueid.value, [props.dimensions], props.divId)
      .addService(window.googletag.pubads())
    window.googletag.pubads().enableSingleRequest()
    window.googletag.enableServices()
  })

  window.googletag.cmd.push(function () {
    window.googletag.display(props.divId)
  })
})

const adShown = ref(true)

function checkSize() {
  // Get size of the div
  const div = document.getElementById(props.divId)
  if (div) {
    const rect = div.getBoundingClientRect()
    const height = rect.height

    if (height < 50) {
      adShown.value = false
    } else {
      setTimeout(checkSize, 500)
    }
  }
}

const sizeTimer = setTimeout(checkSize, 500)

onBeforeUnmount(() => {
  if (window.googletag?.destroySlots) {
    window.googletag.destroySlots([slot])
  }

  if (sizeTimer) {
    clearTimeout(sizeTimer)
  }
})
</script>
<style scoped lang="scss">
.textsize {
  font-size: 0.75rem;
}
</style>
