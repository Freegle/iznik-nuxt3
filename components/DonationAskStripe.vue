<template>
  <div>
    <div class="donation-ask-container">
      <div class="d-flex justify-content-between">
        <div class="donation-ask-content">
          <!-- Traditional variant: Show intro text -->
          <DonationIntroText
            v-if="!isMinimalVariant && !birthdayMode"
            :groupid="groupid"
            :groupname="groupname"
            :target="target"
            :target-met="targetMet"
            :donated="donated"
            :hide-intro="hideIntro"
          />

          <!-- Minimal variant: Show simple message -->
          <p v-if="isMinimalVariant && !birthdayMode" class="donation-message">
            Freegle is volunteer-run and free to use. Donate to help us
            continue?
          </p>

          <DonationBirthdayDisplay
            v-if="birthdayMode"
            v-model="otherAmount"
            :price="price"
            :monthly="monthly"
          />

          <div v-else>
            <div class="donation-controls">
              <div class="amount-display">
                <div class="amount-label">Donation Amount</div>
                <div class="amount-value">£{{ selectedAmount.toFixed(2) }}</div>
              </div>
              <input
                v-model.number="selectedAmount"
                type="range"
                min="2"
                max="25"
                step="1"
                class="amount-slider"
              />
              <div class="slider-labels">
                <span>£2</span>
                <span>£25</span>
              </div>
            </div>
          </div>

          <div
            v-if="parseFloat(price) || payPalFallback"
            class="mt-2 mb-2 w-100 stripe-container"
          >
            <div v-show="!payPalFallback">
              <StripeDonate
                :key="price + monthly"
                :price="price"
                :monthly="monthly"
                @success="succeeded"
                @no-payment-methods="noMethods"
                @error="noMethods"
              />
            </div>
            <DonationButton
              v-if="payPalFallback"
              :text="`Donate £${price} with PayPal`"
              :value="String(price)"
              class="mb-4"
            />
            <div ref="belowStripe" />
          </div>

          <!-- Cancel button below donation -->
          <div class="text-center mt-3">
            <b-button variant="secondary" @click="cancel"> Not now </b-button>
          </div>

          <!-- Traditional variant: Show supporter badge info and footnotes -->
          <DonationTraditionalExtras
            v-if="!isMinimalVariant"
            :groupid="groupid"
            :groupname="groupname"
            :target-met="targetMet"
            :hide-thermometer="hideThermometer"
          />
        </div>
        <!-- Traditional variant: Show thermometer inside container -->
        <DonationThermometer
          v-if="!hideThermometer && !isMinimalVariant"
          ref="thermo"
          :groupid="groupid"
          class="ml-md-4 flex-shrink-0"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import DonationButton from './DonationButton'
import DonationIntroText from './DonationIntroText'
import DonationBirthdayDisplay from './DonationBirthdayDisplay'
import DonationTraditionalExtras from './DonationTraditionalExtras'
import Api from '~/api'

const props = defineProps({
  groupid: {
    type: Number,
    required: false,
    default: null,
  },
  groupname: {
    type: String,
    required: true,
  },
  target: {
    type: Number,
    default: 2000,
  },
  raised: {
    type: Number,
    default: 0,
  },
  targetMet: {
    type: Boolean,
    default: false,
  },
  donated: {
    type: String,
    default: null,
  },
  amounts: {
    type: Array,
    required: false,
    default: () => [2, 3, 5, 10, 15, 25],
  },
  default: {
    type: Number,
    required: false,
    default: 5,
  },
  hideIntro: {
    type: Boolean,
    required: false,
    default: false,
  },
  hideThermometer: {
    type: Boolean,
    required: false,
    default: false,
  },
  birthdayMode: {
    type: Boolean,
    required: false,
    default: false,
  },
})

const emit = defineEmits(['score', 'success', 'cancel'])

const runtimeConfig = useRuntimeConfig()
const api = Api(runtimeConfig)

const monthly = ref(false)
const price = ref(props.default)
const payPalFallback = ref(false)
const otherAmount = ref(null)
const belowStripe = ref(null)
const thermo = ref(null)

const variation = ref('minimal-friction')
const testAmount = ref(props.default)
const selectedAmount = ref(testAmount.value)

const isMinimalVariant = computed(() => {
  return variation.value && variation.value.includes('minimal')
})

watch(testAmount, (newVal) => {
  selectedAmount.value = newVal
  price.value = newVal
})

watch(selectedAmount, (newVal) => {
  price.value = newVal
})

watch(otherAmount, (newVal) => {
  if (newVal) {
    price.value = parseFloat(newVal)
  } else {
    price.value = props.default
  }
})

function score(amount) {
  emit('score', amount)
}

async function succeeded() {
  score(price.value)
  emit('success')

  try {
    const variantToRecord =
      variation.value === 'traditional' && selectedAmount.value === 5
        ? 'stripe'
        : `${variation.value}-${selectedAmount.value}`

    await api.bandit.chosen({
      uid: 'donation',
      variant: variantToRecord,
      score: selectedAmount.value,
    })
  } catch (err) {
    console.error('Error recording donation conversion:', err)
  }
}

function noMethods() {
  console.log('No payment methods')
  payPalFallback.value = true
}

function cancel() {
  emit('cancel')
}

