<template>
  <client-only>
    <div class="donate-page">
      <div class="donate-content">
        <!-- Header -->
        <div class="page-header">
          <h1>Support Freegle</h1>
          <p>Free to use, not free to run!</p>
        </div>

        <!-- Main donation card -->
        <div class="section-card donate-card">
          <DonationThank v-if="success" />
          <div v-else>
            <h2 class="donate-title">
              <v-icon icon="heart" class="heart-icon" />
              Please donate £3
            </h2>
            <p class="donate-subtitle">...or whatever you can give</p>

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

            <div v-if="!payPalFallback" class="frequency-toggle">
              <button
                :class="['freq-btn', { active: !monthly }]"
                @click="monthly = false"
              >
                One-off
              </button>
              <button
                :class="['freq-btn', { active: monthly }]"
                @click="monthly = true"
              >
                Monthly
              </button>
            </div>

            <div v-if="parseFloat(amount)" class="payment-section">
              <DonationButton
                v-if="payPalFallback && !isApp"
                :key="amount + '-fallback'"
                :text="'Donate £' + amount"
                :value="amount"
              />
              <p v-else-if="payPalFallback && isApp" class="text-muted">
                Payment is temporarily unavailable. Please try again later.
              </p>
              <StripeDonate
                v-else
                :key="amount + '-' + monthly + '-stripe'"
                :price="amount"
                :monthly="monthly"
                @success="succeeded"
                @error="payPalFallback = true"
                @no-payment-methods="noMethods"
              />
            </div>

            <p class="donate-info">
              We keep costs low with volunteers, but some things we have to pay
              for.
            </p>
          </div>
        </div>

        <!-- PayPal favourite -->
        <div class="section-card">
          <div class="section-header">
            <v-icon icon="star" class="section-icon" />
            <h2>PayPal favourite</h2>
          </div>
          <div class="section-content">
            <p>
              Set Freegle as your favourite PayPal charity for easy donations at
              checkout.
            </p>
            <ExternalLink
              href="https://www.paypal.com/fundraiser/charity/55681"
            >
              <b-button variant="primary"> Go to PayPal Giving Fund </b-button>
            </ExternalLink>
          </div>
        </div>

        <!-- Other ways -->
        <div class="section-card">
          <div class="section-header">
            <v-icon icon="hand-holding-heart" class="section-icon" />
            <h2>Other ways to donate</h2>
          </div>
          <div class="section-content">
            <!-- Bank transfer -->
            <div class="donate-option">
              <h3><v-icon icon="briefcase" /> Bank Transfer</h3>
              <p>
                Sort code: <strong>60-83-01</strong><br />
                Account: <strong>20339094</strong><br />
                Name: Freegle Limited (Unity Trust Bank)
              </p>
              <p class="reference-note">
                Reference:
                <span v-if="myid" class="reference">{{ myid }}</span>
                <span v-else class="reference">your email</span>
              </p>
            </div>

            <!-- Cheque -->
            <div class="donate-option">
              <h3><v-icon icon="envelope" /> By Cheque</h3>
              <p>
                Payable to <strong>Freegle Limited</strong><br />
                Send to: 64A North Road, Ormesby, Great Yarmouth NR29 3LE
              </p>
              <p class="reference-note">
                Include:
                <span v-if="myid" class="reference">{{ myid }}</span>
                <span v-else class="reference">your email</span>
              </p>
            </div>

            <!-- Gift Aid -->
            <p class="gift-aid">
              UK taxpayer? Make a
              <nuxt-link no-prefetch to="/giftaid"
                >Gift Aid declaration</nuxt-link
              >
              to boost your donation by 25%!
            </p>
          </div>
        </div>

        <!-- Shopping & eBay -->
        <div class="section-card">
          <div class="section-header">
            <v-icon icon="shopping-cart" class="section-icon" />
            <h2>Support while shopping</h2>
          </div>
          <div class="section-content">
            <div class="shop-options">
              <a
                href="https://www.giveasyoulive.com/join/freegle"
                target="_blank"
                rel="noopener"
                class="shop-option"
              >
                <b-img fluid src="/donate/GAYL.gif" alt="Give As You Live" />
                <span>Give As You Live</span>
              </a>
              <a
                href="http://www.ebay.co.uk/egw/ebay-for-charity/charity-profile/Freegle/74430"
                target="_blank"
                rel="noopener"
                class="shop-option"
              >
                <b-img fluid src="/donate/ebay.png" alt="eBay for Charity" />
                <span>eBay for Charity</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </client-only>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { buildHead } from '~/composables/useBuildHead'
