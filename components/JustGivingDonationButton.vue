<template>
  <button
    ref="jgbutton"
    data-jg-donate-button
    data-linkId="fx6eedvc49"
    data-marketCode="GB"
    data-donateButtonType="justgivingSmall"
    data-linkType="givingCheckout"
    data-popupCheckout="true"
    data-showPaymentLogos="false"
    class="jgbutton"
  >
    <b-img src="https://www.jg-cdn.com/buttons/donate-with-jg.svg" />
  </button>
</template>
<script setup>
const jgbutton = ref()

watch(
  jgbutton,
  (newVal) => {
    if (newVal && process.client) {
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
    deep: true,
  }
)
</script>
<style scoped lang="scss">
.jgbutton {
  background-color: #7a04dd;
}
</style>
