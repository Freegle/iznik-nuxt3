<template>
  <client-only>
    <b-row class="m-0">
      <b-col cols="0" md="3" />
      <b-col cols="12" md="6" class="mt-2">
        <b-card no-body class="mt-1 p-4">
          <h1>Love Freegle, Hate Ads?</h1>
          <div class="d-flex">
            <div>
              <p>
                <strong
                  >Hate ads? Donate and we'll turn them off for a month.</strong
                >
              </p>
              <p>
                Our charity is free to use but not free to run. There are some
                things we have to pay for to keep going. Ads support this - but
                wouldn't it be nice not to have them?
              </p>
              <p>
                <strong
                  >If you donate, we'll turn ads off for you for a
                  month:</strong
                >
              </p>
              <div class="d-flex flex-wrap justify-content-between mt-2 mb-3">
                <donation-button value="1" class="mb-1" @clicked="score(1)" />
                <donation-button value="5" class="mb-1" @clicked="score(5)" />
                <donation-button value="10" class="mb-1" @clicked="score(10)" />
              </div>
              <p>Regular monthly donations are especially helpful.</p>
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
          <p v-if="adsOffTarget <= 0">
            Right now we've raised enough in donations over the last 24 hours,
            so ads are off for everyone. Thanks!
          </p>
          <p v-else>
            <span v-if="recentDonor"
              >You've donated, so ads are off for you.
            </span>
            Right now we still need &pound;{{ adsOffTarget }} to reach our
            donation target of &pound;{{ adsOffTargetMax }}
            over the last 24 hours. Once we reach that, we'll turn ads off for
            everyone.
          </p>
          <p>
            Other ways to donate are <nuxt-link to="/donate">here</nuxt-link>.
          </p>
        </b-card>
      </b-col>
    </b-row>
  </client-only>
</template>
<script setup>
import { ref, onMounted, useRuntimeConfig } from '#imports'
import { useConfigStore } from '~/stores/config'
import { useAuthStore } from '~/stores/auth'
import Api from '~/api'
import DonationButton from '~/components/DonationButton.vue'
import VueThermometer from '~/components/VueThermometer.vue'

const configStore = useConfigStore()
const authStore = useAuthStore()
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

const recentDonor = ref(authStore.user?.donor === 1)

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

const runtimeConfig = useRuntimeConfig()
const api = Api(runtimeConfig)

onMounted(async () => {
  await api.bandit.shown({
    uid: 'adsoff',
    variant: 'page',
  })
})

function score(amount) {
  api.bandit.chosen({
    uid: 'adsoff',
    variant: 'page',
  })
}
</script>
