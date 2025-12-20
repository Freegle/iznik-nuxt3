<template>
  <div ref="donationElement" class="clickme" @click="submit">
    <b-img
      lazy
      src="/donate_per_month.jpg"
      alt="Click to support Freegle by donating £1 per month"
      class="w-100"
      title="Click here to set up a £1/month donation to Freegle.  Thank you!"
    />
    <form
      ref="donateform"
      action="https://www.paypal.com/cgi-bin/webscr"
      method="post"
      target="_top"
      class="d-none"
    >
      <input type="hidden" name="cmd" value="_s-xclick" />
      <input type="hidden" name="hosted_button_id" value="6VJKBWQ9RQHPU" />
      <input type="hidden" name="os0" value="Supporter1" />
      <input type="hidden" name="on0" value="" />
      <input type="hidden" name="currency_code" value="GBP" />
      <img
        alt=""
        border="0"
        src="https://www.paypalobjects.com/en_GB/i/scr/pixel.gif"
        width="1"
        height="1"
      />
    </form>
  </div>
</template>
<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { action } from '~/composables/useClientLog'

const props = defineProps({
  variant: {
    type: String,
    required: true,
  },
})

const donateform = ref(null)
const donationElement = ref(null)
const hasBeenVisible = ref(false)
let visibilityObserver = null

onMounted(() => {
  try {
    action('donation_monthly_rendered', {
      variant: props.variant,
    })

    // Track visibility with Intersection Observer.
    if (donationElement.value && 'IntersectionObserver' in window) {
      visibilityObserver = new IntersectionObserver(
        (entries) => {
          try {
            entries.forEach((entry) => {
              if (entry.isIntersecting && !hasBeenVisible.value) {
                hasBeenVisible.value = true
                action('donation_monthly_visible', {
                  variant: props.variant,
                })
              }
            })
          } catch (e) {
            console.log('Error in donation visibility observer callback', e)
          }
        },
        { threshold: 0.5 }
      )
      visibilityObserver.observe(donationElement.value)
    }
  } catch (e) {
    console.log('Error setting up donation tracking', e)
  }
})

onBeforeUnmount(() => {
  if (visibilityObserver) {
    visibilityObserver.disconnect()
    visibilityObserver = null
  }
})

function submit() {
  action('donation_monthly_click', {
    variant: props.variant,
  })

  donateform.value.submit()
}
</script>
