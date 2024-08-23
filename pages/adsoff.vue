<template>
  <client-only>
    <b-row class="m-0">
      <b-col cols="0" md="3" />
      <b-col cols="12" md="6" class="mt-2">
        <b-card no-body class="mt-1 p-4">
          <h1>Free To Use - Not Free To Run!</h1>
          <div class="d-flex">
            <div>
              <p>
                <strong
                  >Hate ads? Your donation could help us turn them off for
                  everyone.</strong
                >
              </p>
              <p>
                There are some things we have to pay for to keep going. Ads
                support this - but wouldn't it be nice not to have them?
              </p>
              <p v-if="adsOffTarget <= 0">
                Right now we've raised enough in donations over the last 24
                hours, so ads are off. Thanks!
              </p>
              <p v-else>
                <strong
                  >Right now we still need &pound;{{ adsOffTarget }}</strong
                >
                to reach our donation target of &pound;{{ adsOffTargetMax }}
                over the last 24 hours. Once we reach that, we'll turn ads off.
              </p>
            </div>
            <vue-thermometer
              :key="adsOffTarget"
              :value="adsOffTargetMax - adsOffTarget"
              :min="0"
              :max="adsOffTargetMax"
              :options="thermOptions"
              scale="£"
            />
          </div>
          <p><strong>Can you help turn ads off for a bit?</strong></p>
          <div class="d-flex flex-wrap justify-content-between mt-2 mb-3">
            <donation-button value="5" class="mb-1" @clicked="score(5)" />
            <donation-button value="10" class="mb-1" @clicked="score(10)" />
            <donation-button value="15" class="mb-1" @clicked="score(15)" />
          </div>
          <p>Regular monthly donations are especially helpful.</p>
          <p>
            Other ways to donate are <nuxt-link to="/donate">here</nuxt-link>.
          </p>
        </b-card>
      </b-col>
    </b-row>
  </client-only>
</template>
<script setup>
import { useConfigStore } from '~/stores/config'

const configStore = useConfigStore()
const showingAds = await configStore.fetch('ads_off_target')

const adsOffTarget = ref(
  showingAds?.length && parseInt(showingAds[0].value)
    ? parseInt(showingAds[0].value)
    : null
)

const target = await configStore.fetch('ads_off_target_max')

const adsOffTargetMax = ref(
  target?.length && parseInt(target[0].value) ? parseInt(target[0].value) : null
)

const thermOptions = {
  thermo: {
    color: 'darkgreen',
    backgroundColor: 'white',
    frameColor: 'black',
    ticks: 11,
    ticksEnabled: true,
    tickColor: 'black',
    tickWidth: '1',
  },
}
</script>
