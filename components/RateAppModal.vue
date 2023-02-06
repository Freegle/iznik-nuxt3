<template>
  <b-modal id="rateappmodal"
           v-model="showModal"
           title="Please help - Rate this App!"
           no-stacking>
    <template #default>
      <b-row>
        <b-col>
          <p>
            If you like Freegle - or not - please rate and review this app.
            This will help others start Freegling, saving money, time and the planet.
          </p>
          <p>Tap the button below to go to the Play Store or App Store - look for "Rate this app" or the "Reviews" tab.</p>
          <p>Note that the review option may not be available in some cases (not our fault).</p>
        </b-col>
      </b-row>
    </template>
    <template #footer>
      <b-button variant="white" @click="notagain">
        Don't ask again
      </b-button>
      <b-button variant="white" @click="hide">
        Not now
      </b-button>
      <b-button variant="success" @click="confirm">
        Rate now
      </b-button>
    </template>
  </b-modal>
</template>
<script>
import { AppLauncher } from '@capacitor/app-launcher'
import { Device } from '@capacitor/device'
//import { mobilestate } from '@/plugins/app-init-push'
import modal from '@/mixins/modal'

export default {
  mixins: [modal],
  data: function() {
    return {
    }
  },
  methods: {
    notagain() {
      // TODO window.localStorage.setItem('rateappnotagain',true)
      this.hide()
    },

    async confirm () {
      let review_link = "market://details?id=org.ilovefreegle.direct";
      const info = await Device.getInfo(); // TODO
      if( info.platform==='ios') review_link = 'https://apps.apple.com/gb/app/id970045029?action=write-review'
      // TODO if (mobilestate.isiOS) review_link = 'https://apps.apple.com/gb/app/id970045029?action=write-review'
      console.log('rateApp.vue: ', review_link)
      AppLauncher.openUrl({ url: review_link })
      this.hide()
    }
  }
}
</script>
