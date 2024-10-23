<template>
  <button
    data-jg-donate-button
    data-link-id="fx6eedvc49"
    data-market-code="GB"
    data-donate-button-type="justgivingSmall"
    data-link-type="givingCheckout"
    data-popup-checkout="true"
    data-show-payment-logos="false"
    class="jgbutton"
  >
    <b-img src="https://www.jg-cdn.com/buttons/donate-with-jg.svg" />
  </button>
</template>
<script setup>
const jgbutton = ref(null)

watch(
  jgbutton,
  (newVal) => {
    if (newVal) {
      const script = document.createElement('script')
      script.setAttribute('data-version', '2')
      script.setAttribute('data-widgetType', 'attachCheckout')

      script.setAttribute(
        'src',
        'https://www.justgiving.com/widgets/scripts/widget.js'
      )

      document.body.appendChild(script)
    }
  },
  {
    immediate: true,
  }
)
</script>
<style scoped lang="scss">
.jgbutton {
  background-color: #7a04dd;
}
</style>
