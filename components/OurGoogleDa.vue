<template>
  <div v-if="showAd">
    <div v-if="adsBlocked" class="bg-white text-center">
      Maybe you're using an ad blocker? We don't like ads much either.
      <DaDisableCTA />
    </div>
    <div
      v-else-if="showTestAd"
      :style="{
        'min-height': minHeight,
        'min-width': minWidth,
        height: '100%',
        width: '100%',
        'background-color': 'red',
      }"
    >
      <p class="text-white text-center">Test ad</p>
    </div>
    <Adsbygoogle
      v-else
      ref="adsbygoogle"
      :style="adStyle"
      :page-url="pageUrl"
      :ad-slot="adSenseSlot"
    />
  </div>
</template>
<script setup>
import { ref, computed, onBeforeUnmount } from '#imports'
import { useMiscStore } from '~/stores/misc'
import { useMe } from '~/composables/useMe'

const miscStore = useMiscStore()

// Set this true to ensure that something always fills a slot.  Useful for testing ad layout.
const AD_TEST = false
const showTestAd = ref(false)

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
  renderAd: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits(['rendered'])
const adsBlocked = ref(false)

const adStyle = computed(() => {
  // See https://support.google.com/adsense/answer/9183363 for background.
  const ret = {
    width: '100%',
  }

  if (props.maxWidth !== null) {
    ret['max-width'] = props.maxWidth
    ret.width = props.maxWidth
  }

  if (props.minWidth !== null) {
    ret['min-width'] = props.minWidth
  }

  if (props.minHeight !== null) {
    ret['min-height'] = props.minHeight
  }

  if (props.maxHeight !== null) {
    ret['max-height'] = props.maxHeight
    ret.height = props.maxHeight
  }

  return ret
})

const showAd = ref(false)

let refreshTimer = null
const AD_REFRESH_TIMEOUT = 31000

const adsbygoogle = ref(null)

const adSenseSlot = computed(() => {
  // Dimensions is an array of dimensions.
  const slot = '9463528951'

  // Old code from using fixed size slots - now we have responsive.
  // props.dimensions.forEach((d) => {
  // if (d[0] === 320 && d[1] === 50) {
  //   slot = '5832702875'
  // } else if (d[0] === 300 && d[1] === 250) {
  //   slot = '8180600393'
  // } else if (d[0] === 728 && d[1] === 90) {
  //   slot = '1595844892'
  // }
  // })

  return slot
})

const pageUrl = computed(() => {
  // Our ads are shown behind login, so we want to give AdSense a page containing similar content.
  // If we are a member of a group then we can give that, otherwise default to Croydon as that's
  // an active group.
  //
  // This isn't quite as good as using the home group, but it's quick and good enough for most
  // users.
  // Use the myGroups computed from useMe composable for consistency
  const { myGroups } = useMe()

  let added = null
  let nameshort = null

  if (myGroups.value?.length) {
    myGroups.value.forEach((g) => {
      if (!added || g.added > added) {
        added = g.added
        nameshort = g.nameshort
      }
    })
  }

  return nameshort
    ? 'https://www.ilovefreegle.org/explore/' + nameshort
    : 'https://www.ilovefreegle.org/explore/Croydon-Freegle'
})

// We want to spot when an ad has been rendered and whether it's filled.  isUnfilled is supposed to be exposed
// by the component, but that doesn't seem to work.
let fillTimer = null
let renderRetry = AD_REFRESH_TIMEOUT / 1000

function checkRendered() {
  fillTimer = null
  const el = adsbygoogle.value?.$el
  let retry = true

  if (el) {
    if (el.dataset.adStatus) {
      const adStatus = el.dataset.adStatus
      console.log('Ad status', adStatus, props.adUnitPath)
      if (adStatus === 'filled') {
        console.log('Filled', props.adUnitPath)
        emit('rendered', true)
      } else {
        console.log('Unfilled', props.adUnitPath)
        if (!AD_TEST) {
          emit('rendered', false)
        } else {
          showTestAd.value = true
          emit('rendered', true)
        }
      }

      if (!refreshTimer) {
        refreshTimer = setTimeout(refreshAd, AD_REFRESH_TIMEOUT)
      }

      retry = false
    }
  }

  if (retry) {
    renderRetry--

    if (renderRetry > 0) {
      fillTimer = setTimeout(checkRendered, 100)
    } else {
      // Give up.
      emit('rendered', false)
    }
  }
}

watch(
  () => props.renderAd,
  (newVal) => {
    if (newVal) {
      if (unPauseAdSense()) {
        fillTimer = setTimeout(checkRendered, 100)
      }

      showAd.value = true
    }
  },
  {
    immediate: true,
  }
)

function refreshAd() {
  console.log('Refresh', miscStore.visible, props.adUnitPath)
  refreshTimer = null

  // Don't refresh if the ad is not visible or tab is not active.
  if (miscStore.visible) {
    console.log('Visible')
    if (adsbygoogle.value) {
      // Need to check again if it's rendered, and so we also need to reset the
      // retry count.
      renderRetry = AD_REFRESH_TIMEOUT / 1000
      fillTimer = setTimeout(checkRendered, 100)

      // updateAd method doesn't seem to do the trick so re-render.
      adsbygoogle.value.updateAd()
      console.log('refreshed')
    }
  } else {
    // console.log('Not refreshing ad', props.adUnitPath)
  }

  refreshTimer = setTimeout(refreshAd, AD_REFRESH_TIMEOUT)
}

function unPauseAdSense() {
  console.log('Unpause AdSense')
  if (window.adsbygoogle?.loaded) {
    // We paused ads on page load - time to enable them
    window.adsbygoogle.pauseAdRequests = 0
    return true
  } else {
    console.log('No AdSense loaded')
    adsBlocked.value = true
    emit('rendered', true)
    return false
  }
}

onBeforeUnmount(() => {
  try {
    if (fillTimer) {
      clearTimeout(fillTimer)
    }

    if (refreshTimer) {
      clearTimeout(refreshTimer)
    }
  } catch (e) {
    console.log('Exception in onBeforeUnmount', e)
  }
})
</script>
