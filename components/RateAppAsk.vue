<template>
  <div>
    <div class="d-flex justify-content-between">
      <b-row>
        <b-col>
          <p>
            If you like Freegle - or not - please rate and review this app. This
            will help others start Freegling, saving money, time and the planet.
          </p>
          <p>
            Tap the button below to go to the Play Store or App Store - look for
            "Rate this app" or the "Reviews" tab.
          </p>
          <p>
            Note that the review option may not be available in some cases (not
            our fault).
          </p>
        </b-col>
      </b-row>
    </div>
    <b-button variant="white" @click="notagain"> Don't ask again </b-button>
    <b-button variant="success" @click="confirm"> Rate now </b-button>
  </div>
</template>
<script setup>
import { AppLauncher } from '@capacitor/app-launcher'
import { useMobileStore } from '@/stores/mobile'

const emit = defineEmits(['hide'])

function notagain() {
  window.localStorage.setItem('rateappnotagain', true)
  emit('hide')
}

function confirm() {
  window.localStorage.setItem('rateappnotagain', true) // Do not ask again
  const mobileStore = useMobileStore()
  let reviewLink = 'market://details?id=org.ilovefreegle.direct'
  if (mobileStore.isiOS)
    reviewLink = 'https://apps.apple.com/gb/app/id970045029?action=write-review'
  AppLauncher.openUrl({ url: reviewLink })
  emit('hide')
}
</script>
