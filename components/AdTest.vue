<template>
  <!--
  We're testing the possibility of using some different ads.  If you don't like ads, then you
  can use an ad blocker.  Plus you could donate to us at https://www.ilovefreegle.org/donate - if we got
  enough donations we would be delighted not to show ads.
   -->
  <div
    v-if="square"
    :id="uniqueid"
    :ref="uniqueid"
    class="d-flex justify-content-end pb-2 w-100"
  />
  <VisibleWhen :not="['sm', 'md', 'lg', 'xl']">
    <div
      v-if="banner"
      :id="uniqueid"
      :ref="uniqueid"
      class="d-flex justify-content-around pb-2 w-100"
      style="width: 320px; height: 50px"
    />
  </VisibleWhen>
  <VisibleWhen :not="['xs', 'sm']">
    <div
      v-if="banner"
      :id="uniqueid"
      :ref="uniqueid"
      class="d-none d-md-flex justify-content-around pb-2 w-100"
      style="width: 728px; height: 90px"
    />
  </VisibleWhen>
</template>
<script setup>
import { useMiscStore } from '../stores/misc'
import VisibleWhen from './VisibleWhen'
import { ref, onMounted, onBeforeUnmount } from '#imports'
import { waitForRef } from '~/composables/useWaitForRef'

const miscStore = useMiscStore()

const props = defineProps({
  square: {
    type: Boolean,
    required: false,
    default: false,
  },
  banner: {
    type: Boolean,
    required: false,
    default: false,
  },
})

// This must match what has been set up in GPT admin.
let tagId, slotId, dims

if (props.square) {
  tagId = 'div-gpt-ad-1610613658342-0'
  slotId = '/22794232631/freegle_test1'
  dims = [300, 250]
} else if (props.banner) {
  if (miscStore.breakpoint === 'xs') {
    tagId = 'div-gpt-ad-1688753114006-0'
    slotId = '/22794232631/freegle_test4'
    dims = [320, 50]
  } else if (miscStore.breakpoint === 'sm') {
    tagId = 'div-gpt-ad-1688724132439-0'
    slotId = '/22794232631/freegle_test3'
    dims = [468, 60]
  } else {
    tagId = 'div-gpt-ad-1688724072018-0'
    slotId = '/22794232631/freegle_test2'
    dims = [728, 90]
  }
}

const uniqueid = ref(tagId)

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
    slot = window.googletag
      .defineSlot(slotId, dims, uniqueid.value)
      .addService(window.googletag.pubads())
    window.googletag.pubads().enableSingleRequest()
    window.googletag.enableServices()
  })

  window.googletag.cmd.push(function () {
    window.googletag.display(uniqueid.value)
  })
})

onBeforeUnmount(() => {
  if (window.googletag?.destroySlots) {
    window.googletag.destroySlots([slot])
  }
})
</script>