import { useAuthStore } from '~/stores/auth'
import { useMobileStore } from '~/stores/mobile'
import DonationButton from '~/components/DonationButton'
import ExternalLink from '~/components/ExternalLink'
import DonationThank from '~/components/DonationThank'
import StripeDonate from '~/components/StripeDonate'

const runtimeConfig = useRuntimeConfig()
const route = useRoute()
const authStore = useAuthStore()
const mobileStore = useMobileStore()

const isApp = ref(mobileStore.isApp)
const monthly = ref(false)
const success = ref(false)
const payPalFallback = ref(false)
const amount = ref(3)

const myid = computed(() => authStore.user?.id)

function succeeded() {
  success.value = true
}

function noMethods() {
  payPalFallback.value = true
}

useHead(
  buildHead(
    route,
    runtimeConfig,
    'Donate to Freegle',
    "We're free to use, but not free to run. Can you help?"
  )
)
</script>

<style scoped lang="scss">
@import 'assets/css/_color-vars.scss';

.donate-page {
  background: $color-gray--lighter;
  min-height: 100vh;
}

.donate-content {
  max-width: 900px;
  margin: 0 auto;
  padding: 1rem;
}

.page-header {
  text-align: center;
  padding: 1.5rem 0;

  h1 {
    color: $color-green-background;
    font-size: 1.75rem;
    margin-bottom: 0.5rem;
  }

  p {
    color: $color-gray--dark;
    margin: 0;
  }
}

.section-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 1rem;
  overflow: hidden;
}

.donate-card {
  padding: 1.5rem;
  text-align: center;
}

.donate-title {
  color: $color-green-background;
  font-size: 1.5rem;
  margin-bottom: 0.25rem;

  .heart-icon {
    color: $color-red;
  }
}

.donate-subtitle {
  color: $color-gray--dark;
  margin-bottom: 1.5rem;
}

.amount-input {
  max-width: 150px;
  margin: 0 auto 1.5rem;

  .amount-field {
    font-size: 1.25rem;
    text-align: center;
  }
}

.frequency-toggle {
  display: flex;
  justify-content: center;
  gap: 0;
  margin-bottom: 1.5rem;
}

.freq-btn {
  padding: 0.5rem 1.5rem;
  border: 2px solid $color-green-background;
  background: white;
  color: $color-green-background;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:first-child {
    border-right: 1px solid $color-green-background;
  }

  &:last-child {
    border-left: 1px solid $color-green-background;
  }

  &.active {
    background: $color-green-background;
    color: white;
  }

  &:hover:not(.active) {
    background: rgba($color-green-background, 0.1);
  }
}

.payment-section {
  margin-bottom: 1.5rem;
}

.donate-info {
  font-size: 0.9rem;
  color: $color-gray--dark;
  margin: 0;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);

  h2 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: $color-green-background;
  }

  .section-icon {
    color: $color-green-background;
  }
}

.section-content {
  padding: 1rem 1.25rem;

  p {
    color: $color-gray--darker;
    font-size: 0.95rem;
    margin-bottom: 1rem;
  }
}

.donate-option {
  padding: 1rem;
  background: $color-gray--lighter;
  border-radius: 8px;
  margin-bottom: 1rem;

  h3 {
    font-size: 1rem;
    font-weight: 600;
    color: $color-gray--darker;
    margin-bottom: 0.5rem;
  }

  p {
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
  }
}

.reference-note {
  font-size: 0.85rem !important;
  color: $color-gray--dark !important;
}

.reference {
  color: $color-red;
  font-weight: 600;
}

.gift-aid {
  text-align: center;
  font-size: 0.9rem;
  padding: 0.75rem;
  background: linear-gradient(135deg, #f8fdf5 0%, #f0f9e8 100%);
  border-radius: 8px;
  margin-bottom: 0;
}

.shop-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 400px) {
    grid-template-columns: 1fr;
  }
}

.shop-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background: $color-gray--lighter;
  border-radius: 8px;
  text-decoration: none;
  transition: background 0.2s;

  &:hover {
    background: darken($color-gray--lighter, 5%);
  }

  img {
    max-height: 50px;
    margin-bottom: 0.5rem;
  }

  span {
    font-size: 0.85rem;
    color: $color-gray--darker;
    font-weight: 500;
  }
}
</style>