onMounted(async () => {
  if (!props.birthdayMode) {
    try {
      const chosen = await api.bandit.choose({
        uid: 'donation',
      })

      if (chosen && chosen.variant) {
        // Handle legacy 'stripe' variant - map it to traditional-5
        if (!chosen.variant.includes('-')) {
          variation.value = 'traditional'
          testAmount.value = 5
          selectedAmount.value = 5
          price.value = 5
        } else {
          const parts = chosen.variant.split('-')
          const amount = parseFloat(parts[parts.length - 1])
          const varType = parts.slice(0, -1).join('-')

          variation.value = varType
          testAmount.value = amount
          selectedAmount.value = amount
          price.value = amount
        }
      }

      await api.bandit.shown({
        uid: 'donation',
        variant: chosen?.variant || `${variation.value}-${testAmount.value}`,
      })
    } catch (err) {
      console.error('Error with bandit API:', err)
    }
  }
})
</script>

<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';

.donation-ask-container {
  position: relative;
  background: linear-gradient(135deg, #ffffff, #f8f9ff);
  border-radius: 15px;
  padding: 2rem;
  margin: 0;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);

  &::before {
    content: '';
    position: absolute;
    top: -4px;
    left: -4px;
    right: -4px;
    bottom: -4px;
    border-radius: 19px;
    background: linear-gradient(
      45deg,
      rgb(255, 0, 0),
      rgb(255, 127, 0),
      rgb(255, 255, 0),
      rgb(0, 255, 0),
      rgb(0, 127, 255),
      rgb(0, 0, 255),
      rgb(75, 0, 130),
      rgb(148, 0, 211),
      rgb(255, 0, 0)
    );
    background-size: 300% 300%;
    z-index: -1;
    filter: blur(5px);
    animation: rainbow-glow 8s ease-in-out infinite;
  }
}

.donation-ask-content {
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
}

@keyframes rainbow-glow {
  0% {
    background-position: 0% 50%;
    filter: blur(6px) brightness(1);
  }
  25% {
    background-position: 50% 50%;
    filter: blur(8px) brightness(1.2);
  }
  50% {
    background-position: 100% 50%;
    filter: blur(6px) brightness(1);
  }
  75% {
    background-position: 50% 50%;
    filter: blur(8px) brightness(1.2);
  }
  100% {
    background-position: 0% 50%;
    filter: blur(6px) brightness(1);
  }
}

.donation-controls {
  width: 100%;
  max-width: 500px;
  margin: 0 auto 1.5rem;
}

.amount-display {
  text-align: center;
  margin-bottom: 1rem;
}

.amount-label {
  font-size: 0.9rem;
  color: #4a5568;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.amount-value {
  font-size: 2.5rem;
  font-weight: bold;
  color: #007bff;
  line-height: 1;
}

.amount-slider {
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: transparent;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  cursor: pointer;
  margin: 1rem 0 0.5rem;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: #007bff;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 123, 255, 0.5);
    transition: all 0.2s ease;
    margin-top: -10px;

    &:hover {
      transform: scale(1.2);
      box-shadow: 0 4px 12px rgba(0, 123, 255, 0.6);
    }

    &:active {
      transform: scale(1.1);
    }
  }

  &::-moz-range-thumb {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: #007bff;
    cursor: pointer;
    border: none;
    box-shadow: 0 2px 8px rgba(0, 123, 255, 0.5);
    transition: all 0.2s ease;

    &:hover {
      transform: scale(1.2);
      box-shadow: 0 4px 12px rgba(0, 123, 255, 0.6);
    }

    &:active {
      transform: scale(1.1);
    }
  }

  &::-webkit-slider-runnable-track {
    width: 100%;
    height: 8px;
    border-radius: 4px;
    background: linear-gradient(to right, #e2e8f0 0%, #007bff 100%);
  }

  &::-moz-range-track {
    width: 100%;
    height: 8px;
    border-radius: 4px;
    background: linear-gradient(to right, #e2e8f0 0%, #007bff 100%);
  }
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: #4a5568;
  font-weight: 500;
  margin-top: 0.5rem;
}

.stripe-container {
  text-align: center;
  width: 100%;

  :deep(> div),
  :deep(> *) {
    display: inline-block;
    margin: 0 auto;
  }
}

.donation-message {
  font-size: 1.25rem;
  color: #2d3748;
  margin-bottom: 1.5rem;
  line-height: 1.6;

  strong {
    color: #1a202c;
    font-weight: 600;
  }
}

@include media-breakpoint-down(md) {
  .donation-ask-container {
    padding: 1.5rem;
    margin: 1rem auto 1.5rem;
    max-width: calc(100% - 2rem);
  }

  .amount-value {
    font-size: 2rem;
  }
}

@include media-breakpoint-down(sm) {
  .donation-ask-container {
    margin: 1.5rem auto;
    max-width: calc(100% - 2rem);
  }

  .amount-value {
    font-size: 1.8rem;
  }

  .amount-slider {
    height: 10px;

    &::-webkit-slider-thumb {
      width: 32px;
      height: 32px;
      margin-top: -11px;
    }

    &::-moz-range-thumb {
      width: 32px;
      height: 32px;
    }

    &::-webkit-slider-runnable-track {
      height: 10px;
    }

    &::-moz-range-track {
      height: 10px;
    }
  }
}
</style>
