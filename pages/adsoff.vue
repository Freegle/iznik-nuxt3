<template>
  <client-only>
    <div class="adsoff-page">
      <div class="adsoff-container">
        <div class="adsoff-content">
          <div class="adsoff-header">
            <h1>Love Freegle, Hate Ads?</h1>
            <p class="subtitle">Donate and we'll turn them off for a month.</p>
          </div>

          <div class="adsoff-main">
            <div class="adsoff-text">
              <p class="intro">
                Our charity is free to use but not free to run. Ads help cover
                our costs - but wouldn't it be nice not to have them?
              </p>

              <div class="donation-section">
                <DonationThank v-if="success" />
                <div v-else>
                  <h2>Support Freegle</h2>
                  <p class="donate-prompt">
                    Please donate £3 or whatever you can give
                  </p>

                  <div class="amount-input">
                    <b-input-group prepend="£">
                      <b-input
                        v-model="amount"
                        type="number"
                        min="1"
                        step="1"
                        class="amount-field"
                      />
                    </b-input-group>
                  </div>

                  <div v-if="parseFloat(amount)" class="payment-section">
                    <DonationButton
                      v-if="payPalFallback"
                      :key="amount + '-fallback'"
                      :text="'Donate £' + amount"
                      :value="String(amount)"
                      @clicked="score"
                    />
                    <StripeDonate
                      v-else
                      :key="amount + '-stripe'"
                      :price="parseFloat(amount)"
                      :monthly="false"
                      @success="succeeded"
                      @error="payPalFallback = true"
                      @no-payment-methods="noMethods"
                    />
                  </div>

                  <p class="monthly-note">
                    Regular monthly donations are especially helpful.
                  </p>
                </div>
              </div>

              <div v-if="recentDonor" class="status-section">
                <div class="status-message success">
                  <v-icon icon="heart" class="status-icon" />
                  <span>You've donated - ads are off for you. Thank you!</span>
                </div>
              </div>

              <p class="other-ways">
                Other ways to donate are
                <nuxt-link to="/donate">here</nuxt-link>.
              </p>
            </div>

            <div class="thermometer-wrapper">
              <DonationThermometer />
              <div class="thermometer-label">Monthly target</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </client-only>
</template>
<script setup>
import { ref, onMounted, useRuntimeConfig } from '#imports'
import { useAuthStore } from '~/stores/auth'
import Api from '~/api'
import DonationButton from '~/components/DonationButton.vue'
import DonationThermometer from '~/components/DonationThermometer.vue'
import DonationThank from '~/components/DonationThank.vue'
import StripeDonate from '~/components/StripeDonate.vue'

const authStore = useAuthStore()
const recentDonor = ref(authStore.user?.donor === 1)

const amount = ref(3)
const success = ref(false)
const payPalFallback = ref(false)

const runtimeConfig = useRuntimeConfig()
const api = Api(runtimeConfig)

onMounted(async () => {
  await api.bandit.shown({
    uid: 'adsoff',
    variant: 'page',
  })
})

function succeeded() {
  success.value = true
  score()
}

function noMethods() {
  payPalFallback.value = true
}

function score() {
  api.bandit.chosen({
    uid: 'adsoff',
    variant: 'page',
  })
}
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';
@import 'assets/css/_color-vars.scss';

.adsoff-page {
  min-height: 100vh;
  background: $color-gray--lighter;
  padding: 1rem;

  @include media-breakpoint-up(md) {
    padding: 2rem;
  }
}

.adsoff-container {
  max-width: 800px;
  margin: 0 auto;
}

.adsoff-content {
  background: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.adsoff-header {
  background: white;
  padding: 1.5rem;
  text-align: center;
  border-bottom: 3px solid $color-green-background;

  @include media-breakpoint-up(md) {
    padding: 2rem 2.5rem;
  }

  h1 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
    color: $color-green-background;

    @include media-breakpoint-up(md) {
      font-size: 2rem;
    }
  }

  .subtitle {
    margin: 0.5rem 0 0;
    font-size: 1rem;
    color: $color-gray--darker;

    @include media-breakpoint-up(md) {
      font-size: 1.1rem;
    }
  }
}

.adsoff-main {
  display: flex;
  flex-direction: column;
  padding: 1.5rem;

  @include media-breakpoint-up(md) {
    flex-direction: row;
    padding: 2rem 2.5rem;
    gap: 2rem;
  }
}

.adsoff-text {
  flex: 1;
}

.intro {
  font-size: 1rem;
  color: $color-gray--darker;
  line-height: 1.6;
  margin-bottom: 1.5rem;

  @include media-breakpoint-up(md) {
    font-size: 1.1rem;
  }
}

.donation-section {
  background: linear-gradient(to bottom, $color-gray--lighter, white);
  border: 1px solid $color-gray--light;
  padding: 1.25rem;
  margin-bottom: 1.5rem;

  h2 {
    font-size: 1rem;
    font-weight: 600;
    color: $color-green-background;
    margin: 0 0 1rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
}

.donate-prompt {
  color: $color-gray--darker;
  margin-bottom: 1rem;
}

.amount-input {
  max-width: 120px;
  margin-bottom: 1rem;

  .amount-field {
    font-size: 1.1rem;
    text-align: center;
  }
}

.payment-section {
  margin-bottom: 1rem;
}

.monthly-note {
  font-size: 0.85rem;
  color: $color-gray--dark;
  margin: 0;
  font-style: italic;
}

.status-section {
  margin-bottom: 1.5rem;
}

.status-message {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  background: $color-gray--lighter;
  border-left: 3px solid $color-green-background;

  &.success {
    background: lighten($colour-success, 45%);
    border-left-color: $colour-success;
    flex-direction: row;
    align-items: center;
  }
}

.status-icon {
  color: $colour-success;
  font-size: 1.25rem;
  margin-right: 0.5rem;
}

.donor-status {
  display: flex;
  align-items: center;
  color: $colour-success;
  font-weight: 600;

  .heart-icon {
    color: #e74c3c;
    margin-right: 0.5rem;
  }
}

.target-info {
  color: $color-gray--darker;
  line-height: 1.5;
}

.other-ways {
  font-size: 0.9rem;
  color: $color-gray--dark;
  margin: 0;

  a {
    color: $color-green-background;
    font-weight: 600;

    &:hover {
      text-decoration: underline;
    }
  }
}

.thermometer-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid $color-gray--light;

  @include media-breakpoint-up(md) {
    margin-top: 0;
    padding-top: 0;
    border-top: none;
    border-left: 1px solid $color-gray--light;
    padding-left: 2rem;
  }
}

.thermometer-label {
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: $color-gray--dark;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
</style>
