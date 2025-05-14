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
})

const daDiv = ref(null)

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
      api.bandit.shown({
        uid: 'playwire',
        variant: 'askedToRender',
      })

      showAd.value = true

      // Playwire ads will always show something - we have house ads as a fallback.
      emit('rendered')

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

            console.log('Execute queued spaAddAds', theType.value, props.divId)
            window.ramp.spaAddAds({
              type: theType.value,
              selector: '#' + props.divId,
            })

            api.bandit.shown({
              uid: 'playwire',
              variant: 'added',
            })
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
