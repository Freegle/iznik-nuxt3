<template>
  <client-only>
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
  </client-only>
</template>
<script setup>
const jgbutton = ref()

watch(
  jgbutton,
  (newVal) => {
    console.log('Watch', newVal)
    if (newVal) {
      console.log('Add script')
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
