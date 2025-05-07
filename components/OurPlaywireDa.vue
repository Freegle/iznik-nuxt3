<template>
  <div v-if="showAd">
    <div v-if="adsBlocked" class="bg-white text-center">
      Maybe you're using an ad blocker? We don't like ads much either.
      <DaDisableCTA />
    </div>
    <div
      v-else
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
import * as Sentry from '@sentry/browser'
import { ref, computed, nextTick, onBeforeRouteLeave } from '#imports'

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

const daDiv = ref(null)
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

const visibleTimer = null

// We want to spot when an ad has been rendered and whether it's filled.
let fillTimer = null
let renderRetry = 10

function checkRendered() {
  fillTimer = null
  let retry = true

  // No need to refresh ad - Playwire ads do that themselves.
  // TODO How to check rendered.
  console.log('Check rendered', props.adUnitPath, theType.value)
  if (window.ramp?.slots && !window.ramp?.slots[theType.value]?.isEmpty) {
    console.log('Ad is filled', props.adUnitPath)
    adsBlocked.value = false
    emit('rendered', true)
    retry = false
    Sentry.captureMessage(
      'Ad is filled ' + props.adUnitPath + ' ' + theType.value
    )
  } else {
    console.log('Ad filled', props.adUnitPath)
    adsBlocked.value = false
  }

  if (retry) {
    renderRetry--

    if (renderRetry > 0) {
      fillTimer = setTimeout(checkRendered, 100)
    } else {
      // Give up.
      console.log('Giving up on ad fill', props.adUnitPath)
      // TODO assume success until we've established that we can use isEmpty
      emit('rendered', true)
    }
  }
}

const theType = ref(null)

watch(
  () => props.renderAd,
  (newVal) => {
    if (newVal) {
      fillTimer = setTimeout(checkRendered, 100)
      showAd.value = true

      // Let the div get created and then ensure we've loaded the Playwire code.
      nextTick(() => {
        function addAd() {
          try {
            // See https://support.playwire.com/docs/ad-units-array-for-ads-api for the types.
            //
            // We don't use spaNewPage as in the example because our ads are added more dynamically than
            // that.
            const height = window.getComputedStyle(daDiv.value, null).maxHeight
            if (height === '50px' || height === '90px') {
              theType.value = 'leaderboard_atf'
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

            console.log(
              'Ad container really in DOM?',
              window.document.getElementById(props.divId) !== null
            )
            console.log('Execute queued spaAddAds', theType.value)
            window.ramp.spaAddAds({
              type: theType.value,
              selector: '#' + props.divId,
            })

            console.log('Called spaAddAds')
          } catch (e) {
            console.log('Failed to inject ad', e)
          }
        }

        if (!window.ramp) {
          // We haven't loaded the Playwire code yet.
          console.log('Load playwire code')
          window.ramp = window.ramp || {}
          window.ramp.que = window.ramp.que || []
          window.ramp.passiveMode = true

          // Load the Ramp configuration script
          const runtimeConfig = useRuntimeConfig()
          const pubId = runtimeConfig.public.PLAYWIRE_PUB_ID
          const websiteId = runtimeConfig.public.PLAYWIRE_WEBSITE_ID

          const configScript = document.createElement('script')
          configScript.src =
            'https://cdn.intergient.com/' + pubId + '/' + websiteId + '/ramp.js'

          configScript.onload = () => {
            // Playwire code loaded. Now we can add our ad.
            console.log('Playwire script loaded, queue spaAddAds')
            window.ramp.que.push(addAd)
          }

          configScript.onerror = (e) => {
            console.log('Error loading Playwire script', e)
          }

          document.body.appendChild(configScript)
          console.log('Appended Playwire script to DOM')
        } else {
          // The code is already loaded - we can add the add.
          console.log('Already loaded code, queue ad')
          window.ramp.que.push(addAd)
        }
      })
    }
  },
  {
    immediate: true,
  }
)

async function leaving() {
  try {
    if (fillTimer) {
      clearTimeout(fillTimer)
    }

    if (visibleTimer) {
      clearTimeout(visibleTimer)
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
