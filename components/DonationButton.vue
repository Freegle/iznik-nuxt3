<template>
  <div>
    buttonId: {{ buttonId }} value: {{ value }}
    <b-button
      variant="primary"
      size="lg"
      aria-label="Donate to Freegle with PayPal"
      @click="clicked"
    >
      <div class="d-flex align-items-center">
        <div
          :id="uniqueId"
          :key="bump"
          ref="paypalbutton"
          class="mr-2"
          @click="suppress"
        />
        <div v-if="text">{{ text }}</div>
        <div v-else-if="!show">Donate</div>
        <div v-else>{{ show }}</div>
      </div>
    </b-button>
  </div>
</template>
<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { loadScript } from 'vue-plugin-load-script'
import { uid } from '../composables/useId'
import { useNuxtApp } from '#app'

const props = defineProps({
  directDonation: {
    type: Boolean,
    required: false,
    default: false,
  },
  value: {
    type: String,
    required: false,
    default: null,
  },
  text: {
    type: String,
    required: false,
    default: null,
  },
})

const bump = ref(1)

watch(
  () => props.value,
  (newVal, oldVal) => {
    bump.value++
    nextTick(() => {
      checkPayPalLoaded()
    })
  }
)

const emit = defineEmits(['clicked'])
const paypalbutton = ref(null)
const nuxtApp = useNuxtApp()

// Load PayPal script
await loadScript('https://www.paypalobjects.com/donate/sdk/donate-sdk.js')

// Computed properties
const uniqueId = computed(() => {
  return uid('donation-')
})

const buttonId = computed(() => {
  // These are set up at https://www.paypal.com/donate/buttons/manage
  switch (props.value) {
    case '1':
      return 'BA7SYG5KVH4WW'
    case '1510':
      return 'XEFBZCF2RDEQ8'
    case '2':
      return 'S3RKX5JHQUUL4'
    case '2510':
      return 'KSDKLE7WBW2X2'
    case '3':
      return 'L4GDMEU6FMNFJ'
    case '5':
      return '92MLE3SKST546'
    case '10':
      return 'KTNBE4YMDUGUY'
    case '15':
      return '7T354NV6HL9P4'
    case '25':
      return 'D5P8XMVRDLC7N'
    case 'any':
      // Any amount.
      return '2DZ6YUDERBVKC'
    default:
      // And whatyoucan. Works better to suggest amounts.
      return 'KSDKLE7WBW2X2'
  }
})

const show = computed(() => {
  return props.value ? '£' + props.value : null
})

// Methods
function checkPayPalLoaded() {
  if (window.PayPal) {
    makeButton()
  } else {
    setTimeout(checkPayPalLoaded, 100)
  }
}

function makeButton() {
  window.PayPal.Donation.Button({
    env: 'production',
    hosted_button_id: buttonId.value,
    image: {
      src: '/pp_cc_mark_37x23.jpg',
      title: 'Donate ' + (show.value ? show.value : '') + ' with PayPal',
      alt: 'Donate ' + (show.value ? show.value : '') + ' with PayPal',
    },
    onComplete(params) {
      // Because we get a callback we can record the actual amount donated.
      console.log('Donation completed with', params)
      emit('clicked', params.amt)
    },
  }).render('#' + uniqueId.value)
}

function suppress(e) {
  // Stop clicking on the PayPal button itself triggering the button click which will click the PayPal button.
  e.stopPropagation()
}

function clicked() {
  if (nuxtApp.$gtm?.enabled()) {
    nuxtApp.$gtm.trackEvent({
      event: 'Donate',
      label: 'Z1RRCIfbv7kZELy618UD',
    })
  }

  paypalbutton.value?.firstChild?.click()
}

// Lifecycle hooks
onMounted(() => {
  checkPayPalLoaded()
})
</script>
