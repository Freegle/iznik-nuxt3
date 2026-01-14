<template>
  <div class="donation-ask-container">
    <div class="donation-ask-content">
      <!-- Solution Framing Variation (#5) - Environmental focus -->
      <p v-if="variation === 'solution-framing'" class="donation-message">
        <strong>Help us continue the solution!</strong><br />
        Our 4.6M freeglers kept 11,000 tonnes out of landfill last year. Donate
        to keep Freegle growing?
      </p>

      <!-- Minimal Friction Variation (#10) - Simple and direct -->
      <p v-else class="donation-message">
        Freegle is volunteer-run and free to use. Donate to help us continue?
      </p>

      <!-- Amount selection: slider (minimal friction) -->
      <div class="donation-controls">
        <div class="amount-display">
          <div class="amount-label">Donation Amount</div>
          <div class="amount-value">£{{ selectedAmount.toFixed(2) }}</div>
        </div>
        <input
          v-model.number="selectedAmount"
          type="range"
          min="0.5"
          max="10"
          step="0.5"
          class="amount-slider"
        />
        <div class="slider-labels">
          <span>£0.50</span>
          <span>£10</span>
        </div>
      </div>

      <!-- Stripe Donation Component (minimal friction - no extra steps) -->
      <div class="stripe-container text-center">
        <div v-show="payPalFallback">
          <DonationButton
            :key="selectedAmount"
            :text="`Donate £${selectedAmount}`"
            :value="selectedAmount"
          />
        </div>
        <div v-show="!payPalFallback">
          <StripeDonate
            :key="selectedAmount"
            :price="selectedAmount"
            @success="onDonationSuccess"
            @no-payment-methods="payPalFallback = true"
            @error="payPalFallback = true"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from '#imports'
import DonationButton from '~/components/DonationButton.vue'
import StripeDonate from '~/components/StripeDonate.vue'
import Api from '~/api'

const emit = defineEmits(['donation-made'])

const runtimeConfig = useRuntimeConfig()
const api = Api(runtimeConfig)

// A/B Test configuration - will be set by bandit API
const variation = ref('minimal-friction')
const testAmount = ref(1)

// Use test amount as the selected amount (can be changed by slider)
const selectedAmount = ref(testAmount.value)
const payPalFallback = ref(false)

// Watch testAmount changes from bandit API
watch(testAmount, (newVal) => {
  selectedAmount.value = newVal
})

// Track donation success
async function onDonationSuccess() {
  emit('donation-made')

  // Record A/B test conversion
  try {
    await api.bandit.chosen({
      uid: 'mypostsdonation',
      variant: `${variation.value}-${selectedAmount.value}`,
      score: selectedAmount.value,
    })
  } catch (err) {
    console.error('Error recording donation conversion:', err)
  }
}

// Choose and record A/B test variant on mount
onMounted(async () => {
  try {
    // Let the bandit algorithm choose the best variant
    const chosen = await api.bandit.choose({
      uid: 'mypostsdonation',
    })

    if (chosen && chosen.variant) {
      // Parse variant (format: "solution-framing-1.5" or "minimal-friction-2")
      const parts = chosen.variant.split('-')
      const amount = parseFloat(parts[parts.length - 1])
      const varType = parts.slice(0, -1).join('-')

      variation.value = varType
      testAmount.value = amount
      selectedAmount.value = amount
    }

    // Record that this variant was shown
    await api.bandit.shown({
      uid: 'mypostsdonation',
      variant: chosen?.variant || `${variation.value}-${testAmount.value}`,
    })
  } catch (err) {
    console.error('Error with bandit API:', err)
  }
})
</script>

<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';

// Variation #10: Minimal Friction Design
// Based on NextAfter 2024 research: reduce friction, increase conversions

.donation-ask-container {
  position: relative;
  background: linear-gradient(135deg, #ffffff, #f8f9ff);
  border-radius: 15px;
  padding: 2rem;
  margin: 1rem auto 1.5rem; // Center with auto horizontal margins
  max-width: calc(100% - 2rem); // Leave 1rem space on each side
  border: 1px solid #e2e8f0;

  // Animated rainbow border using pseudo-element
  &::before {
    content: '';
    position: absolute;
    top: -5px;
    left: -5px;
    right: -5px;
    bottom: -5px;
    border-radius: 17px;
    background: linear-gradient(
      45deg,
      rgba(255, 0, 0, 0.7),
      rgba(255, 127, 0, 0.7),
      rgba(255, 255, 0, 0.7),
      rgba(0, 255, 0, 0.7),
      rgba(0, 127, 255, 0.7),
      rgba(0, 0, 255, 0.7),
      rgba(75, 0, 130, 0.7),
      rgba(148, 0, 211, 0.7),
      rgba(255, 0, 0, 0.7)
    );
    background-size: 300% 300%;
    z-index: -1;
    filter: blur(8px);
    animation: rainbow-glow 8s ease-in-out infinite;
  }

  // Main shadow for depth
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
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

.donation-ask-content {
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
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
  background: transparent; // Make transparent so we can control the track color
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
    margin-top: -10px; // Vertically center thumb (half of thumb height minus half of track height)

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
  margin-top: 1.5rem;
  text-align: center;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;

  // Force centering of child elements
  :deep(> div) {
    width: 100%;
    max-width: 400px;
  }
}

// Mobile optimization - larger touch targets
@include media-breakpoint-down(md) {
  .donation-ask-container {
    padding: 1.5rem;
    margin: 1rem auto 1.5rem;
    max-width: calc(100% - 2rem); // Ensure equal space on both sides
  }

  .donation-message {
    font-size: 1.1rem;
  }

  .amount-value {
    font-size: 2rem;
  }
}

@include media-breakpoint-down(sm) {
  .donation-ask-container {
    margin: 1.5rem auto;
    max-width: calc(100% - 2rem); // Ensure equal space on both sides
  }

  .amount-value {
    font-size: 1.8rem;
  }

  // Larger slider thumb for mobile (easier to touch)
  .amount-slider {
    height: 10px;

    &::-webkit-slider-thumb {
      width: 32px;
      height: 32px;
      margin-top: -11px; // Recalculate for mobile: (32-10)/2 = 11px
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
