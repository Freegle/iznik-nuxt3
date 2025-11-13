<template>
  <client-only>
    <b-row class="m-0">
      <b-col cols="0" md="3" />
      <b-col cols="12" md="6" class="mt-2">
        <b-card no-body class="mt-1">
          <b-card-header bg-variant="primary" text-variant="white">
            <h1 class="text-white">Free To Use - Not Free To Run!</h1>
          </b-card-header>
          <b-card-text class="p-2">
            <DonationThermometer
              v-if="false"
              ref="thermo"
              class="text-center"
            />
            <DonationThank v-if="success" />
            <div v-else>
              <p>
                Thank you! It's nice of you to even think about supporting us.
              </p>
              <h3>If you can, please donate &pound;3.</h3>
              <p>...but anything you can give is very welcome.</p>
              <b-input-group prepend="£">
                <b-input
                  v-model="amount"
                  type="number"
                  min="1"
                  step="1"
                  size="lg"
                  class="amountwidth"
                />
              </b-input-group>
              <!--BFormCheckbox
                v-if="!payPalFallback"
                id="monthly"
                v-model="monthly"
                name="monthly"
                class="mb-2"
              >
                <v-icon icon="arrow-left" /> Monthly donations are really
                helpful
              </BFormCheckbox-->
              <div v-if="parseFloat(amount)">
                <DonationButton
                  v-if="payPalFallback"
                  :key="amount + '-fallback'"
                  :text="'Donate £' + amount"
                  :value="amount"
                />
                <StripeDonate
                  v-else
                  :key="amount + '-stripe'"
                  :price="amount"
                  :monthly="monthly"
                  @success="succeeded"
                  @error="payPalFallback = true"
                  @no-payment-methods="noMethods"
                />
              </div>
              <p class="mt-1">
                We provide a free service and keep costs low thanks to our large
                number of committed volunteers - but there are some things we
                have to pay for to keep going.
              </p>
              <p>
                Freegle is relatively unusual, especially in the charity world.
                Most websites host a few web pages which change quite rarely,
                for a relatively small number of active users at any one time.
                We have an active service where there are changes happening
                continuously, and we send out hundreds of thousands of emails a
                day. You can certainly get a cheap and cheerful charity website
                that doesn't do much for a few quid a year, but you can't run
                something like Freegle that way. It's a different kettle of
                fish. It's not even a kettle, and they're not fish.
              </p>
              <p v-if="false" class="font-weight-bold">
                This month we're trying to raise &pound;{{ target }} from
                donations - can you help?
              </p>
            </div>
          </b-card-text>
        </b-card>
        <b-card no-body class="mt-2">
          <b-card-header bg-variant="primary" text-variant="white">
            <h2 class="text-white">
              Please set us as your favourite PayPal charity
            </h2>
          </b-card-header>
          <b-card-text class="p-2">
            <p>
              This will make it easier to donate a little to Freegle when you're
              checking out using PayPal. Go to our page on PayPal Giving Fund
              and click the <strong>Set as favourite charity</strong> link.
            </p>
            <ExternalLink
              href="https://www.paypal.com/fundraiser/charity/55681"
            >
              <b-button variant="primary" size="lg" class="mb-2">
                Go to PayPal Giving Fund
              </b-button>
            </ExternalLink>
            <p>Here's how it looks:</p>
            <b-img lazy fluid src="/donate/PayPalFavourite.gif" />
          </b-card-text>
        </b-card>
        <p />
        <h2 class="mt-2">Other ways to Donate</h2>
        <b-row>
          <b-col cols="12" lg="6">
            <b-card class="mt-2 mb-2" no-body>
              <b-card-header bg-variant="primary" text-variant="white">
                Bank Transfer
              </b-card-header>
              <b-card-text class="p-2">
                <p>
                  You can also donate by transfer to sort code 60-83-01, account
                  number 20339094. The account name is Freegle Limited, and the
                  bank is Unity Trust Bank.
                </p>
                <p>
                  Please use a reference of
                  <span v-if="myid" class="text-danger font-weight-bold">{{
                    myid
                  }}</span>
                  <span v-else class="text-danger font-weight-bold">
                    your email
                  </span>
                  so we know who it comes from!
                </p>
                <p>
                  If you can, please make a Gift Aid
                  <!-- eslint-disable-next-line -->
                  Declaration
                  <nuxt-link no-prefetch to="/giftaid">here</nuxt-link>
                  .
                </p>
              </b-card-text>
            </b-card>
          </b-col>
          <b-col cols="12" lg="6">
            <b-card class="mt-2 mb-2" no-body>
              <b-card-header bg-variant="primary" text-variant="white">
                By Cheque
              </b-card-header>
              <b-card-text class="p-2">
                <p>You can donate by cheque.</p>
                <p>
                  Please make it payable to Freegle Limited and send to Freegle,
                  64A North Road, Ormesby, Great Yarmouth NR29 3LE. Please
                  include
                  <span v-if="myid">
                    reference
                    <span class="font-weight-bold text-danger">{{ myid }}</span
                    >,
                  </span>
                  <span v-else class="font-weight-bold text-danger"
                    >your email,</span
                  >
                  so we know who it comes from!
                </p>
                <p>
                  If you can, please make a Gift Aid
                  <!-- eslint-disable-next-line -->
                  Declaration
                  <nuxt-link no-prefetch to="/giftaid">here</nuxt-link>
                  .
                </p>
              </b-card-text>
            </b-card>
          </b-col>
          <b-col cols="12" lg="6">
            <b-card class="mt-2 mb-2" no-body>
              <b-card-header bg-variant="primary" text-variant="white">
                Online Shopping
              </b-card-header>
              <b-card-text class="p-2">
                <p>
                  You can support us for free when you shop using
                  <a
                    target="_blank"
                    rel="noopener"
                    href="https://www.giveasyoulive.com/join/freegle"
                  >
                    Give As You Live </a
                  >.
                </p>
                <p>Please click here to find out more:</p>
                <a
                  target="_blank"
                  rel="noopener"
                  href="https://www.giveasyoulive.com/join/freegle"
                >
                  <b-img
                    fluid
                    alt="Give As You Live"
                    class="img-rounded img-responsive"
                    src="/donate/GAYL.gif"
                  />
                </a>
              </b-card-text>
            </b-card>
          </b-col>
          <b-col cols="12" lg="6">
            <b-card class="mt-2 mb-2" no-body>
              <b-card-header bg-variant="primary" text-variant="white">
                On eBay
              </b-card-header>
              <b-card-text class="p-2">
                <p>
                  You can also help us when you sell on <strong>eBay</strong>.
                  Make sure you're signed in to eBay, then click below and
                  <em>Save as favourite</em>.
                </p>
                <a
                  href="http://www.ebay.co.uk/egw/ebay-for-charity/charity-profile/Freegle/74430"
                  target="_blank"
                  rel="noopener"
                >
                  <b-img
                    fluid
                    class="img-rounded img-responsive"
                    src="/donate/ebay.png"
                  />
                </a>
              </b-card-text>
            </b-card>
          </b-col>
        </b-row>
      </b-col>
    </b-row>
  </client-only>
</template>
<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useDonationStore } from '~/stores/donations'
import { buildHead } from '~/composables/useBuildHead'
import { useAuthStore } from '~/stores/auth'
import DonationThermometer from '~/components/DonationThermometer'
import DonationButton from '~/components/DonationButton'
import ExternalLink from '~/components/ExternalLink'
import DonationThank from '~/components/DonationThank'
import StripeDonate from '~/components/StripeDonate'

// Setup
const runtimeConfig = useRuntimeConfig()
const route = useRoute()
const donationStore = useDonationStore()
const authStore = useAuthStore()

// State
const monthly = ref(false)
const success = ref(false)
const payPalFallback = ref(false)
const amount = ref(3)

// Computed properties
const target = computed(() => donationStore.target)
const myid = computed(() => authStore.user?.id)

// Methods
function succeeded() {
  success.value = true
}

function noMethods() {
  payPalFallback.value = true
}

// Page head
useHead(
  buildHead(
    route,
    runtimeConfig,
    'Donate to Freegle',
    "We're free to use, but not free to run. Can you help us keep going?"
  )
)
</script>
<style scoped lang="scss">
:deep(.form-check-input) {
  border: 1px solid red;
}

.amountwidth {
  max-width: 5rem;
}
</style>
