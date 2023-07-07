<template>
  <!--
  We're testing the possibility of using some different ads.  If you don't like ads, then you
  can use an ad blocker.  Plus you could donate to us at https://www.ilovefreegle.org/donate - if we got
  enough donations we would be delighted not to show ads.
   -->
  <div :ref="uniqueid" class="d-flex justify-content-end pb-2">
    <div :id="uniqueid" style="min-width: 300px; min-height: 250px" />
  </div>
</template>
<script setup>
import { ref, onMounted, onBeforeUnmount } from '#imports'
import { waitForRef } from '~/composables/useWaitForRef'

// This must match what has been set up in GPT admin.
const uniqueid = ref('div-gpt-ad-1610613658342-0')

const p = new Promise((resolve, reject) => {
  const already = document.getElementById('gpt-script')
  if (already) {
    console.log('Script already there')
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
    slot = window.googletag
      .defineSlot('/22794232631/freegle_test1', [300, 250], uniqueid.value)
      .addService(window.googletag.pubads())
    window.googletag.pubads().enableSingleRequest()
    window.googletag.enableServices()
  })

  window.googletag.cmd.push(function () {
    window.googletag.display(uniqueid.value)
    console.log('Displayed slot', uniqueid.value)
  })
})

onBeforeUnmount(() => {
  console.log('Destroy slot', uniqueid.value)
  window.googletag.destroySlots([slot])
})
</script>
