<template>
  <span />
</template>
<script setup>
import { onMounted, onUnmounted } from 'vue'
import { Capacitor } from '@capacitor/core'
import { useMiscStore } from '~/stores/misc'

const miscStore = useMiscStore()

let orientationListener = null
let mediaQueryList = null

function updateOrientation(isLandscape) {
  // Don't update orientation while fullscreen modal is open - keyboard opening
  // changes viewport dimensions which would incorrectly trigger landscape mode.
  if (miscStore.fullscreenModalOpen) return
  if (miscStore.isLandscape !== isLandscape) {
    miscStore.setLandscape(isLandscape)
  }
}

async function initCapacitorOrientation() {
  try {
    const { ScreenOrientation } = await import('@capacitor/screen-orientation')

    const orientation = await ScreenOrientation.orientation()
    updateOrientation(
      orientation.type === 'landscape-primary' ||
        orientation.type === 'landscape-secondary'
    )

    orientationListener = await ScreenOrientation.addListener(
      'screenOrientationChange',
      (info) => {
        updateOrientation(
          info.type === 'landscape-primary' ||
            info.type === 'landscape-secondary'
        )
      }
    )
  } catch (e) {
    console.warn('ScreenOrientation plugin not available, using fallback', e)
    initMediaQueryOrientation()
  }
}

function initMediaQueryOrientation() {
  if (typeof window === 'undefined') return

  mediaQueryList = window.matchMedia('(orientation: landscape)')
  updateOrientation(mediaQueryList.matches)

  const handler = (e) => {
    updateOrientation(e.matches)
  }

  mediaQueryList.addEventListener('change', handler)
  orientationListener = { handler, isMediaQuery: true }
}

function cleanupListeners() {
  if (orientationListener) {
    if (
      orientationListener.isMediaQuery &&
      mediaQueryList &&
      orientationListener.handler
    ) {
      mediaQueryList.removeEventListener('change', orientationListener.handler)
    } else if (typeof orientationListener.remove === 'function') {
      orientationListener.remove()
    }
    orientationListener = null
  }
}

onMounted(() => {
  const isApp =
    Capacitor.getPlatform() === 'ios' || Capacitor.getPlatform() === 'android'

  if (isApp) {
    initCapacitorOrientation()
  } else {
    initMediaQueryOrientation()
  }
})

onUnmounted(() => {
  cleanupListeners()
})
</script>
