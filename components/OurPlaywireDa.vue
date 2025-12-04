<template>
  <div v-if="showAd">
    <div
      :id="divId"
      ref="daDiv"
      :style="adStyle"
      :class="{
        theType,
      }"
    ></div>
  </div>
</template>
<script setup>
import { ref, computed, nextTick, onBeforeRouteLeave } from '#imports'
import Api from '~/api'

const emit = defineEmits(['rendered'])

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
  video: {
    type: Boolean,
    default: false,
  },
})

const daDiv = ref(null)
let addAdTimer = null
let queueAdTimer = null
let queueRetryCount = 0
const MAX_QUEUE_RETRIES = 100 // 5 seconds at 50ms intervals

const showAd = ref(false)

// No need to refresh ad - Playwire ads do that themselves.

const theType = ref(null)

const runtimeConfig = useRuntimeConfig()
const api = Api(runtimeConfig)

api.bandit.shown({
  uid: 'playwire',
  variant: 'loaded',
})

watch(
  () => props.renderAd,
  (newVal) => {
    if (newVal) {
      console.log('Render ad', props.adUnitPath)
      api.bandit.shown({
        uid: 'playwire',
        variant: 'askedToRender',
      })

      showAd.value = true
      queueRetryCount = 0

      // Let the div get created and then ensure we've loaded the Playwire code.
      nextTick(() => {
        async function addAd() {
          try {
            // Wait for daDiv to be in the DOM and not null before proceeding
            if (!daDiv.value) {
              console.log('daDiv not ready, retrying in 50ms')
              addAdTimer = setTimeout(addAd, 50)
              return
            }

            // See https://support.playwire.com/docs/ad-units-array-for-ads-api for the types.
            //
            // We don't use spaNewPage as in the example because our ads are added more dynamically than
            // that.
            //
            // The setPath settings have been advised by Playwire for the different sizes of
            // sticky footer ads.
            const height = window.getComputedStyle(daDiv.value, null).maxHeight

            if (props.video) {
              theType.value = 'corner_ad_video'
            } else if (height === '50px' || height === '90px') {
              theType.value = 'leaderboard_atf'
              try {
                await window.ramp.setPath('ROS')
              } catch (e) {
                console.log('Failed to set path for ROS', e)
              }
            } else if (height === '100px') {
              theType.value = 'leaderboard_atf'
              try {
                await window.ramp.setPath('mobile_large_footer')
              } catch (e) {
                console.log('Failed to set path for ROS', e)
              }
            } else if (height === '250px') {
              theType.value = 'leaderboard_atf'
              try {
                await window.ramp.setPath('desktop_large_footer')
              } catch (e) {
                console.log('Failed to set path for ROS', e)
              }
            } else {
              // See if we already have a med_rect; if so we should use the alternate type value as Playwire
              // doesn't like multiple ads of the same type.
              const existing = document.querySelector('.med_rect_atf')

              if (existing) {
                theType.value = 'med_rect_btf'
              } else {
                theType.value = 'med_rect_atf'
              }
            }

            console.log('Execute queued spaAddAds', theType.value, props.divId)

            if (props.video) {
              // No div for corner video.
              window.ramp.spaAddAds({
                type: theType.value,
              })
            } else {
              window.ramp.spaAddAds({
                type: theType.value,
                selector: '#' + props.divId,
              })
            }

            api.bandit.shown({
              uid: 'playwire',
              variant: 'added',
            })
          } catch (e) {
            console.log('Failed to inject ad', e)
          }
        }

        function doQueueAd() {
          queueAdTimer = null
          queueRetryCount++

          if (window.playwireScriptLoaded) {
            window.ramp.que.push(addAd)
            console.log('Queued ad count', window.ramp.que.length)
            // Playwire ads will always show something - we have house ads as a fallback.
            emit('rendered', true)
          } else if (queueRetryCount >= MAX_QUEUE_RETRIES) {
            console.log(
              'Playwire script failed to load after max retries - giving up'
            )
            emit('rendered', false)
          } else {
            console.log('Playwire script not loaded yet, retrying in 50ms')
            queueAdTimer = setTimeout(doQueueAd, 50)
          }
        }

        doQueueAd()
      })
    }
  },
  {
    immediate: true,
  }
)

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

async function leaving() {
  try {
    if (addAdTimer) {
      clearTimeout(addAdTimer)
      addAdTimer = null
    }

    if (queueAdTimer) {
      clearTimeout(queueAdTimer)
      queueAdTimer = null
    }

    if (window.ramp?.destroyUnits) {
      // We need to destroy the ad unit.
      console.log('Destroying ad unit', props.adUnitPath)
      await window.ramp.destroyUnits(props.adUnitPath)
      console.log('Destroyed', theType.value)
    }
  } catch (e) {
    console.log('Exception in onBeforeUnmount', e)
  }
}

onBeforeUnmount(leaving)

// onBeforeUnmount doesn't always seem to get called.
onBeforeRouteLeave(leaving)
</script>
